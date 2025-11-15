# Shared Rules

1. Follow Edith token system for all colors, spacing, and elevation. No hard-coded hex unless defined in `app/globals.css`.
2. Default to server components (`app/` routes). Only mark a component `"use client"` when it needs browser APIs. Render heavy UI islands via `dynamic(() => import(...), { ssr:false })`.
3. Never remove user data; do not run destructive git commands unless explicitly requested.
4. CLI output should be concise: summarize success/failure, list next steps, and avoid dumping large files inline.
5. When hitting sandbox limitations (WSL1, no network), explain the limitation and describe how to run the blocked command locally.
