/* eslint-disable @typescript-eslint/no-non-null-assertion -- indexed math on fixed-size tables */
import * as THREE from "three";
import type { EvMaterialBank } from "./materials";
import { VEHICLE } from "./types";

export interface CarBodyMeshes {
  root: THREE.Group;
  exteriorGroup: THREE.Group;
  lightsGroup: THREE.Group;
  chassisGroup: THREE.Group;
  /** Spinning parts of each wheel (tyre, rim, rotor). Rotate on X. */
  wheelSpin: THREE.Group[];
  paintMeshes: THREE.Mesh[];
  glassMeshes: THREE.Mesh[];
}

/** One lofted cross-section: z, bottom y, top y, half width. Sorted rear to front. */
type Station = readonly [number, number, number, number];

const LOWER_BODY: readonly Station[] = [
  [-2.37, 0.44, 0.58, 0.2],
  [-2.3, 0.34, 0.78, 0.6],
  [-2.1, 0.26, 0.9, 0.82],
  [-1.7, 0.22, 0.93, 0.93],
  [-1.0, 0.2, 0.91, 0.96],
  [0.0, 0.2, 0.88, 0.97],
  [0.9, 0.2, 0.86, 0.97],
  [1.4, 0.2, 0.82, 0.96],
  [1.9, 0.22, 0.7, 0.9],
  [2.15, 0.27, 0.6, 0.78],
  [2.32, 0.34, 0.51, 0.55],
  [2.37, 0.4, 0.46, 0.2],
];

const GREENHOUSE: readonly Station[] = [
  [-1.95, 0.91, 0.95, 0.18],
  [-1.85, 0.91, 0.99, 0.42],
  [-1.55, 0.9, 1.12, 0.6],
  [-1.1, 0.89, 1.28, 0.68],
  [-0.5, 0.88, 1.39, 0.72],
  [0.1, 0.87, 1.41, 0.74],
  [0.55, 0.86, 1.32, 0.76],
  [0.95, 0.85, 1.1, 0.8],
  [1.18, 0.84, 0.93, 0.84],
  [1.3, 0.83, 0.86, 0.3],
];

/** Smooth interpolation (cardinal spline) of one column of the station table. */
function sampleStations(stations: readonly Station[], z: number, col: 1 | 2 | 3): number {
  const n = stations.length;
  let i = 0;
  while (i < n - 2 && stations[i + 1]![0] < z) i++;
  const p1 = stations[i]!;
  const p2 = stations[i + 1]!;
  const p0 = stations[Math.max(0, i - 1)]!;
  const p3 = stations[Math.min(n - 1, i + 2)]!;
  const span = p2[0] - p1[0] || 1;
  const t = THREE.MathUtils.clamp((z - p1[0]) / span, 0, 1);
  const m1 = ((p2[col] - p0[col]) / (p2[0] - p0[0] || 1)) * span * 0.5;
  const m2 = ((p3[col] - p1[col]) / (p3[0] - p1[0] || 1)) * span * 0.5;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p1[col] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[col] + (t3 - t2) * m2;
}

const sgnPow = (v: number, e: number) => Math.sign(v) * Math.pow(Math.abs(v), e);

interface LoftOptions {
  stations: readonly Station[];
  rings: number;
  ringPoints: number;
  exponent: number;
  /** Stations are resampled finely; extra density near the wheel arches helps the cut-out stay crisp. */
  arches?: boolean;
}

