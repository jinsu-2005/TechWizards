import { Activity, Bell, Boxes, ChartColumn, Database, FlaskConical, Search, ShieldCheck, Sparkles, Volume2, VolumeX } from "lucide-react";
import { navigate } from "../../lib/navigation";
import { useUi } from "../../store/ui";
import { ThemeSwitcher } from "./ThemeSwitcher";

const pages = [
  { href: "/", label: "Monitoring", icon: Activity },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/assets", label: "Assets", icon: Boxes },
  { href: "/investigations", label: "Investigations", icon: Search },
  { href: "/sources", label: "Sources", icon: Database },
  { href: "/metrics", label: "Metrics", icon: ChartColumn },
  { href: "/lab", label: "Local lab", icon: FlaskConical },
];
export function WorkspaceHeader({ current }: { current: string }) {
  const sound = useUi((s) => s.soundEnabled);
  const toggleSound = useUi((s) => s.toggleSound);
  const copilot = useUi((s) => s.copilotOpen);
  const toggleCopilot = useUi((s) => s.toggleCopilot);
  return <header className="workspace-header">
    <a className="skip-link" href="#main-workspace">Skip to content</a>
    <div className="workspace-brand-row">
      <a href="/" className="workspace-brand" aria-label="AttackTrace monitoring home"><span className="brand-glyph"><ShieldCheck size={20} aria-hidden /></span><span><strong>AttackTrace</strong><span className="brand-caption">Process security workspace</span></span></a>
      <div className="workspace-utilities"><ThemeSwitcher />
        <button type="button" className="utility-icon" onClick={toggleSound} aria-label={sound ? "Mute audio alarms" : "Unmute audio alarms"} title={sound ? "Mute audio alarms" : "Unmute audio alarms"}>{sound ? <Volume2 size={17} aria-hidden /> : <VolumeX size={17} aria-hidden />}</button>
        <button type="button" className={`copilot-trigger ${copilot ? "is-selected" : ""}`} aria-label="Toggle AI Copilot" aria-pressed={copilot} onClick={toggleCopilot}><Sparkles size={16} aria-hidden /><span>Copilot</span></button>
      </div>
    </div>
    <nav aria-label="Workspace navigation" className="workspace-links">{pages.map(({ href, label, icon: Icon }) => <a key={href} href={href} aria-current={href === current ? "page" : undefined}><Icon size={16} aria-hidden /><span>{label}</span></a>)}</nav>
    <label className="mobile-navigation"><span>Workspace</span><select aria-label="Go to workspace" value={current} onChange={(event) => navigate(event.target.value)}>{pages.map(({ href, label }) => <option key={href} value={href}>{label}</option>)}</select></label>
  </header>;
}
