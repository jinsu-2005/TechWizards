import {
  Send, X, Wrench, RefreshCw, Plus, ArrowDown, FileSearch,
  GitBranch, BookOpen, ArrowUpRight, Mic, MicOff, Volume2,
  Settings, Radio, AlertCircle, Activity, ListChecks,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { controlHaiReplay, getTopology, postAttack, postCopilotChat, postIsolate, postReset, setMode } from "../../lib/api";
import type { CopilotChatResponse, Incident, EvidenceEvent } from "../../lib/types";
import { useFreshness } from "../../app/useFreshness";
import { selectView, useLive } from "../../store/live";
import { useUi } from "../../store/ui";
import { CopilotAnswer } from "./CopilotAnswer";
import { useAccess } from "../auth/access";
import { useModalFocus } from "../../lib/useModalFocus";
import { useVoice, parseVoiceCommand, speak, stopSpeech } from "../../lib/voice";
import { startBrowserRecognition, startServerRecording } from "../../lib/voiceInput";
import { navigate } from "../../lib/navigation";
import { LiveVoicePanel } from "./LiveVoicePanel";
import { SCENARIO_LABEL } from "../../lib/scenarios";
import { parsePilotAction } from "../../lib/pilotActions";
import pilotIcon from "../../assets/ai-pilot-emblem.webp";

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  model?: string;
  actionNode?: string | null;
  suggestions?: string[];
  timestamp?: string;
  scope?: string;
  evidence?: EvidenceEvent[];
  retryText?: string;
  isError?: boolean;
}

const SOURCE_LABELS: Record<string, string> = {
  sim: "SIM · Local simulation",
  hai: "HAI · Dataset replay",
  live: "LIVE · Modbus monitoring",
};

function makeWelcome(scope: string): Message {
  return {
    id: "initial",
    sender: "copilot",
    scope,
    text: "### Investigation assistant\n\nCompare the ranked candidates, review available evidence, or ask about SIM, HAI and LIVE. Inferred origins and paths need corroboration. Operational checks must follow approved site procedures.",
    suggestions: ["Explain SIM, HAI and LIVE", "What evidence is missing?", "Compare the origin candidates"],
  };
}

