import { useEffect, useState, type ReactNode } from "react";
import { LockKeyhole, ShieldCheck, LogOut, LoaderCircle } from "lucide-react";
import { csrfHeaders } from "../../lib/csrf";
import { AccessContext, type Access } from "./access";
import { useLive } from "../../store/live";

interface Principal { email: string; role: Access["role"]; expires_at: number }

export function AuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<"loading" | "local" | "signin" | "ready" | "error">("loading");
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const config = await fetch("/api/auth/config", { cache: "no-store" });
        if (!config.ok) throw new Error("Cannot reach the authentication service.");
        const data = await config.json() as { enabled: boolean };
        if (!data.enabled) { if (alive) setState("local"); return; }
        const me = await fetch("/api/auth/me", { cache: "no-store" });
        if (me.status === 401 || me.status === 403) { if (alive) setState("signin"); return; }
        if (!me.ok) throw new Error("Server authentication is unavailable.");
        const user = await me.json() as Principal;
        if (alive) { setPrincipal(user); setState("ready"); }
      } catch (e) { if (alive) { setError(e instanceof Error ? e.message : "Unable to connect"); setState("error"); } }
    })();
    return () => { alive = false; };
  }, [revision]);
  useEffect(() => {
    if (state !== "ready" || !principal) return;
    const expire = setTimeout(() => { setPrincipal(null); setState("signin"); }, Math.max(0, principal.expires_at * 1000 - Date.now()));
    const timer = setInterval(() => {
      void fetch("/api/auth/me", { cache: "no-store" }).then((r) => {
        if (r.status === 401 || r.status === 403) { setPrincipal(null); setState("signin"); }
      }).catch(() => { /* Transient outages are shown by the stream; server still denies access. */ });
    }, 15000);
    return () => { clearTimeout(expire); clearInterval(timer); };
  }, [state, principal]);
  const login = async () => {
    setBusy(true); setError("");
    try {
      const { googleIdToken } = await import("./firebase");
      const idToken = await googleIdToken();
      const result = await fetch("/api/auth/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id_token: idToken }) });
      const data = await result.json() as Principal & { detail?: string };
      if (!result.ok) throw new Error(data.detail ?? "Sign-in was not accepted.");
      setPrincipal(data); setState("ready");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to sign in."); }
    finally { setBusy(false); }
  };
  const logout = async () => {
    setBusy(true); setError("");
    try {
      const result = await fetch("/api/auth/logout", { method: "POST", headers: csrfHeaders() });
      if (!result.ok) throw new Error("Sign-out could not be verified. Please retry.");
      useLive.getState().clear();
      useLive.setState({ status: null, topology: null });
      setPrincipal(null); setState("signin");
    } catch (e) { setError(e instanceof Error ? e.message : "Sign-out failed"); }
    finally { setBusy(false); }
  };
  if (state === "local") return children;
  if (state === "ready" && principal) return <AccessContext.Provider value={{ privateMode: true, role: principal.role, email: principal.email }}><><div className="flex flex-wrap items-center gap-3 border-b border-border bg-surface px-4 py-2 text-xs"><ShieldCheck size={15} className="text-normal" /><span className="break-all">{principal.email}</span><span className="text-muted capitalize">{principal.role}</span><span className="hidden text-muted sm:block">Shared monitoring workspace · controls require administrator access</span><button disabled={busy} onClick={() => void logout()} className="ml-auto inline-flex min-h-9 items-center gap-2 rounded px-2 hover:bg-bg"><LogOut size={14} />Sign out</button>{error && <p role="alert" className="w-full text-suspect">{error}</p>}</div>{children}</></AccessContext.Provider>;
  return <main className="grid min-h-dvh place-items-center bg-bg p-5"><section className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 shadow-xl"><div className="mb-7 flex items-center gap-3"><ShieldCheck className="text-accent" size={26} /><span className="text-lg font-semibold">AttackTrace</span><span className="ml-auto text-xs text-muted">Private workspace</span></div><LockKeyhole size={25} className="mb-4 text-accent" /><h1 className="text-2xl font-semibold tracking-tight">Sign in to investigate</h1><p className="mt-3 text-sm leading-6 text-muted">Access incident evidence, process monitoring and your investigation copilot with an approved account.</p>{error && <p role="alert" className="mt-5 rounded-lg border border-suspect/40 bg-suspect/10 p-3 text-sm leading-6 text-suspect">{error}</p>}{state === "loading" ? <p role="status" className="mt-6 flex items-center gap-2 text-sm text-muted"><LoaderCircle size={16} className="animate-spin" />Checking your session…</p> : state === "error" ? <button className="mt-6 min-h-11 w-full rounded-lg border border-border" onClick={() => { setState("loading"); setRevision((n) => n + 1); }}>Retry connection</button> : <button disabled={busy} onClick={() => void login()} className="mt-6 min-h-12 w-full rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent disabled:opacity-50">{busy ? "Completing sign-in…" : "Continue with Google"}</button>}<p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted">Signing in does not grant workspace access automatically. Membership and permissions are checked by the server.</p></section></main>;
}
