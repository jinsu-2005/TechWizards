import type { MagnitudeInput } from "../../lib/scenarios";

interface Props {
  input: MagnitudeInput;
  value: number;
  onChange: (v: number) => void;
  className: string;
}

export function MagnitudeField({ input, value, onChange, className }: Props) {
  if (input.kind === "none") {
    return (
      <div className="flex flex-col gap-1 text-xs text-muted">
        Magnitude
        <span className={`${className} flex items-center opacity-50`}>–</span>
      </div>
    );
  }
  if (input.kind === "toggle") {
    return (
      <div className="flex flex-col gap-1 text-xs text-muted">
        Command
        <div role="group" aria-label="Command" className="inline-flex rounded border border-border p-px">
          {([0, 1] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={value === v}
              onClick={() => onChange(v)}
              className={`h-7 flex-1 rounded-sm font-mono text-xs transition-colors duration-150 ${
                value === v ? "bg-accent text-bg" : "text-muted hover:text-text"
              }`}
            >
              {v === 1 ? input.on : input.off}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {`Magnitude${input.unit ? ` (${input.unit})` : ""}`}
      <input
        type="number"
        className={className}
        value={value}
        step={input.step}
        min={input.min}
        max={input.max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
