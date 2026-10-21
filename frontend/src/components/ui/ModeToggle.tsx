import type { Mode } from "../../lib/types";
import { useAccess } from "../../features/auth/access";

interface Props {
  mode: Mode;
  haiAvailable: boolean;
  liveAvailable: boolean;
  liveReason?: string | null;
  onChange: (m: Mode) => void;
}

const MODES: Mode[] = ["sim", "hai", "live"];

export function ModeToggle({ mode, haiAvailable, liveAvailable, liveReason, onChange }: Props) {
  const { canAdmin } = useAccess();
  return (
    <div role="group" aria-label="Mode" className="inline-flex rounded border border-border p-px">
      {MODES.map((m) => {
        const disabled = !canAdmin || (m === "hai" && !haiAvailable) || (m === "live" && !liveAvailable);
        const active = m === mode;
        const title =
          !canAdmin ? "Only administrators can change the shared monitoring source" : m === "hai" && disabled
            ? "HAI data missing"
            : m === "live" && disabled
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
              active ? "bg-accent text-on-accent" : "text-muted hover:text-text"
            } disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-muted`}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
