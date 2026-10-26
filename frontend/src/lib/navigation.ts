import type { MouseEvent } from "react";

export const WORKSPACE_PATHS = ["/", "/ev", "/alerts", "/assets", "/investigations", "/sources", "/metrics", "/lab", "/about", "/settings"];
export const NAVIGATION_EVENT = "attacktrace:navigation";
export function navigate(href: string) {
  if (window.location.pathname + window.location.search + window.location.hash === href) return;
  window.history.pushState(null, "", href);
  window.dispatchEvent(new Event(NAVIGATION_EVENT));
}
export function handleWorkspaceLink(event: MouseEvent<HTMLElement>) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
  if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.hasAttribute("download")) return;
  const url = new URL(anchor.href);
  if (url.origin !== window.location.origin || !WORKSPACE_PATHS.includes(url.pathname)) return;
  if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return;
  event.preventDefault();
  navigate(url.pathname + url.search + url.hash);
}
export function subscribeNavigation(notify: () => void) {
  window.addEventListener("popstate", notify);
  window.addEventListener(NAVIGATION_EVENT, notify);
  return () => { window.removeEventListener("popstate", notify); window.removeEventListener(NAVIGATION_EVENT, notify); };
}
