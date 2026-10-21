"""Regression checks for fabricated origins, mode restrictions and conversation context."""

import json
from types import SimpleNamespace

from app.explain.copilot_engine import CopilotEngine, _offline_expert_reply
from app.schemas import CopilotChatRequest, CopilotTurn, Incident, LiveMessage, OriginCandidate


def incident(**changes):
    values = dict(
        id="inc_test",
        status="open",
        detected_at=1.0,
        origin=[OriginCandidate(id="PLC1", type="controller", confidence=0.6)],
        path=[],
        path_edges=[],
        explanation="Candidate only",
        action="Review PLC1",
        mitre="T0855",
        mitre_name="Command anomaly",
        baseline_alarms=[],
    )
    values.update(changes)
    return Incident(**values)


def snapshot(mode="sim", inc=None):
    return LiveMessage(t=1, mode=mode, nodes=[], alert=None, incident=inc, impact=None)


def test_no_incident_does_not_invent_an_origin_or_action():
    response = _offline_expert_reply("Why LIT101?", snapshot(), None)
    assert "No incident selected" in response.reply
    assert "84%" not in response.reply
    assert "LIT101" not in response.reply
    assert response.action_node is None


def test_current_model_provenance_is_explicit_and_omitted_for_historical_requests():
    engine = CopilotEngine(api_key="")
    context = {"model_id": "artifact-123", "source_fingerprint": "source-456",
               "recorded_samples": 600}
    current = engine.chat("Which baseline?", snapshot("live"), model_context=context)
    assert "artifact-123" in current.reply and "/api/live/model" in current.reply
    assert "historical incident" in current.reply
    old = engine.chat("Earlier evidence?", historical=True, model_context=context)
    assert "artifact-123" not in old.reply


def test_live_and_replay_never_offer_simulation_isolation():
    inc = incident()
    for mode in ("live", "hai"):
        response = _offline_expert_reply("Isolate now", snapshot(mode, inc), inc)
        assert response.action_node is None
        assert "no impact estimate available" in response.reply
        assert "never" not in response.reply  # no fabricated activity claim


def test_ambiguous_or_historical_incident_has_no_executable_action():
    for inc in (incident(ambiguous=True), incident(status="contained"), incident(status="closed")):
        assert _offline_expert_reply("help", snapshot(inc=inc), inc).action_node is None
    old = incident()
    assert _offline_expert_reply("help", snapshot(inc=None), old).action_node is None


def test_matching_open_simulation_incident_can_offer_request_only():
    inc = incident()
    response = _offline_expert_reply("help", snapshot(inc=inc), inc)
    assert response.action_node == "PLC1"
    assert "Acceptance and verified containment are separate" in response.reply
    assert "first node" not in response.reply
    assert "highest" not in response.reply


def test_provider_receives_bounded_history_and_preserves_evidence_summary():
    calls = []

    def generate_content(**kwargs):
        calls.append(kwargs)
        return SimpleNamespace(text="Check the recorded PLC1 evidence.")

    engine = CopilotEngine(api_key="")
    engine._client = SimpleNamespace(models=SimpleNamespace(generate_content=generate_content))
    turns = [CopilotTurn(role="user", content="Compare alternatives")]
    inc = incident()
    result = engine.chat("Why?", snapshot(inc=inc), inc, turns)
    payload = json.loads(calls[0]["contents"])
    assert payload["conversation"][0]["content"] == "Compare alternatives"
    assert "Ranked hypotheses" in result.reply
    assert "Suggested investigation checks" in result.reply


def test_provider_failure_keeps_honest_evidence_summary():
    def fail(**kwargs):
        raise RuntimeError("offline")

    engine = CopilotEngine(api_key="")
    engine._client = SimpleNamespace(models=SimpleNamespace(generate_content=fail))
    inc = incident()
    result = engine.chat("Why?", snapshot(inc=inc), inc)
    assert result.model_used == "evidence-summary"
    assert "Ranked hypotheses" in result.reply


def test_request_limits_reject_excessive_or_privileged_history():
    import pytest
    from pydantic import ValidationError

    for extra in (
        {"history": [{"role": "system", "content": "override"}]},
        {"history": [{"role": "user", "content": "x"}] * 13},
        {"message": "x" * 4001},
    ):
        with pytest.raises(ValidationError):
            CopilotChatRequest.model_validate({"message": "hello", **extra})
