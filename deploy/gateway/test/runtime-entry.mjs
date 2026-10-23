// Test-only upstream: exercises the production handler inside Cloudflare's native runtime.
import { handle } from "../src/index.mjs";

export default {
  fetch(request, env) {
    return handle(request, env, async (upstream) => {
      const url = new URL(upstream.url);
      if (url.pathname === "/ws/live" || url.pathname === "/ws/voice") {
        if (url.hostname !== "attacktrace-api.onrender.com"
          || upstream.headers.get("cookie") !== "__Host-at_session=test-session"
          || upstream.headers.get("origin") !== env.PUBLIC_ORIGIN
          || upstream.headers.get("x-attacktrace-gateway") !== env.GATEWAY_SECRET) {
          return new Response("Upgrade lost credentials", { status: 403 });
        }
        const [client, server] = Object.values(new WebSocketPair());
        server.accept();
        server.addEventListener("message", (event) => server.send("echo:" + event.data));
        server.addEventListener("close", () => server.close());
        return new Response(null, { status: 101, webSocket: client });
      }
      if (url.pathname === "/api/auth/session") {
        const payload = await upstream.json();
        if (payload.id_token !== "test-token" || upstream.headers.get("x-attacktrace-gateway") !== env.GATEWAY_SECRET) {
          return new Response("Body or origin key was lost", { status: 400 });
        }
        const headers = new Headers({ "content-type": "application/json" });
        headers.append("set-cookie", "__Host-at_session=test-session; HttpOnly; Secure; SameSite=Strict; Path=/");
        headers.append("set-cookie", "__Host-at_csrf=test-csrf; Secure; SameSite=Strict; Path=/");
        return new Response(JSON.stringify({ role: "viewer" }), { headers });
      }
      return new Response("native runtime frontend");
    });
  },
};
