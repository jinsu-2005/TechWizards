/* eslint-disable @typescript-eslint/no-non-null-assertion -- indexed math on fixed-size tables */
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { createEvMaterials, type EvMaterialBank } from "./materials";
import { buildCarGeometry, type CarBodyMeshes } from "./carGeometry";
import { buildSubsystemsGeometry, type SubsystemMeshes } from "./subsystemsGeometry";
import { ParticleNetwork, type PropagationPathDef } from "./particleNetwork";
import { VEHICLE, type CameraPreset, type EvViewMode, type SubsystemKind } from "./types";

export interface Ev3dSceneOptions {
  container: HTMLElement;
  onSelectComponent: (id: string) => void;
}

const HERO_POS = new THREE.Vector3(4.2, 1.9, 4.6);
const HERO_LOOK = new THREE.Vector3(0, 0.62, 0);
const EXPLODE_LIFT = 2.0;

function radialTexture(stops: Array<[number, string]>, size = 512): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [t, c] of stops) g.addColorStop(t, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export class Ev3dScene {
  private container: HTMLElement;
  private onSelectComponent: (id: string) => void;

  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private labelRenderer: CSS2DRenderer;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private controls: OrbitControls;
  private resizeObserver: ResizeObserver;
  private envTarget: THREE.WebGLRenderTarget;

  private materials: EvMaterialBank;
  private car: CarBodyMeshes;
  private sub: SubsystemMeshes;
  private particles: ParticleNetwork;
  private scanRing: THREE.Mesh;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private downAt: { x: number; y: number; t: number } | null = null;
  private hoveredId: string | null = null;
  private selectedId: string | null = null;

  private viewMode: EvViewMode = "xray";
  private activeSubsystem: SubsystemKind = "All";
  private explodedTarget = 0;
  private explodedCurrent = 0;

  private camTargetPos = HERO_POS.clone();
  private camTargetLook = HERO_LOOK.clone();
  private camTransition = false;
  private lastInteraction = performance.now();
  private reducedMotion = false;

  private speed = 64;
  private affected = new Set<string>();
  private originId: string | null = null;
  private attackActive = false;

  private appliedAccent = new Map<string, THREE.Material>();
  private appliedBody = new Map<string, THREE.Material>();

  private rafId: number | null = null;
  private clock = new THREE.Clock();
  private disposed = false;

  public getSubsystem(): SubsystemKind {
    return this.activeSubsystem;
  }

  constructor(options: Ev3dSceneOptions) {
    this.container = options.container;
    this.onSelectComponent = options.onSelectComponent;
    this.reducedMotion = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 520;

    this.scene.background = new THREE.Color(0x070b10);

    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 80);
    this.camera.position.copy(HERO_POS);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    this.renderer.setSize(width, height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.container.appendChild(this.renderer.domElement);

    // Image-based lighting so paint, glass and metal reflect a studio instead of rendering black
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const room = new RoomEnvironment();
    this.envTarget = pmrem.fromScene(room, 0.04);
    this.scene.environment = this.envTarget.texture;
    this.scene.environmentIntensity = 0.6;
    room.dispose();
    pmrem.dispose();

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(width, height);
    const labelDom = this.labelRenderer.domElement;
    labelDom.classList.add("ev-3d-labels");
    this.container.appendChild(labelDom);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.03;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 16;
    this.controls.target.copy(HERO_LOOK);
    this.controls.autoRotateSpeed = 0.9;
    this.controls.addEventListener("start", this.onInteract);
    this.controls.addEventListener("end", this.onInteract);

    this.setupLighting();
    this.scanRing = this.buildFloor();

    this.materials = createEvMaterials();
    this.car = buildCarGeometry(this.materials);
    this.scene.add(this.car.root);
    this.sub = buildSubsystemsGeometry(this.materials);
    this.scene.add(this.sub.root);
    this.particles = new ParticleNetwork();
    this.scene.add(this.particles.group);

    // Post-processing: selective bloom on emissive accents, lights and attack paths
    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(this.renderer.getPixelRatio());
    this.composer.setSize(width, height);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.45, 0.6, 1.0);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    const dom = this.renderer.domElement;
    dom.addEventListener("pointermove", this.onPointerMove);
    dom.addEventListener("pointerdown", this.onPointerDown);
    dom.addEventListener("pointerup", this.onPointerUp);
    dom.addEventListener("pointerleave", this.onPointerLeave);
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(this.container);

    this.applyViewMode(this.viewMode);
    this.animate();
  }

  // ---------------------------------------------------------------- setup

  private setupLighting(): void {
    this.scene.add(new THREE.HemisphereLight(0x6f8fb3, 0x0a0f14, 0.35));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 7, 5);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0x38d6ff, 2.4);
    rim.position.set(-6, 3, -5);
    this.scene.add(rim);
    const warm = new THREE.DirectionalLight(0xffb27a, 0.7);
    warm.position.set(6, 2, -3);
    this.scene.add(warm);
  }

  private buildFloor(): THREE.Mesh {
    const floor = new THREE.Group();
    floor.name = "EV_Floor";

    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(9, 96).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: radialTexture([[0, "rgba(22,38,54,1)"], [0.55, "rgba(12,20,30,0.85)"], [1, "rgba(7,11,16,0)"]]),
        transparent: true,
        depthWrite: false,
      }),
    );
    disc.position.y = -0.002;
    floor.add(disc);

    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({
        map: radialTexture([[0, "rgba(0,0,0,0.85)"], [0.6, "rgba(0,0,0,0.35)"], [1, "rgba(0,0,0,0)"]]),
        transparent: true,
        depthWrite: false,
      }),
    );
    shadow.scale.set(VEHICLE.width * 1.9, 1, VEHICLE.length * 1.25);
    shadow.position.y = 0.003;
    floor.add(shadow);

    const ringMat = (opacity: number) =>
      new THREE.MeshBasicMaterial({ color: 0x38d6ff, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false, toneMapped: false });
    for (const [r, o] of [[3.4, 0.22], [5.2, 0.12]] as const) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(r - 0.012, r + 0.012, 128).rotateX(-Math.PI / 2), ringMat(o));
      ring.position.y = 0.004;
      floor.add(ring);
    }

    // Tick marks around the outer ring
    const ticks: number[] = [];
    for (let i = 0; i < 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const len = i % 5 === 0 ? 0.22 : 0.1;
      ticks.push(Math.cos(a) * 5.2, 0.005, Math.sin(a) * 5.2, Math.cos(a) * (5.2 + len), 0.005, Math.sin(a) * (5.2 + len));
    }
    const tickGeo = new THREE.BufferGeometry();
    tickGeo.setAttribute("position", new THREE.Float32BufferAttribute(ticks, 3));
    floor.add(new THREE.LineSegments(tickGeo, new THREE.LineBasicMaterial({ color: 0x38d6ff, transparent: true, opacity: 0.3 })));

    const scan = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, 128).rotateX(-Math.PI / 2), ringMat(0.4));
    scan.position.y = 0.006;
    floor.add(scan);

    this.scene.add(floor);
    return scan;
  }

  // ---------------------------------------------------------------- events

  private onInteract = (): void => {
    this.lastInteraction = performance.now();
    this.camTransition = false;
  };

  private onResize(): void {
    if (this.disposed) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (w === 0 || h === 0) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
  }

  private setPointer(e: PointerEvent): void {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.camera);
  }

  private pick(): string | null {
    if (this.viewMode === "exterior") return null;
    const hits: THREE.Object3D[] = [];
    for (const c of Object.values(this.sub.components)) hits.push(c.hit);
    const first = this.raycaster.intersectObjects(hits, false)[0];
    return (first?.object.userData.componentId as string | undefined) ?? null;
  }

  private onPointerMove = (e: PointerEvent): void => {
    if (e.buttons) return;
    this.setPointer(e);
    const id = this.pick();
    this.renderer.domElement.style.cursor = id ? "pointer" : "grab";
    this.hoveredId = id;
  };

  private onPointerLeave = (): void => {
    this.hoveredId = null;
  };

  private onPointerDown = (e: PointerEvent): void => {
    this.lastInteraction = performance.now();
    this.downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
  };

  private onPointerUp = (e: PointerEvent): void => {
    const d = this.downAt;
    this.downAt = null;
    if (!d || e.button !== 0) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 5 || performance.now() - d.t > 500) return; // was an orbit drag
    this.setPointer(e);
    const id = this.pick();
    if (id) {
      this.selectComponent(id, true);
      this.onSelectComponent(id);
    }
  };

  // ---------------------------------------------------------------- public API

  public setViewMode(mode: EvViewMode): void {
    const wasExploded = this.viewMode === "exploded";
    this.viewMode = mode;
    this.applyViewMode(mode);
    if (mode === "exploded" || wasExploded) this.reframe(mode === "exploded");
  }

  public setSubsystem(subsystem: SubsystemKind): void {
    this.activeSubsystem = subsystem;
  }

  public setCameraPreset(preset: CameraPreset): void {
    const ex = this.viewMode === "exploded";
    const k = ex ? 1.3 : 1;
    const lookY = ex ? 1.3 : 0.62;
    const look = new THREE.Vector3(0, lookY, 0);
    let pos: THREE.Vector3;
    switch (preset) {
      case "front": pos = new THREE.Vector3(0, 1.1 * k, 6.4 * k); break;
      case "side": pos = new THREE.Vector3(6.8 * k, 1.1 * k, 0); break;
      case "rear": pos = new THREE.Vector3(0, 1.2 * k, -6.4 * k); break;
      case "top": pos = new THREE.Vector3(0, 8.2 * k, 0.01); look.y = 0.3; break;
      default: pos = HERO_POS.clone().multiplyScalar(k); pos.y = HERO_POS.y * k; break;
    }
    this.camTargetPos.copy(pos);
    this.camTargetLook.copy(look);
    this.camTransition = true;
  }

  public selectComponent(id: string, focus = true): void {
    this.selectedId = id;
    const comp = this.sub.components[id];
    if (!comp || !focus) return;
    const look = comp.group.position.clone();
    if (this.explodedTarget > 0.5) look.y += 0.0;
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    dir.y = Math.max(dir.y, 0.25);
    dir.normalize();
    this.camTargetLook.copy(look);
    this.camTargetPos.copy(look).addScaledVector(dir, this.explodedTarget > 0.5 ? 3.2 : 2.2);
    this.camTransition = true;
    this.lastInteraction = performance.now();
  }

  public updateTelemetry(data: {
    speed: number;
    affected: string[];
    candidates: Array<{ id: string; score: number }>;
    paths: PropagationPathDef[];
    isAttackActive: boolean;
  }): void {
    this.speed = data.speed;
    this.affected = new Set(data.affected);
    this.originId = data.candidates[0]?.id ?? null;
    this.attackActive = data.isAttackActive;
    this.particles.updatePaths(data.paths);
  }

  // ---------------------------------------------------------------- modes

  private reframe(exploded: boolean): void {
    const look = new THREE.Vector3(0, exploded ? 1.3 : 0.62, 0);
    const dir = this.camera.position.clone().sub(this.controls.target).normalize();
    this.camTargetLook.copy(look);
    this.camTargetPos.copy(look).addScaledVector(dir, exploded ? 11 : 6.6);
    this.camTransition = true;
  }

  private applyViewMode(mode: EvViewMode): void {
    const shell = mode === "exterior";
    const m = this.materials;
    for (const mesh of this.car.paintMeshes) mesh.material = shell ? m.paint : m.ghostBody;
    for (const mesh of this.car.glassMeshes) mesh.material = shell ? m.glass : m.ghostGlass;

    const showShell = mode !== "system";
    this.car.exteriorGroup.visible = showShell;
    this.car.lightsGroup.visible = showShell;
    this.sub.root.visible = mode !== "exterior";
    this.explodedTarget = mode === "exploded" ? 1 : 0;
    this.bloom.strength = mode === "exterior" ? 0.1 : 0.45;
  }

  // ---------------------------------------------------------------- per-frame state

  private refreshComponentStates(time: number): void {
    const m = this.materials;
    m.statusOrigin.emissiveIntensity = 2.4 + Math.sin(time * 6) * 1.1;
    m.statusAffected.emissiveIntensity = 1.7 + Math.sin(time * 3) * 0.5;

    const attackFocus = this.viewMode === "investigation" && (this.affected.size > 0 || this.originId !== null);
    let labelsShown = 0;

    for (const [id, c] of Object.entries(this.sub.components)) {
      const isSelected = this.selectedId === id;
      const isHovered = this.hoveredId === id;
      const isOrigin = this.attackActive && this.originId === id || (this.originId === id && this.affected.size > 0);
      const isAffected = this.affected.has(id);

      const layerDim = this.activeSubsystem !== "All" && c.def.system !== this.activeSubsystem;
      const attackDim = attackFocus && !(isAffected || isOrigin || isSelected);
      const dim = (layerDim || attackDim) && !isSelected;

      const accentMat = dim ? m.accentDim : isOrigin ? m.statusOrigin : isAffected ? m.statusAffected : (m.accent[c.def.system] ?? m.accent.Energy!);
      if (this.appliedAccent.get(id) !== accentMat) {
        for (const mesh of c.accentMeshes) mesh.material = accentMat;
        this.appliedAccent.set(id, accentMat);
      }
      const bodyMat = dim ? m.housingDim : m.housing;
      if (this.appliedBody.get(id) !== bodyMat) {
        for (const mesh of c.bodyMeshes) mesh.material = bodyMat;
        this.appliedBody.set(id, bodyMat);
      }

      // Bracket
      const halo = c.halo;
      if (isSelected) { halo.material = m.haloSelected; halo.visible = true; }
      else if (isOrigin) { halo.material = m.haloOrigin; halo.visible = true; }
      else if (isAffected) { halo.material = m.haloAffected; halo.visible = true; }
      else if (isHovered) { halo.material = m.haloLine; halo.visible = true; }
      else halo.visible = false;
      if (halo.visible) {
        const s = 1 + Math.sin(time * (isOrigin ? 7 : 3)) * (isOrigin ? 0.07 : 0.035);
        halo.scale.setScalar(s);
      }

      // Label
      const wantLabel = this.sub.root.visible && !dim && (isSelected || isHovered || isOrigin || (isAffected && labelsShown < 4));
      if (wantLabel && !isSelected && !isHovered) labelsShown++;
      c.label.visible = wantLabel;
      c.labelEl.classList.toggle("is-origin", isOrigin);
      c.labelEl.classList.toggle("is-affected", isAffected && !isOrigin);
      c.labelEl.classList.toggle("is-selected", isSelected);
    }
  }

  private animate = (): void => {
    if (this.disposed) return;
    this.rafId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.elapsedTime;

    // Wheels
    if (this.speed > 0.1) {
      const omega = (this.speed / 3.6 / VEHICLE.wheelRadius) * delta;
      for (const w of this.car.wheelSpin) w.rotation.x += omega;
    }

    // Exploded interpolation
    if (Math.abs(this.explodedCurrent - this.explodedTarget) > 0.0005) {
      this.explodedCurrent += (this.explodedTarget - this.explodedCurrent) * (1 - Math.exp(-delta * 4));
      if (Math.abs(this.explodedCurrent - this.explodedTarget) <= 0.0005) this.explodedCurrent = this.explodedTarget;
      const e = this.explodedCurrent;
      this.car.exteriorGroup.position.y = e * EXPLODE_LIFT;
      this.car.lightsGroup.position.y = e * EXPLODE_LIFT;
      for (const c of Object.values(this.sub.components)) {
        const b = c.def.position;
        const o = c.def.explodedOffset;
        c.group.position.set(b[0] + o[0] * e, b[1] + o[1] * e, b[2] + o[2] * e);
      }
    }
    const e = this.explodedCurrent;
    this.sub.connections.visible = e < 0.02;
    this.particles.group.visible = e < 0.02;
    this.sub.leaders.visible = e > 0.02 && this.sub.root.visible;
    if (this.sub.leaders.visible) {
      const attr = this.sub.leaders.geometry.attributes.position as THREE.BufferAttribute;
      let i = 0;
      for (const c of Object.values(this.sub.components)) {
        const b = c.def.position;
        attr.setXYZ(i++, b[0], b[1], b[2]);
        attr.setXYZ(i++, c.group.position.x, c.group.position.y, c.group.position.z);
      }
      attr.needsUpdate = true;
    }

    // Camera transition
    if (this.camTransition) {
      const k = 1 - Math.exp(-delta * 4.5);
      this.camera.position.lerp(this.camTargetPos, k);
      this.controls.target.lerp(this.camTargetLook, k);
      if (this.camera.position.distanceTo(this.camTargetPos) < 0.015 && this.controls.target.distanceTo(this.camTargetLook) < 0.015) {
        this.camTransition = false;
      }
    }

    // Gentle idle orbit
    const idle = performance.now() - this.lastInteraction > 4500;
    this.controls.autoRotate = idle && !this.camTransition && !this.hoveredId && !this.reducedMotion;

    // Floor scan ring
    const phase = (time * 0.22) % 1;
    this.scanRing.scale.setScalar(1.6 + phase * 4);
    (this.scanRing.material as THREE.MeshBasicMaterial).opacity = (1 - phase) * 0.35;

    this.materials.ghostBody.uniforms.uTime!.value = time;
    this.materials.ghostGlass.uniforms.uTime!.value = time;

    this.particles.tick(delta, this.speed, this.attackActive, time);
    this.refreshComponentStates(time);

    this.controls.update();
    this.composer.render();
    this.labelRenderer.render(this.scene, this.camera);
  };

  public dispose(): void {
    this.disposed = true;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.resizeObserver.disconnect();
    const dom = this.renderer.domElement;
    dom.removeEventListener("pointermove", this.onPointerMove);
    dom.removeEventListener("pointerdown", this.onPointerDown);
    dom.removeEventListener("pointerup", this.onPointerUp);
    dom.removeEventListener("pointerleave", this.onPointerLeave);
    this.controls.removeEventListener("start", this.onInteract);
    this.controls.removeEventListener("end", this.onInteract);
    this.controls.dispose();
    this.particles.dispose();

    const disposed = new Set<unknown>();
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.geometry && !disposed.has(mesh.geometry)) { mesh.geometry.dispose(); disposed.add(mesh.geometry); }
      const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      for (const mat of mats) {
        if (disposed.has(mat)) continue;
        const map = (mat as THREE.MeshBasicMaterial).map;
        map?.dispose();
        mat.dispose();
        disposed.add(mat);
      }
    });
    for (const mat of Object.values(this.materials.accent)) mat.dispose();
    this.envTarget.dispose();
    this.composer.dispose();
    this.renderer.dispose();

    dom.parentElement?.removeChild(dom);
    this.labelRenderer.domElement.parentElement?.removeChild(this.labelRenderer.domElement);
  }
}
