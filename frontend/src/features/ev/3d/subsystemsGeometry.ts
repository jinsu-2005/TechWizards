/* eslint-disable @typescript-eslint/no-non-null-assertion -- indexed math on fixed-size tables */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { COMPONENT_3D_DEFS, type Component3DDef } from "./types";
import type { EvMaterialBank } from "./materials";

export interface ComponentVisual {
  id: string;
  def: Component3DDef;
  group: THREE.Group;
  /** Invisible pick volume (enlarged for tiny sensors). */
  hit: THREE.Mesh;
  bodyMeshes: THREE.Mesh[];
  accentMeshes: THREE.Mesh[];
  halo: THREE.LineSegments;
  label: CSS2DObject;
  labelEl: HTMLDivElement;
}

export interface SubsystemMeshes {
  root: THREE.Group;
  components: Record<string, ComponentVisual>;
  connections: THREE.Group;
  /** Lines from each component's home position to its (exploded) position. */
  leaders: THREE.LineSegments;
}

function bracketGeometry(w: number, h: number, d: number): THREE.BufferGeometry {
  const hx = w / 2, hy = h / 2, hz = d / 2;
  const lx = Math.min(w * 0.3, 0.1), ly = Math.min(h * 0.3, 0.1), lz = Math.min(d * 0.3, 0.1);
  const v: number[] = [];
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    const cx = sx * hx, cy = sy * hy, cz = sz * hz;
    v.push(cx, cy, cz, cx - sx * lx, cy, cz);
    v.push(cx, cy, cz, cx, cy - sy * ly, cz);
    v.push(cx, cy, cz, cx, cy, cz - sz * lz);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
  return g;
}

