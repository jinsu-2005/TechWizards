import { lazy, Suspense, useEffect, useRef, useSyncExternalStore } from "react";
import { App } from "./App";
import { handleWorkspaceLink, subscribeNavigation } from "../lib/navigation";
import { CopilotDrawer } from "../features/copilot/CopilotDrawer";
import { WorkspaceHeader } from "../components/ui/WorkspaceHeader";
import { NoticeToast } from "../components/ui/NoticeToast";
import { useLiveStream } from "./useLiveStream";

// Tiny pathname switch instead of a router dependency. The metrics page (and ECharts) load lazily.
const MetricsPage = lazy(() =>
  import("../features/metrics/MetricsPage").then((m) => ({ default: m.MetricsPage })),
);

const WorkspacePage = lazy(() => import("../features/investigation/WorkspacePage").then((m) => ({ default: m.WorkspacePage })));
const SocPage = lazy(() => import("../features/investigation/SocPage").then((m) => ({ default: m.SocPage })));
const VoiceSettingsPage = lazy(() => import("../features/voice/VoiceSettingsPage").then((m) => ({ default: m.VoiceSettingsPage })));
const AboutPage = lazy(() => import("../features/about/AboutPage").then((m) => ({ default: m.AboutPage })));
const EvWorkspace = lazy(() => import("../features/ev/EvWorkspace").then((m) => ({ default: m.EvWorkspace })));

// Warm every lazy page once the first screen is idle, so later switches render without a fetch.
const PAGE_CHUNKS = [
  () => import("../features/ev/EvWorkspace"),
  () => import("../features/investigation/SocPage"),
  () => import("../features/investigation/WorkspacePage"),
  () => import("../features/metrics/MetricsPage"),
  () => import("../features/voice/VoiceSettingsPage"),
  () => import("../features/about/AboutPage"),
];
function prefetchPages() {
  const idle = (cb: () => void) => { if (typeof requestIdleCallback === "function") requestIdleCallback(cb, { timeout: 3000 }); else setTimeout(cb, 1200); };
  let i = 0;
  const next = () => { const load = PAGE_CHUNKS[i++]; if (load) void load().catch(() => undefined).finally(() => idle(next)); };
  idle(next);
}

function WorkspaceLoading({ current }: { current: string }) {
  return (
    <div className="content-page bg-bg">
      <div className="page-container flex flex-col gap-3 sm:gap-3.5">
        <WorkspaceHeader current={current} />
        <div role="status" aria-busy="true" className="mt-4 rounded-xl border border-border bg-surface p-6 text-sm text-muted">
          Loading workspace…
        </div>
      </div>
    </div>
  );
}

function Route() {
  const path = window.location.pathname.replace(/\/$/, "");
  if (path === "/ev") return <Suspense fallback={<WorkspaceLoading current="/ev" />}><EvWorkspace /></Suspense>;
  if (path === "/settings") return <Suspense fallback={<WorkspaceLoading current={path} />}><VoiceSettingsPage /></Suspense>;
  if (path === "/about") return <Suspense fallback={<WorkspaceLoading current={path} />}><AboutPage /></Suspense>;
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
  useLiveStream();
  useEffect(prefetchPages, []);
  const href = useSyncExternalStore(subscribeNavigation, () => window.location.pathname + window.location.search);
  const page = href.split("?")[0];
  const previous = useRef(page);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (previous.current === page) return;
    previous.current = page; window.scrollTo(0, 0);
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
  }, [page]);
  return (
    <div ref={container} onClick={handleWorkspaceLink}>
      {/* Keyed by path only: query changes (EV drawers) must not remount the page or its 3D scene. */}
      <div key={page} id="workspace-content" className="page-enter" tabIndex={-1}>
        <Route />
      </div>
      <NoticeToast />
      <div hidden={window.location.pathname.replace(/\/$/, "") === "/ev"}><CopilotDrawer /></div>
    </div>
  );
}
