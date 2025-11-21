// lib/appConfig.ts
export const BRAND_NAME = process.env.PROJECT_BRAND!;
export const FROM_EMAIL = process.env.FROM_EMAIL!; // e.g. "HomeFix India <no-reply@aesthetichomes.net>"
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL!; // e.g. "support@aesthetichomes.net"
export const RESEND_API_KEY = process.env.RESEND_API_KEY!;
export const RESEND_SANDBOX_SENDER = process.env.RESEND_SANDBOX_SENDER; // optional (e.g. "onboarding@resend.dev")

// Strict validation so nothing silently falls back to a hardcoded value
const missing: string[] = [];
if (!BRAND_NAME) missing.push("PROJECT_BRAND");
if (!FROM_EMAIL) missing.push("FROM_EMAIL");
if (!ADMIN_EMAIL) missing.push("ADMIN_EMAIL");
if (!RESEND_API_KEY) missing.push("RESEND_API_KEY");

if (missing.length) {
  // Crash early in dev; in prod you'll see a clear boot error
  throw new Error(`Missing required env vars: ${missing.join(", ")}`);
}
