# Vercel + Render deployment package — 16 October 2026

## Current state

The deployment code is implemented and locally tested. **The app has not been published.**
No paid service, Render disk or hosting project was created in this work. Cloudflare CLI login
is available; Render/Vercel CLI sessions were not available in this workspace.

The selected application name is **AttackTrace Console**. The existing Cloudflare account's
Workers subdomain was read through its API and is `jinsu-j2005`. The planned public entry point is:

`https://attacktrace-console.jinsu-j2005.workers.dev`

This address has been added to Firebase Authentication's authorized domains using the Firebase MCP;
the auth-only deployment succeeded. **It is a configured target, not a claim that a Worker is live.**
Suggested upstream project names are `attacktrace-ui` on Vercel and `attacktrace-api` on Render;
availability and provider-assigned suffixes must be checked during creation.

## Routing and access

The browser uses one origin. A small Cloudflare Worker sends UI/assets to Vercel, `/api/*` to
Render, and `/ws/live` to Render as a WebSocket upgrade. The Python inference service runs on
Render; it is not ported to Workers. Neither Vercel's API proxy nor cross-site cookies are required.

The Worker supplies `X-AttackTrace-Gateway` from its secret storage. Render checks that secret
before HTTP routes or WebSocket upgrade. Direct `onrender.com` requests fail with 403, apart from
the minimal read-only `/api/health` used by Render. **The gateway secret grants no user access**:
Firebase membership, roles, CSRF and session checks still run afterward.

Only AttackTrace's host-only session/CSRF cookies reach Render. No browser cookies, authorization
or gateway secret reach Vercel. API responses are never cached; redirects are not followed with
credentials. Session cookies retain HttpOnly, Secure and SameSite Strict. WebSocket upgrades retain
the native runtime binding. Production CSP and security headers are applied at the gateway.

Open the public Worker hostname after deployment, rather than the upstream Vercel hostname. The
upstream static site is not an authenticated application entry point: its relative API/WS calls
intentionally have no backend route. Do not enable credentials or make cross-site cookies permissive
to work around this. Do not wildcard Firebase domains or CORS origins for preview deployments.

## Deployment sequence

1. **Resolve runtime identity before starting paid resources.** Keep the selected keyless ADC/workload
   identity method. Render's managed OIDC documentation currently lists AWS, Anthropic and OpenAI;
   an automatic Google runtime identity is not documented. Validate a supported federation path for
   this account and Google IAM first. The backend will refuse to start without working Auth read
   access. A Google Cloud VM with an attached identity remains the simpler native-ADC alternative.
   Never use a build-time token as a persistent runtime credential or download a private key as an
   implicit fallback. See [Firebase setup](FIREBASE_PRIVATE_SETUP.md).
2. Create the Vercel project with repository **root directory `frontend`**, name `attacktrace-ui`
   if available, Node 24, and the checked-in `vercel.json`. Build with `npm ci` / `npm run build`.
   Leave `VITE_API_KEY` unset. Use the stable production `*.vercel.app` URL as `FRONTEND_ORIGIN`;
   deployment protection must permit the gateway to fetch the static build. Preview URLs are not
   supported as public signed-in environments by this package.
3. Review then apply repository-root `render.yaml` in the intended Render account. It declares a
   **paid standard API service, paid starter private emulator and 10 GB disk**, in Singapore, with
   automatic deployment off. These are initial configuration choices, not performance sizing or a
   price estimate. Confirm account costs before applying. Private emulator ports are never public.
4. Provide Render's prompted environment values:
   - `AT_CORS_ORIGINS=["https://attacktrace-console.jinsu-j2005.workers.dev"]`
   - `AT_AUTH_MEMBERS={"approved-admin@example.com":"admin", ...}` using approved accounts only.
   - `AT_GATEWAY_SECRET`: at least 32 random characters, shared only with the Worker secret below.
   - `GOOGLE_APPLICATION_CREDENTIALS`: the container path to the validated external-account ADC
     configuration, mounted read-only together with any referenced subject-token source. This is
     not a Firebase web config. Bindings, token refresh and IAM must work at runtime.
5. Confirm the persistent disk is writable by backend UID **10001**. `python -m app.deploy` validates
   private mode, approved origin/membership, identity access and a mounted writable disk, and starts
   one ingestion worker on Render's `PORT`. Models are seeded only into an empty model directory;
   retained models/journals are not overwritten. Copy HAI files to `/var/data/hai` separately and
   verify replay before claiming hosted HAI support; the large dataset is not baked into the image.
