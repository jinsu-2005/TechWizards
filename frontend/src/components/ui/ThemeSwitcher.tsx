import { Check, ChevronDown, Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { THEMES, useTheme, type ThemeMeta } from "../../store/theme";

const DEFAULT_THEME: ThemeMeta = THEMES[0] ?? {
  id: "obsidian",
  name: "Obsidian Dark",
  tagline: "Default SCADA Dark Room",
  colors: {
    bg: "#0b0f14",
    surface: "#121821",
    accent: "#4c8dff",
    status: "#2ea97d",
  },
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const activeTheme: ThemeMeta = THEMES.find((t) => t.id === theme) ?? DEFAULT_THEME;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    if (open) {
      containerRef.current?.querySelector<HTMLElement>('[role="menuitemradio"][aria-checked="true"]')?.focus();
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={containerRef} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
    }}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Switch UI Theme"
        title={`Current theme: ${activeTheme.name}`}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true);
          }
        }}
        className={`flex min-h-10 items-center gap-1.5 rounded-lg border px-2.5 text-xs transition-all duration-150 ${
          open
            ? "border-accent bg-accent/10 text-accent shadow-sm"
            : "border-border text-muted hover:border-border/80 hover:text-text"
        }`}
      >
        <Palette size={13} className="shrink-0 text-accent" aria-hidden />
        <span className="font-medium text-text">{activeTheme.name.split(" ")[0]}</span>
        <div className="flex items-center -space-x-0.5">
          <span
            className="h-2 w-2 rounded-full border border-border shadow-xs"
            style={{ backgroundColor: activeTheme.colors.accent }}
          />
          <span
            className="h-2 w-2 rounded-full border border-border shadow-xs"
            style={{ backgroundColor: activeTheme.colors.status }}
          />
        </div>
        <ChevronDown size={12} className={`text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Theme Selection"
          onKeyDown={(event) => {
            const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
            if (!keys.includes(event.key)) return;
            event.preventDefault();
            const items = Array.from(containerRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') ?? []);
            const index = items.indexOf(document.activeElement as HTMLButtonElement);
            const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
            items[next]?.focus();
          }}
          className="theme-menu absolute right-0 mt-1.5 z-50 w-80 rounded-lg border border-border bg-surface p-2 shadow-2xl "
        >
          <div className="mb-2 border-b border-border/70 px-2 pb-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wider text-muted uppercase">
                Display Theme
              </span>
              <span className="rounded bg-accent/15 px-1 py-0.2 text-[11px] font-mono text-accent">
                {THEMES.length} Themes
              </span>
            </div>
            <p className="text-xs text-muted/80">Select control room visualization palette</p>
          </div>

          <div className="max-h-80 space-y-1 overflow-y-auto pr-0.5">
            {THEMES.map((item) => {
              const isSelected = item.id === theme;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="menuitemradio"
                  tabIndex={-1}
                  aria-checked={isSelected}
                  onClick={() => {
                    setTheme(item.id);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-all duration-150 ${
                    isSelected
                      ? "bg-accent/15 text-accent font-semibold border border-accent/40 shadow-xs"
                      : "text-text/90 hover:bg-border/40 hover:text-text border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* 4-dot Palette Swatch */}
                    <div className="flex items-center -space-x-1 shrink-0 rounded-full bg-border/40 p-0.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-border/80 shadow-xs"
                        style={{ backgroundColor: item.colors.bg }}
                        title="Background"
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-border/80 shadow-xs"
                        style={{ backgroundColor: item.colors.surface }}
                        title="Surface"
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-border/80 shadow-xs"
                        style={{ backgroundColor: item.colors.accent }}
                        title="Accent"
                      />
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-border/80 shadow-xs"
                        style={{ backgroundColor: item.colors.status }}
                        title="Status"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{item.name}</span>
                        {item.isLight && (
                          <span className="rounded bg-accent/10 px-1 py-0.2 text-[11px] text-accent font-mono">
                            LIGHT
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted leading-tight">{item.tagline}</p>
                    </div>
                  </div>

                  {isSelected && <Check size={14} className="text-accent shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
