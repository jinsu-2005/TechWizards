import {
  Send, X, Wrench, RefreshCw, Plus, ArrowDown, FileSearch,
  GitBranch, BookOpen, ArrowUpRight, Mic, MicOff, Volume2,
  VolumeX, Settings, Sparkles, Radio, AlertCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { postCopilotChat, postIsolate } from "../../lib/api";
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

export function CopilotDrawer({ selectedIncident }: { selectedIncident?: Incident } = {}) {
  const voice = useVoice();
  const { canAdmin } = useAccess();
  const open = useUi((s) => s.copilotOpen);
  const setOpen = useUi((s) => s.setCopilotOpen);
  const latest = useLive(selectView);
  const selectedAsset = useUi((s) => s.selectedAsset);
  const incident = selectedIncident ?? latest?.incident ?? null;

  const { stale, replaying } = useFreshness();
  const scope = `${latest?.mode ?? "unknown"}:${incident?.id ?? "none"}:${incident?.detected_at ?? ""}:${selectedAsset ?? "all"}:${replaying ? "replay" : "current"}`;
  const scopeRef = useRef(scope);

  const [messages, setMessages] = useState<Message[]>([makeWelcome(scope)]);
  const [pendingIsolation, setPendingIsolation] = useState<{ incidentId: string; node: string } | null>(null);

  useEffect(() => {
    scopeRef.current = scope;
    setMessages([makeWelcome(scope)]);
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
  const [listening, setListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"conversation" | "voice">("conversation");
  const [liveVoiceActive, setLiveVoiceActive] = useState(false);

  const stopListening = useRef<(() => void) | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  const streamRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const followRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    setLoading(false);
    return () => {
      requestRef.current?.abort();
      stopListening.current?.();
      stopListening.current = null;
      stopSpeech();
    };
  }, [scope, open]);

  useEffect(() => {
    const el = composerRef.current;
    if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 160)}px`; }
  }, [input, open]);

  useEffect(() => {
    if (open && !messages.some((message) => message.id !== "initial")) {
      streamRef.current?.scrollTo({ top: 0, behavior: "instant" });
    } else if (open && followRef.current) {
      streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "instant" });
    }
  }, [messages, loading, open]);

  useModalFocus(open, dialogRef, () => setOpen(false), "#aip-tab-conversation");

  if (!open) return null;

  const starting = messages.length === 1 && messages[0]?.id === "initial";

  const prompts = incident ? [
    { icon: FileSearch, title: "Explain the suspected origin", detail: "See what supports the leading candidate", question: "Explain the suspected origin and its supporting evidence" },
    { icon: GitBranch, title: "Compare alternative explanations", detail: "Separate competing origins and benign faults", question: "Compare the origin candidates and alternative explanations" },
    { icon: BookOpen, title: "Find the evidence gaps", detail: "Understand what this case cannot establish", question: "What evidence is missing and what should I check next?" },
  ] : [
    { icon: BookOpen, title: "Understand the data sources", detail: "Simulation, HAI replay and Modbus monitoring", question: "Explain SIM, HAI and LIVE" },
    { icon: FileSearch, title: "Know what evidence is missing", detail: "Learn the limits of process telemetry", question: "What evidence is missing?" },
    { icon: GitBranch, title: "Start an investigation", detail: "A practical path from anomaly to evidence", question: "How do I investigate an anomaly and compare possible origins?" },
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
    } catch {
      if (scopeRef.current !== requestScope || requestRef.current !== controller) return;
      const isAbort = controller.signal.aborted;
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        sender: "copilot",
        isError: true,
        text: isAbort
          ? "Request cancelled or timed out. No action was executed."
          : "Unable to reach AI Pilot. Check the local backend connection and retry.",
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
  const executeCommand = () => {
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
  const incidentLabel = incident
    ? `${incident.id.slice(0, 12)}… · ${incident.status}`
    : selectedAsset ? `Asset: ${selectedAsset}` : "General guidance";

  return (
    <>
      <div
        data-dialog-backdrop
        className="fixed inset-0 z-40 bg-black/40"
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />
      <div
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-label="AI Pilot"
        className="aip-drawer copilot-drawer fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-[640px] flex-col border-l border-border bg-surface shadow-2xl"
      >
        {/* ── Header ── */}
        <div className="aip-header flex shrink-0 items-start justify-between gap-2 border-b border-border/80 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="aip-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/25">
              <Sparkles size={18} aria-hidden />
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
                <span aria-hidden className="text-border">/</span>
                <span className="truncate max-w-[26ch]">{incidentLabel}</span>
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
            <button
              type="button"
              className="copilot-icon-button"
              aria-label="New conversation"
              title="New conversation"
              onClick={resetChat}
            >
              <Plus size={16} />
            </button>
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

        {/* ── Tab bar ── */}
        <div className="aip-tabs flex shrink-0 border-b border-border/60" role="tablist" aria-label="AI Pilot panels">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "conversation"}
            aria-controls="aip-panel-conversation"
            id="aip-tab-conversation"
            className={`aip-tab flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${activeTab === "conversation" ? "aip-tab-active text-accent border-b-2 border-accent" : "text-muted hover:text-text border-b-2 border-transparent"}`}
            onClick={() => handleVoiceTabSwitch("conversation")}
          >
            <Sparkles size={13} aria-hidden /> Conversation
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
                  <div className="aip-start-visual" aria-hidden="true">
                    <span className="aip-start-orbit aip-start-orbit-outer" />
                    <span className="aip-start-orbit aip-start-orbit-inner" />
                    <span className="copilot-start-icon"><Sparkles size={25} /></span>
                    <span className="aip-orbit-point aip-orbit-point-one" />
                    <span className="aip-orbit-point aip-orbit-point-two" />
                  </div>
                  <p className="aip-kicker">SIGNAL / CONTEXT / EVIDENCE</p>
                  <h2>{incident ? "Trace the signal." : "From signal to evidence."}</h2>
                  <p className="copilot-start-description">
                    {incident
                      ? "Compare origin hypotheses, inspect saved evidence, and choose the next check."
                      : "Ask a question about your process. AI Pilot keeps claims grounded in what AttackTrace can actually observe."}
                  </p>
                  <div className="aip-start-divider"><span>EXPLORE A PATH</span><span>01 / 03</span></div>
                  <div className="copilot-start-tasks">
                    {prompts.map(({ icon: Icon, title, detail, question }, index) => (
                      <button key={title} onClick={() => { void handleSend(question); }}>
                        <span className="aip-task-index">0{index + 1}</span>
                        <span className="aip-task-icon"><Icon size={17} aria-hidden /></span>
                        <span><strong>{title}</strong><small>{detail}</small></span>
                        <ArrowUpRight size={15} aria-hidden />
                      </button>
                    ))}
                  </div>
                  <a className="copilot-checklist" href="/api/runbooks/local" target="_blank" rel="noreferrer">
                    <BookOpen size={14} aria-hidden />
                    Open the local investigation checklist
                    <ArrowUpRight size={13} aria-hidden />
                  </a>
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
                        <Sparkles size={11} aria-hidden className="text-accent/70" />
                        <span className="text-accent/80">AI Pilot</span>
                        {m.model && m.model !== "evidence-summary" && m.model !== "system" && (
                          <span className="aip-model-tag" title={m.model}>GEMINI · {m.model.replace("gemini-", "")}</span>
                        )}
                        {m.model === "evidence-summary" && <span className="aip-model-tag aip-model-local">LOCAL EVIDENCE</span>}
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
                          <span>{isolating ? "Requesting..." : pendingIsolation ? "Awaiting verification" : `Request simulation isolation: ${m.actionNode}`}</span>
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
                  <span>AI Pilot is analyzing the evidence…</span>
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
            <div className="copilot-composer border-t border-border/70 p-3 bg-surface">
              {voiceStatus && (
                <p role="status" className="mb-2 rounded-md bg-bg px-3 py-2 text-xs text-muted">
                  {voiceStatus}
                </p>
              )}
              {parsedCommand && parsedCommand.kind !== "ask" && (
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-accent/50 bg-accent/5 px-3 py-2 text-xs">
                  <span>{parsedCommand.kind === "selectAsset" ? `Focus asset ${parsedCommand.asset}` : `Open ${parsedCommand.label}`}</span>
                  <button type="button" className="min-h-10 rounded-md bg-accent px-3 font-semibold text-on-accent" onClick={executeCommand}>Open view</button>
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (parsedCommand?.kind === "ask") void handleSend(); else executeCommand();
                }}
                className="flex items-end gap-2"
              >
                <textarea
                  ref={composerRef}
                  rows={2}
                  aria-describedby="aip-composer-help"
                  aria-label="Message to AI Pilot"
                  maxLength={4000}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) {
                      e.preventDefault();
                      if (parsedCommand?.kind === "ask") void handleSend(); else executeCommand();
                    }
                  }}
                  placeholder="Ask about evidence, candidates, or next checks…"
                  className="max-h-40 min-h-12 resize-none min-w-0 flex-1 rounded-lg border border-border bg-bg/90 px-3 py-2 text-sm leading-6 text-text placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent/30 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  aria-label={listening ? "Stop recording" : "Start voice input"}
                  aria-pressed={listening}
                  title={listening ? "Stop recording" : "Start voice input"}
                  onClick={() => void startListening()}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${listening ? "border-suspect text-suspect" : "border-border text-muted hover:text-accent hover:border-accent"} transition-colors`}
                >
                  {listening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>
                <button
                  type="button"
                  aria-label="Stop speaking"
                  title="Stop speaking"
                  onClick={stopSpeech}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted hover:text-accent transition-colors"
                >
                  <VolumeX size={16} />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || loading || parsedCommand?.kind !== "ask"}
                  aria-label="Send message"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent transition-all hover:bg-accent/90 disabled:opacity-40 shadow-sm"
                >
                  <Send size={14} />
                </button>
              </form>
              <p id="aip-composer-help" className="mt-1.5 text-[11px] text-muted">
                Review voice transcripts before sending. Enter to send · Shift+Enter for a new line.
              </p>
            </div>
        </div>

        {/* ── Live Voice panel ── */}
        <div
          id="aip-panel-voice"
          role="tabpanel"
          aria-labelledby="aip-tab-voice"
          className={`flex-1 flex-col min-h-0 ${activeTab === "voice" ? "flex" : "hidden"}`}
        >
          <LiveVoicePanel active={activeTab === "voice"} onSessionChange={setLiveVoiceActive} />
        </div>
      </div>
    </>
  );
}
