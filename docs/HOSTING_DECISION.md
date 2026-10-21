# Hosting direction — 16 October 2026

Implementation update: the user has no paid domain. The selected approach uses the account's free
`attacktrace-console.jinsu-j2005.workers.dev` entry point to proxy Vercel UI and Render API/WS traffic
under one browser origin. See [the implemented deployment package](VERCEL_RENDER_DEPLOYMENT.md).
Firebase has authorized that exact hostname; application publication remains pending.

The user is considering Vercel for the frontend and Render (assumed from “renderer”) or Cloudflare
Workers for the backend. No hosting resources have been created or application deployed.

## Recommendation

Render is the closer fit for the existing backend: a long-running Python/FastAPI service with
PyTorch, WebSocket telemetry and a writable investigation journal. Render supports WebSockets and
persistent disks. A disk requires a paid service and binds it to one instance. This matches the
current one-worker limit, but is not a horizontally scalable or zero-downtime design.

Cloudflare Python Workers use a different runtime/package environment. The current native PyTorch
service, continuous source loops and SQLite persistence have not been ported to it. Treat Workers
as a possible routing/edge layer, not a deployment target for the current backend without a redesign.

Vercel can serve the frontend build. The app currently assumes one origin for API requests,
WebSockets and host-only session/CSRF cookies. Simply deploying the UI and pointing it to an
`onrender.com` backend will not satisfy those assumptions. No split-origin compatibility is claimed.

## Work before publishing a split deployment

1. Choose the final application hostname and request-routing design. Prefer a single public origin
   whose gateway routes `/api/*` and `/ws` to the backend and serves the frontend. Confirm the gateway
   supports WebSocket upgrades. Alternatively implement explicit separate-origin API/WS configuration,
   credentialed requests and a CSRF strategy that works with host-only cookies; do not weaken cookie
   protections merely to make unrelated provider domains communicate.
2. Add the chosen hostname to Firebase's authorized domains and backend's exact allowed Origin list.
3. Resolve keyless runtime credentials. The user selected ADC/workload identity. Render's current
   managed OIDC docs list AWS, Anthropic and OpenAI, not Google. A Google federation path therefore
   needs validation/configuration rather than assuming automatic ADC. Do not substitute a downloaded
   service-account key without changing the agreed credential decision. A Google Cloud VM with an
   attached service account is an alternative with native ADC if keyless setup is the priority.
4. Configure a paid persistent volume for journal, captures, calibration/model artifacts and reports;
   map each path explicitly and verify restore. Keep one ingestion worker. PostgreSQL/shared storage
   and distributed ingestion ownership are later prerequisites for multiple replicas.
5. Provision the local Modbus emulator as a separate private service when testing hosted LIVE mode.
   A cloud backend's `localhost` is not this workstation. Keep Modbus off the public internet; do not
   treat simulator attribution as validated evidence from real hardware.
6. Test real Google sign-in, restricted roles, cookie expiry/revocation, CSRF, WebSocket reconnects,
   incident persistence through restart, backup restore and representative load on staging.

For an initial deployment with fewer integration changes, serve the frontend and backend through
one origin on a persistent container/VM host. Vercel can be introduced after the routing and auth
boundaries have passed staging checks. Production readiness still depends on the broader release plan.

## Documentation checked

- [Render WebSockets](https://render.com/docs/websocket)
- [Render persistent disks](https://render.com/docs/disks)
- [Render managed OIDC and supported providers](https://render.com/docs/oidc)
- [Cloudflare Python package environment](https://developers.cloudflare.com/workers/languages/python/packages/)
- [Google Workload Identity Federation](https://docs.cloud.google.com/iam/docs/workload-identity-federation)

This is an implementation direction and a list of unresolved deployment decisions, not a verified
provider deployment or cost estimate.
