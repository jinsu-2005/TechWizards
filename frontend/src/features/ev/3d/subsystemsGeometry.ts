import * as THREE from "three";
import { COMPONENT_3D_DEFS, type Component3DDef } from "./types";
import type { EvMaterialBank } from "./materials";

export interface ComponentObjectMap {
  [id: string]: {
    group: THREE.Group;
    mainMesh: THREE.Mesh;
    haloMesh: THREE.Mesh;
    def: Component3DDef;
  };
}

export interface SubsystemMeshes {
  root: THREE.Group;
  components: ComponentObjectMap;
  connectionsGroup: THREE.Group;
}

export function buildSubsystemsGeometry(m: EvMaterialBank): SubsystemMeshes {
  const root = new THREE.Group();
  root.name = "EV_Subsystems_Root";

  const components: ComponentObjectMap = {};
  const connectionsGroup = new THREE.Group();
  connectionsGroup.name = "EV_Connections_Group";
  root.add(connectionsGroup);

  // Build each of the 22 components
  for (const [id, def] of Object.entries(COMPONENT_3D_DEFS)) {
    const group = new THREE.Group();
    group.name = `EV_Component_${id}`;
    group.position.set(...def.position);

    const [sx, sy, sz] = def.size;
    const sysMat = m.subsystemMaterials[def.system] || m.subsystemMaterials.Energy;

    let mainGeo: THREE.BufferGeometry;

    // Custom geometries according to component identity
    if (id === "PACK") {
      // Skateboard battery enclosure with module ridges
      mainGeo = new THREE.BoxGeometry(sx, sy, sz);
      // Add individual cell module ridges on top of pack
      for (let rx = -0.4; rx <= 0.4; rx += 0.26) {
        for (let rz = -0.8; rz <= 0.8; rz += 0.38) {
          const cellBankGeo = new THREE.BoxGeometry(0.2, 0.04, 0.32);
          const cellBank = new THREE.Mesh(cellBankGeo, m.subsystemMaterials.Energy);
          cellBank.position.set(rx, sy / 2 + 0.02, rz);
          group.add(cellBank);
        }
      }
    } else if (id === "MOTOR") {
      // Cylindrical electric motor
      mainGeo = new THREE.CylinderGeometry(sy / 2, sy / 2, sz, 20);
      mainGeo.rotateX(Math.PI / 2);
    } else if (id === "COOL") {
      // Centrifugal pump with volute
      mainGeo = new THREE.CylinderGeometry(sx / 2, sx / 2, sy, 16);
      const portGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.14, 8);
      portGeo.rotateZ(Math.PI / 2);
      const port1 = new THREE.Mesh(portGeo, m.subsystemMaterials.Thermal);
      port1.position.set(sx / 2 + 0.05, 0, 0);
      group.add(port1);
    } else if (id === "EPS") {
      // Steering rack cylinder + servo
      mainGeo = new THREE.CylinderGeometry(sy / 4, sy / 4, sx, 12);
      mainGeo.rotateZ(Math.PI / 2);
      const motorBox = new THREE.BoxGeometry(0.12, 0.16, 0.14);
      const mMesh = new THREE.Mesh(motorBox, m.subsystemMaterials.Chassis);
      mMesh.position.set(0.1, 0.08, 0);
      group.add(mMesh);
    } else if (def.kind === "Sensor") {
      // Sensor probe with bevel
      mainGeo = new THREE.BoxGeometry(sx, sy, sz);
    } else {
      // Controller / Actuator
      mainGeo = new THREE.BoxGeometry(sx, sy, sz);
    }

    const mainMesh = new THREE.Mesh(mainGeo, sysMat);
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    mainMesh.userData = {
      isEvComponent: true,
      componentId: id,
      componentName: def.name,
      componentKind: def.kind,
      componentSystem: def.system,
      componentUnit: def.unit,
    };
    group.add(mainMesh);

    // Glowing halo / bounding wireframe for hover & selection & anomaly indicator
    const haloGeo = new THREE.BoxGeometry(sx * 1.25, sy * 1.25, sz * 1.25);
    const haloMesh = new THREE.Mesh(haloGeo, m.nominalGlow);
    haloMesh.visible = false;
    group.add(haloMesh);

    root.add(group);

    components[id] = {
      group,
      mainMesh,
      haloMesh,
      def,
    };
  }

  // 1. High-Voltage DC Busbar from PACK to INV
  const packPos = COMPONENT_3D_DEFS.PACK.position;
  const invPos = COMPONENT_3D_DEFS.INV.position;
  const busbarCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, packPos[1] + 0.1, packPos[2] - 0.9),
    new THREE.Vector3(0, packPos[1] + 0.18, packPos[2] - 1.1),
    new THREE.Vector3(0, invPos[1] - 0.1, invPos[2] + 0.15),
  ]);
  const busbarGeo = new THREE.TubeGeometry(busbarCurve, 16, 0.025, 8, false);
  const busbarMesh = new THREE.Mesh(busbarGeo, m.hvBusbar);
  connectionsGroup.add(busbarMesh);

  // 2. Coolant Loop Piping (COOL -> FLOW -> CTEMP -> TEMP / PACK -> Radiator)
  const coolPos = COMPONENT_3D_DEFS.COOL.position;
  const flowPos = COMPONENT_3D_DEFS.FLOW.position;
  const ctempPos = COMPONENT_3D_DEFS.CTEMP.position;
  const tempPos = COMPONENT_3D_DEFS.TEMP.position;

  const coolantCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(coolPos[0], coolPos[1], coolPos[2]),
    new THREE.Vector3(flowPos[0], flowPos[1], flowPos[2]),
    new THREE.Vector3(ctempPos[0], ctempPos[1], ctempPos[2]),
    new THREE.Vector3(0, 0.28, 0.5),
    new THREE.Vector3(tempPos[0], tempPos[1], tempPos[2]),
    new THREE.Vector3(-0.35, 0.26, -0.6),
    new THREE.Vector3(0, 0.32, -1.1), // motor cooling jacket
    new THREE.Vector3(0.35, 0.3, 0.2),
    new THREE.Vector3(coolPos[0], coolPos[1], coolPos[2]),
  ], true);

  const coolantGeo = new THREE.TubeGeometry(coolantCurve, 48, 0.018, 8, true);
  const coolantMesh = new THREE.Mesh(coolantGeo, m.coolantTube);
  connectionsGroup.add(coolantMesh);

  // 3. Central CAN Bus Harness
  const canPos = COMPONENT_3D_DEFS.CAN.position;
  const canTargets = [
    COMPONENT_3D_DEFS.VCU.position,
    COMPONENT_3D_DEFS.BMS.position,
    COMPONENT_3D_DEFS.BRAKE.position,
    COMPONENT_3D_DEFS.INV.position,
  ];

  for (const target of canTargets) {
    const points = [
      new THREE.Vector3(canPos[0], canPos[1], canPos[2]),
      new THREE.Vector3(canPos[0], (canPos[1] + target[1]) / 2, (canPos[2] + target[2]) / 2),
      new THREE.Vector3(target[0], target[1], target[2]),
    ];
    const canGeo = new THREE.BufferGeometry().setFromPoints(points);
    const canLine = new THREE.Line(canGeo, m.canBusWire);
    connectionsGroup.add(canLine);
  }

  return {
    root,
    components,
    connectionsGroup,
  };
}
