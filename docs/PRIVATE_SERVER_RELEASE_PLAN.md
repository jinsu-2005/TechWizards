# Private-server release plan — 16 October 2026

Target: multiple authenticated users on a private server. Existing simulator, HAI replay and
local Modbus emulator remain the supported environments. This plan does not claim readiness
to protect or control a physical industrial facility.

## Current assessment

The application has tested detection, a persistent evidence journal, historical model captures,
an investigation workflow and a working Copilot fallback. The last completed suites passed
310 backend and 144 frontend tests; those do not constitute production certification.

Repository review found these release blockers:

- `backend/app/api/security.py` explicitly implements demo-key protection, not user authentication.
  `VITE_API_KEY` is embedded in the browser build. Read APIs and `/ws/live` remain open.
- Active source mode is application-wide state. User source navigation must not switch the
  monitoring context for other people. Process-local runtimes, rate limits and Copilot slots
  also cannot simply be replicated by adding web workers.
- Analyst records use an unauthenticated local identity. Case access, roles and action auditing
  need enforcement on the server, including exports and evidence references.
- Compose mounts LIVE data but does not explicitly persist `AT_SOC_DB` in its mounted directory.
  Container replacement can lose the investigation journal under the current default path.
- Compose exposes the backend port directly; nginx has no TLS configuration or explicit security
  headers. Backend image runs without an explicit non-root user. No `.github` CI directory exists.
- Native zoom and an actual screen-reader session remain unverified. Four held-out gentle-drift
  cases were missed, and simultaneous-origin cases recovered only one of the two injected origins.

## Phase 1 — Copilot polish and urgent persistence

Design: restrained security investigation interface, existing theme tokens, readable text and
predictable spacing. Preserve the project's identity rather than introduce a second component system.

1. Replace the large undifferentiated assistant bubble with a concise answer and clear sections:
   assessment, supporting evidence, alternatives/uncertainty, and suggested checks.
2. Collapse model hashes, full evidence payloads, repetitive caveats and long reference lists behind
   labeled disclosures. Keep uncertainty visible; never hide a material limitation in a disclosure.
3. Use readable citations such as `LIT101 · first observation`, with a preview showing source,
   timestamp and saved/current status. Do not make a raw API JSON page the primary reading experience.
4. Replace the single-line input with an expanding multiline composer. Enter sends, Shift+Enter
   inserts a line, and composition input does not accidentally submit. Keep Send/Cancel visible.
5. Add contextual empty states, clear loading/cancel/retry/offline states, copy-answer and new-chat
   controls. Preserve text while reading older messages; auto-scroll only when already at the bottom.
6. Make incident/source selection clear, shorten visible IDs with accessible full references, separate
   read-only advice from explicitly authorized simulator actions, and remove redundant suggestion rows.
7. Support a desktop side panel and a full-screen phone layout with accessible focus management and
   reduced motion. Verify long answers, disconnected streams, missing captures and archived incidents.
8. Immediately persist the existing investigation database on a mounted volume and verify a restore
   and container replacement before migrating storage. Preserve existing records.

Acceptance: screenshots at representative phone/tablet/desktop sizes; no page overflow, reachable
composer, keyboard flow and stable scroll behavior. No change to evidence meaning or detector scores.

## Phase 2 — Consistent interface across the workspace

Audit Dashboard, Alerts, Assets, Investigations, Sources, Metrics, Local lab and overlays. Track each
finding by screen and viewport rather than broadly claiming every UI issue is fixed.

- Standardize spacing, type sizes, panel headings, button heights, icon sizing and form alignment.
- Use shared semantic tokens for selection, normal/warning/critical, muted text and keyboard focus.
  Theme colors must not change the meaning of severity or rely on color alone.
- Improve table density, wrapping, empty/loading/error/stale states and small-screen navigation.
- Make process/twin zoom controls predictable and keep labels legible. Test resized and expanded views.
- Review all supported themes; do not silently remove existing choices. Document which have passed
  contrast checks before advertising production theme support.

Acceptance: reproducible visual checks, contrast checks, keyboard-only walkthrough, target-browser
200%/400% zoom and a real NVDA or VoiceOver pass. Browser accessibility-tree checks supplement these.

## Phase 3 — Authenticated users and server-side authorization

Use standards-based OIDC through the organization's existing identity provider where available.
Provider selection is a deployment input; avoid building a custom password system. Prefer same-origin
server-managed sessions in Secure, HttpOnly cookies, with CSRF protection, expiry/revocation and logout.
Verify issuer/audience/signatures and enforce private-server HTTPS. Do not ship shared admin credentials
or depend on a browser-embedded secret for authorization.

Initial roles:

