import * as THREE from "three";
import { SUBSYSTEM_COLORS } from "./types";

export interface EvMaterialBank {
  // Exterior
  paint: THREE.MeshPhysicalMaterial;
  glass: THREE.MeshPhysicalMaterial;
  trim: THREE.MeshStandardMaterial;
  headlight: THREE.MeshStandardMaterial;
  taillight: THREE.MeshStandardMaterial;
  tire: THREE.MeshStandardMaterial;
  rim: THREE.MeshStandardMaterial;
  caliper: THREE.MeshStandardMaterial;
  rotor: THREE.MeshStandardMaterial;

  // Holographic shell (X-ray / exploded / attack)
  ghostBody: THREE.ShaderMaterial;
  ghostGlass: THREE.ShaderMaterial;

  // Components
  housing: THREE.MeshStandardMaterial;
  housingDim: THREE.MeshStandardMaterial;
  accent: Record<string, THREE.MeshStandardMaterial>;
  accentDim: THREE.MeshStandardMaterial;
  statusAffected: THREE.MeshStandardMaterial;
  statusOrigin: THREE.MeshStandardMaterial;

  // Overlays
  haloLine: THREE.LineBasicMaterial;
  haloSelected: THREE.LineBasicMaterial;
  haloAffected: THREE.LineBasicMaterial;
  haloOrigin: THREE.LineBasicMaterial;
  leaderLine: THREE.LineBasicMaterial;

  // Connections
  hvBusbar: THREE.MeshStandardMaterial;
  coolant: THREE.MeshStandardMaterial;
  canWire: THREE.MeshStandardMaterial;
}

const GHOST_VERTEX = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  varying float vWorldY;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    vWorldY = (modelMatrix * vec4(position, 1.0)).y;
    gl_Position = projectionMatrix * mv;
  }
`;

const GHOST_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vN;
  varying vec3 vV;
  varying float vWorldY;
  void main() {
    float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.3);
    float scan = 0.84 + 0.16 * sin(vWorldY * 64.0 - uTime * 1.4);
    float a = (0.03 + f * 0.6) * scan * uOpacity;
    gl_FragColor = vec4(uColor * (0.55 + f * 1.7), a);
  }
`;

function ghost(color: number, opacity: number): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uTime: { value: 0 },
      uOpacity: { value: opacity },
    },
    vertexShader: GHOST_VERTEX,
    fragmentShader: GHOST_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
  });
}

export function createEvMaterials(): EvMaterialBank {
  const paint = new THREE.MeshPhysicalMaterial({
    color: 0x6a7684,
    metalness: 0.9,
    roughness: 0.34,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 0.9,
  });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x070b10,
    metalness: 0.2,
    roughness: 0.04,
    transparent: true,
    opacity: 0.88,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    envMapIntensity: 1.6,
  });

  const trim = new THREE.MeshStandardMaterial({ color: 0x0b0f14, roughness: 0.55, metalness: 0.5 });

  const headlight = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xcfe9ff, emissiveIntensity: 0.9, roughness: 0.2,
  });
  const taillight = new THREE.MeshStandardMaterial({
    color: 0xff2a3d, emissive: 0xff1230, emissiveIntensity: 2.0, roughness: 0.3,
  });

  const tire = new THREE.MeshStandardMaterial({ color: 0x0d0f12, roughness: 0.92, metalness: 0.02 });
  const rim = new THREE.MeshStandardMaterial({ color: 0xc6ced6, metalness: 1, roughness: 0.22 });
  const caliper = new THREE.MeshStandardMaterial({ color: 0x22d3ee, metalness: 0.5, roughness: 0.35, emissive: 0x0a5560, emissiveIntensity: 0.8 });
  const rotor = new THREE.MeshStandardMaterial({ color: 0x9aa5ad, metalness: 0.95, roughness: 0.4 });

  const ghostBody = ghost(0x37d6ff, 1.0);
  const ghostGlass = ghost(0x5fb8ff, 0.55);

  const housing = new THREE.MeshStandardMaterial({ color: 0x232c37, metalness: 0.85, roughness: 0.38 });
  const housingDim = new THREE.MeshStandardMaterial({
    color: 0x0f151c, metalness: 0.6, roughness: 0.6, transparent: true, opacity: 0.32,
  });

  const accent: Record<string, THREE.MeshStandardMaterial> = {};
  for (const [sys, hex] of Object.entries(SUBSYSTEM_COLORS)) {
    accent[sys] = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex),
      emissive: new THREE.Color(hex),
      emissiveIntensity: 1.35,
      metalness: 0.2,
      roughness: 0.4,
    });
  }
  const accentDim = new THREE.MeshStandardMaterial({
    color: 0x1b242d, emissive: 0x0b1218, emissiveIntensity: 0.4, transparent: true, opacity: 0.4,
  });
  const statusAffected = new THREE.MeshStandardMaterial({
    color: 0xffb300, emissive: 0xffa000, emissiveIntensity: 2.2, roughness: 0.4,
  });
  const statusOrigin = new THREE.MeshStandardMaterial({
    color: 0xff2d55, emissive: 0xff1744, emissiveIntensity: 3, roughness: 0.4,
  });

  const haloLine = new THREE.LineBasicMaterial({ color: 0x8fe9ff, transparent: true, opacity: 0.85 });
  const haloSelected = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
  const haloAffected = new THREE.LineBasicMaterial({ color: 0xffc233, transparent: true, opacity: 1 });
  const haloOrigin = new THREE.LineBasicMaterial({ color: 0xff3b5c, transparent: true, opacity: 1 });
  const leaderLine = new THREE.LineBasicMaterial({ color: 0x38a1ff, transparent: true, opacity: 0.35 });

  const hvBusbar = new THREE.MeshStandardMaterial({
    color: 0xff7a1a, emissive: 0xff5a00, emissiveIntensity: 0.9, metalness: 0.6, roughness: 0.35,
  });
  const coolant = new THREE.MeshStandardMaterial({
    color: 0x38a1ff, emissive: 0x1b78d6, emissiveIntensity: 0.9, transparent: true, opacity: 0.7, roughness: 0.3,
  });
  const canWire = new THREE.MeshStandardMaterial({
    color: 0xc77dff, emissive: 0xa855f7, emissiveIntensity: 1.1, transparent: true, opacity: 0.85,
  });

  return {
    paint, glass, trim, headlight, taillight, tire, rim, caliper, rotor,
    ghostBody, ghostGlass,
    housing, housingDim, accent, accentDim, statusAffected, statusOrigin,
    haloLine, haloSelected, haloAffected, haloOrigin, leaderLine,
    hvBusbar, coolant, canWire,
  };
}
