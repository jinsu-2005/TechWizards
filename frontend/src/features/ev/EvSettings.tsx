import { useEffect, useState } from "react";
import { Settings, X } from "lucide-react";
import { navigate } from "../../lib/navigation";
import { useVoice } from "../../lib/voice";
import { useUi } from "../../store/ui";

const VOICES = [{ id: "Kore", label: "Kore · calm" }, { id: "Puck", label: "Puck · bright" }];

/** EV-only settings: stays inside the vehicle workspace instead of the water-plant settings page. */
export function EvSettings({ narrate, onNarrate }: { narrate: boolean; onNarrate: (on: boolean) => void }) {
  const voice = useVoice();
  const sound = useUi((s) => s.soundEnabled);
  const toggleSound = useUi((s) => s.toggleSound);
  const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
  useEffect(() => {
    void navigator.mediaDevices?.enumerateDevices?.().then((d) => setMics(d.filter((x) => x.kind === "audioinput"))).catch(() => undefined);
  }, []);
  return <aside className="evs-drawer evs-drawer-right" aria-label="EV settings">
    <header>
      <h2><Settings size={16} aria-hidden /> Settings</h2>
      <button className="evs-x" aria-label="Close" onClick={() => navigate("/ev")}><X size={16} aria-hidden /></button>
    </header>
    <label>Pilot voice
      <select value={voice.geminiVoice} onChange={(e) => voice.update({ geminiVoice: e.target.value })}>
        {VOICES.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
      </select>
    </label>
    <label>Microphone
      <select value={voice.inputDeviceId} onChange={(e) => voice.update({ inputDeviceId: e.target.value })}>
        <option value="">System default</option>
        {mics.filter((m) => m.deviceId && m.deviceId !== "default").map((m, i) => <option key={m.deviceId} value={m.deviceId}>{m.label || `Microphone ${i + 1}`}</option>)}
      </select>
    </label>
    <div className="evs-switches">
      <label className="evs-switch"><input type="checkbox" checked={narrate} onChange={(e) => onNarrate(e.target.checked)} /><span>Spoken alerts</span></label>
      <label className="evs-switch"><input type="checkbox" checked={sound} onChange={toggleSound} /><span>Alarm sound</span></label>
    </div>
    <footer><p>Voice changes apply to the next live session.</p></footer>
  </aside>;
}