| Role | Intended access |
| --- | --- |
| Viewer | Read permitted sources, incidents and evidence |
| Analyst | Viewer access plus acknowledge, investigate and add attributed notes |
| Administrator | Manage membership/source configuration and explicitly enabled sandbox capabilities |

Enforce workspace/source membership on every API, WebSocket subscription, citation and export.
Anonymous, revoked and wrong-workspace requests must fail. UI visibility is not authorization.
Audit actor, action, scope, time and outcome. Server policy must constrain any Copilot action.

Disable attack/reset/configuration experiments in the monitoring deployment by default. If needed,
run the emulator lab as an explicitly enabled isolated sandbox with audited administrator access.
Physical LIVE control remains outside scope.

Acceptance: negative authorization tests, session/CSRF tests, WebSocket expiry/revocation checks,
and verified role-based access for evidence, notes, exports, source settings and sandbox operations.

## Phase 4 — Shared monitoring and durable storage

- Define a workspace/source boundary even for a single organization. Analysts can share a case while
  their selected screen, source view and replay position remain personal navigation state.
- Separate ingestion/analysis ownership from API workers. Run exactly one owner for each source;
  publish scoped telemetry to authenticated subscribers. Do not start duplicate plant simulators or
  pollers when web workers scale. Explicit source administration is distinct from selecting a view.
- Migrate incident/evidence/workflow/user/audit records to PostgreSQL with versioned migrations,
  constrained relationships and source/workspace access rules. Import existing SQLite records and
  immutable captures, verify checksums/counts, retain backups and define a rollback path.
- Keep model artifacts and exports in backed-up persistent storage, with references and checksums in
  the database. Define retention, storage limits, migrations and model compatibility behavior.
- Keep Copilot conversation persistence per user/workspace with an explicit retention policy; do not
  silently store provider prompts or telemetry indefinitely.

Acceptance: two-user simultaneous sessions cannot leak data or switch each other's source view;
shared notes behave coherently; restart/container replacement/restore retain verified captures;
scaling API workers does not duplicate ingestion or calibration.

## Phase 5 — Copilot and service reliability

- Return structured, validated explanation sections and evidence IDs so the interface need not infer
  structure with a custom regex Markdown renderer. Escape content and reject unsupported references.
- Define timeout, cancellation and bounded work behavior. Current `asyncio.to_thread` timeout does not
  stop an already running provider request; concurrency accounting must include unfinished work.
- Add per-user/provider budgets and shared rate limiting, provider outage fallback, request-size
  bounds and meaningful error IDs. Add streaming only after cancellation/backpressure is sound.
- Make external-model data transfer explicit in server configuration and admin documentation. Allow
  a local-evidence-only mode; redact credentials/personal fields from logs and provider context.
- Add structured logs, health/readiness checks, error monitoring, source freshness and ingestion lag,
  disk/database alerts and operational recovery instructions.
- Load test authenticated UI/API/WebSocket clients against agreed concurrency and hardware targets.
  Set measurable latency, recovery and data-loss budgets before calling a release ready.

## Phase 6 — Reproducible private deployment and release gates

- Serve the built frontend and API behind a private HTTPS entry point. Keep backend, database and
  emulator ports internal to the required networks; configure trusted proxies deliberately.
- Run containers as non-root where supported, reduce writable paths/privileges, inject secrets at
  runtime, pin/review dependencies and images, and apply appropriate security/cache headers.
- Add CI for backend/frontend checks, migration tests, authorization regression tests, dependency/
  secret scans, end-to-end scenarios and a clean deployment smoke test. Add staging and rollback.
- Prove encrypted backup/restore, incident retention, provider failure handling and recovery from
  backend/database/source interruption. Document installation and operation for another administrator.

## Detection research track — separate from interface readiness

Use the new immutable evidence and reports to measure accumulated residual/change-point methods
for slow drift and joint origin selection for simultaneous attacks. Keep tuning and evaluation seeds
separate, include normal operating changes and longer clean recordings, and report misses and false
alarms. Do not lower thresholds simply to make existing tests pass. Version models and support rollback.

A private simulator/emulator release can be scoped around documented detector limitations. A claim of
reliable physical-plant attack localization requires independent validation beyond this release plan.

## Execution order and definition of done

Start with Phase 1 Copilot and urgent persistence, then finish workspace consistency while the
authentication/shared-monitoring design is established. Follow with authorization, storage/worker
separation, reliability and staging release gates. Do not deploy broadly while the current demo
key and open telemetry endpoints remain the access boundary.

Production readiness is an evidence-based release decision: agreed user scale, no unresolved critical
access/data-loss defects, proven restore, passed deployment/authentication/isolation checks, accepted
UI/accessibility results, explicit detector limitations, and a named deployment/operations owner.
This document is a plan, not a claim those controls are already implemented.
