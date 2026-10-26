import * as THREE from "three";
import { COMPONENT_3D_DEFS } from "./types";

export interface PropagationPathDef {
  source: string;
  target: string;
  onset_s: number;
}

/** Attack propagation tubes with travelling pulses, plus the idle energy-flow stream. */
export class ParticleNetwork {
  public group = new THREE.Group();
  private tubes: THREE.Mesh[] = [];
  private pulses: THREE.Mesh[] = [];
  private curves: THREE.CatmullRomCurve3[] = [];
  private speeds: number[] = [];
  private progress: number[] = [];

  private tubeMaterial = new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.9, toneMapped: false });
  private pulseMaterial = new THREE.MeshBasicMaterial({ color: 0xfff1a8, toneMapped: false });
  private pulseGeometry = new THREE.SphereGeometry(0.045, 12, 10);

  private flow: THREE.Points;
  private flowPositions: Float32Array;
  private readonly flowCount = 36;

  constructor() {
    this.group.name = "EV_Particle_Network";
    this.flowPositions = new Float32Array(this.flowCount * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(this.flowPositions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x67e8f9, size: 0.055, transparent: true, opacity: 0.9,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
    });
    this.flow = new THREE.Points(geo, mat);
    this.flow.frustumCulled = false;
    this.group.add(this.flow);
  }

  public updatePaths(paths: PropagationPathDef[]): void {
    for (const t of this.tubes) { this.group.remove(t); t.geometry.dispose(); }
    for (const p of this.pulses) this.group.remove(p);
    this.tubes = []; this.pulses = []; this.curves = []; this.speeds = []; this.progress = [];

    for (const p of paths) {
      const src = COMPONENT_3D_DEFS[p.source as keyof typeof COMPONENT_3D_DEFS];
      const tgt = COMPONENT_3D_DEFS[p.target as keyof typeof COMPONENT_3D_DEFS];
      if (!src || !tgt) continue;
      const a = new THREE.Vector3(...src.position);
      const b = new THREE.Vector3(...tgt.position);
      const mid = a.clone().lerp(b, 0.5);
      mid.y = Math.max(a.y, b.y) + 0.25 + a.distanceTo(b) * 0.12;
      const curve = new THREE.CatmullRomCurve3([a, mid, b]);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.011, 8, false), this.tubeMaterial);
      this.group.add(tube);
      const pulse = new THREE.Mesh(this.pulseGeometry, this.pulseMaterial);
      this.group.add(pulse);
      this.tubes.push(tube);
      this.pulses.push(pulse);
      this.curves.push(curve);
      this.speeds.push(0.55 + (this.tubes.length % 3) * 0.12);
      this.progress.push((this.tubes.length * 0.23) % 1);
    }
  }

  public tick(delta: number, speedKmH: number, isAttack: boolean, time: number): void {
    for (let i = 0; i < this.pulses.length; i++) {
      const next = ((this.progress[i] ?? 0) + delta * (this.speeds[i] ?? 0.6)) % 1;
      this.progress[i] = next;
      const point = this.curves[i]?.getPoint(next);
      if (point) this.pulses[i]?.position.copy(point);
    }
    this.tubeMaterial.opacity = isAttack ? 0.65 + Math.sin(time * 7) * 0.3 : 0.9;

    // Energy flowing from the pack toward the rear drive unit, faster with vehicle speed.
    if (speedKmH > 0.5) {
      this.flow.visible = true;
      const t = time * 0.25 * (0.4 + speedKmH / 80);
      const z0 = 0.9;
      const z1 = COMPONENT_3D_DEFS.MOTOR.position[2];
      for (let i = 0; i < this.flowCount; i++) {
        const lane = (i % 3) - 1;
        const frac = (t + i / this.flowCount) % 1;
        this.flowPositions[i * 3] = lane * 0.09;
        this.flowPositions[i * 3 + 1] = 0.5 + Math.sin(frac * Math.PI) * 0.06;
        this.flowPositions[i * 3 + 2] = z0 + frac * (z1 - z0);
      }
      (this.flow.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    } else {
      this.flow.visible = false;
    }
  }

  public dispose(): void {
    for (const t of this.tubes) t.geometry.dispose();
    this.pulseGeometry.dispose();
    this.flow.geometry.dispose();
    this.tubeMaterial.dispose();
    this.pulseMaterial.dispose();
    (this.flow.material as THREE.Material).dispose();
  }
}
