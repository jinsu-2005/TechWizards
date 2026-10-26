export type EvViewMode = "exterior" | "xray" | "exploded" | "system" | "investigation";

export type CameraPreset = "iso" | "front" | "side" | "rear" | "top" | "reset";

export type SubsystemKind = "All" | "Energy" | "Powertrain" | "Thermal" | "Chassis" | "Network";

export type SystemName = Exclude<SubsystemKind, "All">;

export interface Component3DDef {
  id: string;
  name: string;
  kind: "Sensor" | "Actuator" | "Controller";
  system: SystemName;
  unit: string;
  tolerance: number;
  position: [number, number, number]; // [x, y, z] metres; +z is the front of the vehicle
  explodedOffset: [number, number, number]; // translation applied in the exploded view
  size: [number, number, number]; // bounding dimensions [width, height, depth]
  color: string;
  description: string;
}

export const SUBSYSTEM_COLORS: Record<string, string> = {
  Energy: "#22d3ee",
  Powertrain: "#ff9f1c",
  Thermal: "#38a1ff",
  Chassis: "#7CFF6B",
  Network: "#c77dff",
};

/** Vehicle envelope shared by geometry, camera framing and floor decoration. */
export const VEHICLE = {
  length: 4.7,
  width: 1.95,
  wheelbaseHalf: 1.4,
  wheelRadius: 0.36,
  wheelX: 0.82,
  floorY: 0.2,
} as const;

export type ComponentId =
  | "PACK" | "CELL" | "BMS" | "CURRENT" | "SOC" | "DCDC"
  | "MOTOR" | "INV" | "VCU" | "RPM" | "PEDAL"
  | "COOL" | "FLOW" | "CTEMP" | "TEMP" | "MTEMP"
  | "WHEEL" | "BRAKE" | "PRESSURE" | "EPS" | "ANGLE"
  | "CAN";

// Exploded view: each subsystem separates into its own horizontal layer.
const LAYER_Y: Record<SystemName, number> = {
  Energy: -0.12,
  Thermal: 0.55,
  Powertrain: 1.0,
  Chassis: 1.45,
  Network: 1.9,
};

function def(
  id: ComponentId,
  name: string,
  kind: Component3DDef["kind"],
  system: SystemName,
  unit: string,
  tolerance: number,
  position: [number, number, number],
  size: [number, number, number],
  description: string,
): Component3DDef {
  const [x, y, z] = position;
  return {
    id, name, kind, system, unit, tolerance, position, size, description,
    color: SUBSYSTEM_COLORS[system] ?? "#22d3ee",
    explodedOffset: [x * 0.85, LAYER_Y[system] - y + 0.3, z * 0.3],
  };
}

