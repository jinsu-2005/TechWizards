import type { Mode } from "../../lib/types";

interface Props {
  mode: Mode;
  haiAvailable: boolean;
  liveAvailable: boolean;
  liveReason?: string | null;
  onChange: (m: Mode) => void;
}

const MODES: Mode[] = ["sim", "hai", "live"];

export function ModeToggle({ mode, haiAvailable, liveAvailable, liveReason, onChange }: Props) {
  return (
    <div role="group" aria-label="Mode" className="inline-flex rounded border border-border p-px">
      {MODES.map((m) => {
        const disabled = (m === "hai" && !haiAvailable) || (m === "live" && !liveAvailable);
        const active = m === mode;
        const title =
          m === "hai" && disabled
            ? "HAI data missing"
            : m === "live" && disabled
              ? (liveReason ?? "LIVE unavailable")
              : undefined;
        return (
          <button
            key={m}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            title={title}
            onClick={() => onChange(m)}
            className={`h-6 rounded-sm px-2 font-mono text-xs uppercase transition-colors duration-150 ${
              active ? "bg-accent text-bg" : "text-muted hover:text-text"
            } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted`}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
