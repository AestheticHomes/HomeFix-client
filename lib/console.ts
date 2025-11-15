// /lib/console.js
/**
 * 🧭 HomeFix India — Edith Integrated Logger (v3.0)
 * -------------------------------------------------
 * Unified logging system with:
 *  - Structured log levels (log, info, warn, error)
 *  - Browser event dispatch via `edith:log`
 *  - Timestamped & tagged console output
 *  - Auto-disable in production or when NEXT_PUBLIC_DEBUG_MODE=false
 */



export type LogLevel = "log" | "info" | "warn" | "error";

const isDebug =
  process.env.NEXT_PUBLIC_DEBUG_MODE === "true" ||
  process.env.NODE_ENV !== "production";

/**
 * 🔊 Dispatch an Edith log event to the browser window.
 * Enables live monitoring from Admin Dashboard.
 */
export function edithLog(level: LogLevel, message: string, meta: any = {}) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("edith:log", {
      detail: { level, message, meta, ts: Date.now() },
    });
    window.dispatchEvent(event);
  }
}

/**
 * 🕒 Timestamp + context formatter
 */
function format(tag: string | undefined, args: any[]) {
  const time = new Date().toLocaleTimeString("en-IN", { hour12: false });
  const label = tag ? `[${tag}]` : "";
  return [`🕒 ${time}`, label, ...args];
}

/**
 * 🟢 Loggers — with fallback to `edithLog()` dispatch
 */
export const log = (tag?: string, ...args: any[]) => {
  const msg = args.join(" ");
  try { edithLog("log", msg, { tag }); } catch {}
  if (isDebug) console.log("🟢", ...format(tag, args));
};

export const info = (tag?: string, ...args: any[]) => {
  const msg = args.join(" ");
  try { edithLog("info", msg, { tag }); } catch {}
  if (isDebug) console.info("🔵", ...format(tag, args));
};

export const warn = (tag?: string, ...args: any[]) => {
  const msg = args.join(" ");
  try { edithLog("warn", msg, { tag }); } catch {}
  if (isDebug) console.warn("🟠", ...format(tag, args));
};

export const error = (tag?: string, ...args: any[]) => {
  const msg = args.join(" ");
  try { edithLog("error", msg, { tag }); } catch {}
  if (isDebug) console.error("🔴", ...format(tag, args));
};

/**
 * ⚡ Force-log even in production (critical alerts)
 */
export const forceLog = (tag?: string, ...args: any[]) => {
  const msg = args.join(" ");
  try { edithLog("log", msg, { tag, force: true }); } catch {}
  console.log("⚡", ...format(tag, args));
};

const consoleBridge = { log, info, warn, error, forceLog, edithLog };

export default consoleBridge;
