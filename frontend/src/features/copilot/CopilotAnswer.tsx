import { Fragment, useState } from "react";
import { Check, Copy, ExternalLink, Target, FileText, GitBranch, HelpCircle, CheckSquare, type LucideIcon } from "lucide-react";
import type { EvidenceEvent } from "../../lib/types";

export function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : part.startsWith("`") && part.endsWith("`") ? (
          <code className="rounded bg-surface px-1 font-mono text-[0.85em]" key={i}>
            {part.slice(1, -1)}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

function Lines({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-1.5 text-sm leading-6">
      {lines.map((line, i) => {
        const item = line.match(/^(?:[-*]|\d+\.)\s+(.+)$/);
        return (
          <p key={i} className={item ? "relative pl-3.5 before:absolute before:left-0 before:top-[0.45em] before:h-1 before:w-1 before:rounded-full before:bg-muted before:content-['']" : ""}>
            <InlineText text={item?.[1] ?? line} />
          </p>
        );
      })}
    </div>
  );
}

// Named section icons for the investigation answer layout
const SECTION_ICONS: Record<string, LucideIcon> = {
  "Suspected origin": Target,
  "Hypothesis": Target,
  "Evidence": FileText,
  "Supporting observations": FileText,
  "Alternatives": GitBranch,
  "Alternative explanations": GitBranch,
  "Competing explanations": GitBranch,
  "Uncertainty": HelpCircle,
  "Next check": CheckSquare,
  "Next checks": CheckSquare,
  "What to check": CheckSquare,
};

type ParsedSection = { title: string; lines: string[]; kind: "collapsed" | "hypothesis" | "evidence" | "section" };

const COLLAPSED_RE = /saved incident|first observation|supporting observations|recorded evidence|model reference|checklist|^evidence$|layer evidence|local investigation/i;
const HYPOTHESIS_RE = /hypothesis|hypothes|suspected origin/i;
const EVIDENCE_RE = /^evidence$|supporting obs|recorded evidence|saved incident/i;

function parseSections(content: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  for (const line of content.split("\n")) {
    const heading = line.match(/^#{2,4}\s+(.+)$/);
    const label = line.match(/^\*\*([^*]+)\*\*:?\s*(.*)$/);
    if (heading || label) {
      const title = (heading?.[1] ?? label?.[1] ?? "").replace(/:$/, "");
      const kind: ParsedSection["kind"] = COLLAPSED_RE.test(title)
        ? "collapsed"
        : HYPOTHESIS_RE.test(title)
        ? "hypothesis"
        : EVIDENCE_RE.test(title)
        ? "evidence"
        : "section";
      sections.push({ title, lines: label?.[2] ? [label[2]] : [], kind });
    } else {
      if (!sections.length) sections.push({ title: "Assessment", lines: [], kind: "section" });
      if (line.trim()) sections[sections.length - 1]?.lines.push(line.trim());
    }
  }
  return sections.filter((s) => s.lines.length);
}

function HypothesisCard({ section }: { section: ParsedSection }) {
  return (
    <div className="rounded-lg border border-accent/20 bg-accent/5 p-3 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Target size={13} className="text-accent shrink-0" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Hypothesis</span>
      </div>
      <Lines lines={section.lines} />
    </div>
  );
}

export function CopilotAnswer({ content, evidence = [] }: { content: string; evidence?: EvidenceEvent[] }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const sections = parseSections(content);

  return (
    <div className="aip-answer space-y-3 [overflow-wrap:anywhere]">
      {sections.map((section, i) => {
        if (section.kind === "collapsed") {
          return (
            <details key={i} className="rounded-lg border border-border bg-surface/50 p-3">
              <summary className="cursor-pointer text-xs font-medium text-muted hover:text-text">
                {section.title}
              </summary>
              <div className="mt-2.5">
                <Lines lines={section.lines} />
              </div>
            </details>
          );
        }

        if (section.kind === "hypothesis") {
          return <HypothesisCard key={i} section={section} />;
        }

        const Icon = Object.entries(SECTION_ICONS).find(([k]) =>
          section.title.toLowerCase().includes(k.toLowerCase())
        )?.[1];

        return (
          <section key={i} className="space-y-1.5">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted/80">
              {Icon && <Icon size={12} aria-hidden className="shrink-0" />}
              {section.title.replace(/^Evidence for inc_.+$/, "Incident assessment")}
            </h3>
            <Lines lines={section.lines} />
          </section>
        );
      })}

      {/* Evidence records */}
      {!!evidence.length && (
        <details className="rounded-lg border border-border p-3">
          <summary className="cursor-pointer text-xs font-medium text-muted hover:text-text">
            Evidence · {evidence.length} {evidence.length === 1 ? "record" : "records"}
          </summary>
          <p className="mt-2 text-xs leading-5 text-muted">
            Inspect the recorded source and timestamp before drawing a conclusion.
          </p>
          <div className="mt-2 space-y-2">
            {evidence.map((event) => (
              <div key={event.id} className="rounded-md border border-border bg-surface p-2">
                <button
                  aria-expanded={preview === event.id}
                  onClick={() => setPreview(preview === event.id ? null : event.id)}
                  className="min-h-10 w-full text-left text-xs font-medium"
                >
                  {event.asset_id ?? "Incident"} · {event.category.replaceAll("_", " ")}
                </button>
                {preview === event.id && (
                  <div className="space-y-2 border-t border-border pt-2 text-xs leading-5">
                    <p>{event.mode.toUpperCase()} · received {new Date(event.received_at * 1000).toLocaleString()}</p>
                    <p className="text-muted">
                      Observed {new Date(event.observed_at * 1000).toLocaleString()} · {String(event.payload.classification ?? "Recorded evidence")}
                    </p>
                    <dl className="space-y-1">
                      {Object.entries(event.payload)
                        .filter(([k]) => !["origin", "classification"].includes(k))
                        .map(([k, v]) => (
                          <div key={k}>
                            <dt className="text-muted">{k.replaceAll("_", " ")}</dt>
                            <dd>{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
                          </div>
                        ))}
                    </dl>
                    <a
                      className="inline-flex min-h-10 items-center gap-1 text-accent underline"
                      href={`/api/evidence/${encodeURIComponent(event.id)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Raw record <ExternalLink size={11} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </details>
      )}

      {/* Copy footer */}
      <div className="flex items-center gap-2 border-t border-border/60 pt-2">
        <button
          type="button"
          className="inline-flex min-h-9 items-center gap-1.5 rounded px-2 text-xs text-muted hover:bg-surface hover:text-text"
          onClick={() => {
            void navigator.clipboard
              .writeText(content)
              .then(() => { setCopied(true); setCopyError(false); }, () => setCopyError(true));
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy answer"}
        </button>
        {copyError && (
          <span role="status" className="text-xs text-suspect">
            Copy unavailable; select the answer text.
          </span>
        )}
      </div>
    </div>
  );
}
