export type EvViewMode = "exterior" | "xray" | "exploded" | "system" | "investigation";

export type CameraPreset = "iso" | "front" | "side" | "rear" | "top" | "reset";

export type SubsystemKind = "All" | "Energy" | "Powertrain" | "Thermal" | "Chassis" | "Network";

export interface Component3DDef {
  id: string;
  name: string;
  kind: "Sensor" | "Actuator" | "Controller";
  system: "Energy" | "Powertrain" | "Thermal" | "Chassis" | "Network";
  unit: string;
  tolerance: number;
  position: [number, number, number]; // [x, y, z] in meters
  explodedOffset: [number, number, number]; // translation vector in exploded view
  size: [number, number, number]; // bounding dimensions [width, height, depth]
  color: string;
  description: string;
}

export const SUBSYSTEM_COLORS: Record<string, string> = {
  Energy: "#00e5ff", // electric cyan
  Powertrain: "#ff9100", // electric amber / orange
  Thermal: "#00b0ff", // coolant light blue
  Chassis: "#76ff03", // dynamics lime green
  Network: "#d500f9", // CAN magenta / purple
};

export type ComponentId =
  | "PACK"
  | "CELL"
  | "BMS"
  | "CURRENT"
  | "SOC"
  | "DCDC"
  | "MOTOR"
  | "INV"
  | "VCU"
  | "RPM"
  | "PEDAL"
  | "COOL"
  | "FLOW"
  | "CTEMP"
  | "TEMP"
  | "MTEMP"
  | "WHEEL"
  | "BRAKE"
  | "PRESSURE"
  | "EPS"
  | "ANGLE"
  | "CAN";

