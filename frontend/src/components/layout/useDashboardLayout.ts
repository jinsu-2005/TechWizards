import { useState, useCallback, useRef } from "react";

const STORAGE_KEY = "attacktrace_dashboard_layout_v1";

export interface DashboardLayoutState {
  leftWidth: number;
  rightWidth: number;
  timelineHeight: number;
}

export const DEFAULT_LAYOUT: DashboardLayoutState = {
  leftWidth: 260,
  rightWidth: 320,
  timelineHeight: 190,
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

  const startDrag = useCallback((splitter: "left" | "right" | "bottom", startEvent: React.PointerEvent) => {
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
  };
}
