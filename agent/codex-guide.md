# Codex Guide

- Always inspect repository state with `git status -sb` before committing changes.
- Prefer `rg`, `fd`, and `sed` for fast searches; avoid heavy IDE-only commands.
- Use `apply_patch` for single-file edits; for batched edits consider scripts.
- Keep responses concise: summary first, file references with inline paths (e.g., `app/page.tsx:42`).
- Validate critical commands locally when sandbox allows; otherwise detail how the user can reproduce.
