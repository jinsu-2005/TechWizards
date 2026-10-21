import { Bot, Send, X, Wrench, RefreshCw, Plus, ArrowDown, FileSearch, GitBranch, BookOpen, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { postCopilotChat, postIsolate } from "../../lib/api";
import type { CopilotChatResponse, Incident, EvidenceEvent } from "../../lib/types";
import { useFreshness } from "../../app/useFreshness";
import { selectView, useLive } from "../../store/live";
import { useUi } from "../../store/ui";
import { CopilotAnswer } from "./CopilotAnswer";
import { useAccess } from "../auth/access";
import { useModalFocus } from "../../lib/useModalFocus";

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
}

export function CopilotDrawer({ selectedIncident }: { selectedIncident?: Incident } = {}) {
  const { canAdmin } = useAccess();
  const open = useUi((s) => s.copilotOpen);
  const setOpen = useUi((s) => s.setCopilotOpen);
  const latest = useLive(selectView);
  const selectedAsset = useUi((s) => s.selectedAsset);
  const incident = selectedIncident ?? latest?.incident ?? null;

  const { stale, replaying } = useFreshness();
  const scope = `${latest?.mode ?? "unknown"}:${incident?.id ?? "none"}:${incident?.detected_at ?? ""}:${selectedAsset ?? "all"}:${replaying ? "replay" : "current"}`;
  const scopeRef = useRef(scope);
  const welcome: Message = { id: "initial", sender: "copilot", text: "### Investigation assistant\n\nCompare the ranked candidates, review available evidence, or ask about SIM, HAI and LIVE. Inferred origins and paths need corroboration. Operational checks must follow approved site procedures.", suggestions: ["Explain SIM, HAI and LIVE", "What evidence is missing?", "Compare the origin candidates"] };
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [pendingIsolation, setPendingIsolation] = useState<{ incidentId: string; node: string } | null>(null);
  useEffect(() => {
    scopeRef.current = scope;
    setMessages([{ id: "initial", sender: "copilot", text: "### Investigation assistant\n\nThis conversation is scoped to the selected source and incident. Ask about evidence, alternatives, or data modes.", suggestions: ["Explain SIM, HAI and LIVE", "What evidence is missing?", "Compare the origin candidates"] }]);
    setPendingIsolation(null);
  }, [scope]);
  useEffect(() => {
    if (pendingIsolation && incident?.id === pendingIsolation.incidentId && incident.status === "contained") {
      setMessages((prev) => [...prev, { id: String(Date.now()), sender: "copilot", model: "system", text: `Containment verified by the simulation incident state for \`${pendingIsolation.node}\`.`, scope }]);
      setPendingIsolation(null);
    }
  }, [incident, pendingIsolation, scope]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isolating, setIsolating] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<AbortController | null>(null);
  useEffect(() => {
    setLoading(false);
    return () => { requestRef.current?.abort(); };
  }, [scope, open]);

  useModalFocus(open, dialogRef, () => setOpen(false), "textarea");

  const streamRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const followRef = useRef(true);
  const [atBottom, setAtBottom] = useState(true);
  useEffect(() => {
    const el = composerRef.current;
    if (el) { el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 160)}px`; }
  }, [input, open]);
  useEffect(() => {
    if (open && followRef.current) streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "instant" });
  }, [messages, loading, open]);

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
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const res: CopilotChatResponse = await postCopilotChat({
        message: text,
        incident_id: incident?.id ?? null,
        asset_id: selectedAsset,
        as_of: replaying ? latest?.t : null,
        history: messages.filter((m) => m.scope === scope && m.model !== "system").slice(-12).map((m) => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text.slice(0, 2000) })),
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
    } catch {
      if (scopeRef.current !== requestScope || requestRef.current !== controller) return;
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        sender: "copilot",
        text: controller.signal.aborted ? "Request cancelled or timed out. You can retry; no action was executed." : "Unable to reach the investigation assistant. Check the local backend connection and retry.",
        timestamp: controller.signal.aborted ? "Cancelled" : "Unavailable",
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
    setMessages([welcome]); setInput(""); followRef.current = true; setAtBottom(true);
    composerRef.current?.focus();
  };
  return (
    <>
      <div data-dialog-backdrop className="fixed inset-0 z-40 bg-black/40" aria-hidden="true" onClick={() => setOpen(false)} />
    <div
      ref={dialogRef}
      role="dialog"
        tabIndex={-1}
      aria-modal="true"
      aria-label="AI Industrial Copilot"
      className="copilot-drawer fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-[600px] flex-col border-l border-border bg-surface shadow-2xl "
    >
      {/* Header */}
      <div className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-border/80 px-4 py-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent border border-accent/30 shadow-inner">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-semibold text-text">Investigation copilot</span>

            </div>
            <p className="text-xs text-muted">Evidence, alternatives and next checks</p>
          </div>
        </div>
        <div className="flex gap-1"><button type="button" className="copilot-icon-button" aria-label="New conversation" title="New conversation" onClick={resetChat}><Plus size={17} /></button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="copilot-icon-button"
          aria-label="Close"
        >
          <X size={16} />
        </button></div>
      </div>

      <div className="copilot-context"><span className="copilot-context-source">{latest?.mode?.toUpperCase() ?? "Workspace"}</span><span>{incident ? `Case ${incident.id.slice(0, 12)}…` : "General guidance"}{selectedAsset ? ` · ${selectedAsset}` : ""}</span><span className="text-muted">{latest?.mode === "sim" ? "Simulation only" : "Read-only advice"}{stale ? " · Stale" : ""}{replaying ? " · Replay" : ""}</span></div>
      {incident?.ambiguous && <p className="shrink-0 border-b border-border px-5 py-3 text-xs leading-5 text-suspect">Competing origins remain unresolved. Compare the evidence before assigning an origin.</p>}

      {/* Message Stream */}
      <div ref={streamRef} onScroll={(e) => { const el = e.currentTarget; const near = el.scrollHeight - el.scrollTop - el.clientHeight < 64; followRef.current = near; setAtBottom(near); }} role="log" aria-label="Copilot conversation" aria-live="polite" aria-busy={loading} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 space-y-7">
        {starting && <div className="copilot-start"><span className="copilot-start-icon"><Bot size={25} aria-hidden /></span><p className="text-xs font-medium uppercase tracking-wider text-accent">Investigation assistant</p><h2>{incident ? "Make sense of this incident" : "Start with a better question"}</h2><p className="copilot-start-description">{incident ? "Explore the saved evidence, compare explanations, and identify the next useful check." : "Understand your sources and evidence before treating an anomaly as a confirmed attack."}</p><div className="copilot-start-tasks">{prompts.map(({ icon: Icon, title, detail, question }) => <button key={title} onClick={() => { void handleSend(question); }}><Icon size={19} aria-hidden /><span><strong>{title}</strong><small>{detail}</small></span><ArrowUpRight size={16} aria-hidden /></button>)}</div><a className="copilot-checklist" href="/api/runbooks/local" target="_blank" rel="noreferrer"><BookOpen size={15} aria-hidden />Open the local investigation checklist<ArrowUpRight size={14} aria-hidden /></a></div>}
        {messages.filter((m) => m.id !== "initial").map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`copilot-message min-w-0 max-w-full rounded-xl px-4 py-3 text-sm leading-relaxed ${
                m.sender === "user"
                  ? "bg-accent text-on-accent font-medium shadow-md"
                  : "text-text"
              }`}
            >
              {m.sender === "user" ? (
                <div className="whitespace-pre-wrap">{m.text}</div>
              ) : (
                <>
                <CopilotAnswer content={m.text} evidence={m.evidence} />
                </>
              )}

              {/* Action Recommendation Button */}
              {canAdmin && m.actionNode && m.scope === scope && latest?.mode === "sim" && !stale && !replaying && !incident?.ambiguous && incident && incident.origin.some((c) => c.id === m.actionNode) && incident.status !== "closed" && incident.status !== "contained" && (
                <div className="mt-3 pt-2.5 border-t border-border/50">
                  <button
                    type="button"
                    disabled={isolating || pendingIsolation !== null}
                    onClick={() => { if (m.actionNode) void handleQuickAction(m.actionNode); }}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-origin/20 hover:bg-origin/30 border border-origin/60 py-2 text-xs font-bold text-origin transition-all shadow-sm active:scale-[0.98]"
                  >
                    <Wrench size={14} />
                    <span>{isolating ? "Requesting..." : pendingIsolation ? "Awaiting verification" : `Request simulation isolation: ${m.actionNode}`}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2 px-1 text-[11px] font-mono text-muted">
              {m.model && <span>via {m.model}</span>}
              {m.timestamp && <span>{m.timestamp}</span>}
            </div>

            {m.retryText && <button disabled={loading} className="mt-2 min-h-10 rounded border border-border px-3 text-sm disabled:opacity-50" onClick={() => { setMessages((items) => items.filter((item) => item.id !== m.id)); void handleSend(m.retryText, true); }}>Retry response</button>}
            {/* Suggestions Pills */}
            {m === messages[messages.length - 1] && !loading && m.suggestions && m.suggestions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5 max-w-[96%]">
                {m.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(s)}
                    className="min-h-10 rounded-lg border border-border px-3 py-2 text-xs text-muted hover:bg-accent/20 hover:border-accent transition-colors text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-surface/80 p-3 text-xs text-muted font-mono animate-pulse">
            <RefreshCw size={13} className="animate-spin text-accent" />
            <span>Preparing an evidence-based response...</span>
            <button className="ml-auto underline" onClick={() => requestRef.current?.abort()}>Cancel</button>
          </div>
        )}

      </div>

      {!atBottom && <button onClick={() => { followRef.current = true; streamRef.current?.scrollTo({ top: streamRef.current.scrollHeight, behavior: "instant" }); setAtBottom(true); }} className="mx-auto my-2 inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-bg px-4 text-xs"><ArrowDown size={14} />Latest messages</button>}
      {/* Input Box */}
      <div className="copilot-composer border-t border-border/80 p-3.5 bg-surface">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={composerRef}
            rows={2}
            aria-describedby="copilot-composer-help"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); void handleSend(); } }}
            aria-label="Message to AI Copilot"
            maxLength={4000}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about evidence, candidates, or next checks…"
            className="max-h-40 min-h-12 resize-none min-w-0 flex-1 rounded-lg border border-border bg-bg/90 px-3.5 py-2 text-sm leading-6 text-text placeholder-muted focus:border-accent focus:ring-1 focus:ring-accent/40 focus:outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent transition-all hover:bg-accent/90 disabled:opacity-40 shadow-sm"
          >
            <Send size={14} />
          </button>
        </form>
        <p id="copilot-composer-help" className="mt-2 text-[11px] text-muted">Enter to send · Shift+Enter for a new line. Inferred origins need corroboration.</p>
      </div>
    </div>
    </>
  );
}