export const COMPONENT_3D_DEFS: Record<ComponentId, Component3DDef> = {
  // Energy: skateboard pack and its supervisors
  PACK: def("PACK", "High-Voltage Battery Pack", "Sensor", "Energy", "V", 4.0, [0, 0.31, -0.05], [1.32, 0.14, 2.3],
    "Main traction battery in a sealed aluminium skateboard enclosure with internal contactors."),
  CELL: def("CELL", "Cell Voltage Monitor", "Sensor", "Energy", "V", 0.06, [0.4, 0.43, 0.5], [0.3, 0.08, 0.42],
    "Multi-channel supervisor tracking per-module cell voltage and balance."),
  BMS: def("BMS", "Battery Management System", "Controller", "Energy", "% limit", 5.0, [-0.4, 0.44, 0.8], [0.3, 0.1, 0.22],
    "Battery controller managing state estimation, thermal limits and pre-charge relays."),
  CURRENT: def("CURRENT", "Pack Current Sensor", "Sensor", "Energy", "A", 3.0, [0.4, 0.44, 0.95], [0.16, 0.09, 0.14],
    "Isolated Hall-effect transducer measuring traction and regenerative current."),
  SOC: def("SOC", "State of Charge Node", "Sensor", "Energy", "%", 1.0, [0, 0.84, 0.62], [0.36, 0.08, 0.06],
    "Kalman-filter charge estimator feeding the driver instrument cluster."),
  DCDC: def("DCDC", "DC/DC Converter", "Actuator", "Energy", "V", 0.3, [-0.46, 0.46, 1.68], [0.3, 0.14, 0.24],
    "Buck converter stepping the traction bus down to 13.8 V for auxiliaries."),

  // Powertrain: rear drive unit and supervisors
  MOTOR: def("MOTOR", "Traction Motor", "Actuator", "Powertrain", "Nm", 8.0, [0, 0.37, -1.4], [0.62, 0.38, 0.4],
    "Permanent-magnet synchronous rear traction drive unit."),
  INV: def("INV", "Traction Inverter", "Actuator", "Powertrain", "kW", 2.0, [0, 0.64, -1.4], [0.44, 0.14, 0.34],
    "Silicon-carbide inverter regulating three-phase motor current."),
  VCU: def("VCU", "Vehicle Control Unit", "Controller", "Powertrain", "Nm", 8.0, [0.4, 0.56, 1.5], [0.26, 0.1, 0.2],
    "Master supervisor translating pedal demand into safe torque requests."),
  RPM: def("RPM", "Motor Speed Sensor", "Sensor", "Powertrain", "rpm", 120.0, [0.4, 0.37, -1.4], [0.1, 0.12, 0.12],
    "Resolver on the rotor shaft measuring instantaneous speed."),
  PEDAL: def("PEDAL", "Accelerator Position Sensor", "Sensor", "Powertrain", "%", 3.0, [-0.36, 0.46, 1.0], [0.1, 0.16, 0.12],
    "Dual-redundant pedal transducer detecting driver demand."),

  // Thermal: coolant loop
  COOL: def("COOL", "Coolant Pump", "Actuator", "Thermal", "%", 5.0, [0.5, 0.38, 1.5], [0.22, 0.2, 0.22],
    "Variable-speed pump circulating coolant through the battery chiller and motor loops."),
  FLOW: def("FLOW", "Coolant Flow Sensor", "Sensor", "Thermal", "L/min", 1.0, [0.36, 0.36, 1.12], [0.14, 0.12, 0.16],
    "Turbine flow meter measuring coolant circulation."),
  CTEMP: def("CTEMP", "Coolant Temperature Sensor", "Sensor", "Thermal", "°C", 2.0, [0.42, 0.36, 0.7], [0.1, 0.1, 0.12],
    "NTC thermistor measuring coolant return temperature."),
  TEMP: def("TEMP", "Pack Temperature Sensor", "Sensor", "Thermal", "°C", 1.5, [-0.34, 0.43, -0.4], [0.14, 0.08, 0.14],
    "Distributed thermistor network monitoring pack thermal gradient."),
  MTEMP: def("MTEMP", "Motor Temperature Sensor", "Sensor", "Thermal", "°C", 2.0, [-0.4, 0.37, -1.4], [0.1, 0.12, 0.12],
    "Stator winding sensor measuring drive-unit temperature."),

  // Chassis
  WHEEL: def("WHEEL", "Wheel Speed Sensor", "Sensor", "Chassis", "km/h", 3.0, [0.7, 0.37, 1.4], [0.1, 0.14, 0.14],
    "Magnetic tone-ring sensor on the front right hub."),
  BRAKE: def("BRAKE", "Brake Control Unit", "Controller", "Chassis", "bar", 3.0, [-0.5, 0.52, 1.5], [0.28, 0.18, 0.2],
    "Stability and regenerative brake-blending actuator modulating hydraulic pressure."),
  PRESSURE: def("PRESSURE", "Brake Pressure Sensor", "Sensor", "Chassis", "bar", 3.0, [-0.28, 0.46, 1.28], [0.1, 0.12, 0.12],
    "Piezoresistive transducer on the master brake line."),
  EPS: def("EPS", "Steering Assist Actuator", "Actuator", "Chassis", "Nm", 1.0, [0, 0.36, 1.1], [0.95, 0.12, 0.12],
    "Rack-mounted servo applying steering torque assist."),
  ANGLE: def("ANGLE", "Steering Angle Sensor", "Sensor", "Chassis", "°", 2.0, [-0.36, 0.8, 0.52], [0.12, 0.12, 0.1],
    "Optical encoder on the column measuring steering wheel angle."),

  // Network
  CAN: def("CAN", "CAN Gateway Controller", "Controller", "Network", "ms", 10.0, [0, 0.6, 0.4], [0.28, 0.1, 0.2],
    "Central gateway routing messages between powertrain, chassis and body buses."),
};
