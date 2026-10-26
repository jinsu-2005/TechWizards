import * as THREE from "three";
import { SUBSYSTEM_COLORS } from "./types";

export interface EvMaterialBank {
  // Exterior materials
  carBodyPaint: THREE.MeshStandardMaterial;
  carBodyGlass: THREE.MeshPhysicalMaterial;
  carBodyTrim: THREE.MeshStandardMaterial;
  carHeadlight: THREE.MeshStandardMaterial;
  carTaillight: THREE.MeshStandardMaterial;
  tireRubber: THREE.MeshStandardMaterial;
  wheelRim: THREE.MeshStandardMaterial;
  brakeCaliper: THREE.MeshStandardMaterial;
  brakeRotor: THREE.MeshStandardMaterial;

  // X-Ray / Holographic modes
  xrayBody: THREE.MeshPhysicalMaterial;
  xrayGlass: THREE.MeshPhysicalMaterial;
  gridFloor: THREE.GridHelper;

  // Subsystem materials
  subsystemMaterials: Record<string, THREE.MeshStandardMaterial>;
  subsystemGlows: Record<string, THREE.MeshBasicMaterial>;

  // Anomaly & Attack materials
  nominalGlow: THREE.MeshBasicMaterial;
  anomalousGlow: THREE.MeshBasicMaterial;
  originGlow: THREE.MeshBasicMaterial;
  selectedHalo: THREE.MeshBasicMaterial;

  // Connections
  canBusWire: THREE.LineBasicMaterial;
  hvBusbar: THREE.MeshStandardMaterial;
  coolantTube: THREE.MeshPhysicalMaterial;
}

export function createEvMaterials(): EvMaterialBank {
  // Exterior Car Paint: Premium Metallic Obsidian Grey / Cyber Navy
  const carBodyPaint = new THREE.MeshStandardMaterial({
    color: 0x141b24,
    metalness: 0.88,
    roughness: 0.22,
    envMapIntensity: 1.5,
  });

  // Windows / Glass Canopy
  const carBodyGlass = new THREE.MeshPhysicalMaterial({
    color: 0x0a1420,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.75,
    transparent: true,
    opacity: 0.45,
    ior: 1.52,
    reflectivity: 0.9,
  });

  // Dark matte trim / aerodynamic diffusers
  const carBodyTrim = new THREE.MeshStandardMaterial({
    color: 0x090d12,
    roughness: 0.7,
    metalness: 0.3,
  });

  // Projector Headlights
  const carHeadlight = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x90caf9,
    emissiveIntensity: 1.2,
    roughness: 0.1,
  });

  // Aerodynamic LED Taillight Bar
  const carTaillight = new THREE.MeshStandardMaterial({
    color: 0xff1744,
    emissive: 0xd50000,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });

  // Tires
  const tireRubber = new THREE.MeshStandardMaterial({
    color: 0x111315,
    roughness: 0.88,
    metalness: 0.05,
  });

  // Wheels / Rims
  const wheelRim = new THREE.MeshStandardMaterial({
    color: 0x78909c,
    metalness: 0.92,
    roughness: 0.28,
  });

  // Brake Calipers (Electric Cyan)
  const brakeCaliper = new THREE.MeshStandardMaterial({
    color: 0x00e5ff,
    roughness: 0.3,
    metalness: 0.8,
  });

  // Brake Rotors
  const brakeRotor = new THREE.MeshStandardMaterial({
    color: 0xb0bec5,
    metalness: 0.95,
    roughness: 0.35,
  });

  // X-Ray / Hologram Body Material (Semi-transparent with cyan glow)
  const xrayBody = new THREE.MeshPhysicalMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.09,
    roughness: 0.1,
    transmission: 0.85,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const xrayGlass = new THREE.MeshPhysicalMaterial({
    color: 0x00838f,
    transparent: true,
    opacity: 0.04,
    roughness: 0.05,
    depthWrite: false,
  });

  // Ground grid
  const gridFloor = new THREE.GridHelper(16, 32, 0x00e5ff, 0x152233);
  (gridFloor.material as THREE.Material).transparent = true;
  (gridFloor.material as THREE.Material).opacity = 0.35;
  gridFloor.position.y = -0.01;

  // Subsystem materials
  const subsystemMaterials: Record<string, THREE.MeshStandardMaterial> = {};
  const subsystemGlows: Record<string, THREE.MeshBasicMaterial> = {};

  for (const [sys, hex] of Object.entries(SUBSYSTEM_COLORS)) {
    subsystemMaterials[sys] = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex),
      metalness: 0.6,
      roughness: 0.35,
      emissive: new THREE.Color(hex),
      emissiveIntensity: 0.25,
    });
    subsystemGlows[sys] = new THREE.MeshBasicMaterial({
      color: new THREE.Color(hex),
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    });
  }

  // Anomaly status glow materials
  const nominalGlow = new THREE.MeshBasicMaterial({
    color: 0x00e5ff,
    transparent: true,
    opacity: 0.4,
    wireframe: true,
  });

  const anomalousGlow = new THREE.MeshBasicMaterial({
    color: 0xffb300,
    transparent: true,
    opacity: 0.75,
    wireframe: true,
  });

  const originGlow = new THREE.MeshBasicMaterial({
    color: 0xff1744,
    transparent: true,
    opacity: 0.9,
    wireframe: true,
  });

  const selectedHalo = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    wireframe: true,
  });

  // Wiring and fluid connections
  const canBusWire = new THREE.LineBasicMaterial({
    color: 0xd500f9,
    linewidth: 2,
    transparent: true,
    opacity: 0.65,
  });

  const hvBusbar = new THREE.MeshStandardMaterial({
    color: 0xff6d00,
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0xff6d00,
    emissiveIntensity: 0.3,
  });

  const coolantTube = new THREE.MeshPhysicalMaterial({
    color: 0x00b0ff,
    transparent: true,
    opacity: 0.55,
    roughness: 0.2,
    transmission: 0.6,
  });

  return {
    carBodyPaint,
    carBodyGlass,
    carBodyTrim,
    carHeadlight,
    carTaillight,
    tireRubber,
    wheelRim,
    brakeCaliper,
    brakeRotor,
    xrayBody,
    xrayGlass,
    gridFloor,
    subsystemMaterials,
    subsystemGlows,
    nominalGlow,
    anomalousGlow,
    originGlow,
    selectedHalo,
    canBusWire,
    hvBusbar,
    coolantTube,
  };
}
