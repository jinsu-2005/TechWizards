// A single browser origin for static Vercel assets and Render HTTP/WebSocket traffic.
// GATEWAY_SECRET is a Worker secret, never a public var or a frontend build argument.
const CSP = "default-src 'self'; script-src 'self' https://apis.google.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; connect-src 'self' wss: https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://apis.google.com; frame-src https://attacktrace-private-20261016.firebaseapp.com https://accounts.google.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";

function origin(value, suffix) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.origin !== value || !url.hostname.endsWith(suffix)
    || /YOUR-|example|\.invalid/i.test(url.hostname) || url.username || url.password) {
    throw new Error("Invalid configured origin");
  }
  return url;
}

function error(status, message) {
  return new Response(message, {
    status,
    headers: { "cache-control": "no-store", "content-type": "text/plain; charset=utf-8", "x-content-type-options": "nosniff" },
  });
}

export async function handle(request, env, fetchUpstream = fetch) {
  let publicUrl, frontend, backend;
  try {
    publicUrl = origin(env.PUBLIC_ORIGIN, ".workers.dev");
    frontend = origin(env.FRONTEND_ORIGIN, ".vercel.app");
    backend = origin(env.BACKEND_ORIGIN, ".onrender.com");
    if (typeof env.GATEWAY_SECRET !== "string" || env.GATEWAY_SECRET.length < 32) throw new Error("Missing secret");
  } catch {
    return error(503, "Application gateway configuration is incomplete");
  }
  const incoming = new URL(request.url);
  if (incoming.origin !== publicUrl.origin) return error(404, "Unknown application hostname");
  const api = incoming.pathname === "/api" || incoming.pathname.startsWith("/api/");
  const ws = incoming.pathname === "/ws/live" || incoming.pathname === "/ws/voice";
  if (incoming.pathname.startsWith("/ws") && !ws) return error(404, "Unknown stream");
  if (ws && (request.method !== "GET" || request.headers.get("upgrade")?.toLowerCase() !== "websocket")) {
    return error(426, "WebSocket upgrade required");
  }
  if (!api && !ws && !["GET", "HEAD"].includes(request.method)) return error(405, "Method not allowed");
  if (["CONNECT", "TRACE"].includes(request.method)) return error(405, "Method not allowed");

  const upstream = api || ws ? backend : frontend;
  // Assign pathname separately: a leading // must never turn into an arbitrary upstream host.
  const target = new URL(upstream.origin);
  target.pathname = incoming.pathname;
  target.search = incoming.search;
  const headers = new Headers(request.headers);
  for (const name of ["host", "x-attacktrace-gateway", "x-forwarded-host", "x-forwarded-for", "x-forwarded-proto", "forwarded"]) headers.delete(name);
  if (api || ws) {
    headers.set("x-attacktrace-gateway", env.GATEWAY_SECRET);
    // Forward only this application's cookies; no edge/provider cookies belong on the origin.
    const cookies = (headers.get("cookie") ?? "").split(";")
      .map((part) => part.trim()).filter((part) => /^__Host-at_(session|csrf)=/.test(part));
    if (cookies.length) headers.set("cookie", cookies.join("; "));
    else headers.delete("cookie");
  } else {
    for (const name of ["cookie", "authorization", "x-csrf-token", "x-api-key"]) headers.delete(name);
  }
  const init = {
    method: request.method, headers, redirect: "manual",
    // Node's streaming Request tests need duplex; Cloudflare's fetch accepts this extra field.
    ...(!["GET", "HEAD"].includes(request.method) ? { body: request.body, duplex: "half" } : {}),
  };
  let response;
  try {
    response = await fetchUpstream(new Request(target, init), {
      cf: { cacheEverything: false, cacheTtl: 0 },
    });
  } catch {
    return error(502, "Upstream unavailable; retry shortly");
  }
  // Return the native upgrade object unchanged, preserving Cloudflare's webSocket binding.
  if (response.status === 101) return response;
  const outgoing = new Headers(response.headers);
  const location = outgoing.get("location");
  if (location) {
    const redirect = new URL(location, target);
    if (redirect.origin !== upstream.origin) return error(502, "Unexpected upstream redirect");
    redirect.host = publicUrl.host;
    outgoing.set("location", redirect.href);
  }
  if (api || ws) {
    outgoing.set("cache-control", "no-store");
    // This is same-origin traffic. Never forward permissive origin headers from an upstream.
    for (const name of ["access-control-allow-origin", "access-control-allow-credentials"]) outgoing.delete(name);
  } else {
    outgoing.delete("set-cookie"); // Static hosting cannot overwrite the backend's session cookies.
    if (!(incoming.pathname.startsWith("/assets/") && response.status === 200)) outgoing.set("cache-control", "no-store");
  }
  outgoing.set("content-security-policy", CSP);
  outgoing.set("x-content-type-options", "nosniff");
  outgoing.set("x-frame-options", "DENY");
  outgoing.set("referrer-policy", "strict-origin-when-cross-origin");
  outgoing.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  outgoing.set("strict-transport-security", "max-age=31536000");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers: outgoing });
}

export default { fetch(request, env) { return handle(request, env); } };
