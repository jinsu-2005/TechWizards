import type { NodeStatus } from "../../lib/types";
import { STATUS_COLOR } from "./status";

/** Shape + colour: circle (normal), triangle (suspect), square (affected), diamond (origin). */
export function StatusGlyph({ status, cx, cy }: { status: NodeStatus; cx: number; cy: number }) {
  const fill = STATUS_COLOR[status];
  switch (status) {
    case "normal":
      return <circle cx={cx} cy={cy} r={4} fill={fill} />;
    case "suspect":
      return <polygon points={`${cx},${cy - 5} ${cx + 5},${cy + 4} ${cx - 5},${cy + 4}`} fill={fill} />;
    case "affected":
      return <rect x={cx - 4} y={cy - 4} width={8} height={8} fill={fill} />;
    case "origin":
      return (
        <polygon points={`${cx},${cy - 6} ${cx + 6},${cy} ${cx},${cy + 6} ${cx - 6},${cy}`} fill={fill} />
      );
  }
}
