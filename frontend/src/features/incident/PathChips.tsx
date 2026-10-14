import { ChevronRight } from "lucide-react";
import type { Incident } from "../../lib/types";

export function PathChips({ incident }: { incident: Incident }) {
  return (
    <ol className="flex flex-wrap items-center gap-1" aria-label="Attack path">
      {incident.path.map((s, i) => (
        <li key={s.id} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} className="text-muted" aria-hidden />}
          <span className="rounded border border-border px-1 font-mono text-xs">
            {s.id}
            <span className="ml-1 text-muted">+{s.t.toFixed(1)}s</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