export const COMPONENT_3D_DEFS: Record<ComponentId, Component3DDef> = {
  // Energy subsystem (Chassis skateboard battery pack)
  PACK: {
    id: "PACK",
    name: "High-Voltage Battery Pack",
    kind: "Sensor",
    system: "Energy",
    unit: "V",
    tolerance: 4.0,
    position: [0, 0.22, -0.05],
    explodedOffset: [0, -0.7, 0],
    size: [1.25, 0.16, 2.1],
    color: "#00e5ff",
    description: "Main 400V structural traction battery pack with sealed aluminum enclosure and internal contactors.",
  },
  CELL: {
    id: "CELL",
    name: "Cell Voltage Monitor",
    kind: "Sensor",
    system: "Energy",
    unit: "V",
    tolerance: 0.06,
    position: [0.28, 0.28, 0.25],
    explodedOffset: [0.3, -0.7, 0.25],
    size: [0.35, 0.1, 0.55],
    color: "#00e5ff",
    description: "Multi-channel cell supervisor tracking individual series module voltages and thermal balance.",
  },
  BMS: {
    id: "BMS",
    name: "Battery Management System",
    kind: "Controller",
    system: "Energy",
    unit: "% limit",
    tolerance: 5.0,
    position: [-0.35, 0.33, 0.72],
    explodedOffset: [-0.4, -0.5, 0.72],
    size: [0.28, 0.12, 0.22],
    color: "#00e5ff",
    description: "Primary battery controller managing state estimation, thermal protection limits, and pre-charge relays.",
  },
  CURRENT: {
    id: "CURRENT",
    name: "Pack Current Sensor",
    kind: "Sensor",
    system: "Energy",
    unit: "A",
    tolerance: 3.0,
    position: [0.32, 0.33, 0.75],
    explodedOffset: [0.4, -0.5, 0.75],
    size: [0.18, 0.1, 0.16],
    color: "#00e5ff",
    description: "Isolated Hall-effect current transducer measuring bidirectional traction and regenerative currents.",
  },
  SOC: {
    id: "SOC",
    name: "State of Charge Node",
    kind: "Sensor",
    system: "Energy",
    unit: "%",
    tolerance: 1.0,
    position: [0, 0.82, 0.45],
    explodedOffset: [0, 0.3, 0.45],
    size: [0.3, 0.08, 0.08],
    color: "#00e5ff",
    description: "Extended Kalman Filter SoC state estimator broadcast to driver digital instrument cluster.",
  },
  DCDC: {
    id: "DCDC",
    name: "DC/DC Converter",
    kind: "Actuator",
    system: "Energy",
    unit: "V",
    tolerance: 0.3,
    position: [-0.42, 0.42, 1.25],
    explodedOffset: [-0.5, 0.1, 1.35],
    size: [0.25, 0.14, 0.22],
    color: "#00e5ff",
    description: "High-efficiency buck converter stepping 400V down to 13.8V for auxiliary vehicle systems.",
  },

  // Powertrain subsystem
  MOTOR: {
    id: "MOTOR",
    name: "Traction Motor",
    kind: "Actuator",
    system: "Powertrain",
    unit: "Nm",
    tolerance: 8.0,
    position: [0, 0.32, -1.35],
    explodedOffset: [0, 0, -0.85],
    size: [0.42, 0.38, 0.45],
    color: "#ff9100",
    description: "High-torque permanent magnet synchronous rear traction drive unit.",
  },
  INV: {
    id: "INV",
    name: "Traction Inverter",
    kind: "Actuator",
    system: "Powertrain",
    unit: "kW",
    tolerance: 2.0,
    position: [0, 0.58, -1.35],
    explodedOffset: [0, 0.45, -0.85],
    size: [0.38, 0.18, 0.34],
    color: "#ff9100",
    description: "Silicon-carbide (SiC) pulse-width modulated power inverter regulating 3-phase AC motor currents.",
  },
  VCU: {
    id: "VCU",
    name: "Vehicle Control Unit",
    kind: "Controller",
    system: "Powertrain",
    unit: "Nm",
    tolerance: 8.0,
    position: [0.36, 0.65, 0.72],
    explodedOffset: [0.55, 0.45, 0.72],
    size: [0.24, 0.14, 0.2],
    color: "#ff9100",
    description: "Master supervisor translating driver pedal demand, cruise modes, and torque safety supervisory logic.",
  },
  RPM: {
    id: "RPM",
    name: "Motor Speed Sensor",
    kind: "Sensor",
    system: "Powertrain",
    unit: "rpm",
    tolerance: 120.0,
    position: [0.26, 0.32, -1.35],
    explodedOffset: [0.4, 0, -0.85],
    size: [0.12, 0.12, 0.14],
    color: "#ff9100",
    description: "High-resolution electromagnetic motor shaft resolver providing instantaneous rotor velocity.",
  },
  PEDAL: {
    id: "PEDAL",
    name: "Accelerator Position Sensor",
    kind: "Sensor",
    system: "Powertrain",
    unit: "%",
    tolerance: 3.0,
    position: [-0.35, 0.46, 0.76],
    explodedOffset: [-0.45, 0.1, 0.76],
    size: [0.12, 0.16, 0.14],
    color: "#ff9100",
    description: "Dual-redundant potentiometer accelerator pedal transducer detecting driver acceleration demand.",
  },

  // Thermal subsystem
  COOL: {
    id: "COOL",
    name: "Coolant Pump",
    kind: "Actuator",
    system: "Thermal",
    unit: "%",
    tolerance: 5.0,
    position: [0.48, 0.3, 1.25],
    explodedOffset: [0.75, 0, 1.35],
    size: [0.24, 0.22, 0.24],
    color: "#00b0ff",
    description: "Brushless variable-speed centrifugal pump circulating coolant through battery chiller and motor loops.",
  },
  FLOW: {
    id: "FLOW",
    name: "Coolant Flow Sensor",
    kind: "Sensor",
    system: "Thermal",
    unit: "L/min",
    tolerance: 1.0,
    position: [0.36, 0.3, 1.05],
    explodedOffset: [0.65, 0, 1.05],
    size: [0.14, 0.14, 0.16],
    color: "#00b0ff",
    description: "Turbine flowmeter measuring volumetric coolant circulation rate through high-voltage cooling loops.",
  },
  CTEMP: {
    id: "CTEMP",
    name: "Coolant Temperature Sensor",
    kind: "Sensor",
    system: "Thermal",
    unit: "°C",
    tolerance: 2.0,
    position: [0.26, 0.3, 0.85],
    explodedOffset: [0.55, 0, 0.85],
    size: [0.12, 0.12, 0.14],
    color: "#00b0ff",
    description: "High-precision NTC thermistor measuring coolant loop return temperature from heat exchanger.",
  },
  TEMP: {
    id: "TEMP",
    name: "Pack Temperature Sensor",
    kind: "Sensor",
    system: "Thermal",
    unit: "°C",
    tolerance: 1.5,
    position: [-0.22, 0.28, -0.25],
    explodedOffset: [-0.35, -0.7, -0.25],
    size: [0.16, 0.12, 0.18],
    color: "#00b0ff",
    description: "Distributed battery pack core temperature thermistor network monitoring thermal gradient.",
  },
  MTEMP: {
    id: "MTEMP",
    name: "Motor Temperature Sensor",
    kind: "Sensor",
    system: "Thermal",
    unit: "°C",
    tolerance: 2.0,
    position: [-0.25, 0.32, -1.35],
    explodedOffset: [-0.4, 0, -0.85],
    size: [0.14, 0.12, 0.14],
    color: "#00b0ff",
    description: "Stator winding thermal sensor measuring drive unit temperature under sustained torque loads.",
  },

  // Chassis & Dynamics subsystem
  WHEEL: {
    id: "WHEEL",
    name: "Wheel Speed Sensor",
    kind: "Sensor",
    system: "Chassis",
    unit: "km/h",
    tolerance: 3.0,
    position: [0.82, 0.32, 1.35],
    explodedOffset: [0.6, 0, 0.3],
    size: [0.15, 0.15, 0.18],
    color: "#76ff03",
    description: "Magnetic wheel hub tone-ring sensor measuring front right wheel rotational speed.",
  },
  BRAKE: {
    id: "BRAKE",
    name: "Brake Control Unit",
    kind: "Controller",
    system: "Chassis",
    unit: "bar",
    tolerance: 3.0,
    position: [-0.38, 0.65, 0.95],
    explodedOffset: [-0.6, 0.45, 0.95],
    size: [0.26, 0.22, 0.22],
    color: "#76ff03",
    description: "Electronic stability and regenerative brake blending actuator modulating hydraulic pressure.",
  },
  PRESSURE: {
    id: "PRESSURE",
    name: "Brake Pressure Sensor",
    kind: "Sensor",
    system: "Chassis",
    unit: "bar",
    tolerance: 3.0,
    position: [-0.32, 0.54, 0.95],
    explodedOffset: [-0.55, 0.35, 0.95],
    size: [0.12, 0.14, 0.14],
    color: "#76ff03",
    description: "Piezoresistive pressure transducer on primary master hydraulic braking line.",
  },
  EPS: {
    id: "EPS",
    name: "Steering Assist Actuator",
    kind: "Actuator",
    system: "Chassis",
    unit: "Nm",
    tolerance: 1.0,
    position: [0, 0.38, 1.15],
    explodedOffset: [0, 0.2, 0.6],
    size: [0.45, 0.16, 0.18],
    color: "#76ff03",
    description: "Rack-mounted electric power steering servo motor applying driver steering torque assist.",
  },
  ANGLE: {
    id: "ANGLE",
    name: "Steering Angle Sensor",
    kind: "Sensor",
    system: "Chassis",
    unit: "°",
    tolerance: 2.0,
    position: [-0.35, 0.76, 0.52],
    explodedOffset: [-0.45, 0.3, 0.52],
    size: [0.14, 0.14, 0.12],
    color: "#76ff03",
    description: "Dual optical encoder on steering column measuring driver steering wheel orientation.",
  },

  // Network & Communication
  CAN: {
    id: "CAN",
    name: "CAN Gateway Controller",
    kind: "Controller",
    system: "Network",
    unit: "ms",
    tolerance: 10.0,
    position: [0, 0.68, 0.58],
    explodedOffset: [0, 0.5, 0.58],
    size: [0.26, 0.14, 0.2],
    color: "#d500f9",
    description: "Central vehicle network gateway routing messages between Powertrain, Chassis, and Body CAN buses.",
  },
};
