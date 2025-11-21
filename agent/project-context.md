# HomeFix-Client Project Snapshot

## Primary stack and goals
- **Framework:** Next.js 14 App Router (`app/`), powered by TypeScript 5.9 and React 18.2, with `next-pwa` enabling a service worker plus `next-themes` for styling states.
- **Backend & data:** Supabase drives all authenticated interaction. API routes in `app/api/**` call `supabaseService()` (via `lib/supabaseClient.js`) for server-role access and `supabaseAnon()` or the shared browser client for session-aware reads. Example: `/api/auth/verify-email-otp` enforces TTL, debug overrides, and clears OTP fields before marking `email_verified`.
- **Experience modes:** `package.json` exposes `dev`, `build`, `start`, plus specialized ports (`estimator` at 4000, `studio` at 4100, `edith` at 4200) so the suite can run client flavor-specific dev servers simultaneously.

## Tooling & configuration notes
- **PWA + performance:** `next.config.mjs` couples `next-pwa` (service worker `sw.js`, caching, register/skip waiting) with `output: "standalone"` so API routes can ship with the Next Server. Image remote patterns include Supabase, YouTube, Cloudinary, Unsplash, and Google-hosted assets. Typed routes, view transitions, scroll restoration, and server actions are enabled under `experimental`.
- **Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DEBUG_MODE`, plus `NODE_ENV`/`NEXT_PUBLIC` toggles for PWA and logging. `next.config.mjs` controls console removal, styled-components support, and aliasing for `@/types`, `@/components`, `@/lib`, `@/hooks`, `@/contexts`, and `@/edith`.
- **Supabase resources:** `supabase/config.toml`, `supabase/functions/`, and `supabase/migrations/` live alongside the app for CLI sync. `lib/supabaseClient.js` centralizes browser/server clients, logs once per runtime, and supplies aliases (`supabase`, `supabaseService`, `supabaseServer`).

## Directory highlights
- `app/` holds the App Router tree (layouts, services, API routes). Services such as `app/services/modular-kitchens/` and `app/api/auth/verify-email-otp/` contain business logic, UI, and Supabase mutations.
- `components/`, `hooks/`, and `contexts/` (Sidebar, Studio, User) store reusable UI pieces and React context providers across experiences.
- `lib/` supplies low-level helpers (`console`, `supabaseClient`, logging utilities), while `edith/` likely collects viewer-specific assets.
- `public/` is the PWA/asset root, `pages/` exists for any legacy routes, and `packages/eslint-plugin-edith` offers a home-grown ESLint addon used via a workspace-relative file reference.
- `agent/` (this folder) captures guidelines and now contextual summaries for future assistants.

## Key dependencies
- UI: MUI 7.3.5, Radix UI (dialog, label, switch, tabs, toast), `lucide-react`, `framer-motion`, `sonner`, `tailwindcss-animate`, `tailwind-merge`, and `class-variance-authority`.
- 3D & visuals: `three@0.160`, `react-three/fiber`, `react-three/drei`, `@react-spring/three`, `@react-three/postprocessing`, `@react-three/rapier`, `three-stdlib`, `maath`, `lottie-react`, `recharts`, `canvas-confetti`.
- Data & helpers: Supabase JS, `date-fns`, `react-day-picker`, `zustand`, `react-use-cart`, `json2csv`, `dexie`, `idb-keyval`, `sharp`, `twilio`, `clsx`.
- Build/QA: TypeScript, ESLint + custom plugin, TailwindCSS CLI v4.1, PostCSS, `@types/*` packages, `next-config`, `sharp`.

## Deployment & runtime
- Node 18.17+ is required per `package.json#engines`. Production builds remove console statements, optimize fonts/CSS, and print a branded `HomeFix India v3.4` banner on completion.
- `next-pwa` only runs in non-development builds, so local dev doesn’t register the SW automatically. API routes default to `dynamic` and may log with `lib/console.ts`.
- Multi-tenant experiences (estimator, studio, edith) can be started via dedicated scripts to keep ports isolated while sharing the same codebase and Supabase backend.

## Notes for future threads
- Use `app/api/**` and `supabase/` resources as authoritative sources for backend logic; `lib/supabaseClient.js` describes the preferred client usage.
- `contexts/` and `agent/` files describe expectations for shared state and collaboration. Keep updating `agent/project-context.md` when high-level architecture shifts (e.g., new entry points or backend services).