6. Put the actual Render `*.onrender.com` origin and Vercel origin in
   `deploy/gateway/wrangler.jsonc`. The public Workers origin is already configured. Set the Worker
   secret interactively from that directory, using the **same** value as Render:

   ```powershell
   npx --yes wrangler@4.151.0 secret put GATEWAY_SECRET
   npx --yes wrangler@4.151.0 deploy --dry-run
   npx --yes wrangler@4.151.0 deploy
   ```

   Keep secrets out of command arguments, chat, config vars, Git and frontend builds. Publishing
   the Worker before valid upstreams/identity are ready produces an unavailable application; do not
   treat it as a successful release. Cloudflare account limits/plan eligibility still apply.
7. Run the read-only deployment smoke check, replacing the Render origin with its assigned address:

   ```powershell
   & ./backend/.venv/Scripts/python.exe ./scripts/check-cloud-deployment.py --public-origin https://attacktrace-console.jinsu-j2005.workers.dev --backend-origin https://YOUR-RENDER-SERVICE.onrender.com
   ```

   This checks anonymous HTTP/stream denial and origin locking. Then test actual administrator and
   viewer sign-in, role rejection, CSRF, expiry/revocation/logout and authenticated telemetry in a
   browser. Those authenticated tests cannot be replaced by anonymous smoke checks or mocks.

## Persistent paths and backup

All mutable cloud data is under `/var/data`:

| Path | Contents |
| --- | --- |
| `journal/investigations.sqlite` | Cases, evidence, captures, workflows, audit and session registry |
| `live/incidents.sqlite` | LIVE incident records |
| `models/` | Models, calibration checkpoints and baseline artifacts |
| `reports/` | Generated metrics and reports |
| `hai/` | Separately uploaded replay dataset |
| `backups/` | Optional local backup staging |

From a running container, `python /app/scripts/backup-journal.py --help` shows the backup interface.
Use that SQLite backup API command rather than copying a live `.sqlite` file without its WAL.
Retain encrypted off-service backups: the attached disk is not an independent backup. For restore,
stop the service, restore into a fresh destination, preserve the original database and any WAL/SHM
files together, set correct ownership, and verify integrity/counts and a real saved capture before
resuming. Test full model/data restore as well as the journal on staging.

The private emulator restarts as a fresh simulated process. LIVE is read-only and demo attacks are
off in this deployment. The existing local attack/integrity lab remains loopback-specific; this
package does not claim remote controller/firmware integrity attribution or expose that lab publicly.

## Validation and limits

- Backend: **336 tests passed** after gateway/startup changes; targeted Ruff/mypy passed.
- Gateway: **9 tests passed**, including native Cloudflare runtime cookie headers and bidirectional
  WebSocket frames against a test upstream. The real hosted Render connection is still untested.
- Wrangler deployment dry run passed. Gateway npm audit: **zero known vulnerabilities** after
  updating the dev harness's Undici and Sharp dependencies. These overrides are test tooling only.
- Render YAML, Vercel JSON and Worker config parsed locally. Render's authenticated Blueprint
  validation and real Vercel build/routing are still required; parsing is not provider validation.
- Docker is unavailable here. Container startup, mounted-disk ownership, restarts and deployment
  rollback/restore have not been exercised on Render. Native browser zoom/screen-reader and the
  outstanding UI verification remain separate release checks.
- An offline restore of the existing backup passed integrity and row-count comparisons: 53 cases,
  100001 evidence rows and 7 saved captures. This verifies the journal backup independently of the
  running service; it does not verify Render disk replacement or a full model/data restore.
- One backend instance/worker only. A disk-backed SQLite deployment has restart/deploy downtime;
  multiple replicas need shared storage/database and coordinated source ingestion first.

The gateway runtime test uses a mocked upstream, and Firebase tests mock verification. Neither
proves successful real OAuth, production workload identity or load capacity. This is deployment
preparation, not production certification.

Sources: [Render Blueprint reference](https://render.com/docs/blueprint-spec),
[Render OIDC](https://render.com/docs/oidc), [Render disks](https://render.com/docs/disks),
[Cloudflare upgrades](https://developers.cloudflare.com/workers/runtime-apis/response/),
[Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json).
