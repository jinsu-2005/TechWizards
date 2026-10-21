import { Fragment, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import type { EvidenceEvent } from "../../lib/types";

export function InlineText({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> :
    part.startsWith("`") && part.endsWith("`") ? <code className="rounded bg-surface px-1 font-mono text-[0.85em]" key={i}>{part.slice(1, -1)}</code> : <Fragment key={i}>{part}</Fragment>)} </>;
}

function answerSections(content: string) {
  const sections: { title: string; lines: string[] }[] = [];
  for (const line of content.split("\n")) {
    const heading = line.match(/^#{2,4}\s+(.+)$/);
    const label = line.match(/^\*\*([^*]+)\*\*:?\s*(.*)$/);
    if (heading || label) {
      sections.push({ title: (heading?.[1] ?? label?.[1] ?? "").replace(/:$/, ""), lines: label?.[2] ? [label[2]] : [] });
    } else {
      if (!sections.length) sections.push({ title: "Assessment", lines: [] });
      if (line.trim()) sections[sections.length - 1]?.lines.push(line.trim());
    }
  }
  return sections.filter((s) => s.lines.length);
}

function Lines({ lines }: { lines: string[] }) {
  return <div className="space-y-2 text-sm leading-6">{lines.map((line, i) => {
    const item = line.match(/^(?:[-*]|\d+\.)\s+(.+)$/);
    return <p key={i} className={item ? "relative pl-3 before:absolute before:left-0 before:content-['·']" : ""}><InlineText text={item?.[1] ?? line} /></p>;
  })}</div>;
}

export function CopilotAnswer({ content, evidence = [] }: { content: string; evidence?: EvidenceEvent[] }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const sections = answerSections(content);
  const collapsed = /saved incident|first observation|supporting observations|recorded evidence|model reference|checklist|^evidence$/i;
  return <div className="space-y-4 [overflow-wrap:anywhere]">
    {sections.map((section, i) => collapsed.test(section.title) ? <details key={i} className="rounded-lg border border-border bg-surface/50 p-3">
      <summary className="cursor-pointer text-sm font-medium text-muted hover:text-text">{section.title}</summary><div className="mt-3"><Lines lines={section.lines} /></div>
    </details> : <section key={i} className="space-y-2"><h3 className="text-sm font-semibold text-text">{section.title.replace(/^Evidence for inc_.+$/, "Incident assessment")}</h3><Lines lines={section.lines} /></section>)}
    {!!evidence.length && <details className="rounded-lg border border-border p-3"><summary className="cursor-pointer text-sm font-medium">Evidence · {evidence.length} records</summary>
      <p className="mt-2 text-xs leading-5 text-muted">Inspect the recorded source and timestamp before drawing a conclusion.</p>
      <div className="mt-2 space-y-2">{evidence.map((event) => <div key={event.id} className="rounded-md border border-border bg-surface p-2">
        <button aria-expanded={preview === event.id} onClick={() => setPreview(preview === event.id ? null : event.id)} className="min-h-10 w-full text-left text-sm font-medium">{event.asset_id ?? "Incident"} · {event.category.replaceAll("_", " ")}</button>
        {preview === event.id && <div className="space-y-2 border-t border-border pt-2 text-xs leading-5"><p>{event.mode.toUpperCase()} · received {new Date(event.received_at * 1000).toLocaleString()}</p><p className="text-muted">Observed {new Date(event.observed_at * 1000).toLocaleString()} · {String(event.payload.classification ?? "Recorded evidence")}</p><dl className="space-y-1">{Object.entries(event.payload).filter(([k]) => !["origin", "classification"].includes(k)).map(([k, v]) => <div key={k}><dt className="text-muted">{k.replaceAll("_", " ")}</dt><dd>{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd></div>)}</dl><a className="inline-flex min-h-10 items-center gap-1 text-accent underline" href={`/api/evidence/${encodeURIComponent(event.id)}`} target="_blank" rel="noreferrer">Raw record <ExternalLink size={12} /></a></div>}
      </div>)}</div>
    </details>}
    <div className="flex items-center gap-2 border-t border-border pt-2"><button type="button" className="inline-flex min-h-10 items-center gap-2 rounded px-2 text-xs text-muted hover:bg-surface hover:text-text" onClick={() => { void navigator.clipboard.writeText(content).then(() => { setCopied(true); setCopyError(false); }, () => setCopyError(true)); }}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy answer"}</button>{copyError && <span role="status" className="text-xs text-suspect">Copy unavailable; select the answer text.</span>}</div>
  </div>;
}
