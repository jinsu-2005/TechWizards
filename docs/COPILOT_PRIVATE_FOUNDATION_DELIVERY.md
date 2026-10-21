# Copilot polish and private-server foundation — 16 October 2026

## Implemented

- Copilot uses escaped React text instead of HTML-string rendering. Model references, saved capture
  details and raw observations are expandable; uncertainty and alternative explanations remain visible.
- Evidence references have readable asset/category labels and an inline source/timestamp/payload
  preview. Raw JSON remains available as a secondary link.
- Multiline, growing composer; Enter sends, Shift+Enter inserts a line, and composition input is
  respected. Added new conversation, copy answer, retry, latest-message navigation and less repeated
  suggestion UI. Scrolling follows new messages only while near the bottom or after sending a question.
- Focus handling includes disclosure summaries. Request identity guards prevent an older cancelled
  response from repopulating a new conversation. Evidence and simulator-action guards remain intact.
- Provider work retains its concurrency slot until its actual worker finishes, including after a
  response timeout. Private Copilot limits use the verified user identity rather than a shared proxy IP.
- [Firebase project and authentication integration](FIREBASE_PRIVATE_SETUP.md) implemented. Real server
  credentials and OAuth verification remain pending. Local development retains its existing demo mode.
- Investigation journal and session registry persist at `/data/live/investigations.sqlite` in Compose.
  Added a consistent SQLite backup command that captures committed WAL data, refuses overwrites and
  checks integrity. A real local backup preserved 53 incidents and seven saved captures with integrity
  result **ok**, at `backups/journal-20261016-ui-auth.sqlite` (ignored by Git).
- Added CI checks for backend tests and frontend lint/tests/build/audit. These checks have run locally;
  the new GitHub workflow has not been executed by GitHub.
- Updated Vite, Vitest and Tailwind's compiler integration to address the old audit findings. Retained
  theme tokens and added a regression check for generated alpha colors. The npm dependency tree reports
  **zero known vulnerabilities**. A gRPC override pins the fixed compatible minor series used by the
  Firebase package; Firebase Firestore itself is not used by this app.
- Fonts are self-hosted. Added production nginx security/CSP headers, loopback port publishing,
  private authentication defaults, disabled demo attacks and a non-root backend image.

## Validation and current limits

- Backend full suite: **319 passed**, including authentication and provider-capacity checks.
- Frontend: **148 passed**, lint/type checking/build passed. npm audit: **zero known vulnerabilities**.
- Python environment audit: **zero known vulnerabilities** after upgrading pip to 26.2.1.
  Setup and the backend image now upgrade the installer before installing dependencies.
- Targeted backend Ruff/type checks passed; Compose configuration validates syntactically.
  A broader transitive type check also found existing NumPy typing errors in graph/localization/HAI
  code; this is not a claim that the whole backend passes mypy.
- The selected server credential method is ADC/workload identity. Added a read-only ADC/access
  check; it confirms this workstation currently has no ADC. The target hosting platform and trust
  bindings are still pending, so real Firebase sign-in has not been verified.
- Docker's engine is unavailable, so image builds, nginx headers/CSP and container replacement were
  not exercised. The SQLite backup was verified directly; container restore remains a deployment check.
- The in-app browser's existing tab was a failed-load error page. Automatic browser security review
  rejected acquiring that page because its underlying scheme is blocked. No alternate browser,
  raw debugger or indirect workaround was used. The user has been asked to reopen localhost:5173.
  Fresh screenshots, post-upgrade theme comparison and interactive composer/scroll checks remain pending.
- Native browser zoom and real screen-reader checks remain pending from the earlier review.

The full [private-server release plan](PRIVATE_SERVER_RELEASE_PLAN.md) remains active. This delivery
does not claim the project is production ready: server credentials, private HTTPS/domain setup, real
OAuth tests, deployment/restore/load checks, source/worker isolation and the known detector limitations
still require work. No public application deployment or paid service provisioning was performed.
