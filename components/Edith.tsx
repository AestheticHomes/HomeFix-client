"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, TerminalSquare } from "lucide-react";
import { EDITH_LOG_EVENT } from "@/lib/edithEvents";
const MUTED = process.env.NEXT_PUBLIC_EDITH_MUTED === "true";

/* ---------- Types ---------- */
interface Message {
  role: string;
  text: string;
}

type StatusState = "online" | "alert" | "idle";

/* ---------- API helper ---------- */
async function askEdith(command: string, context?: Record<string, unknown>) {
  const res = await fetch("/api/edith", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command, context }),
  });
  if (!res.ok) throw new Error(`Edith API error: ${res.status}`);
  return res.json();
}

/* ---------- Component ---------- */
export default function Edith() {
  if (MUTED) return null; // 👈 clean mute, nothing renders when muted
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<StatusState>("online");
  const [messages, setMessages] = useState<Message[]>([
    { role: "system", text: "Edith online. Press Ctrl+E to toggle." },
  ]);
  const logsRef = useRef<HTMLDivElement | null>(null);

  /* Hot-key toggle (Ctrl+E) */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Listen for forwarded logs */
  useEffect(() => {
    const onLog = (e: CustomEvent) => {
      const payload: any = e?.detail || {};
      const tag = payload.level || "log";
      const text = payload.message || JSON.stringify(payload);
      const statusBump: StatusState = payload.level === "error" ? "alert" : "online";
      setStatus(statusBump);
      setMessages((prev) => [...prev, { role: tag, text }]);
    };

    window.addEventListener(EDITH_LOG_EVENT, onLog as EventListener);
    return () => window.removeEventListener(EDITH_LOG_EVENT, onLog as EventListener);
  }, []);

  /* Auto-scroll to latest message */
  useEffect(() => {
    logsRef.current?.scrollTo({ top: logsRef.current.scrollHeight });
  }, [messages, open]);

  /* Send command */
  const send = useCallback(async () => {
    const cmd = input.trim();
    if (!cmd) return;

    setMessages((m) => [...m, { role: "you", text: cmd }]);
    setInput("");
    setBusy(true);

    try {
      const res = await askEdith(cmd, {
        ts: Date.now(),
        url: typeof window !== "undefined" ? window.location.pathname : "",
      });

      const text =
        res?.message || res?.diagnosis || JSON.stringify(res, null, 2);

      setMessages((m) => [...m, { role: "edith", text }]);
      setStatus(res?.status === "error" ? "alert" : "online");
    } catch (err: any) {
      setMessages((m) => [
        ...m,
        { role: "error", text: `API error: ${err?.message}` },
      ]);
      setStatus("alert");
    } finally {
      setBusy(false);
    }
  }, [input]);

  /* ---------- UI ---------- */
  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 rounded-2xl shadow-lg px-4 py-3 text-sm font-medium bg-black/70 text-white backdrop-blur hover:bg-black/80"
      >
        <div className="flex items-center gap-2">
          <TerminalSquare className="h-4 w-4" />
          <span>Edith</span>
          <span
            className={`ml-2 inline-block h-2 w-2 rounded-full ${
              status === "online"
                ? "bg-emerald-400"
                : status === "alert"
                ? "bg-red-400"
                : "bg-zinc-400"
            }`}
          />
        </div>
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="absolute right-0 top-0 h-full w-full max-w-[560px] bg-white dark:bg-zinc-900 shadow-xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  <div className="font-semibold">Edith — Supervisor Console</div>
                </div>
                <button onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Log area */}
              <div
                ref={logsRef}
                className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
              >
                {messages.map((m, idx) => (
                  <div key={idx} className="text-sm">
                    <span className="mr-2 font-medium capitalize">{m.role}:</span>
                    <span className="whitespace-pre-wrap break-words opacity-90">
                      {m.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Input area */}
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !busy && send()}
                    placeholder="Ask Edith…"
                    className="flex-1 rounded-xl border px-3 py-2 text-sm bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    disabled={busy}
                    onClick={send}
                    className="rounded-xl px-4 py-2 text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {busy ? "Thinking…" : "Send"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
