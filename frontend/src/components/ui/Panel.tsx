import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  icon: LucideIcon;
  className?: string;
  /** Optional controls or indicators placed directly beside the title. */
  headerExtra?: ReactNode;
  /** Optional controls on the right of the header. */
  actions?: ReactNode;
  children: ReactNode;
}

/** Surface with a 1 px border and a one-line header label. */
export function Panel({ title, icon: Icon, className = "", headerExtra, actions, children }: PanelProps) {
  return (
    <section
      aria-label={title}
      className={`flex min-h-0 min-w-0 flex-col rounded-lg border border-border bg-surface shadow-sm ${className}`}
    >
      <header className="panel-heading flex min-h-10 shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-3 py-1.5 text-sm font-semibold text-text">
        <div className="flex h-5 w-5 items-center justify-center rounded bg-accent/10 text-accent">
          <Icon size={12} aria-hidden />
        </div>
        <span>{title}</span>
        {headerExtra && <div className="flex items-center gap-2">{headerExtra}</div>}
        {actions && <div className="ml-auto flex items-center normal-case tracking-normal">{actions}</div>}
      </header>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}
