import { memo } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";

interface ResizeHandleProps {
  orientation: "vertical" | "horizontal";
  className?: string;
  isDragging?: boolean;
  valueNow?: number;
  label: string;
  /** Which way the panel this handle borders lies, so the chevron points the right way. */
  side: "left" | "right" | "bottom";
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onDoubleClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

/** Chevron that points toward the motion the button causes: away to collapse, back to reopen. */
function collapseIcon(side: "left" | "right" | "bottom", collapsed: boolean) {
  if (side === "bottom") return collapsed ? ChevronUp : ChevronDown;
  if (side === "left") return collapsed ? ChevronRight : ChevronLeft;
  return collapsed ? ChevronLeft : ChevronRight;
}

export const ResizeHandle = memo(function ResizeHandle({
  orientation,
  className = "",
  isDragging = false,
  valueNow,
  label,
  side,
  collapsed = false,
  onToggleCollapse,
  onPointerDown,
  onDoubleClick,
  onKeyDown,
}: ResizeHandleProps) {
  const isVertical = orientation === "vertical";
  const Chevron = collapseIcon(side, collapsed);
  const action = collapsed ? `Show ${label}` : `Hide ${label}`;

  return (
    <div
      role="separator"
      tabIndex={collapsed ? -1 : 0}
      aria-orientation={orientation}
      aria-valuenow={collapsed ? undefined : valueNow}
      aria-label={
        collapsed ? `${label} hidden` : `${label} · Drag to resize or double-click to reset`
      }
      title={collapsed ? `${label} hidden` : `${label} (Drag to resize · Double-click to reset)`}
      onPointerDown={collapsed ? undefined : onPointerDown}
      onDoubleClick={collapsed ? undefined : onDoubleClick}
      onKeyDown={collapsed ? undefined : onKeyDown}
      className={`dashboard-resize-handle ${isVertical ? "resize-handle-vertical" : "resize-handle-horizontal"} ${
        isDragging ? "is-dragging" : ""
      } ${collapsed ? "is-collapsed" : ""} ${className}`}
    >
      {!collapsed && <div className="resize-handle-line" />}
      {!collapsed && (
        <div className="resize-handle-grip">
          {isVertical ? (
            <div className="grip-dots-vertical">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <div className="grip-dots-horizontal">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>
      )}
      {onToggleCollapse && (
        <button
          type="button"
          aria-label={action}
          aria-expanded={!collapsed}
          title={action}
          className="panel-collapse-button"
          onPointerDown={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse();
          }}
        >
          <Chevron size={13} aria-hidden />
        </button>
      )}
    </div>
  );
});
