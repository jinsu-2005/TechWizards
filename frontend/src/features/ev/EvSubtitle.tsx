import pilotIcon from "../../assets/ai-pilot-emblem.png";
import { useEv } from "./store";

/** On-stage subtitles for whatever the AI Pilot is saying (spoken alert or live call). */
export function EvSubtitle() {
  const caption = useEv((s) => s.caption);
  if (!caption) return null;
  // Long live turns keep only the latest sentences so the subtitle stays two lines tall.
  const text = caption.text.length > 220 ? `…${caption.text.slice(-210).replace(/^\S*\s/, "")}` : caption.text;
  return <div className="evs-subtitle" role="status" aria-live="polite" aria-label="AI Pilot is speaking">
    <span className="evs-subtitle-who">
      <img src={pilotIcon} alt="" />
      <b>AI Pilot</b>
      <i aria-hidden><s /><s /><s /><s /></i>
      {caption.live && <em>LIVE</em>}
    </span>
    <p>{text}</p>
  </div>;
}
