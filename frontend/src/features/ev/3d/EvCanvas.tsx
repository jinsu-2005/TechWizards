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
import { COMPONENT_3D_DEFS, SUBSYSTEM_COLORS, type CameraPreset, type EvViewMode, type SubsystemKind } from "./types";
import type { Frame, Snapshot } from "../model";
import { useEv } from "../store";

interface EvCanvasProps {
  snapshot: Snapshot;
  frame: Frame;
  className?: string;
}

export function EvCanvas({ snapshot, frame, className = "" }: EvCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Ev3dScene | null>(null);

  const selected = useEv((s) => s.selected);
  const select = useEv((s) => s.select);

  const [viewMode, setViewMode] = useState<EvViewMode>("xray");
  const [subsystem, setSubsystem] = useState<SubsystemKind>("All");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new Ev3dScene({
      container: containerRef.current,
      onSelectComponent: (id) => {
        select(id);
      },
    });
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, [select]);

  // Sync viewMode changes
  useEffect(() => {
    sceneRef.current?.setViewMode(viewMode);
  }, [viewMode]);

  // Sync subsystem filter
  useEffect(() => {
    sceneRef.current?.setSubsystem(subsystem);
  }, [subsystem]);

  // Sync selected component
  useEffect(() => {
    if (selected) {
      sceneRef.current?.selectComponent(selected);
    }
  }, [selected]);

  // Sync simulation telemetry, affected list, and propagation paths
  useEffect(() => {
    if (!sceneRef.current) return;

    const paths = (frame.analysis.path || []).map((p) => ({
      source: p.source,
      target: p.target,
      onset_s: p.onset_s,
    }));

    sceneRef.current.updateTelemetry({
      speed: snapshot.actual_speed,
      affected: frame.analysis.affected,
      candidates: frame.analysis.candidates,
      paths,
      isAttackActive: snapshot.attack_active,
    });
  }, [frame, snapshot.attack_active, snapshot.actual_speed]);

  const handleCameraPreset = (preset: CameraPreset) => {
    sceneRef.current?.setCameraPreset(preset);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      void document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const selectedDef = selected ? COMPONENT_3D_DEFS[selected as keyof typeof COMPONENT_3D_DEFS] : null;
  const leaderId = frame.analysis.candidates[0]?.id;
  const isAttack = snapshot.attack_active;

  return (
    <div
      ref={containerRef}
      className={`ev-3d-viewport ${isFullscreen ? "is-fullscreen" : ""} ${className}`}
      role="region"
      aria-label="Scrollable interactive EV diagram"
      tabIndex={0}
    >
      {/* Top Floating HUD: View Modes & Camera Controls */}
      <div className="ev-3d-hud-top">
        <div className="ev-3d-toolbar-row">
          {/* Mode Selector */}
          <div className="ev-3d-modes" role="group" aria-label="3D Visualization Modes">
            <button
              type="button"
              className={viewMode === "exterior" ? "is-active" : ""}
              onClick={() => setViewMode("exterior")}
              title="Full exterior vehicle view"
            >
              <Eye size={14} aria-hidden />
              <span>Exterior</span>
            </button>
            <button
              type="button"
              className={viewMode === "xray" ? "is-active" : ""}
              onClick={() => setViewMode("xray")}
              title="Semi-transparent holographic X-Ray view"
            >
              <Sparkles size={14} aria-hidden />
              <span>X-Ray</span>
            </button>
            <button
              type="button"
              className={viewMode === "exploded" ? "is-active" : ""}
              onClick={() => setViewMode("exploded")}
              title="Exploded subsystem isolation view"
            >
              <Boxes size={14} aria-hidden />
              <span>Exploded</span>
            </button>
            <button
              type="button"
              className={viewMode === "system" ? "is-active" : ""}
              onClick={() => setViewMode("system")}
              title="Focus on vehicle engineering subsystems"
            >
              <Layers size={14} aria-hidden />
              <span>Subsystems</span>
            </button>
            <button
              type="button"
              className={`ev-mode-attack ${viewMode === "investigation" ? "is-active" : ""}`}
              onClick={() => setViewMode("investigation")}
              title="Cyber-attack localization and propagation view"
            >
              <ShieldAlert size={14} aria-hidden />
              <span>Attack View</span>
            </button>
          </div>

          {/* Camera Presets */}
          <div className="ev-3d-cameras" role="group" aria-label="Camera Presets">
            <span className="ev-hud-label">
              <Camera size={13} aria-hidden /> Camera
            </span>
            <button type="button" onClick={() => handleCameraPreset("iso")} title="Isometric perspective">
              Iso
            </button>
            <button type="button" onClick={() => handleCameraPreset("front")} title="Front viewpoint">
              Front
            </button>
            <button type="button" onClick={() => handleCameraPreset("side")} title="Side profile viewpoint">
              Side
            </button>
            <button type="button" onClick={() => handleCameraPreset("rear")} title="Rear powertrain viewpoint">
              Rear
            </button>
            <button type="button" onClick={() => handleCameraPreset("top")} title="Top-down skateboard viewpoint">
              Top
            </button>
            <button
              type="button"
              className="ev-cam-reset"
              onClick={() => handleCameraPreset("reset")}
              title="Reset camera orientation"
            >
              <RotateCcw size={12} aria-hidden />
            </button>
            <button
              type="button"
              className="ev-fullscreen-toggle"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen 3D twin"}
            >
              {isFullscreen ? <Minimize2 size={13} aria-hidden /> : <Maximize2 size={13} aria-hidden />}
            </button>
          </div>
        </div>

        {/* Subsystem Layer Bar (Visible in Subsystems mode or general inspection) */}
        <div className="ev-3d-subsystems" role="group" aria-label="Subsystem Filters">
          {(["All", "Energy", "Powertrain", "Thermal", "Chassis", "Network"] as SubsystemKind[]).map((sys) => (
            <button
              key={sys}
              type="button"
              className={`ev-subsys-pill ${subsystem === sys ? "is-active" : ""}`}
              style={{
                borderColor: sys !== "All" ? SUBSYSTEM_COLORS[sys] : undefined,
                color: subsystem === sys && sys !== "All" ? SUBSYSTEM_COLORS[sys] : undefined,
              }}
              onClick={() => setSubsystem(sys)}
            >
              <span
                className="ev-subsys-dot"
                style={{ backgroundColor: sys !== "All" ? SUBSYSTEM_COLORS[sys] : "var(--ev-accent)" }}
              />
              {sys}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Floating Telemetry Strip & Status */}
      <div className="ev-3d-hud-bottom">
        {/* Speed & Drive Status */}
        <div className="ev-3d-status-pill">
          <Zap size={14} className="ev-pulse-icon" aria-hidden />
          <span>
            <strong>{snapshot.actual_speed.toFixed(0)}</strong> km/h
          </span>
          <span className="ev-status-sep">·</span>
          <span>{snapshot.speed !== snapshot.actual_speed ? `Target ${snapshot.speed.toFixed(0)}` : "Cruising"}</span>
          <span className="ev-status-sep">·</span>
          <span className={isAttack ? "ev-attack-badge" : "ev-nominal-badge"}>
            {isAttack ? "CYBER ATTACK ACTIVE" : "NOMINAL TELEMETRY"}
          </span>
        </div>

        {/* Selected Component Floating Card */}
        {selectedDef && (
          <div className="ev-3d-inspect-card">
            <Cpu size={16} aria-hidden />
            <div>
              <strong>{selectedDef.name}</strong>
              <small>
                {selectedDef.id} · {selectedDef.system} · {selectedDef.kind}
              </small>
            </div>
            {leaderId === selectedDef.id && <span className="ev-origin-badge">#1 Attack Origin</span>}
          </div>
        )}

        {/* Interactive Gesture Guide */}
        <div className="ev-3d-hint">
          <Compass size={13} aria-hidden />
          <span>Click component to inspect · Drag to orbit · Scroll to zoom</span>
        </div>
      </div>
    </div>
  );
}
