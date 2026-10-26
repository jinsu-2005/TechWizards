import * as THREE from "three";
import type { EvMaterialBank } from "./materials";

export interface CarBodyMeshes {
  root: THREE.Group;
  exteriorGroup: THREE.Group;
  chassisGroup: THREE.Group;
  wheels: {
    fl: THREE.Group;
    fr: THREE.Group;
    rl: THREE.Group;
    rr: THREE.Group;
  };
  paintMeshes: THREE.Mesh[];
  glassMeshes: THREE.Mesh[];
}

export function buildCarGeometry(m: EvMaterialBank): CarBodyMeshes {
  const root = new THREE.Group();
  root.name = "EV_Car_Root";

  const exteriorGroup = new THREE.Group();
  exteriorGroup.name = "EV_Exterior";
  root.add(exteriorGroup);

  const chassisGroup = new THREE.Group();
  chassisGroup.name = "EV_Chassis";
  root.add(chassisGroup);

  const paintMeshes: THREE.Mesh[] = [];
  const glassMeshes: THREE.Mesh[] = [];

  // Helper to add paint mesh
  const addPaint = (geo: THREE.BufferGeometry, pos: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geo, m.carBodyPaint);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    exteriorGroup.add(mesh);
    paintMeshes.push(mesh);
    return mesh;
  };

  // Helper to add glass mesh
  const addGlass = (geo: THREE.BufferGeometry, pos: [number, number, number] = [0, 0, 0], rot: [number, number, number] = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geo, m.carBodyGlass);
    mesh.position.set(...pos);
    mesh.rotation.set(...rot);
    exteriorGroup.add(mesh);
    glassMeshes.push(mesh);
    return mesh;
  };

  // 1. Lower Body / Skateboard Floor
  const lowerBodyGeo = new THREE.BoxGeometry(1.68, 0.28, 4.1);
  addPaint(lowerBodyGeo, [0, 0.28, 0]);

  // 2. Front Hood / Frunk Slope
  const hoodShape = new THREE.Shape();
  hoodShape.moveTo(-0.78, 0);
  hoodShape.lineTo(0.78, 0);
  hoodShape.lineTo(0.72, 1.35);
  hoodShape.lineTo(-0.72, 1.35);
  hoodShape.closePath();

  const hoodExtrudeSettings = { depth: 0.12, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.04 };
  const hoodGeo = new THREE.ExtrudeGeometry(hoodShape, hoodExtrudeSettings);
  hoodGeo.rotateX(Math.PI / 2);
  hoodGeo.rotateX(-0.1); // slight forward aerodynamic rake
  addPaint(hoodGeo, [0, 0.44, 0.75]);

  // 3. Front Nose Cone & Aerodynamic Bumper
  const frontBumperGeo = new THREE.CylinderGeometry(0.82, 0.86, 0.32, 16, 1, false, -Math.PI / 2, Math.PI);
  frontBumperGeo.rotateZ(Math.PI / 2);
  frontBumperGeo.scale(1.0, 0.55, 1.0);
  addPaint(frontBumperGeo, [0, 0.32, 2.05]);

  // 4. Rear Bumper & Diffuser
  const rearBumperGeo = new THREE.BoxGeometry(1.68, 0.34, 0.42);
  addPaint(rearBumperGeo, [0, 0.36, -2.05]);

  const rearDiffuserGeo = new THREE.BoxGeometry(1.5, 0.12, 0.38);
  const diffuserMesh = new THREE.Mesh(rearDiffuserGeo, m.carBodyTrim);
  diffuserMesh.position.set(0, 0.18, -2.08);
  exteriorGroup.add(diffuserMesh);

  // 5. Glass Cabin Greenhouse
  // Windshield
  const windshieldGeo = new THREE.PlaneGeometry(1.42, 0.95);
  windshieldGeo.rotateX(-Math.PI / 3.4);
  addGlass(windshieldGeo, [0, 0.76, 0.82]);

  // Panoramic Glass Roof
  const roofGeo = new THREE.BoxGeometry(1.3, 0.04, 1.45);
  addGlass(roofGeo, [0, 1.08, -0.05]);

  // Rear Windshield / Fastback slope
  const rearGlassGeo = new THREE.PlaneGeometry(1.36, 1.05);
  rearGlassGeo.rotateX(Math.PI / 3.2);
  addGlass(rearGlassGeo, [0, 0.82, -0.98]);

  // Side Windows (Left & Right)
  const sideWindowShape = new THREE.Shape();
  sideWindowShape.moveTo(-1.0, 0);
  sideWindowShape.lineTo(0.7, 0);
  sideWindowShape.lineTo(0.3, 0.38);
  sideWindowShape.lineTo(-0.6, 0.38);
  sideWindowShape.closePath();
  const sideWindowGeo = new THREE.ShapeGeometry(sideWindowShape);

  // Left side windows
  const leftWindow = new THREE.Mesh(sideWindowGeo, m.carBodyGlass);
  leftWindow.position.set(-0.78, 0.65, 0);
  leftWindow.rotation.y = -Math.PI / 2;
  exteriorGroup.add(leftWindow);
  glassMeshes.push(leftWindow);

  // Right side windows
  const rightWindow = new THREE.Mesh(sideWindowGeo, m.carBodyGlass);
  rightWindow.position.set(0.78, 0.65, 0);
  rightWindow.rotation.y = Math.PI / 2;
  exteriorGroup.add(rightWindow);
  glassMeshes.push(rightWindow);

  // 6. Roof Pillars (A, B, C pillars)
  const pillarGeo = new THREE.BoxGeometry(0.08, 0.55, 0.08);
  // A pillars
  addPaint(pillarGeo, [-0.7, 0.8, 0.75], [0.4, 0, -0.2]);
  addPaint(pillarGeo, [0.7, 0.8, 0.75], [0.4, 0, 0.2]);
  // B pillars
  addPaint(pillarGeo, [-0.74, 0.82, 0], [0, 0, 0]);
  addPaint(pillarGeo, [0.74, 0.82, 0], [0, 0, 0]);
  // C pillars
  addPaint(pillarGeo, [-0.68, 0.78, -0.95], [-0.4, 0, -0.2]);
  addPaint(pillarGeo, [0.68, 0.78, -0.95], [-0.4, 0, 0.2]);

  // 7. Headlight & Taillight Bars
  // Full-width front lightbar
  const frontLightbarGeo = new THREE.BoxGeometry(1.48, 0.04, 0.06);
  const frontLightbar = new THREE.Mesh(frontLightbarGeo, m.carHeadlight);
  frontLightbar.position.set(0, 0.46, 2.12);
  exteriorGroup.add(frontLightbar);

  // Left & Right Headlamp Clusters
  const headlampGeo = new THREE.BoxGeometry(0.24, 0.1, 0.15);
  const leftHeadlamp = new THREE.Mesh(headlampGeo, m.carHeadlight);
  leftHeadlamp.position.set(-0.62, 0.44, 2.06);
  leftHeadlamp.rotation.y = -0.2;
  exteriorGroup.add(leftHeadlamp);

  const rightHeadlamp = new THREE.Mesh(headlampGeo, m.carHeadlight);
  rightHeadlamp.position.set(0.62, 0.44, 2.06);
  rightHeadlamp.rotation.y = 0.2;
  exteriorGroup.add(rightHeadlamp);

  // Full-width aerodynamic rear taillight bar
  const taillightBarGeo = new THREE.BoxGeometry(1.52, 0.05, 0.06);
  const taillightBar = new THREE.Mesh(taillightBarGeo, m.carTaillight);
  taillightBar.position.set(0, 0.52, -2.12);
  exteriorGroup.add(taillightBar);

  // 8. Aerodynamic Side Mirrors
  const mirrorStemGeo = new THREE.BoxGeometry(0.12, 0.04, 0.05);
  const mirrorHousingGeo = new THREE.BoxGeometry(0.22, 0.12, 0.12);

  const leftMirror = new THREE.Group();
  leftMirror.position.set(-0.84, 0.68, 0.68);
  const lmStem = new THREE.Mesh(mirrorStemGeo, m.carBodyTrim);
  const lmHouse = new THREE.Mesh(mirrorHousingGeo, m.carBodyPaint);
  lmHouse.position.x = -0.12;
  leftMirror.add(lmStem, lmHouse);
  exteriorGroup.add(leftMirror);

  const rightMirror = new THREE.Group();
  rightMirror.position.set(0.84, 0.68, 0.68);
  const rmStem = new THREE.Mesh(mirrorStemGeo, m.carBodyTrim);
  const rmHouse = new THREE.Mesh(mirrorHousingGeo, m.carBodyPaint);
  rmHouse.position.x = 0.12;
  rightMirror.add(rmStem, rmHouse);
  exteriorGroup.add(rightMirror);

  // 9. Wheels, Rims, Tires, and Brake Calipers
  const createWheel = (isFront: boolean, isRight: boolean) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.name = `Wheel_${isFront ? "Front" : "Rear"}_${isRight ? "Right" : "Left"}`;

    // Tire
    const tireGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.24, 24);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, m.tireRubber);
    tire.castShadow = true;
    wheelGroup.add(tire);

    // Rim
    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.245, 16);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, m.wheelRim);
    wheelGroup.add(rim);

    // Aero Spoke Blades
    for (let i = 0; i < 5; i++) {
      const spokeGeo = new THREE.BoxGeometry(0.04, 0.2, 0.25);
      const spoke = new THREE.Mesh(spokeGeo, m.wheelRim);
      spoke.rotation.x = (i * Math.PI * 2) / 5;
      wheelGroup.add(spoke);
    }

    // Brake Rotor
    const rotorGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.03, 16);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotor = new THREE.Mesh(rotorGeo, m.brakeRotor);
    rotor.position.x = isRight ? -0.06 : 0.06;
    wheelGroup.add(rotor);

    // Brake Caliper
    const caliperGeo = new THREE.BoxGeometry(0.06, 0.1, 0.08);
    const caliper = new THREE.Mesh(caliperGeo, m.brakeCaliper);
    caliper.position.set(isRight ? -0.07 : 0.07, 0.12, 0);
    wheelGroup.add(caliper);

    return wheelGroup;
  };

  const wheelFL = createWheel(true, false);
  wheelFL.position.set(-0.84, 0.34, 1.35);
  chassisGroup.add(wheelFL);

  const wheelFR = createWheel(true, true);
  wheelFR.position.set(0.84, 0.34, 1.35);
  chassisGroup.add(wheelFR);

  const wheelRL = createWheel(false, false);
  wheelRL.position.set(-0.84, 0.34, -1.35);
  chassisGroup.add(wheelRL);

  const wheelRR = createWheel(false, true);
  wheelRR.position.set(0.84, 0.34, -1.35);
  chassisGroup.add(wheelRR);

  // 10. Front and Rear Suspension Axles
  const axleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.6, 12);
  axleGeo.rotateZ(Math.PI / 2);
  const frontAxle = new THREE.Mesh(axleGeo, m.carBodyTrim);
  frontAxle.position.set(0, 0.34, 1.35);
  chassisGroup.add(frontAxle);

  const rearAxle = new THREE.Mesh(axleGeo, m.carBodyTrim);
  rearAxle.position.set(0, 0.34, -1.35);
  chassisGroup.add(rearAxle);

  return {
    root,
    exteriorGroup,
    chassisGroup,
    wheels: {
      fl: wheelFL,
      fr: wheelFR,
      rl: wheelRL,
      rr: wheelRR,
    },
    paintMeshes,
    glassMeshes,
  };
}