export function CopilotDrawer({ selectedIncident: propIncident }: { selectedIncident?: Incident } = {}) {
  const voice = useVoice();
  const { canAdmin } = useAccess();
  const open = useUi((s) => s.copilotOpen);
  const setOpen = useUi((s) => s.setCopilotOpen);
  const latest = useLive(selectView);
  const selectedAsset = useUi((s) => s.selectedAsset);
  const storeIncident = useUi((s) => s.selectedIncident);
  const scenarioContext = useUi((s) => s.scenarioContext);
  const conn = useLive((s) => s.conn);
  const incident = propIncident ?? storeIncident ?? latest?.incident ?? null;

  const { stale, replaying } = useFreshness();
  const scope = `${latest?.mode ?? "unknown"}:${incident?.id ?? "none"}:${incident?.detected_at ?? ""}:${selectedAsset ?? "all"}:${replaying ? "replay" : "current"}`;
  const scopeRef = useRef(scope);

  const [messages, setMessages] = useState<Message[]>([makeWelcome(scope)]);
  const [pendingIsolation, setPendingIsolation] = useState<{ incidentId: string; node: string } | null>(null);

  useEffect(() => {
    scopeRef.current = scope;
    // Preserve conversation history across page navigation and asset changes;
    // only update the initial welcome card if the user hasn't chatted yet.
    setMessages((prev) => {
      if (prev.length <= 1 && prev[0]?.id === "initial") {
        return [makeWelcome(scope)];
      }
      return prev;
    });
    setPendingIsolation(null);
  }, [scope]);

  useEffect(() => {
    if (pendingIsolation && incident?.id === pendingIsolation.incidentId && incident.status === "contained") {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: "copilot",
          model: "system",
          text: `Containment verified by the simulation incident state for \`${pendingIsolation.node}\`.`,
          scope,
        },
      ]);
      setPendingIsolation(null);
    }
  }, [incident, pendingIsolation, scope]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isolating, setIsolating] = useState(false);
  const [acting, setActing] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"conversation" | "voice">("conversation");
  const [liveVoiceActive, setLiveVoiceActive] = useState(false);
  const [docked, setDocked] = useState(() => window.matchMedia("(min-width: 87.5rem)").matches);

  const stopListening = useRef<(() => void) | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const followRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [scope]);

  // Only abort active sessions when CopilotDrawer unmounts from the app, NOT on internal route navigation
  useEffect(() => {
    return () => {
      requestRef.current?.abort();
      stopListening.current?.();
      stopListening.current = null;
      stopSpeech();
    };
  }, []);

  useEffect(() => {
    const el = composerRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(Math.max(el.scrollHeight, 22), 140)}px`;
    }
  }, [input, open]);

  useEffect(() => {
    if (open && !messages.some((message) => message.id !== "initial")) {
      streamRef.current?.scrollTo({ top: 0, behavior: "instant" });
    } else if (open && followRef.current) {
      streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "instant" });
    }
  }, [messages, loading, open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 87.5rem)");
    const update = () => setDocked(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("aip-docked", open && docked);
    return () => document.body.classList.remove("aip-docked");
  }, [open, docked]);

  useModalFocus(open && !docked, dialogRef, () => setOpen(false), "#aip-tab-conversation");

  if (!open) return null;

  const starting = messages.length === 1 && messages[0]?.id === "initial";

  const prompts = incident ? [
    { icon: FileSearch, title: "Explain the suspected origin", question: "Explain the suspected origin and its supporting evidence" },
    { icon: GitBranch, title: "Compare alternative explanations", question: "Compare the origin candidates and alternative explanations" },
    { icon: BookOpen, title: "Find the evidence gaps", question: "What evidence is missing and what should I check next?" },
    { icon: ListChecks, title: "Recommend next checks", question: "What should I check next to distinguish the leading origins?" },
  ] : [
    { icon: Activity, title: "Summarize anomalies", question: "Summarize the current anomalies and cite the available evidence" },
    { icon: FileSearch, title: "Explain signal deviation", question: "Which current signals deviate from their baseline, and what supports that?" },
    { icon: GitBranch, title: "Trace likely cause", question: "Trace the likely cause and compare alternative explanations" },
    { icon: ListChecks, title: "Recommend next checks", question: "What should I check next, and what evidence is still missing?" },
  ];

  const handleSend = async (textToSend?: string, retry = false) => {
    const text = (textToSend ?? input).trim();
    if (!text || loading) return;

    const requestScope = scope;
    const userMsg: Message = {
      scope,
      id: String(Date.now()),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    followRef.current = true; setAtBottom(true);
    if (!retry) setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);
    const controller = new AbortController();
    requestRef.current = controller;
    const timeout = setTimeout(() => controller.abort(), 42000);

    try {
      const res: CopilotChatResponse = await postCopilotChat({
        message: text,
        incident_id: incident?.id ?? null,
        asset_id: selectedAsset,
        as_of: replaying ? latest?.t : null,
        history: messages
          .filter((m) => m.scope === scope && m.model !== "system")
          .slice(-12)
          .map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text.slice(0, 2000) })),
      }, controller.signal);

      if (scopeRef.current !== requestScope || requestRef.current !== controller) return;
      const aiMsg: Message = {
        scope: requestScope,
        id: String(Date.now() + 1),
        sender: "copilot",
        text: res.reply,
        model: res.model_used,
        actionNode: res.action_node,
        suggestions: res.suggestions,
        evidence: res.evidence,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      if (useVoice.getState().replySpeech) void speak(res.reply).catch((error: unknown) => setVoiceStatus(`Speech unavailable: ${String(error)}`));
    } catch (error) {
      if (scopeRef.current !== requestScope || requestRef.current !== controller) return;
      const isAbort = controller.signal.aborted;
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        sender: "copilot",
        isError: true,
        text: isAbort
          ? "Request cancelled or timed out. No action was executed."
          : error instanceof Error ? `AI Pilot request failed: ${error.message}. Retry when the backend is ready.` : "Unable to reach AI Pilot. Check the backend connection and retry.",
        timestamp: isAbort ? "Cancelled" : "Unavailable",
        retryText: text,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      clearTimeout(timeout);
      if (requestRef.current === controller) setLoading(false);
    }
  };

  const handleQuickAction = async (nodeId: string) => {
    if (!canAdmin || !incident || isolating || latest?.mode !== "sim" || stale || replaying || incident.ambiguous) return;
    setIsolating(true);
    try {
      const response = await postIsolate({ incident_id: incident.id, node_id: nodeId });
      if (!response.accepted) throw new Error(response.reason ?? "Request rejected");
      if (scopeRef.current !== scope) return;
      setPendingIsolation({ incidentId: incident.id, node: nodeId });
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: "copilot",
          text: `Simulation isolation accepted for \`${nodeId}\`. Waiting for the incident stream to verify containment.`,
          model: "system",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          sender: "copilot",
          isError: true,
          text: `Containment command failed: ${String(e)}`,
          model: "system",
          timestamp: "Failed",
        },
      ]);
    } finally {
      setIsolating(false);
    }
  };

  const resetChat = () => {
    requestRef.current?.abort(); requestRef.current = null; setLoading(false);
    setMessages([makeWelcome(scope)]); setInput(""); followRef.current = true; setAtBottom(true);
    composerRef.current?.focus();
  };

  const startListening = async () => {
    if (listening) { stopListening.current?.(); stopListening.current = null; setListening(false); setVoiceStatus("Processing transcript…"); return; }
    stopSpeech(); setVoiceStatus("Listening… Speak one command or question."); setListening(true);
    const onText = (text: string) => { setInput(text); setVoiceStatus(text ? "Transcript ready. Review it, then send." : "No speech recognized. Try again."); composerRef.current?.focus(); };
    const onError = (message: string) => { setVoiceStatus(message); setListening(false); stopListening.current = null; };
    const onEnd = () => { setListening(false); stopListening.current = null; };
    try {
      stopListening.current = voice.transcriptionProvider === "gemini"
        ? await startServerRecording(onText, onError, onEnd)
        : startBrowserRecognition(onText, onError, onEnd);
    } catch (error) { onError(error instanceof Error ? error.message : "Microphone unavailable."); }
  };

  const handleVoiceTabSwitch = (targetTab: "conversation" | "voice") => {
    setActiveTab(targetTab);
  };

  const parsedCommand = input.trim()
    ? parseVoiceCommand(input, useLive.getState().topology?.nodes.map((n) => n.id) ?? [])
    : null;
  const pilotAction = input.trim() ? parsePilotAction(input, useLive.getState().topology?.nodes ?? []) : null;
  const executeCommand = async () => {
    if (pilotAction) {
      if (acting || conn !== "live" || (pilotAction.kind !== "timeline" && (!canAdmin || stale || replaying))) return;
      const currentMode = latest?.mode ?? useLive.getState().status?.mode;
      if (pilotAction.kind === "attack" || pilotAction.kind === "reset") { if (currentMode !== "sim") return; }
      if (pilotAction.kind === "haiReplay" && currentMode !== "hai") return;
      const status = useLive.getState().status;
      if (pilotAction.kind === "source" && ((pilotAction.mode === "hai" && !status?.hai_available) || (pilotAction.mode === "live" && !status?.live_available))) return;
      setActing(true);
      try {
        let confirmation: string;
        if (pilotAction.kind === "source") {
          const result = await setMode(pilotAction.mode);
          useLive.getState().setStatus(result);
          useLive.getState().clear();
          useLive.getState().setTopology(await getTopology());
          useUi.getState().selectAsset(null);
          confirmation = `${pilotAction.label} accepted. Waiting for source readings.`;
        } else if (pilotAction.kind === "attack") {
          const result = await postAttack(pilotAction.request);
          confirmation = `${pilotAction.label} accepted. Test ID: ${result.attack_id}. Watch the process and incident panels for the effect.`;
        } else if (pilotAction.kind === "haiReplay") {
          await controlHaiReplay({ paused: pilotAction.paused });
          confirmation = `${pilotAction.label} accepted.`;
        } else if (pilotAction.kind === "timeline") {
          const live = useLive.getState();
          if (pilotAction.action === "pause") {
            if (!live.buffer.length) throw new Error("No timeline readings are available yet.");
            live.pause();
          } else if (pilotAction.action === "play") {
            if (live.cursor === null) throw new Error("The timeline is already showing current readings.");
            live.play();
          }
          else if (pilotAction.action === "live") live.goLive();
          else if (live.latest?.incident && live.buffer.some((item) => item.incident?.id === live.latest?.incident?.id)) live.replayIncident();
          else throw new Error("There is no current incident to replay.");
          confirmation = `${pilotAction.label} applied.`;
        } else {
          await postReset();
          useLive.getState().clear();
          confirmation = "Simulation reset accepted. Saved investigation records remain available.";
        }
        setMessages((previous) => [...previous, { id: crypto.randomUUID(), sender: "copilot", model: "system", text: confirmation, timestamp: new Date().toLocaleTimeString(), scope }]);
        useUi.getState().notify(confirmation, "success");
        setInput(""); setVoiceCommand("");
      } catch (error) {
        setMessages((previous) => [...previous, { id: crypto.randomUUID(), sender: "copilot", model: "system", isError: true, text: `Action failed: ${error instanceof Error ? error.message : String(error)}`, timestamp: "Failed", scope }]);
      } finally { setActing(false); }
      return;
    }
    if (!parsedCommand || parsedCommand.kind === "ask") return;
    if (parsedCommand.kind === "selectAsset") {
      useUi.getState().selectAsset(parsedCommand.asset);
      navigate(`/?asset=${encodeURIComponent(parsedCommand.asset)}`);
    } else if (parsedCommand.kind === "view") {
      useUi.getState().setView(parsedCommand.view);
      navigate("/");
    } else navigate(parsedCommand.path);
    setInput(""); setVoiceStatus(""); setOpen(false);
  };

  const modeLabel = latest?.mode ? SOURCE_LABELS[latest.mode] ?? latest.mode.toUpperCase() : "No source";
  const incidentLabel = incident ? `${incident.id.slice(0, 12)}… · ${incident.status}` : null;

  return (
    <>
      {!docked && <div
        data-dialog-backdrop
        className="fixed inset-0 z-40 bg-black/40"
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />}
      <div
        ref={dialogRef}
        onKeyDown={(event) => {
          if (docked && event.key === "Escape") setOpen(false);
        }}
        role={docked ? "complementary" : "dialog"}
        tabIndex={-1}
        aria-modal={docked ? undefined : true}
        aria-label="AI Pilot"
        className={`aip-drawer copilot-drawer fixed inset-y-0 right-0 z-50 flex h-dvh w-full flex-col border-l border-border bg-surface ${docked ? "aip-drawer-docked" : "aip-drawer-modal"}`}
      >
        {/* ── Header ── */}
        <div className="aip-header flex shrink-0 items-start justify-between gap-2 border-b border-border/80 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="aip-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/25">
              <img src={pilotIcon} alt="" className="aip-emblem" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="aip-brand-name text-sm font-semibold text-text">AI Pilot</span>
                {stale && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-suspect/15 px-1.5 py-0.5 text-[10px] font-medium text-suspect">
                    <AlertCircle size={10} aria-hidden /> Stale
                  </span>
                )}
                {replaying && (
                  <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-medium text-accent">Replay</span>
                )}
              </div>
              {/* Compact context strip */}
              <div className="aip-header-context mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted leading-tight">
                <span className="aip-source-label font-mono text-accent/80">{modeLabel}</span>
                <span className="truncate max-w-[16ch]">{stale ? "· Signal stale" : conn === "live" ? "· Receiving" : "· Connecting"}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <a
              href="/settings"
              onClick={() => setOpen(false)}
              className="copilot-icon-button"
              aria-label="AI Pilot settings"
              title="AI Pilot settings"
            >
              <Settings size={16} />
            </a>
            {!starting && <button
              type="button"
              className="copilot-icon-button"
              aria-label="New conversation"
              title="New conversation"
              onClick={resetChat}
            >
              <Plus size={16} />
            </button>}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="copilot-icon-button"
              aria-label="Close AI Pilot"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {activeTab === "voice" && voiceCommand && <div role="status" className="mx-3 mt-2 flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-text">
          <span className="min-w-0 flex-1">Heard: <strong>{voiceCommand}</strong></span>
          <button type="button" className="shrink-0 rounded bg-accent px-2 py-1 font-semibold text-on-accent" onClick={() => { setInput(voiceCommand); setVoiceCommand(""); setActiveTab("conversation"); }}>Review</button>
          <button type="button" aria-label="Dismiss voice command" onClick={() => setVoiceCommand("")}><X size={15} /></button>
        </div>}

        {/* ── Tab bar ── */}
        <div
          className="aip-tabs flex shrink-0 border-b border-border/60"
          role="tablist"
          aria-label="AI Pilot panels"
          onKeyDown={(event) => {
            if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === "Home" ? "conversation"
              : event.key === "End" ? "voice"
                : activeTab === "voice" ? "conversation" : "voice";
            setActiveTab(next);
            dialogRef.current?.querySelector<HTMLElement>(`#aip-tab-${next}`)?.focus();
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "conversation"}
            aria-controls="aip-panel-conversation"
            id="aip-tab-conversation"
            className={`aip-tab flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${activeTab === "conversation" ? "aip-tab-active text-accent border-b-2 border-accent" : "text-muted hover:text-text border-b-2 border-transparent"}`}
            onClick={() => handleVoiceTabSwitch("conversation")}
          >
            <img src={pilotIcon} alt="" className="aip-tab-emblem" /> Conversation
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "voice"}
            aria-controls="aip-panel-voice"
            id="aip-tab-voice"
            className={`aip-tab flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${activeTab === "voice" ? "aip-tab-active text-accent border-b-2 border-accent" : "text-muted hover:text-text border-b-2 border-transparent"}`}
            onClick={() => handleVoiceTabSwitch("voice")}
          >
            <Radio size={13} aria-hidden /> Live Voice
            {liveVoiceActive && (
              <span className="ml-1 h-2 w-2 rounded-full bg-normal animate-pulse" aria-label="session active" />
            )}
          </button>
        </div>

        {activeTab === "conversation" && (
          <div className="aip-context-card" role="group" aria-label="Current investigation context">
            <div><span>{latest?.mode === "sim" ? "Scenario" : "Context"}</span><strong>{latest?.mode === "sim" && scenarioContext ? SCENARIO_LABEL[scenarioContext.scenario] : incident ? "Incident investigation" : modeLabel}</strong></div>
            <div><span>{incident ? "Incident" : "Focus"}</span><strong>{incidentLabel ?? selectedAsset ?? (latest?.mode === "sim" ? scenarioContext?.target : null) ?? "All assets"}</strong></div>
          </div>
        )}

        {/* ── Ambiguity notice ── */}
        {incident?.ambiguous && activeTab === "conversation" && (
          <p className="shrink-0 border-b border-border px-5 py-2.5 text-xs leading-5 text-suspect">
            Competing origins remain unresolved. Compare the evidence before assigning an origin.
          </p>
        )}

        {/* ── Conversation panel container ── */}
        <div
          id="aip-panel-conversation"
          role="tabpanel"
          aria-labelledby="aip-tab-conversation"
          className={`flex-1 flex-col min-h-0 ${activeTab === "conversation" ? "flex" : "hidden"}`}
        >
          <div
            ref={streamRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                const near = el.scrollHeight - el.scrollTop - el.clientHeight < 64;
                followRef.current = near;
                setAtBottom(near);
              }}
              aria-label="AI Pilot conversation"
              aria-live="polite"
              aria-busy={loading}
              className="aip-conversation-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-5"
            >
              {/* Starting state */}
              {starting && (
                <div className="aip-start copilot-start">
                  <h2>{incident ? "Trace the signal" : "Ask AI Pilot"}</h2>
                  <div className="copilot-start-tasks">
                    {prompts.map(({ icon: Icon, title, question }) => (
                      <button key={title} onClick={() => { void handleSend(question); }}>
                        <span className="aip-task-icon"><Icon size={17} aria-hidden /></span>
                        <span><strong>{title}</strong></span>
                        <ArrowUpRight size={15} aria-hidden />
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted">You can also give commands, e.g. “launch sensor offset on LIT101 at -25”.</p>
                </div>
              )}

              {/* Messages */}
              {messages.filter((m) => m.id !== "initial").map((m) => (
                <div
                  key={m.id}
                  className={`aip-message-row flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Sender label */}
                  <div className={`mb-1 flex items-center gap-1.5 text-[11px] font-medium ${m.sender === "user" ? "flex-row-reverse text-muted" : "text-muted"}`}>
                    {m.sender === "user" ? (
                      <span>You</span>
                    ) : (
                      <>
                        <img src={pilotIcon} alt="" className="aip-message-emblem" />
                        <span className="text-accent/80">AI Pilot</span>
                        {m.model === "system" && (
                          <span className="rounded bg-surface px-1 text-[10px]">system</span>
                        )}
                      </>
                    )}
                    {m.timestamp && <span className="font-mono opacity-60">{m.timestamp}</span>}
                  </div>

                  <div
                    className={`copilot-message min-w-0 max-w-full rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.sender === "user"
                        ? "bg-accent text-on-accent font-medium shadow-sm"
                        : m.isError
                        ? "border border-suspect/30 bg-suspect/8 text-text"
                        : m.model === "system"
                        ? "border border-border/60 bg-bg/60 text-muted text-xs"
                        : "text-text"
                    }`}
                  >
                    {m.sender === "user" ? (
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    ) : (
                      <CopilotAnswer content={m.text} evidence={m.evidence} />
                    )}

                    {/* Isolation action */}
                    {canAdmin && m.actionNode && m.scope === scope && latest?.mode === "sim" && !stale && !replaying && !incident?.ambiguous && incident && incident.origin.some((c) => c.id === m.actionNode) && incident.status !== "closed" && incident.status !== "contained" && (
                      <div className="mt-3 pt-2.5 border-t border-border/50">
                        <button
                          type="button"
                          disabled={isolating || pendingIsolation !== null}
                          onClick={() => { if (m.actionNode) void handleQuickAction(m.actionNode); }}
                          className="flex w-full items-center justify-center gap-2 rounded-lg bg-origin/20 hover:bg-origin/30 border border-origin/60 py-2 text-xs font-bold text-origin transition-all shadow-sm active:scale-[0.98]"
                        >
                          <Wrench size={13} />
                          <span>{isolating ? "Requesting..." : pendingIsolation ? "Awaiting verification" : `Isolate ${m.actionNode}`}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Per-message actions */}
                  <div className="mt-1 flex items-center gap-1 px-1">
                    {m.sender === "copilot" && !m.retryText && !m.isError && (
                      <button
                        type="button"
                        className="min-h-8 rounded px-2 text-[11px] text-muted hover:text-accent"
                        title="Speak this answer"
                        aria-label="Speak this answer"
                        onClick={() => void speak(m.text).catch((error: unknown) => setVoiceStatus(`Speech unavailable: ${String(error)}`))}
                      >
                        <Volume2 size={13} />
                      </button>
                    )}
                  </div>

                  {m.retryText && (
                    <button
                      disabled={loading}
                      className="mt-2 inline-flex min-h-10 items-center gap-1.5 rounded border border-border px-3 text-xs disabled:opacity-50 hover:border-accent hover:text-accent"
                      onClick={() => { setMessages((items) => items.filter((item) => item.id !== m.id)); void handleSend(m.retryText, true); }}
                    >
                      <RefreshCw size={12} /> Retry
                    </button>
                  )}

                  {/* Suggestion pills */}
                  {m === messages[messages.length - 1] && !loading && m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[96%]">
                      {m.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(s)}
                          className="min-h-10 rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:bg-accent/15 hover:border-accent transition-colors text-left"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading state */}
              {loading && (
                <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-surface/70 px-3.5 py-3 text-xs text-muted">
                  <span className="flex gap-1" aria-hidden>
                    <span className="aip-dot" style={{ animationDelay: "0ms" }} />
                    <span className="aip-dot" style={{ animationDelay: "160ms" }} />
                    <span className="aip-dot" style={{ animationDelay: "320ms" }} />
                  </span>
                  <span>Thinking…</span>
                  <button
                    className="ml-auto text-xs underline hover:text-accent"
                    onClick={() => requestRef.current?.abort()}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Scroll-to-bottom button */}
            {!atBottom && (
              <button
                onClick={() => {
                  followRef.current = true;
                  streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "instant" });
                  setAtBottom(true);
                }}
                className="mx-auto my-1.5 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-bg px-3.5 text-xs hover:border-accent hover:text-accent"
              >
                <ArrowDown size={13} /> Latest
              </button>
            )}

            {/* ── Composer ── */}
            <div className="copilot-composer">
              {voiceStatus && (
                <div role="status" className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-surface/90 px-3 py-1.5 text-xs text-muted backdrop-blur-sm">
                  <span className="truncate">{voiceStatus}</span>
                  <button
                    type="button"
                    onClick={() => setVoiceStatus("")}
                    aria-label="Dismiss voice status"
                    className="shrink-0 p-0.5 text-muted hover:text-text rounded transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
              {pilotAction && (
                <div role="group" aria-label="Review AI Pilot action" className="mb-2 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-text">
                  <strong className="block">Review action</strong>
                  <span className="mt-1 block">{pilotAction.label}</span>
                  <span className="mt-1 block text-muted">{pilotAction.kind === "attack" ? "Simulation only." : pilotAction.kind === "reset" ? "Saved incidents are kept." : pilotAction.kind === "haiReplay" ? "Recorded data only." : pilotAction.kind === "timeline" ? "Changes only your view." : "Switches the data source."}</span>
                  <div className="mt-2 flex gap-2">
                    <button type="button" disabled={acting || conn !== "live" || (pilotAction.kind !== "timeline" && (!canAdmin || stale || replaying)) || ((pilotAction.kind === "attack" || pilotAction.kind === "reset") && latest?.mode !== "sim") || (pilotAction.kind === "haiReplay" && latest?.mode !== "hai") || (pilotAction.kind === "source" && pilotAction.mode === "hai" && !useLive.getState().status?.hai_available) || (pilotAction.kind === "source" && pilotAction.mode === "live" && !useLive.getState().status?.live_available)} onClick={() => void executeCommand()} className="rounded-md bg-accent px-3 py-1.5 font-semibold text-on-accent disabled:opacity-50">{acting ? "Working…" : "Confirm action"}</button>
                    <button type="button" onClick={() => setInput("")} className="rounded-md border border-border px-3 py-1.5">Cancel</button>
                  </div>
                  {!canAdmin && pilotAction.kind !== "timeline" && <p className="mt-1 text-muted">Requires an administrator.</p>}
                  {(stale || replaying || conn !== "live") && pilotAction.kind !== "timeline" && <p className="mt-1 text-muted">Return to live readings first.</p>}
                </div>
              )}
              {!pilotAction && parsedCommand && parsedCommand.kind !== "ask" && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs text-accent">
                  <span className="truncate font-medium">{parsedCommand.kind === "selectAsset" ? `Focus asset ${parsedCommand.asset}` : `Open ${parsedCommand.label}`}</span>
                  <button type="button" className="shrink-0 rounded-lg bg-accent px-2.5 py-1 text-[11px] font-semibold text-on-accent hover:brightness-110 active:scale-95 transition-all" onClick={executeCommand}>
                    Open view
                  </button>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (pilotAction) return;
                  if (parsedCommand?.kind === "ask") void handleSend(); else void executeCommand();
                }}
                className="copilot-composer-box flex flex-col justify-between"
              >
                {/* Top row: Input on left, vertical divider + mic + circular send on right */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <textarea
                      ref={composerRef}
                      rows={1}
                      aria-label="Message to AI Pilot"
                      maxLength={4000}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                          e.preventDefault();
                          if (pilotAction) return;
                          if (parsedCommand?.kind === "ask") void handleSend(); else void executeCommand();
                        }
                      }}
                      placeholder="Ask AI Pilot…"
                      className="w-full resize-none border-0 bg-transparent p-0 text-[13.5px] leading-relaxed text-text placeholder:text-muted/60 focus:outline-none focus:ring-0"
                      style={{ minHeight: "22px", maxHeight: "140px" }}
                    />
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="h-4.5 w-[1px] bg-border" aria-hidden="true" />
                    <button
                      type="button"
                      aria-label={listening ? "Stop recording" : "Start voice input"}
                      aria-pressed={listening}
                      title={listening ? "Stop recording" : "Start voice input"}
                      onClick={() => void startListening()}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95 ${
                        listening
                          ? "bg-suspect text-on-accent shadow-[0_0_12px_rgba(var(--suspect-rgb),0.55)] ring-2 ring-suspect/30 hover:scale-105"
                          : "text-muted hover:text-text hover:bg-border/30"
                      }`}
                    >
                      {listening ? <MicOff size={16} className="animate-pulse" /> : <Mic size={17} />}
                    </button>
                    <button
                      type="submit"
                      disabled={!input.trim() || loading || !!pilotAction || parsedCommand?.kind !== "ask"}
                      aria-label="Send message"
                      className="copilot-send-btn flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-40 disabled:hover:shadow-none disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      ) : (
                        <Send size={14} className="translate-x-[0.5px] -translate-y-[0.5px]" />
                      )}
                    </button>
                  </div>
                </div>

                {listening && (
                <div className="flex items-center gap-2 mt-2 pt-0.5">
                    <div className="ml-auto flex items-center gap-1.5 rounded-full bg-suspect/10 border border-suspect/25 px-2 py-0.5 text-[11px] font-medium text-suspect">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-suspect opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-suspect" />
                      </span>
                      <span>Listening…</span>
                    </div>
                </div>
                )}
              </form>
            </div>
        </div>

        {/* ── Live Voice panel ── */}
        <div
          id="aip-panel-voice"
          role="tabpanel"
          aria-labelledby="aip-tab-voice"
          className={`flex-1 flex-col min-h-0 ${activeTab === "voice" ? "flex" : "hidden"}`}
        >
          <LiveVoicePanel active={activeTab === "voice"} onSessionChange={setLiveVoiceActive} onUserTranscript={(text) => { if (parsePilotAction(text, useLive.getState().topology?.nodes ?? [])) setVoiceCommand(text); }} />
        </div>
      </div>
    </>
  );
}
