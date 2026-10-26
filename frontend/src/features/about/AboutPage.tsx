import {
  AlertOctagon,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Cpu,
  FlaskConical,
  Layers,
  Network,
  Radar,
  Radio,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
  Waypoints,
  Wrench
} from "lucide-react";
import { WorkspaceHeader } from "../../components/ui/WorkspaceHeader";

interface TeamMember {
  name: string;
  role: string;
  initials: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  { name: "Jinsu", role: "AI Architecture & Plant Emulation", initials: "JS" },
  { name: "Jerico Gris", role: "Digital Twin & Visual Engineering", initials: "JG" },
  { name: "Dishon Sam", role: "Graph Inference & Backend API", initials: "DS" },
  { name: "Mohamed Baasil", role: "Security Analysis & Benchmarking", initials: "MB" },
];

const ORIGIN_LAYERS = [
  {
    icon: Radio,
    title: "Sensors",
    example: "LIT101, FIT201",
    desc: "Sensor spoofing, analog drift, or replayed telemetry deceive operators into believing the plant is running within normal bounds.",
  },
  {
    icon: Network,
    title: "Communication Channels",
    example: "Modbus TCP, Fieldbus",
    desc: "Unauthenticated packet injection or MITM tampering alters control setpoints or reports false feedback frames across network hops.",
  },
  {
    icon: Cpu,
    title: "Controllers (PLCs)",
    example: "PLC-1, PLC-2 logic",
    desc: "Rogue ladder logic or hijacked setpoint registers cause PLCs to issue destructive physical commands while masking alarms.",
  },
  {
    icon: Wrench,
    title: "Firmware Components",
    example: "RTU / Gateway Code",
    desc: "Compromised device firmware or corrupted execution routines silently alter device behaviors beneath operating software layers.",
  },
  {
    icon: AlertOctagon,
    title: "Physical Actuators",
    example: "P101 pump, MV101 valve",
    desc: "Valve jamming, mechanical fatigue, pump cavitation, or physical tampering physically compromise fluid dynamics.",
  },
];

const PROTOTYPE_CAPABILITIES = [
  {
    icon: Radar,
    title: "Multi-Variate Anomaly Detection",
    detail: "Graph Deviation Networks (GDN) learn structural sensor correlations from normal plant operations to flag physical deviations.",
  },
  {
    icon: Waypoints,
    title: "Directional Origin Ranking",
    detail: "Combines residual forecast error, temporal onset sequencing, and physical flow topology to rank the most likely origin candidates.",
  },
  {
    icon: Layers,
    title: "Propagation Path Tracing",
    detail: "Traces how an anomaly at a single component (e.g. LIT101) cascades downstream into dependent pumps, valves, and downstream tanks.",
  },
  {
    icon: Shield,
    title: "Containment Recommendations",
    detail: "Suggests immediate isolation actions (e.g., fallback setpoints, pump trip, network isolation) before equipment suffers physical damage.",
  },
];

