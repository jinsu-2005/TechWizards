# Firebase private-server setup — 16 October 2026

Created with the Firebase MCP plugin:

- Project: `attacktrace-private-20261016` — **AttackTrace Private**.
- Web app: **AttackTrace Console**, `1:23971457649:web:ac3e59d999698c090f49d0`.
- Google sign-in enabled and deployed. Password and anonymous providers disabled.
- Authorized domains: localhost, this project's Firebase app domains and the selected
  `attacktrace-console.jinsu-j2005.workers.dev` public gateway hostname. The latest auth-only domain
  deployment succeeded. No AttackTrace application was published to Firebase Hosting or Workers.

[Project console](https://console.firebase.google.com/project/attacktrace-private-20261016/overview)

## Credentials and access

Firebase MCP's signed-in account provisions the project; it is not a deployed backend identity.
The selected credential method is **Google Application Default Credentials / workload identity**.
The Python service discovers ADC automatically. The identity
must be authorized for Firebase Authentication user/session administration in this project.
Prefer a managed workload identity over a long-lived downloaded key. Do not put a server key in
the frontend, source repository, container image, chat, or `VITE_*` variables.

No server ADC was available during implementation, and the Google Cloud CLI is not installed on
this workstation. Auth endpoints fail closed when credentials are missing; a real Google
session exchange has not been verified. Automated tests use mocked Firebase verification; they
do not replace a real OAuth/session check.

The local `.env` now identifies the Firebase project and gives the connected account initial
administrator membership. Authentication remains in its existing local-demo mode while server
credentials are pending. This is explicitly not the private-server deployment mode.

For the private service configure:

```dotenv
AT_AUTH_ENABLED=true
AT_FIREBASE_PROJECT_ID=attacktrace-private-20261016
AT_AUTH_COOKIE_SECURE=true
AT_AUTH_MEMBERS={"owner@example.com":"admin","analyst@example.com":"analyst","viewer@example.com":"viewer"}
AT_CORS_ORIGINS=["https://your-private-hostname"]
AT_DEMO_MODE=false
```

Replace the example members with approved accounts. A valid Firebase sign-in alone grants no
workspace access. Verified email must match this server-maintained membership list. Updating the
list currently requires restarting the server. Roles are re-evaluated on each request.

For local verification only, an ADC-enabled
loopback backend can use `AT_AUTH_COOKIE_SECURE=false` with `AT_HOST=127.0.0.1`; this is rejected
for a non-loopback private-server configuration. Private mode rejects unsigned Auth emulator tokens.

### Activate the selected ADC method

On a Google-managed server, attach a dedicated runtime service account and let the metadata service
provide ADC. On a server outside Google Cloud, configure Workload Identity Federation for the host's
identity provider, and set `GOOGLE_APPLICATION_CREDENTIALS` to the generated external-account ADC
configuration. Make that configuration and any referenced subject-token source available to the
backend process/container, read-only, at the paths in that configuration. A Docker container does
not inherit a host credential file automatically. No downloaded service-account private key is needed.

The runtime identity needs Firebase Authentication permissions in this project, including reading
users for revocation checks and creating server sessions. Configure the IAM binding on the target
server/project, then run this read-only check using the backend virtual environment:

```powershell
& ./backend/.venv/Scripts/python.exe ./scripts/check-firebase-adc.py
```

The check fetches at most one user record and prints no user data or credentials. It verifies read
access, not the complete browser/session flow. An absent ADC returns exit code 2; an access failure
returns 1. The production service must still pass the real sign-in/session checks below.

For workstation testing with a human account, Firebase documents an additional requirement:
ordinary `gcloud auth application-default login` credentials using gcloud's default OAuth client
are not accepted by Firebase Authentication. Use your own Desktop OAuth client as described in
[Firebase's local ADC instructions](https://firebase.google.com/docs/admin/setup#test-with-gcloud-end-user-credentials),
or test with the configured runtime identity. Never copy access tokens into `.env` or the frontend.

The target server/platform and workload identity provider have not been supplied, so runtime IAM
bindings and federation trust have not been provisioned or claimed as tested.

## What the implementation enforces

- Firebase Admin SDK verifies recent ID tokens and checks revocation/disabled users before creating
  an eight-hour HttpOnly, SameSite Strict server session. Production cookies use the `__Host-`
  prefix and Secure flag. Firebase browser tokens remain in memory and are discarded after exchange.
- The database records session hashes, not cookie plaintext. Logout revokes the specific server
  session, including a copied cookie, and removes the browser cookies.
- API reads, exports, evidence references and WebSocket telemetry require membership in private
  mode. Viewer/Analyst/Admin write boundaries are server enforced. The former demo key cannot bypass
  them. Unsafe browser requests require both an approved Origin and CSRF header/cookie pair.
- Firebase cookie checks cache for at most five seconds, bounded by token expiry. Session expiry,
  local logout and membership are checked on every HTTP request. Open sockets are rechecked at most
  every ten seconds, even if the client keeps sending frames.
- Analyst notes and authenticated actions record the verified actor UID. Action controls are hidden
  or disabled for lower roles where implemented; backend authorization is the authoritative boundary.

This is one shared monitoring workspace per deployment. Current source administration is global
and restricted to administrators. Per-user source selection, multiple isolated workspaces and
multi-worker ingestion ownership are still release-plan work. Run one backend worker meanwhile.

## Deployment and verification still required

1. Supply the backend identity, verify its project permissions and enable private mode.
2. Configure the private HTTPS hostname, authorized domain and exact CORS origin.
3. Sign in with the approved administrator and a separate restricted account; verify role rejection,
   logout, disabled-user behavior and authenticated WebSockets against actual Firebase.
4. Put the service behind the organization's HTTPS entry point. Compose publishes frontend/backend
   on loopback only; Secure cookies require the HTTPS entry point. Do not expose the dev server.
5. Ensure mounted model/data/report directories are writable by backend UID **10001**. The backend
   image now runs as that non-root user. Build and run the containers on the target server.
6. Test the production nginx CSP with real Google sign-in and WebSocket traffic. It is configured
   in source but has not been exercised here because Docker's engine is not running.
7. Test a clean installation, container replacement, restore, load and the remaining accessibility
   checks before releasing. Existing container-layer journal files must be backed up before removing
   old containers; do not assume a new volume setting migrates old container data automatically.

Sources: [Firebase server sessions](https://firebase.google.com/docs/auth/admin/manage-cookies),
[Admin SDK setup](https://firebase.google.com/docs/admin/setup),
[ID-token verification](https://firebase.google.com/docs/auth/admin/verify-id-tokens).
