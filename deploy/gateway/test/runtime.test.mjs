import assert from "node:assert/strict";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";
import { Miniflare } from "miniflare";

const PUBLIC = "https://attacktrace-console.myaccount.workers.dev";
const runtime = new Miniflare({
  modules: true,
  scriptPath: fileURLToPath(new URL("./runtime-entry.mjs", import.meta.url)),
  compatibilityDate: "2026-01-01",
  bindings: {
    PUBLIC_ORIGIN: PUBLIC,
    FRONTEND_ORIGIN: "https://attacktrace-ui.vercel.app",
    BACKEND_ORIGIN: "https://attacktrace-api.onrender.com",
    GATEWAY_SECRET: "native-runtime-test-secret-more-than-32-characters",
  },
});
after(() => runtime.dispose());

test("Cloudflare runtime preserves separate HttpOnly session and readable CSRF Set-Cookie headers", async () => {
  const response = await runtime.dispatchFetch(PUBLIC + "/api/auth/session", {
    method: "POST",
    headers: { "content-type": "application/json", origin: PUBLIC },
    body: JSON.stringify({ id_token: "test-token" }),
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { role: "viewer" });
  const cookies = response.headers.getSetCookie();
  assert.equal(cookies.length, 2);
  assert.match(cookies[0], /__Host-at_session=.*HttpOnly; Secure; SameSite=Strict/);
  assert.match(cookies[1], /__Host-at_csrf=.*Secure; SameSite=Strict/);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("Cloudflare runtime forwards a real WebSocket upgrade and bidirectional frames", { timeout: 15000 }, async () => {
  const response = await runtime.dispatchFetch(PUBLIC + "/ws/live", {
    headers: { upgrade: "websocket", origin: PUBLIC, cookie: "__Host-at_session=test-session" },
  });
  assert.equal(response.status, 101);
  const socket = response.webSocket;
  assert.ok(socket);
  socket.accept();
  try {
    const received = new Promise((resolve, reject) => {
      socket.addEventListener("message", (event) => resolve(event.data), { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    socket.send("telemetry-check");
    assert.equal(await received, "echo:telemetry-check");
  } finally { socket.close(1000, "verified"); }
});
