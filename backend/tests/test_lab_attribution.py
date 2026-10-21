import asyncio
import json
import socket
import struct
from pathlib import Path

import pytest
from plant_emulator.server import PlantEmulator
from pymodbus.client import AsyncModbusTcpClient

from app.attribution import assess_layers
from app.live.lab_proxy import LabProxy, alter_response
from app.live.tagmap import decode, load_tagmap

TAGMAP = Path(__file__).resolve().parents[2] / "config" / "tagmap.yaml"


def port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


@pytest.mark.parametrize(
    ("before", "after", "expected"),
    [
        (5, 15, "supported"),
        (5, 5, "not_observed"),
        (5, None, "unresolved"),
        (5, float("nan"), "unresolved"),
    ],
)
def test_channel_evidence_rules(before, after, expected):
    findings = assess_layers(
        [
            {
                "id": "e",
                "asset_id": "LIT101",
                "category": "channel_observation",
                "payload": {"emulator_value": before, "receiver_value": after},
            }
        ]
    )
    assert findings[0]["result"] == expected
    assert findings[0]["event_ids"] == ["e"]


@pytest.mark.parametrize(
    ("approved", "verified", "changed", "expected"),
    [
        (True, True, True, "approved_change"),
        (False, True, True, "supported"),
        (False, False, True, "unresolved"),
        (False, True, False, "unresolved"),
    ],
)
def test_integrity_requires_observation_and_separate_approval(
    approved, verified, changed, expected
):
    findings = assess_layers(
        [
            {
                "id": "e",
                "asset_id": "PLC1",
                "category": "integrity_change",
                "payload": {
                    "before_hash": "a",
                    "after_hash": "b" if changed else "a",
                    "applied_verified": verified,
                    "approved": approved,
                },
            }
        ]
    )
    assert findings[0]["result"] == expected


async def test_proxy_real_modbus_pairing_and_rejects_writes(tmp_path):
    tm = load_tagmap(TAGMAP)
    emu = PlantEmulator(tm, port=port(), health_port=None, realtime=False)
    records = []
    proxy = LabProxy(
        tm,
        lambda asset, payload: records.append(payload),
        listen_port=port(),
        upstream_port=emu.port,
    )
    client = AsyncModbusTcpClient("127.0.0.1", port=proxy.listen_port, timeout=1, retries=0)
    try:
        await emu.start()
        await emu.tick()
        await proxy.start()
        assert await client.connect()
        proxy.offset = 10
        reply = await client.read_input_registers(0, count=24, device_id=tm.device_id)
        assert not reply.isError()
        tag = next(t for t in tm.by_role("value") if t.node_id == "LIT101")
        measured = decode(tag, reply.registers[:2])
        assert measured == pytest.approx(emu.plant.state()["LIT101"] + 10, abs=1e-4)
        assert records[0]["receiver_value"] - records[0]["emulator_value"] == pytest.approx(10)
        assert records[0]["emulator_reply_hex"] != records[0]["forwarded_reply_hex"]
        result = await client.write_register(200, 1, device_id=tm.device_id)
        assert result.isError()
        assert (await emu.server.async_getValues(tm.device_id, 3, 200, 1))[0] == 0
        proxy.offset = 0
        proxy.delay_ms = 20
        reply = await client.read_input_registers(0, count=24, device_id=tm.device_id)
        assert not reply.isError()
        assert proxy.latest["hypothesis"].startswith("paired values match")
        proxy.drop = True
        reader, writer = await asyncio.open_connection("127.0.0.1", proxy.listen_port)
        writer.write(struct.pack(">HHHBBHH", 71, 0, 6, tm.device_id, 4, 0, 24))
        await writer.drain()
        assert await asyncio.wait_for(reader.read(1024), 2) == b""
        assert proxy.latest["receiver_value"] is None
        assert proxy.latest["hypothesis"].startswith("unresolved")
        writer.close()
        await writer.wait_closed()
    finally:
        client.close()
        await proxy.stop()
        await emu.stop()


async def test_manifest_changes_real_emulator_controller_and_invalid_file_is_reported(tmp_path):
    tm = load_tagmap(TAGMAP)
    manifest = tmp_path / "manifest.json"
    emu = PlantEmulator(tm, port=port(), health_port=None, realtime=False, manifest_path=manifest)
    await emu.start()
    try:
        initial = emu.integrity()["observed_hash"]
        manifest.write_text(
            json.dumps({"version": 1, "PLC1_setpoint_delta": 20, "PLC2_setpoint_delta": 0})
        )
        await emu.tick()
        assert emu.integrity()["observed_hash"] != initial
        assert emu.overlay.controls.delta["PLC1"] == 20
        manifest.write_text("invalid")
        await emu.tick()
        assert emu.integrity()["error"]
        assert (
            emu.overlay.controls.delta["PLC1"] == 20
        )  # last valid configuration, no hidden fallback
    finally:
        await emu.stop()


def test_proxy_rejects_transaction_mismatch():
    tag = next(t for t in load_tagmap(TAGMAP).by_role("value") if t.node_id == "LIT101")
    request = struct.pack(">HHHBBHH", 1, 0, 6, 1, 4, 0, 2)
    response = struct.pack(">HHHBBBf", 2, 0, 7, 1, 4, 4, 50.0)
    with pytest.raises(ValueError, match="Mismatched"):
        alter_response(request, response, tag, 10)


def test_normal_read_after_alteration_does_not_erase_retained_evidence():
    def record(event_id, value):
        return {
            "id": event_id,
            "asset_id": "LIT101",
            "category": "channel_observation",
            "payload": {"emulator_value": 5, "receiver_value": value},
        }

    finding = assess_layers([record("normal", 5), record("altered", 15)])[0]
    assert finding["result"] == "supported" and finding["event_ids"] == ["altered"]


async def test_passive_integrity_observer_records_external_change(monkeypatch):
    from types import SimpleNamespace

    from app.api import lab
    from app.soc import SocStore

    count = 0

    async def info():
        nonlocal count
        count += 1
        return {
            "instance_id": "emulator1",
            "observed_hash": "a" if count == 1 else "b",
            "config": {"version": 1},
            "error": None,
        }

    monkeypatch.setattr(lab, "emulator_info", info)
    store = SocStore(":memory:")
    state = SimpleNamespace(soc=store, live=None, session_id="source1", mode="sim")
    task = asyncio.create_task(lab.observe_integrity(state, interval=0.01))
    try:
        for _ in range(20):
            await asyncio.sleep(0.01)
            if any(e["category"] == "integrity_change" for e in store.events("live")):
                break
        changes = [e for e in store.events("live") if e["category"] == "integrity_change"]
        assert len(changes) == 1
        assert changes[0]["payload"]["approval_status"] == "not_recorded"
        assert changes[0]["payload"]["applied_verified"] is True
    finally:
        task.cancel()
        await asyncio.gather(task, return_exceptions=True)
        store.close()
