import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { createEvMaterials, type EvMaterialBank } from "./materials";
import { buildCarGeometry, type CarBodyMeshes } from "./carGeometry";
import { buildSubsystemsGeometry, type SubsystemMeshes } from "./subsystemsGeometry";
import { ParticleNetwork, type PropagationPathDef } from "./particleNetwork";
import { COMPONENT_3D_DEFS, type CameraPreset, type EvViewMode, type SubsystemKind } from "./types";

export interface Ev3dSceneOptions {
  container: HTMLElement;
  onSelectComponent: (id: string) => void;
}

export class Ev3dScene {
  private container: HTMLElement;
  private onSelectComponent: (id: string) => void;

  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;

  private materials: EvMaterialBank;
  private carMeshes: CarBodyMeshes;
  private subsystemMeshes: SubsystemMeshes;
  private particleNetwork: ParticleNetwork;

  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private hoveredId: string | null = null;
  private selectedId: string | null = null;

  private viewMode: EvViewMode = "xray";
  private activeSubsystem: SubsystemKind = "All";
  private explodedTarget = 0.0;
  private explodedCurrent = 0.0;

  public getSubsystem(): SubsystemKind {
    return this.activeSubsystem;
  }

  // Camera animation target
  private cameraTargetPos = new THREE.Vector3(3.8, 2.5, 3.8);
  private cameraTargetLook = new THREE.Vector3(0, 0.4, 0);
  private isCameraTransitioning = false;

  // Simulation state caches
  private currentSpeed = 64.0;
  private affectedComponents: string[] = [];
  private leadingOriginId: string | null = null;
  private isAttackActive = false;

  private animFrameId: number | null = null;
  private lastTime = performance.now();
  private isDisposed = false;

  constructor(options: Ev3dSceneOptions) {
    this.container = options.container;
    this.onSelectComponent = options.onSelectComponent;

    const width = this.container.clientWidth || 800;
    const height = this.container.clientHeight || 500;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0f14);
    this.scene.fog = new THREE.FogExp2(0x0b0f14, 0.06);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.camera.position.set(3.8, 2.5, 3.8);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent camera going below floor
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 14;
    this.controls.target.set(0, 0.4, 0);

    // 5. Lighting
    this.setupLighting();

    // 6. Materials & Models
    this.materials = createEvMaterials();
    this.scene.add(this.materials.gridFloor);

    this.carMeshes = buildCarGeometry(this.materials);
    this.scene.add(this.carMeshes.root);

    this.subsystemMeshes = buildSubsystemsGeometry(this.materials);
    this.scene.add(this.subsystemMeshes.root);

    this.particleNetwork = new ParticleNetwork();
    this.scene.add(this.particleNetwork.group);

    // 7. Event Listeners
    this.bindEvents();

    // 8. Apply Initial View Mode
    this.applyViewMode(this.viewMode);

