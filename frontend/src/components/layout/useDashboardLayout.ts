import { useState, useCallback, useRef } from "react";

const STORAGE_KEY = "attacktrace_dashboard_layout_v2";

export interface DashboardLayoutState {
  leftWidth: number;
  rightWidth: number;
  timelineHeight: number;
  /** Collapsed panels give their space to the digital twin; the splitter keeps a reopen rail. */
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  bottomCollapsed: boolean;
}

export type Splitter = "left" | "right" | "bottom";

const COLLAPSE_KEY = {
  left: "leftCollapsed",
  right: "rightCollapsed",
  bottom: "bottomCollapsed",
} as const satisfies Record<Splitter, keyof DashboardLayoutState>;

export const DEFAULT_LAYOUT: DashboardLayoutState = {
  leftWidth: 260,
  rightWidth: 320,
  timelineHeight: 190,
  leftCollapsed: false,
  rightCollapsed: false,
  bottomCollapsed: false,
};

export const CONSTRAINTS = {
  left: { min: 180, max: 420 },
  right: { min: 240, max: 500 },
  bottom: { min: 130, max: 420 },
};

export function useDashboardLayout() {
  const [layout, setLayout] = useState<DashboardLayoutState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          leftWidth: Math.min(Math.max(parsed.leftWidth ?? DEFAULT_LAYOUT.leftWidth, CONSTRAINTS.left.min), CONSTRAINTS.left.max),
          rightWidth: Math.min(Math.max(parsed.rightWidth ?? DEFAULT_LAYOUT.rightWidth, CONSTRAINTS.right.min), CONSTRAINTS.right.max),
          timelineHeight: Math.min(Math.max(parsed.timelineHeight ?? DEFAULT_LAYOUT.timelineHeight, CONSTRAINTS.bottom.min), CONSTRAINTS.bottom.max),
          leftCollapsed: parsed.leftCollapsed === true,
          rightCollapsed: parsed.rightCollapsed === true,
          bottomCollapsed: parsed.bottomCollapsed === true,
        };
      }
    } catch {
      // ignore JSON parse or localStorage errors
    }
    return DEFAULT_LAYOUT;
  });

  const [isDragging, setIsDragging] = useState<"left" | "right" | "bottom" | null>(null);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const persist = useCallback((next: DashboardLayoutState) => {
    setLayout(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable
    }
  }, []);

  const resetLayout = useCallback(() => {
    persist(DEFAULT_LAYOUT);
  }, [persist]);

  const resetLeft = useCallback(() => {
    persist({ ...layoutRef.current, leftWidth: DEFAULT_LAYOUT.leftWidth });
  }, [persist]);

  const resetRight = useCallback(() => {
    persist({ ...layoutRef.current, rightWidth: DEFAULT_LAYOUT.rightWidth });
  }, [persist]);

  const resetBottom = useCallback(() => {
    persist({ ...layoutRef.current, timelineHeight: DEFAULT_LAYOUT.timelineHeight });
  }, [persist]);

  /** Collapse or reopen one panel. The width it had is kept, so reopening restores it. */
  const toggleCollapse = useCallback((splitter: Splitter) => {
    const key = COLLAPSE_KEY[splitter];
    persist({ ...layoutRef.current, [key]: !layoutRef.current[key] });
  }, [persist]);

  /** Give every pixel to the twin, or put the workspace back the way it was. */
  const focusCenter = useCallback(() => {
    const l = layoutRef.current;
    const anyOpen = !l.leftCollapsed || !l.rightCollapsed || !l.bottomCollapsed;
    persist({ ...l, leftCollapsed: anyOpen, rightCollapsed: anyOpen, bottomCollapsed: anyOpen });
  }, [persist]);

  const startDrag = useCallback((splitter: Splitter, startEvent: React.PointerEvent) => {
    if (layoutRef.current[COLLAPSE_KEY[splitter]]) return; // a collapsed panel has no width to drag
    startEvent.preventDefault();
    setIsDragging(splitter);

    const startX = startEvent.clientX;
    const startY = startEvent.clientY;
    const initialLayout = { ...layoutRef.current };

    const handlePointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      if (splitter === "left") {
        const newWidth = Math.min(
          Math.max(initialLayout.leftWidth + deltaX, CONSTRAINTS.left.min),
          CONSTRAINTS.left.max
        );
        setLayout((prev) => ({ ...prev, leftWidth: Math.round(newWidth) }));
      } else if (splitter === "right") {
        // Dragging left increases right panel width, dragging right decreases it
        const newWidth = Math.min(
          Math.max(initialLayout.rightWidth - deltaX, CONSTRAINTS.right.min),
          CONSTRAINTS.right.max
        );
        setLayout((prev) => ({ ...prev, rightWidth: Math.round(newWidth) }));
      } else if (splitter === "bottom") {
        // Dragging up increases timeline height, dragging down decreases it
        const newHeight = Math.min(
          Math.max(initialLayout.timelineHeight - deltaY, CONSTRAINTS.bottom.min),
          CONSTRAINTS.bottom.max
        );
        setLayout((prev) => ({ ...prev, timelineHeight: Math.round(newHeight) }));
      }
    };

    const handlePointerUp = () => {
      setIsDragging(null);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(layoutRef.current));
      } catch {
        // ignore
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  }, []);

  return {
    layout,
    isDragging,
    startDrag,
    resetLayout,
    resetLeft,
    resetRight,
    resetBottom,
    toggleCollapse,
    focusCenter,
  };
}
