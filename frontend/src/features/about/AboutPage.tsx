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

const TEAM_MEMBERS = ["Jinsu", "Jerico Gris", "Dishon Sam", "Mohamed Baasil"];

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
    title: "Anomaly detection",
    detail: "A graph forecaster (GDN) learns normal plant behaviour and flags readings it cannot predict.",
  },
  {
    icon: Waypoints,
    title: "Origin ranking",
    detail: "Scores each tag by deviation size, how early it deviated, and its position in the process flow.",
  },
  {
    icon: Layers,
    title: "Propagation path",
    detail: "Shows how a fault at one tag (e.g. LIT101) reaches the pumps, valves and tanks downstream.",
  },
  {
    icon: Shield,
    title: "Containment",
    detail: "Isolates the suspected origin and substitutes a virtual sensor so the plant keeps running safely.",
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
            </div>

            {/* Main Headline (Turquoise Glow) */}
            <h1 id="about-hero-heading" className="about-hero-title">
              The Attack-Localization Problem
            </h1>

            <p className="about-hero-lead">
              In cyber-physical critical infrastructure, detecting an anomaly is only the first step.
              The critical engineering dilemma is knowing <em>where</em> the attack originated,{" "}
              <em>which</em> component is compromised, and <em>how</em> the fault cascades across physical processes.
            </p>

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
                Localization, not just detection
              </h2>
              <p className="about-section-sub">
                An alarm says something is wrong, not where it started.
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
              <span>Where an attack can start</span>
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
                What AttackTrace does
              </h2>
              <p className="about-section-sub">
                Demonstrated on a simulated three-stage water treatment plant.
              </p>
            </div>
          </div>

          <div className="about-overview-card">
            <p className="text-sm text-text leading-relaxed">
              AttackTrace watches water-plant telemetry (simulated, recorded HAI data, or a Modbus emulator),
              <strong> detects anomalies</strong>, <strong>ranks the likely origin</strong> and
              <strong> shows how the effect spread</strong> through the plant.
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
                Scope
              </h2>
              <p className="about-section-sub">
                What this prototype shows, and what it does not claim.
              </p>
            </div>
          </div>

          <div className="about-boundary-grid">
            <div className="about-boundary-card verified">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 size={16} className="text-normal shrink-0" aria-hidden />
                <h3 className="text-sm font-semibold text-text">Demonstrated</h3>
              </div>
              <ul className="about-list">
                <li>A three-stage water plant simulation and a Modbus TCP emulator.</li>
                <li>Origin ranking when sensors (LIT101) or actuators (MV101, P101) are manipulated.</li>
                <li>Evaluated on simulated attacks and the public HAI 20.07 dataset (see Metrics).</li>
              </ul>
            </div>

            <div className="about-boundary-card scope">
              <div className="flex items-center gap-2 mb-2">
                <AlertOctagon size={16} className="text-purple-300 shrink-0" aria-hidden />
                <h3 className="text-sm font-semibold text-text">Not claimed</h3>
              </div>
              <ul className="about-list">
                <li>Other plants need their own process graph and a clean baseline to train on.</li>
                <li>Firmware-level attacks are outside what process telemetry alone can see.</li>
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
            </div>
          </div>

          <ul className="about-team-grid">
            {TEAM_MEMBERS.map((name) => (
              <li key={name} className="about-member-card">
                <h3 className="text-sm font-bold text-text">{name}</h3>
              </li>
            ))}
          </ul>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            6. QUICK ACTIONS & VERIFICATION
            ══════════════════════════════════════════════════════════════════ */}
        <section className="about-actions-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-text">Try it</h2>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a href="/" className="about-cta-primary">
                <span>Monitoring</span>
                <ArrowRight size={14} aria-hidden />
              </a>
              <a href="/lab" className="about-cta-secondary">
                <FlaskConical size={14} aria-hidden />
                <span>Local Lab</span>
              </a>
              <a href="/metrics" className="about-cta-secondary">
                <Boxes size={14} aria-hidden />
                <span>Metrics</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
