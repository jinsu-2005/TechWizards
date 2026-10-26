# EV workspace

The top-level Water Plant / EV Vehicle switch opens an isolated EV workspace at `/ev`. Existing water plant routes, data sources, backend endpoints, and operational controls are retained.

## Working implementation

- Vehicle twin: keyboard-accessible component selection and visible fault origin / downstream states.
- Components: searchable, filterable inventory of 12 sensors, actuators, and controllers.
- Telemetry: a 1 Hz local deterministic simulator with 60-sample charts. Pause freezes sampling; reset clears the scenario and history. Speed and component selection persist locally; the simulator only advances while its workspace is mounted.
- Fault lab: temperature sensor bias, wheel-speed dropout, CAN delay, and coolant pump failure. Fault paths are predefined simulation relationships, not learned diagnoses.
- EV AI Pilot: a separate rule-based diagnostic preview with prompts and free-text input. Each answer includes the current scenario and sample timestamp. It does not call the water plant AI or control hardware. Conversation is scoped to the mounted pilot view.

## Product direction

Use the vehicle twin as the investigation surface: choose a component, compare reported and reference signals, trace controller responses, and ask the pilot for a source-linked explanation. Distinguish known injected origins from inferred causes when a real detector is added. Keep operational modes and data provenance visible at all times.

Future hardware integration needs an authenticated, read-only telemetry adapter, explicit signal definitions/units/timestamps, freshness and quality indicators, recorded EV datasets, and a validated vehicle model. Integrate an EV-specific backend diagnosis endpoint before labeling pilot responses as model-generated. The current curves and scenarios are illustrative and are not a validated EV physics or cybersecurity model.

The EV state store does not import water plant controls or invoke plant API mutations. The existing water plant stream remains connected globally as before.
