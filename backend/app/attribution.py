"""Corroborating layer hypotheses. These do not rewrite process-model probabilities."""

import math
from typing import Any


def evidence_priority(event: dict[str, Any]) -> int:
    p = event["payload"]
    if event["category"] == "channel_observation":
        values = p.get("emulator_value"), p.get("receiver_value")
        if all(isinstance(v, (int, float)) and math.isfinite(v) for v in values):
            return 2 if not math.isclose(*values, rel_tol=1e-6, abs_tol=1e-6) else 0
    if (
        event["category"] == "integrity_change"
        and p.get("applied_verified")
        and p.get("before_hash")
        and p.get("after_hash")
        and p["before_hash"] != p["after_hash"]
    ):
        return 1 if p.get("approved") is True else 2
    return 0


def assess_layers(events: list[dict[str, Any]]) -> list[dict[str, Any]]:
    findings = []
    seen = set()
    # A later normal reading or approved restore must not erase retained change evidence.
    for event in sorted(events, key=evidence_priority, reverse=True):
        payload = event["payload"]
        asset = event.get("asset_id")
        kind = event["category"]
        key = (kind, asset)
        if key in seen:
            continue
        if kind == "channel_observation":
            before, after = payload.get("emulator_value"), payload.get("receiver_value")
            paired = all(isinstance(v, (int, float)) and math.isfinite(v) for v in (before, after))
            altered = paired and not math.isclose(before, after, rel_tol=1e-6, abs_tol=1e-6)
            findings.append(
                {
                    "category": "communication_channel",
                    "asset_id": asset,
                    "candidate_id": f"channel:{asset}",
                    "event_ids": [event["id"]],
                    "result": "supported"
                    if altered
                    else "unresolved"
                    if not paired
                    else "not_observed",
                    "explanation": "Paired replies differ within the local test proxy."
                    if altered
                    else "No paired receiver observation; delay/loss does not establish tampering."
                    if not paired
                    else "Paired replies match. This does not certify the entire network.",
                    "scope": "Local proxy evidence; association with this incident "
                    "is not proof of causation or ongoing compromise",
                }
            )
            seen.add(key)
        elif kind == "integrity_change":
            changed = bool(
                payload.get("before_hash")
                and payload.get("after_hash")
                and payload["before_hash"] != payload["after_hash"]
            )
            verified = payload.get("applied_verified") is True
            approved = payload.get("approved") is True
            findings.append(
                {
                    "category": "controller_configuration",
                    "asset_id": asset,
                    "candidate_id": f"config:{asset}",
                    "event_ids": [event["id"]],
                    "result": "approved_change"
                    if verified and changed and approved
                    else "supported"
                    if verified and changed
                    else "unresolved",
                    "explanation": "Emulator observed a changed configuration "
                    "with an approval record."
                    if approved and verified and changed
                    else "Configuration change observed; "
                    "approval is not established by this record."
                    if verified and changed
                    else "No verified configuration change in this record.",
                    "scope": "Emulated configuration only; "
                    "real firmware provenance remains unavailable",
                }
            )
            seen.add(key)
    return findings
