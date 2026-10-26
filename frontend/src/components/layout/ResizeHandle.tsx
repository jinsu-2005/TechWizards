import { memo } from "react";

interface ResizeHandleProps {
  orientation: "vertical" | "horizontal";
  className?: string;
  isDragging?: boolean;
  valueNow?: number;
  label: string;
  onPointerDown: (e: React.PointerEvent) => void;
  onDoubleClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const ResizeHandle = memo(function ResizeHandle({
  orientation,
  className = "",
  isDragging = false,
  valueNow,
  label,
  onPointerDown,
  onDoubleClick,
  onKeyDown,
}: ResizeHandleProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation={orientation}
      aria-valuenow={valueNow}
      aria-label={`${label} · Drag to resize or double-click to reset`}
      title={`${label} (Drag to resize · Double-click to reset)`}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      onKeyDown={onKeyDown}
      className={`dashboard-resize-handle ${isVertical ? "resize-handle-vertical" : "resize-handle-horizontal"} ${
        isDragging ? "is-dragging" : ""
      } ${className}`}
    >
      <div className="resize-handle-line" />
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
    </div>
  );
});
