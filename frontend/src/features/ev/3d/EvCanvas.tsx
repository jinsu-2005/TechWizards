import { useEffect, useRef, useState } from "react";
import {
  Boxes,
  Camera,
  Compass,
  Cpu,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";
import { Ev3dScene } from "./Ev3dScene";
import { COMPONENT_3D_DEFS, SUBSYSTEM_COLORS, type CameraPreset, type ComponentId, type EvViewMode, type SubsystemKind } from "./types";
import { formatReading, getReading, type Frame, type Snapshot } from "../model";
import { useEv } from "../store";

interface EvCanvasProps {
  snapshot: Snapshot;
  frame: Frame;
  className?: string;
}

const MODES: Array<{ id: EvViewMode; label: string; title: string; icon: typeof Eye }> = [
  { id: "exterior", label: "Exterior", title: "Solid exterior, internals hidden", icon: Eye },
  { id: "xray", label: "X-Ray", title: "Holographic shell with live internals", icon: Sparkles },
  { id: "exploded", label: "Exploded", title: "Subsystems separated into layers", icon: Boxes },
  { id: "system", label: "Subsystems", title: "Shell removed, focus on engineering layers", icon: Layers },
  { id: "investigation", label: "Attack View", title: "Dim everything except affected signals and the origin", icon: ShieldAlert },
];

const CAMERAS: Array<{ id: CameraPreset; label: string; title: string }> = [
  { id: "iso", label: "Iso", title: "Isometric perspective" },
  { id: "front", label: "Front", title: "Front viewpoint" },
  { id: "side", label: "Side", title: "Side profile" },
  { id: "rear", label: "Rear", title: "Rear powertrain viewpoint" },
  { id: "top", label: "Top", title: "Top-down skateboard view" },
];

const SYSTEMS: SubsystemKind[] = ["All", "Energy", "Powertrain", "Thermal", "Chassis", "Network"];

export function EvCanvas({ snapshot, frame, className = "" }: EvCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Ev3dScene | null>(null);
  const prevSelected = useRef<string | null>(useEv.getState().selected);

  const selected = useEv((s) => s.selected);
  const select = useEv((s) => s.select);

  const [viewMode, setViewMode] = useState<EvViewMode>("xray");
  const [subsystem, setSubsystem] = useState<SubsystemKind>("All");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sceneReady, setSceneReady] = useState(0);

  // Build the scene one frame after the page paints: the first shader compile blocks the main
  // thread, so the header, HUD and layout appear instantly and the car fades in a moment later.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let scene: Ev3dScene | null = null;
    const frame = requestAnimationFrame(() => {
      scene = new Ev3dScene({ container, onSelectComponent: (id) => select(id) });
      sceneRef.current = scene;
      if (prevSelected.current) scene.selectComponent(prevSelected.current, false);
      setSceneReady((n) => n + 1);
    });
    return () => {
      cancelAnimationFrame(frame);
      scene?.dispose();
      sceneRef.current = null;
    };
  }, [select]);

  useEffect(() => {
    sceneRef.current?.setViewMode(viewMode);
  }, [viewMode, sceneReady]);

  useEffect(() => {
    sceneRef.current?.setSubsystem(subsystem);
  }, [subsystem, sceneReady]);

  // Selection from anywhere (3D click, quick bar, ranked list) drives the camera.
  // The persisted selection on first mount is highlighted without moving the camera.
  useEffect(() => {
    if (!selected || prevSelected.current === selected) return;
    prevSelected.current = selected;
    sceneRef.current?.selectComponent(selected, true);
    setViewMode((m) => (m === "exterior" ? "xray" : m));
  }, [selected]);

  // An injection starting switches to Attack View so the origin and propagation read immediately.
  useEffect(() => {
    if (snapshot.attack_active) setViewMode("investigation");
  }, [snapshot.attack_active]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    sceneRef.current?.updateTelemetry({
      speed: snapshot.actual_speed,
      affected: frame.analysis.affected,
      candidates: frame.analysis.candidates,
      paths: (frame.analysis.path || []).map((p) => ({ source: p.source, target: p.target, onset_s: p.onset_s })),
      isAttackActive: snapshot.attack_active,
    });
  }, [frame, snapshot.attack_active, snapshot.actual_speed, sceneReady]);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) void el.requestFullscreen().catch(() => {});
    else void document.exitFullscreen().catch(() => {});
  };

  const def = selected ? COMPONENT_3D_DEFS[selected as ComponentId] : undefined;
  const backendComponent = snapshot.components.find((c) => c.id === selected);
  const reading = selected ? getReading(frame, selected) : undefined;
  const leaderId = frame.analysis.candidates[0]?.id;
  const isAttack = snapshot.attack_active;
  const anomalous = frame.analysis.affected.length;
  const selectedAnomalous = !!selected && frame.analysis.affected.includes(selected);
  // The drive cycle swings about ±13% around cruise; only a real setpoint change counts.
  const demandChanged = Math.abs(snapshot.speed - snapshot.actual_speed) > snapshot.speed * 0.16 + 2;

  return (
    <div
      ref={containerRef}
      className={`ev-3d-viewport ${isFullscreen ? "is-fullscreen" : ""} ${className}`}
      role="region"
      aria-label="Scrollable interactive EV diagram"
      tabIndex={0}
    >
      <div className="ev-3d-hud-top">
        <div className="ev-3d-modes" role="group" aria-label="3D Visualization Modes">
          {MODES.map(({ id, label, title, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`${viewMode === id ? "is-active" : ""} ${id === "investigation" ? "ev-mode-attack" : ""}`}
              onClick={() => setViewMode(id)}
              title={title}
              aria-pressed={viewMode === id}
            >
              <Icon size={14} aria-hidden />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="ev-3d-cameras" role="group" aria-label="Camera Presets">
          <span className="ev-hud-label">
            <Camera size={13} aria-hidden /> Camera
          </span>
          {CAMERAS.map(({ id, label, title }) => (
            <button key={id} type="button" onClick={() => sceneRef.current?.setCameraPreset(id)} title={title}>
              {label}
            </button>
          ))}
          <button type="button" className="ev-cam-reset" onClick={() => sceneRef.current?.setCameraPreset("reset")} title="Reset camera orientation" aria-label="Reset camera orientation">
            <RotateCcw size={12} aria-hidden />
          </button>
          <button
            type="button"
            className="ev-fullscreen-toggle"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen 3D twin"}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen 3D twin"}
          >
            {isFullscreen ? <Minimize2 size={13} aria-hidden /> : <Maximize2 size={13} aria-hidden />}
          </button>
        </div>
      </div>

      <div className="ev-3d-subsystems" role="group" aria-label="Subsystem Filters">
        {SYSTEMS.map((sys) => {
          const color = sys === "All" ? "var(--ev-accent)" : SUBSYSTEM_COLORS[sys];
          return (
            <button
              key={sys}
              type="button"
              className={`ev-subsys-pill ${subsystem === sys ? "is-active" : ""}`}
              style={{ ["--pill" as string]: color }}
              onClick={() => setSubsystem(sys)}
              aria-pressed={subsystem === sys}
            >
              <span className="ev-subsys-dot" />
              {sys}
            </button>
          );
        })}
      </div>

      <div className="ev-3d-hud-bottom">
        <div className={`ev-3d-telemetry ${isAttack ? "is-attack" : ""}`}>
          <div className="ev-3d-speed">
            <Zap size={14} aria-hidden />
            <strong>{Math.round(snapshot.actual_speed)}</strong>
            <small>km/h</small>
          </div>
          <div className="ev-3d-telemetry-meta">
            <span>{demandChanged ? `Target ${snapshot.speed.toFixed(0)} km/h` : "Cruising"}</span>
            <span className={isAttack ? "ev-attack-badge" : "ev-nominal-badge"}>
              {isAttack ? "CYBER ATTACK ACTIVE" : anomalous ? `${anomalous} ANOMALOUS` : "NOMINAL TELEMETRY"}
            </span>
          </div>
        </div>

        <div className="ev-3d-hint">
          <Compass size={13} aria-hidden />
          <span>Click a part · Drag to orbit · Scroll to zoom</span>
        </div>

        {def && (
          <div className={`ev-3d-inspect-card ${selectedAnomalous ? "is-anomalous" : ""}`} style={{ ["--sys" as string]: def.color }}>
            <Cpu size={16} aria-hidden />
            <div className="ev-3d-inspect-body">
              <strong>{backendComponent?.name ?? def.name}</strong>
              <small>
                {def.id} · {def.system} · {def.kind}
              </small>
              {reading && (
                <span className="ev-3d-reading">
                  {formatReading(reading)}
                  <em>
                    ref {reading.expected.toFixed(1)} · residual {reading.residual.toFixed(2)}
                  </em>
                </span>
              )}
            </div>
            {leaderId === def.id && <span className="ev-origin-badge">#1 Origin</span>}
          </div>
        )}
      </div>
    </div>
  );
}
