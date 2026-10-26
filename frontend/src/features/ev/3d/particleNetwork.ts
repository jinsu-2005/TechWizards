import * as THREE from "three";
import { COMPONENT_3D_DEFS } from "./types";

export interface PropagationPathDef {
  source: string;
  target: string;
  onset_s: number;
}

export class ParticleNetwork {
  public group: THREE.Group;
  private pathLines: THREE.Line[] = [];
  private pulseMeshes: THREE.Mesh[] = [];
  private pulseCurves: THREE.CatmullRomCurve3[] = [];
  private pulseSpeeds: number[] = [];
  private pulseProgress: number[] = [];

  // Material for attack propagation path
  private pathMaterial = new THREE.LineBasicMaterial({
    color: 0xff1744,
    linewidth: 3,
    transparent: true,
    opacity: 0.85,
  });

  private pulseMaterial = new THREE.MeshBasicMaterial({
    color: 0xffea00,
    transparent: true,
    opacity: 0.95,
  });

  // Energy flow particles
  private energyParticleCount = 20;
  private energyParticles: THREE.Points;
  private energyPositions: Float32Array;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "EV_Particle_Network";

    // Setup energy flow particles
    this.energyPositions = new Float32Array(this.energyParticleCount * 3);
    const energyGeo = new THREE.BufferGeometry();
    energyGeo.setAttribute("position", new THREE.BufferAttribute(this.energyPositions, 3));

    const energyMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this.energyParticles = new THREE.Points(energyGeo, energyMat);
    this.group.add(this.energyParticles);
  }

  public updatePaths(paths: PropagationPathDef[]): void {
    // Clear old path lines and pulses
    for (const line of this.pathLines) {
      this.group.remove(line);
      line.geometry.dispose();
    }
    for (const pulse of this.pulseMeshes) {
      this.group.remove(pulse);
      pulse.geometry.dispose();
    }
    this.pathLines = [];
    this.pulseMeshes = [];
    this.pulseCurves = [];
    this.pulseSpeeds = [];
    this.pulseProgress = [];

    // Create 3D curves for each propagation edge
    for (const p of paths) {
      const srcDef = COMPONENT_3D_DEFS[p.source as keyof typeof COMPONENT_3D_DEFS];
      const tgtDef = COMPONENT_3D_DEFS[p.target as keyof typeof COMPONENT_3D_DEFS];
      if (!srcDef || !tgtDef) continue;

      const p1 = new THREE.Vector3(...srcDef.position);
      const p3 = new THREE.Vector3(...tgtDef.position);
      const p2 = new THREE.Vector3(
        (p1.x + p3.x) / 2,
        Math.max(p1.y, p3.y) + 0.15,
        (p1.z + p3.z) / 2
      );

      const curve = new THREE.CatmullRomCurve3([p1, p2, p3]);
      const points = curve.getPoints(24);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, this.pathMaterial);
      this.group.add(line);
      this.pathLines.push(line);

      // Add a glowing traveling pulse along the path
      const pulseGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const pulseMesh = new THREE.Mesh(pulseGeo, this.pulseMaterial);
      pulseMesh.position.copy(p1);
      this.group.add(pulseMesh);

      this.pulseMeshes.push(pulseMesh);
      this.pulseCurves.push(curve);
      this.pulseSpeeds.push(0.8 + Math.random() * 0.4);
      this.pulseProgress.push(Math.random());
    }
  }

  public tick(delta: number, speedKmH: number, isAttack: boolean): void {
    // 1. Advance propagation pulses
    for (let i = 0; i < this.pulseMeshes.length; i++) {
      const mesh = this.pulseMeshes[i];
      const curve = this.pulseCurves[i];
      const speed = this.pulseSpeeds[i] ?? 1.0;
      const progress = this.pulseProgress[i] ?? 0;
      if (!mesh || !curve) continue;

      const nextProgress = (progress + delta * speed) % 1.0;
      this.pulseProgress[i] = nextProgress;
      const point = curve.getPoint(nextProgress);
      mesh.position.copy(point);
    }

    // 2. Animate energy flow particles (from battery pack to motor)
    if (speedKmH > 0.5) {
      this.energyParticles.visible = true;
      const t = Date.now() * 0.002 * (speedKmH / 60);
      const packZ = COMPONENT_3D_DEFS.PACK.position[2];
      const motorZ = COMPONENT_3D_DEFS.MOTOR.position[2];

      for (let i = 0; i < this.energyParticleCount; i++) {
        const frac = (t + i / this.energyParticleCount) % 1.0;
        const z = packZ + frac * (motorZ - packZ);
        const y = 0.28 + Math.sin(frac * Math.PI) * 0.12;
        const x = Math.sin(i * 1.5 + t * 2) * 0.04;

        this.energyPositions[i * 3] = x;
        this.energyPositions[i * 3 + 1] = y;
        this.energyPositions[i * 3 + 2] = z;
      }
      const posAttr = this.energyParticles.geometry.attributes.position;
      if (posAttr) {
        posAttr.needsUpdate = true;
      }
    } else {
      this.energyParticles.visible = false;
    }

    // Modulate path glow opacity when attack is active
    if (isAttack) {
      this.pathMaterial.opacity = 0.6 + Math.sin(Date.now() * 0.008) * 0.35;
    }
  }

  public dispose(): void {
    for (const line of this.pathLines) {
      line.geometry.dispose();
    }
    for (const pulse of this.pulseMeshes) {
      pulse.geometry.dispose();
    }
    this.energyParticles.geometry.dispose();
  }
}
