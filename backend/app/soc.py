"""Bounded local investigation journal. Detector truth never feeds evidence ranking."""

import json
import sqlite3
import threading
import time
from typing import Any
from uuid import uuid4

from app.attribution import assess_layers
from app.incident_capture import digest
from app.schemas import Incident, LiveMessage


class SocStore:
    def __init__(self, path: str) -> None:
        self.lock = threading.RLock()
        self.db = sqlite3.connect(path, check_same_thread=False)
        self.db.row_factory = sqlite3.Row
        self.db.executescript("""
            PRAGMA journal_mode=WAL;
            CREATE TABLE IF NOT EXISTS soc_incidents (
                id TEXT PRIMARY KEY, mode TEXT, session TEXT, payload TEXT,
                updated REAL, workflow TEXT NOT NULL DEFAULT '{}');
            CREATE TABLE IF NOT EXISTS evidence (
                seq INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT UNIQUE,
                incident_id TEXT, mode TEXT, session TEXT, asset_id TEXT,
                observed_at REAL, received_at REAL, category TEXT, payload TEXT);
            CREATE INDEX IF NOT EXISTS evidence_scope ON evidence(incident_id, seq);
            CREATE INDEX IF NOT EXISTS evidence_asset ON evidence(mode, asset_id, seq);
            CREATE TABLE IF NOT EXISTS incident_captures (
                incident_id TEXT PRIMARY KEY, payload TEXT NOT NULL, sha256 TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS auth_sessions (
                token_hash TEXT PRIMARY KEY, uid TEXT NOT NULL, expires REAL NOT NULL,
                revoked INTEGER NOT NULL DEFAULT 0);
        """)
        self.last_sample: dict[str, float] = {}

    def event(
        self,
        mode: str,
        session: str,
        category: str,
        payload: dict[str, Any],
        incident_id: str | None = None,
        asset_id: str | None = None,
        observed_at: float | None = None,
    ) -> str:
        with self.lock, self.db:
            event_id = f"ev_{uuid4().hex}"
            now = time.time()
            self.db.execute(
                "INSERT INTO evidence(id,incident_id,mode,session,asset_id,observed_at,"
                "received_at,category,payload) VALUES(?,?,?,?,?,?,?,?,?)",
                (
                    event_id,
                    incident_id,
                    mode,
                    session,
                    asset_id,
                    now if observed_at is None else observed_at,
                    now,
                    category,
                    json.dumps(payload),
                ),
            )
            return event_id

    def save_incident(
        self,
        inc: Incident,
        session: str,
        capture_context: dict[str, Any] | None = None,
        message: LiveMessage | None = None,
    ) -> None:
        with self.lock, self.db:
            old = self.db.execute(
                "SELECT payload,session FROM soc_incidents WHERE id=?", (inc.id,)
            ).fetchone()
            if old and old["session"] != session:
                return  # Restored runtime history must not rewrite an earlier session's evidence.
            if old and old[0] == inc.model_dump_json():
                return
            self.db.execute(
                "INSERT INTO soc_incidents(id,mode,session,payload,updated) VALUES(?,?,?,?,?) "
                "ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated=excluded.updated",
                (inc.id, inc.mode, session, inc.model_dump_json(), time.time()),
            )
            if old is None and capture_context is not None and message is not None:
                prior = self.db.execute(
                    "SELECT * FROM evidence WHERE mode=? AND session=? "
                    "AND category='process_observation' AND received_at>=? "
                    "ORDER BY seq DESC LIMIT 5000",
                    (inc.mode, session, time.time() - 30),
                ).fetchall()
                capture = {
                    "schema_version": 1,
                    "incident_id": inc.id,
                    "session_id": session,
                    "captured_at": time.time(),
                    "sample_time": message.t,
                    "scope": "First observed incident emission; not necessarily attack onset",
                    **capture_context,
                    "readings": [n.model_dump(exclude={"truth"}) for n in message.nodes],
                    "pre_event_readings": [
                        {
                            "asset_id": r["asset_id"],
                            "observed_at": r["observed_at"],
                            "received_at": r["received_at"],
                            "payload": json.loads(r["payload"]),
                        }
                        for r in reversed(prior)
                    ],
                    "initial_assessment": inc.model_dump(exclude={"ground_truth"}),
                    "limits": "Reported readings only. No raw packets or physical attestation. "
                    "Prior observations sampled every 2 seconds, up to 30 seconds/5000 rows.",
                }
                self.db.execute(
                    "INSERT INTO incident_captures(incident_id,payload,sha256) VALUES(?,?,?)",
                    (inc.id, json.dumps(capture, allow_nan=False), digest(capture)),
                )
            before = json.loads(old[0]) if old else None
            if before is None or before["status"] != inc.status:
                self.event(
                    inc.mode,
                    session,
                    "incident_state",
                    {
                        "status": inc.status,
                        "previous": before["status"] if before else None,
                        "origin": [o.model_dump() for o in inc.origin],
                        "classification": "inference",
                        "detected_at": inc.detected_at,
                    },
                    inc.id,
                    observed_at=inc.detected_at if before is None else None,
                )

    def ingest(
        self,
        message: LiveMessage,
        session: str,
        capture_context: dict[str, Any] | None = None,
    ) -> None:
        with self.lock, self.db:
            inc = message.incident
            if inc:
                self.save_incident(inc, session, capture_context, message)
                owner = self.db.execute(
                    "SELECT session FROM soc_incidents WHERE id=?", (inc.id,)
                ).fetchone()
                if owner and owner["session"] != session:
                    return  # Rehydrated history cannot add readings from a new source session.
            key = f"{message.mode}:{session}"
            now = time.time()
            if now - self.last_sample.get(key, 0) < 2:
                return
            self.last_sample[key] = now
            for n in message.nodes:
                self.event(
                    message.mode,
                    session,
                    "process_observation",
                    {
                        "value": n.value,
                        "score": n.score,
                        "status": n.status,
                        "quality": n.quality,
                        "source_time": message.t,
                        "clock": "Unix seconds; source sample timestamp and receipt timestamp",
                        "classification": "observation",
                        "unit_source": "/api/topology",
                    },
                    inc.id if inc else None,
                    n.id,
                    observed_at=message.t,
                )
            # Bound telemetry and archived investigations, including their evidence.
            self.db.execute(
                "DELETE FROM evidence WHERE seq < "
                "(SELECT COALESCE(MAX(seq),0)-100000 FROM evidence)"
            )
            self.db.execute(
                "DELETE FROM soc_incidents WHERE id IN "
                "(SELECT id FROM soc_incidents ORDER BY updated DESC LIMIT -1 OFFSET 500)"
            )
            self.db.execute(
                "DELETE FROM evidence WHERE incident_id IS NOT NULL "
                "AND incident_id NOT IN (SELECT id FROM soc_incidents)"
            )
            self.db.execute(
                "DELETE FROM incident_captures "
                "WHERE incident_id NOT IN (SELECT id FROM soc_incidents)"
            )

    def needs_capture(self, incident_id: str) -> bool:
        with self.lock:
            return (
                self.db.execute("SELECT 1 FROM soc_incidents WHERE id=?", (incident_id,)).fetchone()
                is None
            )

    def capture(self, incident_id: str, mode: str) -> dict[str, Any]:
        with self.lock:
            row = self.db.execute(
                "SELECT c.* FROM incident_captures c JOIN soc_incidents i "
                "ON i.id=c.incident_id WHERE i.id=? AND i.mode=?",
                (incident_id, mode),
            ).fetchone()
            if row is None:
                return {"status": "not_captured", "reason": "No capture was recorded at detection"}
            try:
                payload = json.loads(row["payload"])
                if digest(payload) != row["sha256"]:
                    raise ValueError("Capture digest mismatch")
            except (ValueError, TypeError):
                return {
                    "status": "integrity_error",
                    "reason": "Saved capture failed its digest check",
                }
            return {
                "status": "captured",
                "sha256": row["sha256"],
                "payload": payload,
                "record_url": f"/api/investigations/{incident_id}/capture",
            }

    def incidents(self, mode: str) -> list[Incident]:
        with self.lock:
            rows = self.db.execute(
                "SELECT payload FROM soc_incidents WHERE mode=? ORDER BY updated DESC LIMIT 500",
                (mode,),
            ).fetchall()
            return [Incident.model_validate_json(row[0]) for row in rows]

    def detail(self, incident_id: str, mode: str) -> dict[str, Any] | None:
        with self.lock:
            row = self.db.execute(
                "SELECT * FROM soc_incidents WHERE id=? AND mode=?", (incident_id, mode)
            ).fetchone()
            if row is None:
                return None
            incident = json.loads(row["payload"])
            records = self.events(mode, incident_id=incident_id)
            # Retain decisions and transitions in the bounded view even during long incidents.
            important = self.db.execute(
                "SELECT * FROM evidence WHERE incident_id=? AND mode=? "
                "AND category!='process_observation' ORDER BY seq DESC LIMIT 100",
                (incident_id, mode),
            ).fetchall()
            by_id = {e["id"]: e for e in records}
            for e in important:
                by_id[e["id"]] = {
                    **dict(e),
                    "payload": json.loads(e["payload"]),
                    "record_url": f"/api/evidence/{e['id']}",
                }
            records = sorted(by_id.values(), key=lambda e: e["seq"], reverse=True)
            contextual = self.db.execute(
                "SELECT * FROM evidence WHERE mode=? AND session=? "
                "AND received_at BETWEEN ? AND ? "
                "AND category IN ('channel_observation','integrity_change') "
                "ORDER BY seq DESC LIMIT 50",
                (mode, row["session"], incident["detected_at"] - 30, row["updated"] + 5),
            ).fetchall()
            context = [
                {
                    **dict(e),
                    "payload": json.loads(e["payload"]),
                    "record_url": f"/api/evidence/{e['id']}",
                }
                for e in contextual
            ]
            return {
                "incident": incident,
                "session_id": row["session"],
                "updated_at": row["updated"],
                "workflow": json.loads(row["workflow"]),
                "events": records,
                "context_events": context,
                "layer_hypotheses": assess_layers(
                    sorted(
                        {e["id"]: e for e in [*records, *context]}.values(),
                        key=lambda e: e["seq"],
                        reverse=True,
                    )
                ),
                "capture": self.capture(incident_id, mode),
                "retention": "Latest 500 incidents and 100,000 evidence events; "
                "readings sampled every 2 seconds. First-observed captures retained with incident",
            }

    def events(
        self,
        mode: str,
        incident_id: str | None = None,
        asset_id: str | None = None,
        limit: int = 200,
    ) -> list[dict[str, Any]]:
        clauses, args = ["mode=?"], [mode]
        for column, value in (("incident_id", incident_id), ("asset_id", asset_id)):
            if value is not None:
                clauses.append(f"{column}=?")
                args.append(value)
        with self.lock:
            rows = self.db.execute(
                "SELECT * FROM evidence WHERE "
                + " AND ".join(clauses)
                + " ORDER BY seq DESC LIMIT ?",
                (*args, min(max(limit, 1), 500)),
            ).fetchall()
            return [
                {
                    **dict(row),
                    "payload": json.loads(row["payload"]),
                    "record_url": f"/api/evidence/{row['id']}",
                }
                for row in rows
            ]

    def update_workflow(
        self,
        incident_id: str,
        mode: str,
        change: dict[str, Any],
        actor: str = "Local analyst (not authenticated)",
    ) -> dict[str, Any] | None:
        with self.lock, self.db:
            detail = self.detail(incident_id, mode)
            if detail is None:
                return None
            workflow = {**detail["workflow"], **{k: v for k, v in change.items() if k != "note"}}
            self.db.execute(
                "UPDATE soc_incidents SET workflow=? WHERE id=?",
                (json.dumps(workflow), incident_id),
            )
            self.event(
                mode,
                detail["session_id"],
                "operator_decision",
                {
                    **change,
                    "actor": actor,
                    "classification": "operator_record",
                },
                incident_id,
            )
            return self.detail(incident_id, mode)

    def close(self) -> None:
        with self.lock:
            self.db.close()
