"""Tick → detect → localize → emit orchestrator. The only stateful component.

`step_sample()` advances the plant one emit period (5 ticks at 10 Hz = 0.5 s of plant time),
scores the new sample, manages the alert/incident lifecycle and returns the live message.
It is synchronous and clock-injectable; `api/ws.py` drives it from an asyncio task.
"""

import time
from collections import deque
from collections.abc import Callable
from dataclasses import dataclass
from typing import cast
from uuid import uuid4

import networkx as nx
import numpy as np
from numpy.typing import NDArray

from app.attacks import AttackEngine, AttackSpec, GroundTruth
from app.config import Settings
from app.data.simdata import EMIT_EVERY
from app.detect.baseline import BaselineDetector
from app.detect.detector import PERSIST, aggregate
from app.detect.pipeline import Loaded
from app.localize import Incident as Analysis
from app.localize import Weights, build_incident
from app.localize.incident import FORWARD_S, LOOKBACK_S, SAMPLE_DT
from app.localize.locator import Candidate
from app.schemas import (
    AlertInfo,
    AttackRequest,
    GroundTruthInfo,
    Impact,
    Incident,
    LiveMessage,
    Mode,
    NodeKind,
    NodeState,
    NodeStatus,
    OriginCandidate,
    PathStep,
    Topology,
    TopologyEdge,
    TopologyNode,
    Triple,
)
from app.sim import NODE_IDS, NODES, Plant

F64 = NDArray[np.float64]

HISTORY = round((LOOKBACK_S + FORWARD_S + 30.0) / SAMPLE_DT)  # samples kept for localization
LOCALIZE_SAMPLES = round(FORWARD_S / SAMPLE_DT) + 1  # incident refines until its window fills
CLOSE_SAMPLES = round(30.0 / SAMPLE_DT)  # quiet time before an incident closes
CONTAINED_SHOW_SAMPLES = round(10.0 / SAMPLE_DT)  # a contained incident stays on screen this long
SUSPECT_FRAC = 0.7  # node score / node threshold that marks a node "suspect"
TOP_ORIGINS = 3
WARMUP_SAMPLES = 40  # 20 s of clean plant scored silently on start and reset


@dataclass
class _Open:
    inc: Incident
    alert_k: int  # absolute sample index of the alert
    alarms: set[str]
    quiet: int = 0
    isolated_t: float | None = None  # plant time of the latest isolate action
    effective: bool = False  # every attack that was live at that moment has been isolated
    calm: int = 0  # consecutive samples with every node score under the alert threshold
    shown: int = 0  # samples a contained incident has stayed on screen


def topology_of(graph: nx.DiGraph) -> Topology:
    """The nodes and the P&ID plus learned edges of the 9-node plant."""
    return Topology(
        nodes=[
            TopologyNode(id=n.id, type=n.type.value, label=n.label, unit=n.unit, lo=n.lo, hi=n.hi)
            for n in NODES
        ],
        edges=[
            TopologyEdge(src=a, dst=b, weight=d["weight"], kind=d["kind"])
            for a, b, d in graph.edges(data=True)
        ],
    )


def origin_candidate(c: Candidate, kind: NodeKind) -> OriginCandidate:
    """Contract entry for a ranked candidate, with its score breakdown."""
    d, o, k = c.contributions()
    w = c.weights
    return OriginCandidate(
        id=c.id,
        type=kind,
        confidence=c.confidence,
        breakdown=Triple(deviation=d, onset=o, causal=k),
        weights=Triple(deviation=w.deviation, onset=w.onset, causal=w.causal),
    )


def is_ambiguous(candidates: list[Candidate], margin: float) -> bool:
    """Top-1 and top-2 confidence closer than `margin`. Read-only: the ranking is not touched."""
    return len(candidates) > 1 and candidates[0].confidence - candidates[1].confidence < margin