function loftBody({ stations, rings, ringPoints, exponent, arches }: LoftOptions): THREE.BufferGeometry {
  const zMin = stations[0]![0];
  const zMax = stations[stations.length - 1]![0];
  const positions: number[] = [];
  const indices: number[] = [];
  const e = 2 / exponent;
  const R = 0.42;
  const yc = VEHICLE.wheelRadius;

  for (let r = 0; r < rings; r++) {
    const z = zMin + ((zMax - zMin) * r) / (rings - 1);
    const yb = sampleStations(stations, z, 1);
    const yt = sampleStations(stations, z, 2);
    const hw = Math.max(0.02, sampleStations(stations, z, 3));
    const cy = (yb + yt) / 2;
    const ry = Math.max(0.01, (yt - yb) / 2);
    for (let k = 0; k < ringPoints; k++) {
      const a = (k / ringPoints) * Math.PI * 2;
      const x = hw * sgnPow(Math.cos(a), e);
      let y = cy + ry * sgnPow(Math.sin(a), e);
      if (arches) {
        const ax = Math.abs(x);
        const w = THREE.MathUtils.smoothstep(ax, 0.3, 0.62);
        if (w > 0) {
          for (const zc of [-VEHICLE.wheelbaseHalf, VEHICLE.wheelbaseHalf]) {
            const dz = Math.abs(z - zc);
            if (dz < R) {
              const archY = yc + Math.sqrt(R * R - dz * dz);
              if (y < archY) y += w * (archY - y);
            }
          }
        }
      }
      positions.push(x, y, z);
    }
  }

  for (let r = 0; r < rings - 1; r++) {
    for (let k = 0; k < ringPoints; k++) {
      const k2 = (k + 1) % ringPoints;
      const A = r * ringPoints + k;
      const B = r * ringPoints + k2;
      const C = (r + 1) * ringPoints + k;
      const D = (r + 1) * ringPoints + k2;
      indices.push(A, B, C, B, D, C);
    }
  }

  // End caps
  for (const [ringIdx, flip] of [[0, true], [rings - 1, false]] as const) {
    let cx = 0, cy = 0, cz = 0;
    for (let k = 0; k < ringPoints; k++) {
      const i = (ringIdx * ringPoints + k) * 3;
      cx += positions[i]!; cy += positions[i + 1]!; cz += positions[i + 2]!;
    }
    const ci = positions.length / 3;
    positions.push(cx / ringPoints, cy / ringPoints, cz / ringPoints);
    for (let k = 0; k < ringPoints; k++) {
      const a = ringIdx * ringPoints + k;
      const b = ringIdx * ringPoints + ((k + 1) % ringPoints);
      if (flip) indices.push(ci, b, a);
      else indices.push(ci, a, b);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/** Trace a light strip that hugs the body by casting rays at the shell. */
function traceStrip(
  body: THREE.Mesh,
  from: "front" | "rear",
  y: number,
  xs: number[],
  radius: number,
  material: THREE.Material,
): THREE.Mesh | null {
  const caster = new THREE.Raycaster();
  const dir = new THREE.Vector3(0, 0, from === "front" ? -1 : 1);
  const pts: THREE.Vector3[] = [];
  for (const x of xs) {
    caster.set(new THREE.Vector3(x, y, from === "front" ? 4 : -4), dir);
    const hit = caster.intersectObject(body, false)[0];
    if (!hit || !hit.face) continue;
    const n = hit.face.normal.clone().normalize();
    pts.push(hit.point.clone().addScaledVector(n, radius * 0.4));
  }
  if (pts.length < 3) return null;
  const curve = new THREE.CatmullRomCurve3(pts);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius, 8, false), material);
  return mesh;
}

function lathe(points: Array<[number, number]>, segments = 40): THREE.LatheGeometry {
  return new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segments);
}