    // 9. Start Render Loop
    this.animate();
  }

  private setupLighting(): void {
    // Ambient Light (subtle cool blue fill)
    const ambientLight = new THREE.AmbientLight(0x1a2636, 1.2);
    this.scene.add(ambientLight);

    // Directional Key Light (crisp white sun from above front right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Rim / Backlight (electric cyan from rear left)
    const rimLight = new THREE.DirectionalLight(0x00e5ff, 1.8);
    rimLight.position.set(-6, 4, -6);
    this.scene.add(rimLight);

    // Underbody Glow Light (soft cyan upwards from skateboard battery)
    const underbodyLight = new THREE.PointLight(0x00e5ff, 1.4, 4);
    underbodyLight.position.set(0, 0.15, 0);
    this.scene.add(underbodyLight);
  }

  private bindEvents(): void {
    this.renderer.domElement.addEventListener("pointermove", this.onPointerMove);
    this.renderer.domElement.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("resize", this.onResize);
  }

  private onResize = (): void => {
    if (this.isDisposed || !this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onPointerMove = (e: MouseEvent): void => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    const hit = this.intersectComponents();
    if (hit) {
      this.renderer.domElement.style.cursor = "pointer";
      if (this.hoveredId !== hit) {
        this.hoveredId = hit;
        this.updateHalos();
      }
    } else {
      this.renderer.domElement.style.cursor = "default";
      if (this.hoveredId !== null) {
        this.hoveredId = null;
        this.updateHalos();
      }
    }
  };

  private onPointerDown = (e: MouseEvent): void => {
    // Only handle left click
    if (e.button !== 0) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);
    const hit = this.intersectComponents();

    if (hit) {
      this.selectComponent(hit);
      this.onSelectComponent(hit);
    }
  };

  private intersectComponents(): string | null {
    const meshes: THREE.Mesh[] = [];
    for (const comp of Object.values(this.subsystemMeshes.components)) {
      meshes.push(comp.mainMesh);
    }

    const intersects = this.raycaster.intersectObjects(meshes, false);
    const top = intersects[0];
    if (top) {
      return top.object.userData.componentId || null;
    }
    return null;
  }

  public setViewMode(mode: EvViewMode): void {
    this.viewMode = mode;
    this.applyViewMode(mode);
  }

  private applyViewMode(mode: EvViewMode): void {
    if (mode === "exterior") {
      this.explodedTarget = 0.0;
      // Show opaque paint
      for (const mesh of this.carMeshes.paintMeshes) {
        mesh.material = this.materials.carBodyPaint;
      }
      for (const mesh of this.carMeshes.glassMeshes) {
        mesh.material = this.materials.carBodyGlass;
      }
      this.carMeshes.exteriorGroup.visible = true;
    } else if (mode === "xray") {
      this.explodedTarget = 0.0;
      // Show transparent body shell
      for (const mesh of this.carMeshes.paintMeshes) {
        mesh.material = this.materials.xrayBody;
      }
      for (const mesh of this.carMeshes.glassMeshes) {
        mesh.material = this.materials.xrayGlass;
      }
      this.carMeshes.exteriorGroup.visible = true;
    } else if (mode === "exploded") {
      this.explodedTarget = 1.0;
      for (const mesh of this.carMeshes.paintMeshes) {
        mesh.material = this.materials.xrayBody;
      }
      for (const mesh of this.carMeshes.glassMeshes) {
        mesh.material = this.materials.xrayGlass;
      }
      this.carMeshes.exteriorGroup.visible = true;
    } else if (mode === "system") {
      this.explodedTarget = 0.2;
      for (const mesh of this.carMeshes.paintMeshes) {
        mesh.material = this.materials.xrayBody;
      }
      for (const mesh of this.carMeshes.glassMeshes) {
        mesh.material = this.materials.xrayGlass;
      }
      this.carMeshes.exteriorGroup.visible = true;
    } else if (mode === "investigation") {
      this.explodedTarget = 0.0;
      for (const mesh of this.carMeshes.paintMeshes) {
        mesh.material = this.materials.xrayBody;
      }
      for (const mesh of this.carMeshes.glassMeshes) {
        mesh.material = this.materials.xrayGlass;
      }
      this.carMeshes.exteriorGroup.visible = true;
    }
    this.updateHalos();
  }

  public setSubsystem(subsystem: SubsystemKind): void {
    this.activeSubsystem = subsystem;
    for (const [, comp] of Object.entries(this.subsystemMeshes.components)) {
      const match = subsystem === "All" || comp.def.system === subsystem;
      comp.group.visible = match;
    }
    this.updateHalos();
  }

  public setCameraPreset(preset: CameraPreset): void {
    this.isCameraTransitioning = true;
    if (preset === "iso" || preset === "reset") {
      this.cameraTargetPos.set(3.8, 2.5, 3.8);
      this.cameraTargetLook.set(0, 0.4, 0);
    } else if (preset === "front") {
      this.cameraTargetPos.set(0, 1.2, 4.2);
      this.cameraTargetLook.set(0, 0.4, 0);
    } else if (preset === "side") {
      this.cameraTargetPos.set(4.2, 1.0, 0);
      this.cameraTargetLook.set(0, 0.4, 0);
    } else if (preset === "rear") {
      this.cameraTargetPos.set(0, 1.2, -4.2);
      this.cameraTargetLook.set(0, 0.4, 0);
    } else if (preset === "top") {
      this.cameraTargetPos.set(0, 5.2, 0.05);
      this.cameraTargetLook.set(0, 0.2, 0);
    }
  }

  public selectComponent(id: string): void {
    this.selectedId = id;
    this.updateHalos();

    // Smoothly focus camera on the selected component
    const def = COMPONENT_3D_DEFS[id as keyof typeof COMPONENT_3D_DEFS];
    if (def) {
      const p = def.position;
      this.cameraTargetLook.set(p[0], p[1], p[2]);
      const dir = this.camera.position.clone().sub(this.controls.target).normalize();
      this.cameraTargetPos.set(p[0] + dir.x * 2.2, p[1] + 0.8, p[2] + dir.z * 2.2);
      this.isCameraTransitioning = true;
    }
  }

  public updateTelemetry(data: {
    speed: number;
    affected: string[];
    candidates: Array<{ id: string; score: number }>;
    paths: PropagationPathDef[];
    isAttackActive: boolean;
  }): void {
    this.currentSpeed = data.speed;
    this.affectedComponents = data.affected;
    this.leadingOriginId = data.candidates[0]?.id || null;
    this.isAttackActive = data.isAttackActive;

    // Update 3D propagation paths
    this.particleNetwork.updatePaths(data.paths);

    this.updateHalos();
  }

  private updateHalos(): void {
    const time = Date.now() * 0.005;

    for (const [id, comp] of Object.entries(this.subsystemMeshes.components)) {
      const isSelected = this.selectedId === id;
      const isHovered = this.hoveredId === id;
      const isOrigin = this.leadingOriginId === id;
      const isAffected = this.affectedComponents.includes(id);

      if (isSelected) {
        comp.haloMesh.material = this.materials.selectedHalo;
        comp.haloMesh.visible = true;
      } else if (isOrigin) {
        comp.haloMesh.material = this.materials.originGlow;
        comp.haloMesh.visible = true;
      } else if (isAffected) {
        comp.haloMesh.material = this.materials.anomalousGlow;
        comp.haloMesh.visible = true;
      } else if (isHovered) {
        comp.haloMesh.material = this.materials.nominalGlow;
        comp.haloMesh.visible = true;
      } else {
        comp.haloMesh.visible = false;
      }

      // Pulse scaling when under attack or selected
      if (comp.haloMesh.visible) {
        const pulse = 1.0 + Math.sin(time * (isOrigin ? 4 : 2)) * 0.08;
        comp.haloMesh.scale.set(pulse, pulse, pulse);
      }
    }
  }

  private animate = (): void => {
    if (this.isDisposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const now = performance.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    // 1. Wheel Rotation (proportional to vehicle speed)
    if (this.currentSpeed > 0.1) {
      // Angular velocity = v / r (where r = 0.34m tire radius, v in m/s)
      const omega = (this.currentSpeed / 3.6 / 0.34) * delta;
      this.carMeshes.wheels.fl.rotation.x += omega;
      this.carMeshes.wheels.fr.rotation.x += omega;
      this.carMeshes.wheels.rl.rotation.x += omega;
      this.carMeshes.wheels.rr.rotation.x += omega;
    }

    // 2. Exploded View Smooth Interpolation
    if (Math.abs(this.explodedCurrent - this.explodedTarget) > 0.001) {
      this.explodedCurrent += (this.explodedTarget - this.explodedCurrent) * delta * 4;

      // Translate exterior body shell upwards
      this.carMeshes.exteriorGroup.position.y = this.explodedCurrent * 0.85;

      // Translate individual subsystems according to explodedOffset
      for (const [, comp] of Object.entries(this.subsystemMeshes.components)) {
        const base = comp.def.position;
        const offset = comp.def.explodedOffset;
        comp.group.position.set(
          base[0] + offset[0] * this.explodedCurrent,
          base[1] + offset[1] * this.explodedCurrent,
          base[2] + offset[2] * this.explodedCurrent
        );
      }
    }

    // 3. Smooth Camera Preset / Focus Interpolation
    if (this.isCameraTransitioning) {
      this.camera.position.lerp(this.cameraTargetPos, delta * 5);
      this.controls.target.lerp(this.cameraTargetLook, delta * 5);
      if (this.camera.position.distanceTo(this.cameraTargetPos) < 0.02) {
        this.isCameraTransitioning = false;
      }
    }

    // 4. Update Particles & Paths
    this.particleNetwork.tick(delta, this.currentSpeed, this.isAttackActive);

    // 5. Update Halos
    this.updateHalos();

    // 6. Controls & Render
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  public dispose(): void {
    this.isDisposed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }

    window.removeEventListener("resize", this.onResize);
    this.renderer.domElement.removeEventListener("pointermove", this.onPointerMove);
    this.renderer.domElement.removeEventListener("pointerdown", this.onPointerDown);

    this.controls.dispose();
    this.particleNetwork.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
