import { Activity, Bell, Boxes, ChartColumn, Database, FlaskConical, Info, Menu, Search, Settings, ShieldCheck, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { navigate } from "../../lib/navigation";
import { useUi } from "../../store/ui";
import { ThemeSwitcher } from "./ThemeSwitcher";
import pilotIcon from "../../assets/ai-pilot-emblem.png";

import { useLive } from "../../store/live";

const NAV_PAGES = [
  { href: "/", label: "Monitoring", icon: Activity },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/assets", label: "Assets", icon: Boxes },
  { href: "/investigations", label: "Investigations", icon: Search },
  { href: "/sources", label: "Sources", icon: Database },
  { href: "/metrics", label: "Metrics", icon: ChartColumn },
  { href: "/lab", label: "Local lab", icon: FlaskConical },
  { href: "/about", label: "About", icon: Info },
];

export function WorkspaceHeader({ current }: { current: string }) {
  const sound = useUi((s) => s.soundEnabled);
  const toggleSound = useUi((s) => s.toggleSound);
  const copilot = useUi((s) => s.copilotOpen);
  const toggleCopilot = useUi((s) => s.toggleCopilot);
  const incident = useLive((s) => s.latest?.incident);
  const isIncidentActive = incident && ["open", "localizing"].includes(incident.status);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { setMenuOpen(false); menuBtnRef.current?.focus(); }
    }
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => { document.removeEventListener("keydown", onKeyDown); document.removeEventListener("mousedown", onClickOutside); };
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector<HTMLElement>("a")?.focus();
  }, [menuOpen]);

  const allPages = [...NAV_PAGES, { href: "/settings", label: "Settings", icon: Settings }];

  return (
    <header className="workspace-header" role="banner">
      <a className="skip-link" href="#main-workspace">Skip to content</a>

      <div className="workspace-topbar">
        {/* Brand */}
        <a href="/" className="workspace-brand" aria-label="AttackTrace monitoring home">
          <span className="brand-glyph"><ShieldCheck size={20} aria-hidden /></span>
          <span>
            <strong>AttackTrace</strong>
            <span className="brand-caption flex items-center gap-1.5">
              Process security
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-normal animate-pulse" title="Telemetry live 2 Hz" />
            </span>
          </span>
        </a>

        {/* Primary nav – wide screens */}
        <nav aria-label="Workspace navigation" className="workspace-links">
          {NAV_PAGES.map(({ href, label, icon: Icon }) => (
            <a key={href} href={href} aria-current={href === current ? "page" : undefined} className="relative">
              <Icon size={15} aria-hidden />
              <span>{label}</span>
              {href === "/alerts" && isIncidentActive && (
                <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-origin animate-ping shadow-[0_0_6px_var(--origin)]" />
              )}
            </a>
          ))}
        </nav>

        {/* Utility controls */}
        <div className="workspace-utilities">
          <ThemeSwitcher />

          <button
            type="button"
            className="utility-icon"
            onClick={toggleSound}
            aria-label={sound ? "Mute audio alarms" : "Unmute audio alarms"}
            title={sound ? "Mute audio alarms" : "Unmute audio alarms"}
          >
            {sound ? <Volume2 size={17} aria-hidden /> : <VolumeX size={17} aria-hidden />}
          </button>

          <button
            type="button"
            className={`copilot-trigger${copilot ? " is-selected" : ""}`}
            aria-label="Toggle AI Pilot"
            aria-pressed={copilot}
            onClick={toggleCopilot}
          >
            <img src={pilotIcon} alt="" className="aip-trigger-emblem" />
            <span className="copilot-label">AI Pilot</span>
          </button>

          <a
            href="/settings"
            className={`utility-icon utility-settings${current === "/settings" ? " is-active" : ""}`}
            aria-label="Settings"
            title="Settings"
            aria-current={current === "/settings" ? "page" : undefined}
          >
            <Settings size={17} aria-hidden />
          </a>

          {/* Hamburger – compact widths */}
          <button
            ref={menuBtnRef}
            type="button"
            className="nav-menu-btn"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="compact-nav-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
          </button>
        </div>
      </div>

      {/* Compact / mobile dropdown */}
      {menuOpen && (
        <div id="compact-nav-menu" className="nav-dropdown" role="dialog" aria-label="Navigation menu" ref={menuRef}>
          <nav aria-label="All pages">
            {allPages.map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className="nav-dropdown-link"
                aria-current={href === current ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <Icon size={16} aria-hidden />
                <span>{label}</span>
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Fallback native select for very small / no-JS contexts */}
      <label className="mobile-navigation">
        <span>Workspace</span>
        <select
          aria-label="Go to workspace"
          value={current}
          onChange={(event) => navigate(event.target.value)}
        >
          {allPages.map(({ href, label }) => (
            <option key={href} value={href}>{label}</option>
          ))}
        </select>
      </label>
    </header>
  );
}
