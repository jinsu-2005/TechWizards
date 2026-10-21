"""Loopback-only read proxy for paired Modbus response evidence, never plant writes."""

import asyncio
import contextlib
import math
import struct
import time
from collections.abc import Callable
from typing import Any
from uuid import uuid4

from app.live.tagmap import Tag, TagMap, decode, encode


async def frame(reader: asyncio.StreamReader) -> bytes:
    header = await asyncio.wait_for(reader.readexactly(7), 3)
    _, protocol, length = struct.unpack(">HHH", header[:6])
    if protocol != 0 or not 2 <= length <= 254:
        raise ValueError("Invalid Modbus frame")
    return header + await asyncio.wait_for(reader.readexactly(length - 1), 3)


def alter_response(
    request: bytes, response: bytes, tag: Tag, offset: float
) -> tuple[bytes, float | None, float | None]:
    if len(request) != 12 or request[7] != 4 or len(response) < 9:
        return response, None, None
    start, count = struct.unpack(">HH", request[8:12])
    if response[:4] != request[:4] or response[6:8] != request[6:8] or response[8] != count * 2:
        raise ValueError("Mismatched Modbus reply")
    if (
        len(response) != 9 + count * 2
        or not start <= tag.address
        or tag.address + tag.width > start + count
    ):
        return response, None, None
    i = 9 + (tag.address - start) * 2
    regs = list(struct.unpack(f">{tag.width}H", response[i : i + tag.width * 2]))
    before = decode(tag, regs)
    after = before + offset
    if not math.isfinite(after):
        raise ValueError("Non-finite test value")
    replacement = struct.pack(f">{tag.width}H", *encode(tag, after))
    return response[:i] + replacement + response[i + tag.width * 2 :], before, after


class LabProxy:
    def __init__(
        self,
        tagmap: TagMap,
        sink: Callable[[str, dict[str, Any]], None],
        listen_port: int = 5021,
        upstream_port: int = 5020,
    ) -> None:
        self.tagmap, self.sink = tagmap, sink
        self.listen_port, self.upstream_port = listen_port, upstream_port
        self.session_id = uuid4().hex
        self.server: asyncio.Server | None = None
        self.clients: set[asyncio.Task[Any]] = set()
        self.asset = "LIT101"
        self.offset = 0.0
        self.delay_ms = 0
        self.drop = False
        self.latest: dict[str, Any] | None = None
        self._last_record = 0.0

    async def start(self) -> None:
        if self.server is None:
            self.server = await asyncio.start_server(
                self._client, "127.0.0.1", self.listen_port, limit=512
            )

    async def stop(self) -> None:
        if self.server:
            self.server.close()
            await self.server.wait_closed()
            self.server = None
        tasks = list(self.clients)
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
        self.clients.clear()

    async def _client(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
        task = asyncio.current_task()
        if task is None or len(self.clients) >= 16:
            writer.close()
            return
        self.clients.add(task)
        upstream: asyncio.StreamWriter | None = None
        try:
            other, upstream = await asyncio.wait_for(
                asyncio.open_connection("127.0.0.1", self.upstream_port), 2
            )
            assert upstream is not None
            while True:
                request = await frame(reader)
                if request[7] != 4 or len(request) != 12:
                    # Illegal function: this proxy never forwards writes or holding-register reads.
                    writer.write(
                        request[:4] + struct.pack(">HBBB", 3, request[6], request[7] | 128, 1)
                    )
                    await writer.drain()
                    continue
                upstream.write(request)
                await upstream.drain()
                response = await frame(other)
                asset = self.asset
                tag = next(t for t in self.tagmap.by_role("value") if t.node_id == asset)
                offset, delay, drop = self.offset, self.delay_ms, self.drop
                outgoing, before, after = alter_response(request, response, tag, offset)
                if delay:
                    await asyncio.sleep(delay / 1000)
                if not drop:
                    writer.write(outgoing)
                    await writer.drain()
                if before is not None:
                    self.latest = {
                        "asset_id": asset,
                        "channel_id": f"channel:{asset}",
                        "transaction_id": struct.unpack(">H", request[:2])[0],
                        "emulator_value": before,
                        "receiver_value": None if drop else after,
                        "emulator_reply_hex": response.hex(),
                        "forwarded_reply_hex": None if drop else outgoing.hex(),
                        "delay_ms": delay,
                        "dropped": drop,
                        "observed_at": time.time(),
                        "hypothesis": "unresolved: no receiver observation"
                        if drop
                        else "channel alteration supported"
                        if offset
                        else "paired values match; no channel alteration observed",
                        "classification": "observation",
                        "delivery": "dropped"
                        if drop
                        else "forwarded at proxy; client ingestion not attested",
                        "scope": "same Modbus transaction at local test proxy endpoints; "
                        "not physical device attestation",
                    }
                    if time.monotonic() - self._last_record >= 2:
                        self.sink(asset, self.latest)
                        self._last_record = time.monotonic()
                if drop:
                    return
        except (OSError, ValueError, TimeoutError, asyncio.IncompleteReadError):
            pass
        finally:
            self.clients.discard(task)
            for connection in (writer, upstream):
                if connection:
                    connection.close()
                    with contextlib.suppress(OSError):
                        await connection.wait_closed()
