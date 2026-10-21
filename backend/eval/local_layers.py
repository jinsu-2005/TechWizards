"""Reproducible paired-evidence checks using real loopback Modbus traffic.

Run from backend: python -m eval.local_layers. This is not a detector benchmark
and does not estimate real-world attack attribution accuracy.
"""

import asyncio
import json
import socket
import sys
import tempfile
import time
from collections import Counter
from datetime import UTC, datetime
from pathlib import Path

from pymodbus.client import AsyncModbusTcpClient

from app.attribution import assess_layers
from app.live.lab_proxy import LabProxy
from app.live.tagmap import decode, load_tagmap

ROOT = Path(__file__).resolve().parents[2]


def free_port() -> int:
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return int(sock.getsockname()[1])


async def evaluate() -> dict:
    if str(ROOT) not in sys.path:
        sys.path.insert(0, str(ROOT))
    from plant_emulator.server import PlantEmulator

    results = []
    tm = load_tagmap(ROOT / "config" / "tagmap.yaml")
    with tempfile.TemporaryDirectory() as directory:
        for seed in (401, 719, 997):  # independent of detector training seeds
            emu = PlantEmulator(
                tm,
                seed=seed,
                port=free_port(),
                health_port=None,
                realtime=False,
                manifest_path=Path(directory) / f"{seed}.json",
            )
            proxy = LabProxy(tm, lambda *_: None, listen_port=free_port(), upstream_port=emu.port)
            client = AsyncModbusTcpClient("127.0.0.1", port=proxy.listen_port, timeout=1, retries=0)
            try:
                await emu.start()
                for _ in range(20):
                    await emu.tick()
                await proxy.start()
                await client.connect()
                for name, offset, delay, expected in (
                    ("unchanged_reply", 0, 0, "not_observed"),
                    ("altered_reply", 10, 0, "supported"),
                    ("benign_delay", 0, 250, "not_observed"),
                ):
                    proxy.offset, proxy.delay_ms = offset, delay
                    start = time.perf_counter()
                    reply = await client.read_input_registers(0, count=24, device_id=tm.device_id)
                    if reply.isError() or not proxy.latest:
                        raise RuntimeError("Loopback observation unavailable")
                    tag = tm.surface("value", "LIT101")
                    received = decode(tag, reply.registers[tag.address : tag.address + tag.width])
                    if abs(received - proxy.latest["receiver_value"]) > 0.001:
                        raise RuntimeError("Client reading differs from paired response")
                    event = {
                        "id": "validation",
                        "asset_id": "LIT101",
                        "category": "channel_observation",
                        "payload": proxy.latest,
                    }
                    predicted = assess_layers([event])[0]["result"]
                    results.append(
                        {
                            "seed": seed,
                            "scenario": name,
                            "expected": expected,
                            "predicted": predicted,
                            "elapsed_ms": (time.perf_counter() - start) * 1000,
                            "client_value_verified": True,
                        }
                    )
                # Gradual tampering over five transactions: rules see paired values, not labels.
                proxy.delay_ms = 0
                drift = []
                for offset in (0, 0.5, 1, 1.5, 2):
                    proxy.offset = offset
                    reply = await client.read_input_registers(0, count=24, device_id=tm.device_id)
                    if reply.isError() or not proxy.latest:
                        raise RuntimeError("Drift observation unavailable")
                    drift.append(proxy.latest.copy())
                finding = assess_layers(
                    [
                        {
                            "id": f"drift_{i}",
                            "asset_id": "LIT101",
                            "category": "channel_observation",
                            "payload": p,
                        }
                        for i, p in enumerate(drift)
                    ]
                )[0]
                results.append(
                    {
                        "seed": seed,
                        "scenario": "gradual_channel_drift",
                        "expected": "supported",
                        "predicted": finding["result"],
                        "offsets": [p["receiver_value"] - p["emulator_value"] for p in drift],
                        "scope": "Five accelerated transactions; not a detector-duration trial",
                    }
                )
                # Missing paired observations are evaluated without inventing receiver readings.
                finding = assess_layers(
                    [
                        {
                            "id": "missing",
                            "asset_id": "LIT101",
                            "category": "channel_observation",
                            "payload": {"emulator_value": 50, "receiver_value": None},
                        }
                    ]
                )[0]
                results.append(
                    {
                        "seed": seed,
                        "scenario": "missing_pair",
                        "expected": "unresolved",
                        "predicted": finding["result"],
                    }
                )
                for name, delta, approved, expected in (
                    ("approved_config", 10, True, "approved_change"),
                    ("unapproved_config", 20, False, "supported"),
                ):
                    before = emu.integrity()["observed_hash"]
                    config = {"version": 1, "PLC1_setpoint_delta": delta, "PLC2_setpoint_delta": 0}
                    emu.manifest_path.write_text(json.dumps(config))
                    await emu.tick()
                    after = emu.integrity()
                    finding = assess_layers(
                        [
                            {
                                "id": "config",
                                "asset_id": "PLC1",
                                "category": "integrity_change",
                                "payload": {
                                    "before_hash": before,
                                    "after_hash": after["observed_hash"],
                                    "approved": approved,
                                    "applied_verified": after["config"] == config,
                                },
                            }
                        ]
                    )[0]
                    results.append(
                        {
                            "seed": seed,
                            "scenario": name,
                            "expected": expected,
                            "predicted": finding["result"],
                        }
                    )
                # Two independent evidence layers coexist; neither should suppress the other.
                proxy.offset = 5
                reply = await client.read_input_registers(0, count=24, device_id=tm.device_id)
                if reply.isError() or not proxy.latest:
                    raise RuntimeError("Combined observation unavailable")
                combined = assess_layers(
                    [
                        {
                            "id": "channel",
                            "asset_id": "LIT101",
                            "category": "channel_observation",
                            "payload": proxy.latest,
                        },
                        {
                            "id": "config",
                            "asset_id": "PLC1",
                            "category": "integrity_change",
                            "payload": {
                                "before_hash": before,
                                "after_hash": after["observed_hash"],
                                "approved": False,
                                "applied_verified": after["config"] == config,
                            },
                        },
                    ]
                )
                results.append(
                    {
                        "seed": seed,
                        "scenario": "simultaneous_channel_and_controller",
                        "expected": "both_supported",
                        "predicted": "both_supported"
                        if len(combined) == 2 and all(h["result"] == "supported" for h in combined)
                        else "unresolved",
                        "hypotheses": combined,
                    }
                )
            finally:
                client.close()
                await proxy.stop()
                await emu.stop()
    confusion = Counter((r["expected"], r["predicted"]) for r in results)
    return {
        "schema_version": 2,
        "generated_at": datetime.now(UTC).isoformat(),
        "scope": "Local paired-evidence rules; not detector accuracy or real firmware validation",
        "seeds": [401, 719, 997],
        "cases": len(results),
        "passed": sum(r["expected"] == r["predicted"] for r in results),
        "confusion": [
            {"expected": a, "predicted": b, "count": count} for (a, b), count in confusion.items()
        ],
        "results": results,
        "not_measured": [
            "end-to-end origin accuracy",
            "confidence calibration",
            "physical hardware behavior",
            "end-to-end simultaneous detector localization",
        ],
    }


if __name__ == "__main__":
    report = asyncio.run(evaluate())
    path = ROOT / "reports" / "local_layer_validation.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Local layer checks: {report['passed']}/{report['cases']} passed. Report: {path}")
