"use client";

import { useEffect, useState, useRef } from "react";
import { TerminalSquare, RefreshCcw, Server, Database, Cpu } from "lucide-react";
import { EDITH_LOG_EVENT } from "@/lib/edithEvents";



export default function EdithAdminPage() {
  const [latency, setLatency] = useState<number | null>(null);
  const [logs, setLogs] = useState<{ level: string; message: string; ts: number }[]>([]);
  const [pingStatus, setPingStatus] = useState<"idle" | "pinging" | "ok" | "fail">("idle");
  const [running, setRunning] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    logsRef.current?.scrollTo({ top: logsRef.current.scrollHeight, behavior: "smooth" });
  }, [logs]);

  // Listen to live frontend edith:log events
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { level, message, ts } = e.detail || {};
      setLogs((prev) => [...prev, { level, message, ts }]);
    };
    window.addEventListener(EDITH_LOG_EVENT, handler as EventListener);
    return () => window.removeEventListener(EDITH_LOG_EVENT, handler as EventListener);
  }, []);

  // Ping Edith API to measure latency
  const ping = async () => {
    setPingStatus("pinging");
    const t0 = performance.now();
    try {
      const res = await fetch("/api/edith", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: "ping" }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setLatency(Math.round(performance.now() - t0));
      setPingStatus("ok");
    } catch {
      setPingStatus("fail");
    }
  };

  // Run prebuilt diagnostic commands
  const runCommand = async (cmd: string) => {
    setRunning(true);
    setLogs((l) => [...l, { level: "info", message: `→ ${cmd}`, ts: Date.now() }]);
    try {
      const res = await fetch("/api/edith", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const json = await res.json();
      setLogs((l) => [...l, { level: json.status, message: json.message, ts: Date.now() }]);
    } catch (e: any) {
      setLogs((l) => [...l, { level: "error", message: e.message, ts: Date.now() }]);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <TerminalSquare className="h-6 w-6 text-emerald-500" />
        <h1 className="text-xl font-semibold">Edith — IT Supervisor</h1>
        <span
          className={`ml-2 inline-block h-2 w-2 rounded-full ${
            pingStatus === "fail"
              ? "bg-red-500"
              : pingStatus === "ok"
              ? "bg-emerald-500"
              : "bg-zinc-400"
          }`}
        />
        <span className="text-sm opacity-70">
          {latency ? `${latency} ms` : pingStatus === "pinging" ? "…" : "—"}
        </span>

        <button
          onClick={ping}
          className="ml-auto flex items-center gap-1 rounded-lg border px-3 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          <RefreshCcw className="h-4 w-4" />
          Ping
        </button>
      </div>

      {/* Quick Commands */}
      <div className="rounded-2xl border p-4">
        <div className="text-sm font-medium opacity-80 mb-2">System Diagnostics</div>
        <div className="flex flex-wrap gap-2">
          {[
            { icon: <Server className="h-4 w-4" />, label: "Check Supabase Connection", cmd: "check Supabase connection" },
            { icon: <Database className="h-4 w-4" />, label: "List Recent Failures", cmd: "list recent failures" },
            { icon: <Cpu className="h-4 w-4" />, label: "Explain Booking Flow", cmd: "explain booking flow" },
            { icon: <Cpu className="h-4 w-4" />, label: "Check Edge Functions", cmd: "list active Edge Functions" },
          ].map((b) => (
            <button
              key={b.label}
              disabled={running}
              onClick={() => runCommand(b.cmd)}
              className="flex items-center gap-2 rounded-xl border px-3 py-1 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
            >
              {b.icon}
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Live Log Console */}
      <div className="rounded-2xl border p-4 bg-white dark:bg-zinc-900 shadow-inner">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium opacity-80">Live Logs</div>
          <button
            onClick={() => setLogs([])}
            className="text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Clear
          </button>
        </div>

        <div
          ref={logsRef}
          className="h-[320px] overflow-y-auto font-mono text-xs space-y-1 text-zinc-800 dark:text-zinc-200"
        >
          {logs.length === 0 && (
            <div className="opacity-60">No logs yet — interact with the system to see activity.</div>
          )}
          {logs.map((l, i) => (
            <div key={i}>
              <span
                className={
                  l.level === "error"
                    ? "text-red-500"
                    : l.level === "warn"
                    ? "text-amber-500"
                    : l.level === "info"
                    ? "text-blue-500"
                    : "text-emerald-500"
                }
              >
                [{new Date(l.ts).toLocaleTimeString("en-IN", { hour12: false })}]
              </span>{" "}
              {l.message}
            </div>
          ))}
        </div>
      </div>

      <div className="text-sm opacity-70">
        🔧 Press <kbd className="px-1 py-0.5 border rounded">Ctrl</kbd> +{" "}
        <kbd className="px-1 py-0.5 border rounded">E</kbd> anywhere to open the floating Edith console.
      </div>
    </div>
  );
}
