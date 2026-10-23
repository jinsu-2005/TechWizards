import type { Mode } from "../../lib/types";
import { useAccess } from "../../features/auth/access";

interface Props {
  mode: Mode;
  haiAvailable: boolean;
  haiReason?: string | null;
  liveAvailable: boolean;
  liveReason?: string | null;
  onChange: (m: Mode) => void;
}

const MODES: Mode[] = ["sim", "hai", "live"];

export function ModeToggle({ mode, haiAvailable, haiReason, liveAvailable, liveReason, onChange }: Props) {
  const { canAdmin } = useAccess();
  return (
    <div role="group" aria-label="Mode" className="inline-flex rounded border border-border p-px">
      {MODES.map((m) => {
        const isHaiDisabled = m === "hai" && !haiAvailable;
        const isLiveDisabled = m === "live" && !liveAvailable;
        const disabled = !canAdmin || isLiveDisabled;
        const active = m === mode;
        const title =
          !canAdmin
            ? "Only administrators can change the shared monitoring source"
            : isHaiDisabled
              ? (haiReason ?? "Backend memory exceeded: HAI requires ≥1GB RAM (disabled on 512MB cloud instance). Click for details.")
              : isLiveDisabled
                ? (liveReason ?? "LIVE unavailable")
                : ({ sim: "Simulation: virtual plant and controlled test attacks", hai: "Dataset replay: recorded HAI industrial testbed data", live: "Connected monitoring: reads the configured Modbus source" }[m]);
        return (
          <button
            key={m}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            title={title}
            onClick={() => onChange(m)}
            className={`h-8 rounded-sm px-2 font-mono text-xs uppercase transition-colors duration-150 ${
              active
                ? "bg-accent text-on-accent"
                : isHaiDisabled
                  ? "text-muted/60 hover:text-amber-400"
                  : "text-muted hover:text-text"
            } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted`}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
