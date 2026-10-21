import assert from "node:assert/strict";
import { test } from "node:test";
import worker, { handle } from "../src/index.mjs";

const env = {
  PUBLIC_ORIGIN: "https://attacktrace-console.testaccount.workers.dev",
  FRONTEND_ORIGIN: "https://attacktrace-ui.vercel.app",
  BACKEND_ORIGIN: "https://attacktrace-api.onrender.com",
  GATEWAY_SECRET: "unit-test-secret-at-least-32-characters",
};
const req = (path, init) => new Request(env.PUBLIC_ORIGIN + path, init);

test("routes static files without sending authentication or gateway credentials to Vercel", async () => {
  const response = await handle(req("/assets/app.js?v=3", { headers: {
    cookie: "__Host-at_session=private; provider=private",
    authorization: "Bearer private", "x-csrf-token": "private", "x-attacktrace-gateway": "forged",
  } }), env, async (upstream) => {
    assert.equal(upstream.url, env.FRONTEND_ORIGIN + "/assets/app.js?v=3");
    for (const name of ["cookie", "authorization", "x-csrf-token", "x-attacktrace-gateway"]) {
      assert.equal(upstream.headers.get(name), null);
    }
    return new Response("asset", { headers: { "set-cookie": "__Host-at_session=forged" } });
  });
  assert.equal(await response.text(), "asset");
  assert.equal(response.headers.get("set-cookie"), null);
  assert.match(response.headers.get("content-security-policy"), /frame-ancestors 'none'/);
});

test("preserves POST body, Origin and two host-only cookies through the API gateway", async () => {
  const response = await handle(req("/api/auth/session", {
    method: "POST", body: JSON.stringify({ id_token: "test-token" }),
    headers: { "content-type": "application/json", origin: env.PUBLIC_ORIGIN,
      cookie: "__Host-at_session=session; __Host-at_csrf=csrf; unrelated=secret",
      "x-csrf-token": "csrf", "x-forwarded-for": "forged", "x-attacktrace-gateway": "forged" },
  }), env, async (upstream) => {
    assert.equal(upstream.url, env.BACKEND_ORIGIN + "/api/auth/session");
    assert.equal(upstream.headers.get("origin"), env.PUBLIC_ORIGIN);
    assert.equal(upstream.headers.get("x-attacktrace-gateway"), env.GATEWAY_SECRET);
    assert.equal(upstream.headers.get("x-forwarded-for"), null);
    assert.equal(upstream.headers.get("cookie"), "__Host-at_session=session; __Host-at_csrf=csrf");
    assert.deepEqual(await upstream.json(), { id_token: "test-token" });
    const headers = new Headers({ "cache-control": "public,max-age=3600", "access-control-allow-origin": "*" });
    headers.append("set-cookie", "__Host-at_session=new; HttpOnly; Secure; SameSite=Strict; Path=/");
    headers.append("set-cookie", "__Host-at_csrf=newcsrf; Secure; SameSite=Strict; Path=/");
    return new Response("ok", { headers });
  });
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(response.headers.getSetCookie().length, 2);
  assert.match(response.headers.getSetCookie()[0], /HttpOnly/);
});

test("returns the native WebSocket upgrade and forwards the session, secret and browser Origin", async () => {
  const upgraded = { status: 101, webSocket: {} };
  const response = await handle(req("/ws/live", { headers: {
    upgrade: "websocket", origin: env.PUBLIC_ORIGIN, cookie: "__Host-at_session=session",
  } }), env, async (upstream) => {
    assert.equal(upstream.url, env.BACKEND_ORIGIN + "/ws/live");
    assert.equal(upstream.headers.get("upgrade"), "websocket");
    assert.equal(upstream.headers.get("cookie"), "__Host-at_session=session");
    assert.equal(upstream.headers.get("origin"), env.PUBLIC_ORIGIN);
    assert.equal(upstream.headers.get("x-attacktrace-gateway"), env.GATEWAY_SECRET);
    return upgraded;
  });
  assert.equal(response, upgraded);
});

test("fails closed for unset configuration, wrong host and non-upgrade stream requests", async () => {
  const never = () => { throw new Error("Must not reach upstream"); };
  assert.equal((await handle(req("/"), { ...env, GATEWAY_SECRET: "" }, never)).status, 503);
  assert.equal((await handle(new Request("https://other.workers.dev/"), env, never)).status, 404);
  assert.equal((await handle(req("/ws/live"), env, never)).status, 426);
  assert.equal((await handle(req("/ws/unknown"), env, never)).status, 404);
  assert.equal((await handle(req("/" , { method: "POST" }), env, never)).status, 405);
});

test("never follows a redirect with cookies or the origin secret", async () => {
  let calls = 0;
  const response = await handle(req("/api/status"), env, async (upstream) => {
    calls++;
    assert.equal(upstream.redirect, "manual");
    return new Response(null, { status: 302, headers: { location: "https://unexpected.invalid/" } });
  });
  assert.equal(response.status, 502);
  assert.equal(calls, 1);
  const local = await handle(req("/api/old"), env, async () => new Response(null, {
    status: 307, headers: { location: env.BACKEND_ORIGIN + "/api/new?x=1" },
  }));
  assert.equal(local.headers.get("location"), env.PUBLIC_ORIGIN + "/api/new?x=1");
});

test("upstream outages return a generic, uncacheable response", async () => {
  const response = await handle(req("/api/status"), env, async () => { throw new Error("private detail"); });
  assert.equal(response.status, 502);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.doesNotMatch(await response.text(), /private detail/);
});

test("Cloudflare entrypoint accepts an execution context without treating it as fetch", async () => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response("entrypoint works");
  try {
    const response = await worker.fetch(req("/"), env, { waitUntil() {} });
    assert.equal(await response.text(), "entrypoint works");
  } finally { globalThis.fetch = oldFetch; }
});
