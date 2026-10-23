import { useFreshness } from "../../app/useFreshness";
import { History, Pause, Play, Radio, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { incidentStartIndex } from "../../lib/replay";
import { useLive } from "../../store/live";

function Btn({ icon: Icon, label, onClick, pressed, disabled }: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  pressed?: boolean;
  disabled?: boolean;
}) {
  return (
    <button type="button" aria-label={label} title={label} aria-pressed={pressed}
      disabled={disabled} onClick={onClick}
      className={`timeline-control ${pressed ? "timeline-control-active" : ""}`}>
      <Icon size={15} aria-hidden />
    </button>
  );
}

/** Controls for recorded samples; the live badge always describes the actual cursor. */
export function ReplayControls() {
  const { stale } = useFreshness();
  const playing = useLive((s) => s.playing);
  const hai = useLive((s) => s.latest?.mode === "hai");
  const cursor = useLive((s) => s.cursor);
  const hasSamples = useLive((s) => s.buffer.length > 0);
  const hasIncident = useLive((s) => incidentStartIndex(s.buffer) !== null);
  const { play, pause, goLive, replayIncident } = useLive.getState();
  const live = cursor === null;
  const running = live || playing;

  return (
    <div className="timeline-controls">
      <div className="timeline-control-group">
        <Btn icon={RotateCcw} label="Replay incident" onClick={replayIncident} disabled={!hasIncident} />
        <Btn icon={running ? Pause : Play} label={running ? "Pause timeline" : "Play timeline"}
          onClick={running ? pause : play} pressed={playing} disabled={!hasSamples} />
      </div>
      <button type="button" onClick={goLive} disabled={live} className={`timeline-live ${live && !stale ? "timeline-live-current" : ""}`}>
        {live ? <Radio size={14} aria-hidden /> : <History size={14} aria-hidden />}
        <span>{live ? (stale ? "Last received" : hai ? "Latest" : "Live") : playing ? "Playing replay" : "Paused replay"}</span>
      </button>
    </div>
  );
}