export function buildCarGeometry(m: EvMaterialBank): CarBodyMeshes {
  const root = new THREE.Group();
  root.name = "EV_Car_Root";
  const exteriorGroup = new THREE.Group();
  exteriorGroup.name = "EV_Exterior";
  const lightsGroup = new THREE.Group();
  lightsGroup.name = "EV_Lights";
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "EV_Chassis";
  root.add(exteriorGroup, lightsGroup, chassisGroup);

  const paintMeshes: THREE.Mesh[] = [];
  const glassMeshes: THREE.Mesh[] = [];

  // 1. Lofted lower body with wheel arches
  const bodyGeo = loftBody({ stations: LOWER_BODY, rings: 150, ringPoints: 56, exponent: 3.1, arches: true });
  const body = new THREE.Mesh(bodyGeo, m.paint);
  exteriorGroup.add(body);
  paintMeshes.push(body);

  // 2. Glass greenhouse
  const glassGeo = loftBody({ stations: GREENHOUSE, rings: 90, ringPoints: 48, exponent: 2.35 });
  const greenhouse = new THREE.Mesh(glassGeo, m.glass);
  exteriorGroup.add(greenhouse);
  glassMeshes.push(greenhouse);

  body.updateMatrixWorld(true);

  // 3. Light strips traced onto the shell
  const frontXs = Array.from({ length: 21 }, (_, i) => -0.72 + (i / 20) * 1.44);
  const front = traceStrip(body, "front", 0.55, frontXs, 0.016, m.headlight);
  if (front) lightsGroup.add(front);
  const rearXs = Array.from({ length: 21 }, (_, i) => -0.7 + (i / 20) * 1.4);
  const rear = traceStrip(body, "rear", 0.72, rearXs, 0.018, m.taillight);
  if (rear) lightsGroup.add(rear);

  // 4. Mirrors
  for (const side of [-1, 1]) {
    const pod = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 14), m.paint);
    pod.scale.set(1.35, 0.8, 1.0);
    pod.position.set(side * 1.0, 0.98, 0.86);
    exteriorGroup.add(pod);
    paintMeshes.push(pod);
    const stalk = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.04), m.trim);
    stalk.position.set(side * 0.9, 0.95, 0.86);
    exteriorGroup.add(stalk);
  }

  // 5. Under-tray and splitters (dark trim)
  const tray = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.03, 3.0), m.trim);
  tray.position.set(0, 0.185, 0);
  // tray removed: it protruded past the rounded nose and tail
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 0.14), m.trim);
  splitter.position.set(0, 0.28, 2.26);
  void splitter;

  // 6. Wheels
  const tireProfile: Array<[number, number]> = [
    [0.235, -0.12], [0.3, -0.125], [0.345, -0.1], [0.36, -0.06], [0.362, 0],
    [0.36, 0.06], [0.345, 0.1], [0.3, 0.125], [0.235, 0.12],
  ];
  const wheelSpin: THREE.Group[] = [];

  const makeWheel = (zSign: number, xSign: number) => {
    const wheel = new THREE.Group();
    wheel.position.set(xSign * VEHICLE.wheelX, VEHICLE.wheelRadius, zSign * VEHICLE.wheelbaseHalf);

    const spin = new THREE.Group();
    const tireGeo = lathe(tireProfile, 48);
    tireGeo.rotateZ(Math.PI / 2);
    spin.add(new THREE.Mesh(tireGeo, m.tire));

    const faceX = xSign * 0.105;
    const lipGeo = new THREE.TorusGeometry(0.232, 0.014, 10, 48);
    lipGeo.rotateY(Math.PI / 2);
    const lip = new THREE.Mesh(lipGeo, m.rim);
    lip.position.x = faceX;
    spin.add(lip);

    const diskGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.018, 36);
    diskGeo.rotateZ(Math.PI / 2);
    const disk = new THREE.Mesh(diskGeo, m.trim);
    disk.position.x = xSign * 0.09;
    spin.add(disk);

    for (let i = 0; i < 10; i++) {
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.2, 0.036), m.rim);
      spoke.position.set(faceX, 0, 0);
      const holder = new THREE.Group();
      holder.rotation.x = (i / 10) * Math.PI * 2;
      spoke.position.y = 0.12;
      holder.add(spoke);
      holder.position.x = faceX;
      spoke.position.x = 0;
      spin.add(holder);
    }
    const capGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 20);
    capGeo.rotateZ(Math.PI / 2);
    const cap = new THREE.Mesh(capGeo, m.rim);
    cap.position.x = xSign * 0.11;
    spin.add(cap);

    const rotorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.022, 36);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotor = new THREE.Mesh(rotorGeo, m.rotor);
    rotor.position.x = xSign * 0.045;
    spin.add(rotor);

    wheel.add(spin);

    // Caliper does not spin
    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.13), m.caliper);
    caliper.position.set(xSign * 0.045, 0.14, zSign * 0.0 + 0.0);
    wheel.add(caliper);

    chassisGroup.add(wheel);
    wheelSpin.push(spin);
  };

  makeWheel(1, -1);
  makeWheel(1, 1);
  makeWheel(-1, -1);
  makeWheel(-1, 1);

  // 7. Axles
  const axleGeo = new THREE.CylinderGeometry(0.025, 0.025, VEHICLE.wheelX * 2, 12);
  axleGeo.rotateZ(Math.PI / 2);
  for (const z of [-VEHICLE.wheelbaseHalf, VEHICLE.wheelbaseHalf]) {
    const axle = new THREE.Mesh(axleGeo, m.trim);
    axle.position.set(0, VEHICLE.wheelRadius, z);
    chassisGroup.add(axle);
  }

  return { root, exteriorGroup, lightsGroup, chassisGroup, wheelSpin, paintMeshes, glassMeshes };
}