def worst_impact(old: Impact | None, new: Impact) -> Impact:
    """Per field, the most severe value seen so far: shortest ETA, highest stress and energy."""
    if old is None:
        return new

    def soonest(a: float | None, b: float | None) -> float | None:
        return b if a is None else a if b is None else min(a, b)

    return Impact(
        t1_overflow_s=soonest(old.t1_overflow_s, new.t1_overflow_s),
        t1_dry_s=soonest(old.t1_dry_s, new.t1_dry_s),
        t2_overflow_s=soonest(old.t2_overflow_s, new.t2_overflow_s),
        t2_dry_s=soonest(old.t2_dry_s, new.t2_dry_s),
        pump_stress={k: max(v, new.pump_stress.get(k, 0.0)) for k, v in old.pump_stress.items()},
        energy_wasted_kwh=max(old.energy_wasted_kwh, new.energy_wasted_kwh),
    )


def _has_hazard(impact: Impact) -> bool:
    """True while any tank has an overflow or dry-run estimate."""
    etas = (impact.t1_overflow_s, impact.t1_dry_s, impact.t2_overflow_s, impact.t2_dry_s)
    return any(e is not None for e in etas)


class Engine:
    mode = "sim"

    def __init__(
        self,
        loaded: Loaded,
        baseline: BaselineDetector,
        graph: nx.DiGraph,
        settings: Settings,
        detector_kind: str | None = None,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self.loaded, self.baseline, self.graph, self.settings = loaded, baseline, graph, settings
        self.detector_kind = detector_kind
        self._clock = clock
        self._weights = Weights(settings.w_deviation, settings.w_onset, settings.w_causal)
        self._contain_samples = max(1, round(settings.contain_s / SAMPLE_DT))
        self._setup_source()
        self._started = clock()
        self.incidents: list[Incident] = []
        self.latest: LiveMessage | None = None
        self._init_state()
        self._prewarm()

    # ------------------------------------------------------------------ data source seam
    # SIM reads the simulator; `live.engine.LiveEngine` overrides these to read a protocol source.
    def _setup_source(self) -> None:
        self._attacks = AttackEngine()
        self._plant = Plant(seed=self.settings.seed, overlay=self._attacks)

    def _acquire(self) -> tuple[dict[str, float], dict[str, float]]:
        """One emit period of data: (values as reported to SCADA, physical truth when known)."""
        for _ in range(EMIT_EVERY):
            self._plant.step()
        return self._plant.state(), self._plant.physical_truth()

    def _source_t(self) -> float:
        """Seconds on the source's own clock (plant time in SIM)."""
        return self._plant.t

    # ------------------------------------------------------------------ lifecycle
    def _init_state(self) -> None:
        self.session_id = uuid4().hex
        self.loaded.detector.reset()
        self._hist: deque[tuple[F64, F64, F64]] = deque(maxlen=HISTORY)  # (scores, errors, x)
        self._k = 0
        self._run = 0  # consecutive samples above the alert threshold
        self._alert_since: float | None = None
        self._open: _Open | None = None
        self._launched: list[tuple[GroundTruth, float]] = []  # (truth, wall-clock launch time)
        self._virtual_sensors: set[str] = set()
        self.incident_impact: dict[str, Impact] = {}  # worst impact seen while each incident ran

    def reset(self, seed: int | None = None) -> None:
        self._attacks.clear()
        self._plant.reset(self.settings.seed if seed is None else seed)
        self.incidents = []
        self.latest = None
        self._init_state()
        self._prewarm()

    def _prewarm(self) -> None:
        """Bring the detector to steady state before the first message.

        Its first `window` scores are zeros while the window fills, so an attack launched in the
        first seconds lost its onset ordering and was ranked worse (first-place origin in 9 of 15
        rehearsal runs instead of 15 of 15). Scoring 20 s of clean plant up front removes that gap.
        """
        for _ in range(WARMUP_SAMPLES):
            self.step_sample()
        self.incidents, self.latest = [], None

    @property
    def uptime_s(self) -> float:
        return self._clock() - self._started

    def topology(self) -> Topology:
        return topology_of(self.graph)

    # --------------------------------------------------------------------- attacks
    def launch(self, req: AttackRequest) -> str:
        """Schedule an attack starting now. Raises ValueError on an invalid scenario/target."""
        spec = AttackSpec(req.scenario, req.target, self._plant.t, req.duration_s, req.magnitude)
        attack_id = self._attacks.schedule(spec)
        self._launched.append((self._attacks.ground_truth()[-1], self._clock()))
        return attack_id

    def record_external_launch(self, gt: GroundTruth, wall_time: float) -> None:
        """Phase 13: register ground truth for an attack launched outside this engine (the
        attacker tool, against the plant emulator in LIVE mode). Read-only toward the plant:
        this only lets the UI reveal what the attacker did; it never causes anything itself."""
        self._launched.append((gt, wall_time))

    def isolate(self, incident_id: str, node_id: str) -> tuple[bool, str | None]:
        """Operator action on the active incident. Returns (applied, reason if refused).

        Applying it only removes an attack's effect where the attack really acts: isolating any
        other node changes nothing. The incident becomes `contained` once an attack that was live
        has been isolated AND every node score then stays under the alert threshold for
        `contain_s`; the simulator knows whether an attack still acts, the detector alone cannot
        see a settled offset."""
        op = self._open
        if op is None or op.inc.id != incident_id or op.inc.status not in ("localizing", "open"):
            return False, "Incident is not active"
        if node_id not in NODE_IDS:
            return False, "Unknown node"
        if node_id in self._attacks.isolated:
            return False, "Node already isolated"
        self._attacks.isolate(node_id)
        self._virtual_sensors.add(node_id)
        op.inc.virtual_active = True
        live = self._attacks.active(self._plant.t)
        op.isolated_t = self._plant.t
        op.effective = bool(live) and all(g.target in self._attacks.isolated for g in live)
        op.calm = 0
        return True, None

    def _truth_for(self, plant_t: float) -> GroundTruthInfo | None:
        for gt, wall in reversed(self._launched):
            if gt.start_s <= plant_t:
                return GroundTruthInfo(
                    attack_id=gt.attack_id,
                    scenario=gt.scenario,
                    target=gt.target,
                    started_at=wall,
                    mitre=gt.mitre,
                )
        return None

    # ------------------------------------------------------------------------ tick
    def step_sample(self) -> LiveMessage:
        reported, truth = self._acquire()
        now = self._clock()
        x = np.array([reported[n] for n in NODE_IDS])
        scores = self.loaded.detector.update(x)
        agg = float(aggregate(scores))

        self._run = self._run + 1 if agg > self.loaded.threshold else 0
        alerting = self._run >= PERSIST
        if alerting and self._alert_since is None:
            self._alert_since = now
        elif not alerting:
            self._alert_since = None

        self._hist.append((scores, self.loaded.detector.last_error, x))
        k = self._k
        self._k += 1
        impact = self._impact()
        hazard = impact is not None and _has_hazard(impact)
        self._advance_incident(k, alerting, now, x, scores, hazard=hazard)

        inc = self._open.inc if self._open else None
        if inc is not None and impact is not None:
            self.incident_impact[inc.id] = worst_impact(self.incident_impact.get(inc.id), impact)
        msg = LiveMessage(
            t=now,
            mode=cast(Mode, self.mode),
            nodes=self._node_states(reported, truth, scores, inc),
            alert=AlertInfo(since=self._alert_since, score=agg, threshold=self.loaded.threshold)
            if self._alert_since is not None
            else None,
            incident=inc.model_copy(deep=True) if inc else None,
            impact=impact,
        )
        self.latest = msg
        return msg

    # ------------------------------------------------------------------- incidents
    def _arrays(self) -> tuple[F64, F64, F64, int]:
        scores = np.array([s for s, _, _ in self._hist])
        errors = np.array([e for _, e, _ in self._hist])
        xs = np.array([v for _, _, v in self._hist])
        return scores, errors, xs, self._k - len(self._hist)  # k of the first stored sample

    def _analyze(self, alert_k: int) -> Analysis:
        scores, errors, xs, k0 = self._arrays()
        return build_incident(
            scores,
            errors,
            xs,
            alert_k - k0,
            self.loaded.detector.norm.mu,
            self.loaded.node_thr,
            self.graph,
            self._weights,
        )

    def _to_schema(self, a: Analysis, base: Incident | None, alarms: set[str]) -> Incident:
        return Incident(
            id=base.id if base else f"inc_{uuid4().hex}",
            status=base.status if base else "localizing",
            detected_at=base.detected_at if base else self._clock(),
            origin=[
                origin_candidate(c, cast(NodeKind, c.type)) for c in a.candidates[:TOP_ORIGINS]
            ],
            path=[PathStep(id=n.id, t=n.t, deviation=n.deviation) for n in a.propagation.nodes],
            path_edges=a.propagation.edges,
            explanation=a.explanation.text,
            action=a.explanation.action,
            mitre=a.explanation.mitre,
            mitre_name=a.explanation.mitre_name,
            baseline_alarms=[n for n in NODE_IDS if n in alarms],
            ground_truth=base.ground_truth if base else None,
            mode=cast(Mode, self.mode),
            ambiguous=is_ambiguous(a.candidates, self.settings.gate_margin),
        )

    def _advance_incident(
        self, k: int, alerting: bool, now: float, x: F64, scores: F64, hazard: bool = False
    ) -> None:
        """`hazard`: the plant still reports an overflow / dry-run estimate. A persistent offset
        stops raising alerts once the plant settles at its new, spoofed equilibrium, so closing on
        a quiet alert alone declared the incident resolved while a tank was still overfilling."""
        op = self._open
        if op is None:
            if not alerting:
                return
            _, _, xs, k0 = self._arrays()
            lo = max(0, k - round(LOOKBACK_S / SAMPLE_DT) - k0)
            hits = np.atleast_1d(self.baseline.breaches(xs[lo:]).any(axis=0))
            alarms = {n for n, hit in zip(NODE_IDS, hits.tolist(), strict=True) if hit}
            inc = self._to_schema(self._analyze(k), None, alarms)
            inc.ground_truth = self._truth_for(self._source_t())
            self._open = _Open(inc, k, alarms)
            self.incidents.append(inc)
            return
        if op.inc.status == "contained":  # stays visible a few seconds, then leaves the live feed
            op.shown += 1
            if op.shown >= CONTAINED_SHOW_SAMPLES:
                self._open = None
            self._sync_history(op.inc)
            return
        op.alarms.update(self.baseline.alarms(x))
        op.quiet = 0 if (alerting or hazard) else op.quiet + 1
        if op.inc.status == "localizing":
            op.inc = self._to_schema(self._analyze(op.alert_k), op.inc, op.alarms)
            if k - op.alert_k + 1 >= LOCALIZE_SAMPLES:
                op.inc.status = "open"
        else:
            op.inc.baseline_alarms = [n for n in NODE_IDS if n in op.alarms]
        if op.isolated_t is not None and op.effective and op.inc.status in ("localizing", "open"):
            op.calm = op.calm + 1 if float(np.max(scores)) < self.loaded.threshold else 0
            if op.calm >= self._contain_samples:
                op.inc.status = "contained"
                op.inc.contained_at = now
                op.inc.time_to_contain_s = self._source_t() - op.isolated_t
        if op.inc.status == "open" and op.quiet >= CLOSE_SAMPLES:
            op.inc.status = "closed"
            self._open = None
        self._sync_history(op.inc)

    def _sync_history(self, inc: Incident) -> None:
        for i, old in enumerate(self.incidents):
            if old.id == inc.id:
                self.incidents[i] = inc
                return

    # --------------------------------------------------------------------- message
    def _node_states(
        self,
        reported: dict[str, float],
        truth: dict[str, float],
        scores: F64,
        inc: Incident | None,
    ) -> list[NodeState]:
        live = inc is not None and inc.status not in ("closed", "contained")
        origin = inc.origin[0].id if inc and live else None
        affected = {s.id for s in inc.path} if inc and live else set()
        out = []
        for i, n in enumerate(NODE_IDS):
            status: NodeStatus
            if n == origin:
                status = "origin"
            elif n in affected:
                status = "affected"
            elif scores[i] > SUSPECT_FRAC * self.loaded.node_thr[i]:
                status = "suspect"
            else:
                status = "normal"
            out.append(
                NodeState(
                    id=n,
                    value=reported[n],
                    truth=truth.get(n),
                    score=float(scores[i]),
                    status=status,
                    is_virtual=True if n in self._virtual_sensors else None,
                )
            )
        return out

    def _impact(self) -> Impact | None:
        im = self._plant.impact()
        return Impact(
            t1_overflow_s=im.t1_overflow_s,
            t1_dry_s=im.t1_dry_s,
            t2_overflow_s=im.t2_overflow_s,
            t2_dry_s=im.t2_dry_s,
            pump_stress=im.pump_stress,
            energy_wasted_kwh=im.energy_wasted_kwh,
        )
