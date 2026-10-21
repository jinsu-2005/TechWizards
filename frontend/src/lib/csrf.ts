export function csrfHeaders(): Record<string, string> {
  const cookie = document.cookie.split(";").map((s) => s.trim()).find((s) => s.startsWith("__Host-at_csrf=") || s.startsWith("at_csrf="));
  return cookie ? { "x-csrf-token": decodeURIComponent(cookie.slice(cookie.indexOf("=") + 1)) } : {};
}