export function AboutPage() {
  return (
    <main id="main-workspace" tabIndex={-1} className="content-page bg-bg">
      <div className="page-container flex flex-col gap-5">
        <WorkspaceHeader current="/about" />

        {/* ══════════════════════════════════════════════════════════════════
            1. HERO SECTION: PROBLEM STATEMENT & HACKATHON CONTEXT
            ══════════════════════════════════════════════════════════════════ */}
        <section className="about-hero" aria-labelledby="about-hero-heading">
          <div className="about-hero-content">
            {/* Context Badge Strip */}
            <div className="about-badge-strip">
              <span className="about-badge-purple" title="Hackathon Problem Statement ID">
                PROBLEM ID · AI-07
              </span>
              <span className="about-badge-teal">
                SUSTAINATHON 2026
              </span>
              <span className="about-badge-accent">
                TEAM TECHWIZARDS
              </span>
              <span className="about-badge-status">
                <span className="about-pulse-dot" />
                CYBER-PHYSICAL SECURITY PROTOTYPE
              </span>
            </div>

            {/* Main Headline (Turquoise Glow) */}
            <h1 id="about-hero-heading" className="about-hero-title">
              The Attack-Localization Problem
            </h1>

            <p className="about-hero-lead">
              In cyber-physical critical infrastructure, detecting an anomaly is only the first step.
              The critical engineering dilemma is knowing <em>where</em> the attack originated,
              <em>which</em> component is compromised, and <em>how</em> the fault cascades across physical processes.
            </p>

            <div className="about-hero-meta">
              <div className="about-meta-item">
                <span className="about-meta-label">Project</span>
                <span className="about-meta-val">AttackTrace</span>
              </div>
              <div className="about-meta-divider" />
              <div className="about-meta-item">
                <span className="about-meta-label">Hackathon</span>
                <span className="about-meta-val">Sustainathon 2026</span>
              </div>
              <div className="about-meta-divider" />
              <div className="about-meta-item">
                <span className="about-meta-label">Problem Title</span>
                <span className="about-meta-val">The Attack-Localization Problem (AI-07)</span>
              </div>
              <div className="about-meta-divider" />
              <div className="about-meta-item">
                <span className="about-meta-label">Team</span>
                <span className="about-meta-val text-purple-300 font-semibold">TechWizards</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            2. THE PROBLEM STATEMENT: THE LOCALIZATION DILEMMA
            ══════════════════════════════════════════════════════════════════ */}
        <section className="about-section" aria-labelledby="problem-heading">
          <div className="about-section-header">
            <div className="about-icon-teal">
              <ShieldAlert size={20} aria-hidden />
            </div>
            <div>
              <h2 id="problem-heading" className="about-heading-teal">
                The Core Challenge: Localization Beyond Detection
              </h2>
              <p className="about-section-sub">
                Why standard intrusion detection systems leave industrial operators blind during active attacks.
              </p>
            </div>
          </div>

          {/* Core Problem Quote / Statement Card */}
          <div className="about-statement-card">
            <div className="about-statement-quote-mark" aria-hidden>&ldquo;</div>
            <p className="about-statement-text">
              Detecting an anomaly does not reveal whether it began in a <strong>sensor</strong>,
              a <strong>communication channel</strong>, a <strong>controller</strong>,
              a <strong>firmware component</strong>, or a <strong>physical actuator</strong>.
              Cybersecurity systems may identify abnormal behavior without showing where an attack
              originated or how it propagated through a cyber-physical system.
            </p>
          </div>

          {/* 5-Layer Origin Ambiguity Grid */}
          <div className="mt-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted mb-3 flex items-center gap-2">
              <span>5 Possible Failure Vectors in Critical Systems</span>
              <span className="h-px flex-1 bg-border/60" />
            </h3>

            <div className="about-origin-grid">
              {ORIGIN_LAYERS.map((layer) => {
                const Icon = layer.icon;
                return (
                  <div key={layer.title} className="about-origin-card">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="about-origin-icon-wrap">
                        <Icon size={16} aria-hidden />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text">{layer.title}</h4>
                        <span className="text-[11px] font-mono text-purple-300/80">{layer.example}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{layer.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            3. WHAT ATTACKTRACE DOES (CURRENT PROTOTYPE)
            ══════════════════════════════════════════════════════════════════ */}
        <section className="about-section" aria-labelledby="solution-heading">
          <div className="about-section-header">
            <div className="about-icon-teal">
              <Sparkles size={20} aria-hidden />
            </div>
            <div>
              <h2 id="solution-heading" className="about-heading-teal">
                What AttackTrace Does (Current Prototype)
              </h2>
              <p className="about-section-sub">
                How our prototype addresses the localization problem using a simulated municipal water treatment testbed.
              </p>
            </div>
          </div>

          <div className="about-overview-card">
            <p className="text-sm text-text leading-relaxed">
              The current <strong>AttackTrace prototype</strong> uses an industrial <strong>water-plant process simulation</strong> (and
              real-time Modbus telemetry) to actively <strong>detect physical anomalies</strong>, <strong>rank likely attack origins</strong>,
              and <strong>visualize how adversarial effects spread</strong> across cyber-physical equipment.
            </p>
          </div>

          <div className="about-capabilities-grid mt-4">
            {PROTOTYPE_CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <div key={cap.title} className="about-cap-card">
                  <div className="about-cap-header">
                    <div className="about-cap-icon-wrap">
                      <Icon size={18} aria-hidden />
                    </div>
                    <h3 className="text-sm font-bold text-text">{cap.title}</h3>
                  </div>
                  <p className="text-xs text-muted leading-relaxed mt-2.5">{cap.detail}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            4. SCOPE & ENGINEERING BOUNDARIES (HONEST EVALUATION)
            ══════════════════════════════════════════════════════════════════ */}
        <section className="about-section" aria-labelledby="scope-heading">
          <div className="about-section-header">
            <div className="about-icon-purple">
              <Layers size={20} aria-hidden />
            </div>
            <div>
              <h2 id="scope-heading" className="about-heading-purple">
                Prototype Scope &amp; Pragmatic Boundaries
              </h2>
              <p className="about-section-sub">
                Honest engineering boundaries: what this prototype proves vs. broader industry challenges.
              </p>
            </div>
          </div>

          <div className="about-boundary-grid">
            <div className="about-boundary-card verified">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-normal shrink-0" aria-hidden />
                <h3 className="text-sm font-semibold text-text">What This Prototype Demonstrates</h3>
              </div>
              <ul className="about-list">
                <li>Demonstrated on a calibrated 6-stage municipal water treatment simulation and live Modbus TCP testbed.</li>
                <li>Ranks root origin candidates when sensors (e.g. LIT101) or actuators (e.g. MV101, P101) are manipulated.</li>
                <li>Traces causal propagation graph paths in real-time, preventing alarms on downstream symptoms from misdirecting operators.</li>
                <li>Evaluated against the empirical HAI 20.07 dataset and synthetic multi-stage industrial cyber attacks.</li>
              </ul>
            </div>

            <div className="about-boundary-card scope">
              <div className="flex items-center gap-2 mb-2">
                <AlertOctagon size={16} className="text-purple-300 shrink-0" aria-hidden />
                <h3 className="text-sm font-semibold text-text">Broader Localization Challenges</h3>
              </div>
              <ul className="about-list">
                <li>Does not claim out-of-the-box operation across all industrial verticals without facility-specific P&amp;ID calibration.</li>
                <li>Distinguishing deep firmware rootkits from physical sensor failure requires specialized bus monitors and attestation hardware.</li>
                <li>Actuator mechanical wear can occasionally mirror slow cyber ramp attacks without dedicated mechanical telemetry.</li>
                <li>The water plant model proves the mathematical and causal localization pipeline, serving as a blueprint for wider industrial adoption.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            5. TEAM TECHWIZARDS & HACKATHON ROSTER
            ══════════════════════════════════════════════════════════════════ */}
        <section className="about-section" aria-labelledby="team-heading">
          <div className="about-section-header">
            <div className="about-icon-teal">
              <Users size={20} aria-hidden />
            </div>
            <div>
              <h2 id="team-heading" className="about-heading-teal">
                Team TechWizards
              </h2>
              <p className="about-section-sub">
                Built for Sustainathon 2026 under Problem Statement AI-07.
              </p>
            </div>
          </div>

          <div className="about-team-grid">
            {TEAM_MEMBERS.map((member) => (
              <div key={member.name} className="about-member-card">
                <div className="about-member-avatar" aria-hidden>
                  {member.initials}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text">{member.name}</h3>
                  <p className="text-xs text-muted mt-0.5">{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            6. QUICK ACTIONS & VERIFICATION
            ══════════════════════════════════════════════════════════════════ */}
        <section className="about-actions-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-text">Explore AttackTrace in Action</h2>
              <p className="text-xs text-muted mt-1">
                Interact with the live digital twin, launch simulated attacks, or inspect the causal process graph.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a href="/" className="about-cta-primary">
                <span>Process Monitoring</span>
                <ArrowRight size={14} aria-hidden />
              </a>
              <a href="/lab" className="about-cta-secondary">
                <FlaskConical size={14} aria-hidden />
                <span>Local Lab</span>
              </a>
              <a href="/metrics" className="about-cta-secondary">
                <Boxes size={14} aria-hidden />
                <span>Threat Metrics</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
