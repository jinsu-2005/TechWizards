import { lazy, Suspense, useEffect, useRef, useSyncExternalStore } from "react";
import { App } from "./App";
import { handleWorkspaceLink, subscribeNavigation } from "../lib/navigation";
import { CopilotDrawer } from "../features/copilot/CopilotDrawer";
import { WorkspaceHeader } from "../components/ui/WorkspaceHeader";

// Tiny pathname switch instead of a router dependency. The metrics page (and ECharts) load lazily.
const MetricsPage = lazy(() =>
  import("../features/metrics/MetricsPage").then((m) => ({ default: m.MetricsPage })),
);

const WorkspacePage = lazy(() => import("../features/investigation/WorkspacePage").then((m) => ({ default: m.WorkspacePage })));
const SocPage = lazy(() => import("../features/investigation/SocPage").then((m) => ({ default: m.SocPage })));
const VoiceSettingsPage = lazy(() => import("../features/voice/VoiceSettingsPage").then((m) => ({ default: m.VoiceSettingsPage })));

function WorkspaceLoading({ current }: { current: string }) {
  return <div className="p-3 sm:p-5"><WorkspaceHeader current={current} /><div role="status" aria-busy="true" className="mt-4 rounded-xl border border-border bg-surface p-6 text-sm text-muted">Loading workspace…</div></div>;
}

function Route() {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path === "/settings") return <Suspense fallback={<WorkspaceLoading current={path} />}><VoiceSettingsPage /></Suspense>;
  if (path === "/alerts" || path === "/assets" || path === "/lab") {
    return <Suspense fallback={<WorkspaceLoading current={path} />}><SocPage page={path.slice(1) as "alerts" | "assets" | "lab"} /></Suspense>;
  }
  if (path === "/sources" || path === "/investigations") {
    return <Suspense fallback={<WorkspaceLoading current={path} />}><WorkspacePage page={path === "/sources" ? "sources" : "investigations"} /></Suspense>;
  }
  if (window.location.pathname.replace(/\/$/, "") === "/metrics") {
    return (
      <Suspense fallback={<WorkspaceLoading current={path} />}>
        <MetricsPage />
      </Suspense>
    );
  }
  return <App />;
}

export function Root() {
  const href = useSyncExternalStore(subscribeNavigation, () => window.location.pathname + window.location.search);
  const previous = useRef(href);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (previous.current === href) return;
    previous.current = href; window.scrollTo(0, 0);
    const focusHeading = () => {
      const heading = container.current?.querySelector("h1");
      if (!heading) return false;
      heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true });
      return true;
    };
    if (focusHeading() || !container.current) return;
    const observer = new MutationObserver(() => { if (focusHeading()) observer.disconnect(); });
    observer.observe(container.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [href]);
  const path = href.split("?")[0] ?? "/";
  return <div ref={container} onClick={handleWorkspaceLink}><div key={href} id="workspace-content" tabIndex={-1}><Route /></div>{["/alerts", "/assets", "/lab", "/metrics", "/settings"].includes(path) && <CopilotDrawer />}</div>;
}