export function buildSubsystemsGeometry(m: EvMaterialBank): SubsystemMeshes {
  const root = new THREE.Group();
  root.name = "EV_Subsystems_Root";
  const connections = new THREE.Group();
  connections.name = "EV_Connections";
  root.add(connections);

  const components: Record<string, ComponentVisual> = {};

  for (const [id, def] of Object.entries(COMPONENT_3D_DEFS)) {
    const group = new THREE.Group();
    group.name = `EV_Component_${id}`;
    group.position.set(...def.position);

    const [sx, sy, sz] = def.size;
    const accentMat = m.accent[def.system] ?? m.accent.Energy!;
    const bodyMeshes: THREE.Mesh[] = [];
    const accentMeshes: THREE.Mesh[] = [];

    const body = (geo: THREE.BufferGeometry, x = 0, y = 0, z = 0): THREE.Mesh => {
      const mesh = new THREE.Mesh(geo, m.housing);
      mesh.position.set(x, y, z);
      group.add(mesh);
      bodyMeshes.push(mesh);
      return mesh;
    };
    const accent = (geo: THREE.BufferGeometry, x = 0, y = 0, z = 0): THREE.Mesh => {
      const mesh = new THREE.Mesh(geo, accentMat);
      mesh.position.set(x, y, z);
      group.add(mesh);
      accentMeshes.push(mesh);
      return mesh;
    };
    const box = (w: number, h: number, d: number, r = 0.012) =>
      new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.2, h / 2.2, d / 2.2));
    const cylX = (r: number, len: number, seg = 24) => {
      const g = new THREE.CylinderGeometry(r, r, len, seg);
      g.rotateZ(Math.PI / 2);
      return g;
    };
    const cylZ = (r: number, len: number, seg = 24) => {
      const g = new THREE.CylinderGeometry(r, r, len, seg);
      g.rotateX(Math.PI / 2);
      return g;
    };
    const ringX = (r: number, tube: number) => {
      const g = new THREE.TorusGeometry(r, tube, 8, 36);
      g.rotateY(Math.PI / 2);
      return g;
    };

    switch (id) {
      case "PACK": {
        body(box(sx, sy, sz, 0.03));
        const cols = 4, rows = 9;
        const pw = (sx - 0.14) / cols, pd = (sz - 0.16) / rows;
        for (let c = 0; c < cols; c++) {
          for (let r = 0; r < rows; r++) {
            accent(
              box(pw * 0.82, 0.012, pd * 0.8, 0.004),
              -sx / 2 + 0.07 + pw * (c + 0.5),
              sy / 2 + 0.005,
              -sz / 2 + 0.08 + pd * (r + 0.5),
            );
          }
        }
        break;
      }
      case "MOTOR": {
        const r = sy / 2;
        body(cylX(r, sx));
        for (let i = 0; i < 6; i++) accent(ringX(r + 0.004, 0.008), -sx / 2 + 0.07 + (i * (sx - 0.14)) / 5);
        accent(cylX(r * 0.45, sx + 0.06), 0, 0, 0);
        body(box(0.2, 0.1, 0.16), 0, r + 0.02, 0);
        break;
      }
      case "INV": {
        body(box(sx, sy, sz));
        for (let i = 0; i < 7; i++) accent(box(0.012, 0.05, sz * 0.84, 0.004), -sx / 2 + 0.04 + (i * (sx - 0.08)) / 6, sy / 2 + 0.02, 0);
        body(box(0.07, 0.06, 0.07), -sx / 2 + 0.05, -0.02, sz / 2 + 0.03);
        body(box(0.07, 0.06, 0.07), sx / 2 - 0.05, -0.02, sz / 2 + 0.03);
        break;
      }
      case "COOL": {
        body(new THREE.CylinderGeometry(sx / 2, sx / 2, sy, 28));
        accent(new THREE.TorusGeometry(sx / 2 - 0.01, 0.01, 8, 32).rotateX(Math.PI / 2), 0, sy / 2, 0);
        body(cylX(0.035, sx * 1.5), sx * 0.2, 0, 0);
        accent(ringX(0.04, 0.007), sx * 0.7, 0, 0);
        break;
      }
      case "EPS": {
        body(cylX(0.034, sx));
        for (const s of [-1, 1]) {
          accent(cylX(0.05, 0.12), s * (sx / 2 - 0.1), 0, 0);
          body(cylX(0.012, 0.18), s * (sx / 2 + 0.06), 0, 0);
        }
        body(box(0.16, 0.12, 0.13), 0.22, 0.06, 0);
        accent(box(0.12, 0.012, 0.09, 0.004), 0.22, 0.13, 0);
        break;
      }
      case "ANGLE": {
        body(cylZ(0.055, 0.05));
        accent(new THREE.TorusGeometry(0.06, 0.009, 8, 28), 0, 0, 0.027);
        break;
      }
      case "WHEEL": {
        body(cylX(0.05, 0.035));
        accent(ringX(0.055, 0.008), 0.02, 0, 0);
        body(box(0.05, 0.05, 0.1), 0, 0.06, 0);
        break;
      }
      case "SOC": {
        body(box(sx, sy, sz, 0.02));
        accent(box(sx * 0.88, sy * 0.7, 0.006, 0.003), 0, 0, sz / 2 + 0.002);
        break;
      }
      case "BRAKE": {
        body(box(sx, sy, sz));
        accent(box(sx * 0.8, 0.012, sz * 0.7, 0.004), 0, sy / 2 + 0.005, 0);
        body(cylZ(0.04, 0.16), -sx * 0.25, 0, sz / 2 + 0.07);
        body(cylZ(0.04, 0.16), sx * 0.25, 0, sz / 2 + 0.07);
        break;
      }
      case "DCDC": {
        body(box(sx, sy, sz));
        for (let i = 0; i < 6; i++) accent(box(sx * 0.9, 0.02, 0.012, 0.004), 0, sy / 2 + 0.008, -sz / 2 + 0.04 + (i * (sz - 0.08)) / 5);
        break;
      }
      default: {
        if (def.kind === "Sensor") {
          body(box(sx, sy * 0.7, sz));
          body(cylZ(Math.min(sx, sy) * 0.22, sz * 0.9), 0, 0, sz * 0.7);
          accent(new THREE.SphereGeometry(Math.min(sx, sy) * 0.14, 12, 10), 0, sy * 0.35 + 0.006, 0);
        } else {
          body(box(sx, sy, sz));
          accent(box(sx * 0.78, 0.012, sz * 0.6, 0.004), 0, sy / 2 + 0.005, 0);
          body(box(sx * 0.2, sy * 0.5, 0.05), -sx * 0.25, 0, sz / 2 + 0.025);
          body(box(sx * 0.2, sy * 0.5, 0.05), sx * 0.25, 0, sz / 2 + 0.025);
        }
      }
    }

    for (const mesh of [...bodyMeshes, ...accentMeshes]) {
      mesh.userData.componentId = id;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
    }

    // Pick volume
    const hx = Math.max(sx, 0.22) * 1.1, hy = Math.max(sy, 0.2) * 1.2, hz = Math.max(sz, 0.22) * 1.1;
    const hit = new THREE.Mesh(new THREE.BoxGeometry(hx, hy, hz), new THREE.MeshBasicMaterial({ visible: false }));
    hit.userData.componentId = id;
    group.add(hit);

    // Selection / status bracket
    const halo = new THREE.LineSegments(bracketGeometry(hx, hy, hz), m.haloLine);
    halo.visible = false;
    group.add(halo);

    // Floating label
    const labelEl = document.createElement("div");
    labelEl.className = "ev-3d-label";
    labelEl.style.display = "none";
    const idEl = document.createElement("b");
    idEl.textContent = id;
    const nameEl = document.createElement("span");
    nameEl.textContent = def.name;
    labelEl.append(idEl, nameEl);
    const label = new CSS2DObject(labelEl);
    label.position.set(0, hy / 2 + 0.1, 0);
    group.add(label);

    root.add(group);
    components[id] = { id, def, group, hit, bodyMeshes, accentMeshes, halo, label, labelEl };
  }

  // ---- Connections (hidden while exploded) ----
  const P = (id: keyof typeof COMPONENT_3D_DEFS, dx = 0, dy = 0, dz = 0) => {
    const p = COMPONENT_3D_DEFS[id].position;
    return new THREE.Vector3(p[0] + dx, p[1] + dy, p[2] + dz);
  };
  const tube = (pts: THREE.Vector3[], r: number, mat: THREE.Material, closed = false) => {
    const curve = new THREE.CatmullRomCurve3(pts, closed, "centripetal");
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(24, pts.length * 12), r, 8, closed), mat);
    connections.add(mesh);
  };

  // High-voltage cables pack -> inverter and pack -> DC/DC
  tube([new THREE.Vector3(0.18, 0.4, -1.1), new THREE.Vector3(0.18, 0.5, -1.25), P("INV", 0.14, -0.05, 0.1)], 0.022, m.hvBusbar);
  tube([new THREE.Vector3(-0.2, 0.4, -1.1), new THREE.Vector3(-0.2, 0.5, -1.25), P("INV", -0.14, -0.05, 0.1)], 0.022, m.hvBusbar);
  tube([new THREE.Vector3(-0.3, 0.4, 1.1), new THREE.Vector3(-0.4, 0.44, 1.4), P("DCDC", 0, 0, -0.1)], 0.02, m.hvBusbar);
  tube([P("INV", 0, -0.12, 0), P("MOTOR", 0, 0.1, 0)], 0.026, m.hvBusbar);

  // Coolant loop
  tube([
    P("COOL", 0, -0.04, 0), P("FLOW", 0, -0.02, 0), P("CTEMP", 0, -0.02, 0),
    new THREE.Vector3(0.66, 0.3, 0.1), new THREE.Vector3(0.66, 0.3, -0.8),
    new THREE.Vector3(0.36, 0.3, -1.3), new THREE.Vector3(-0.36, 0.3, -1.3),
    new THREE.Vector3(-0.66, 0.3, -0.8), new THREE.Vector3(-0.66, 0.3, 0.6),
    new THREE.Vector3(-0.5, 0.32, 1.3),
  ], 0.014, m.coolant, true);

  // CAN harness
  for (const target of ["VCU", "BMS", "BRAKE", "INV", "DCDC", "SOC"] as const) {
    const a = P("CAN");
    const b = P(target);
    const mid = a.clone().lerp(b, 0.5);
    mid.y += 0.08;
    tube([a, mid, b], 0.005, m.canWire);
  }

  // Leader lines for the exploded view
  const leaderPositions = new Float32Array(Object.keys(components).length * 6);
  const leaderGeo = new THREE.BufferGeometry();
  leaderGeo.setAttribute("position", new THREE.BufferAttribute(leaderPositions, 3));
  const leaders = new THREE.LineSegments(leaderGeo, m.leaderLine);
  leaders.visible = false;
  leaders.frustumCulled = false;
  root.add(leaders);

  return { root, components, connections, leaders };
}
