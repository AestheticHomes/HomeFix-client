# Design Laws — Edith Continuum

1. **Cosmic Duality**: light theme is "white energy" (pure whites, soft gradients); dark theme is "deep space" (rich midnight gradients with aura glows). Each surface uses `--surface-*` tokens.
2. **Aura Motion**: animated glows must be subtle; e.g., sidebar aurora moves slowly, never distracting. Use CSS variables `--aura-light` / `--aura-dark`.
3. **Typography**: all copy draws from `--text-primary`, `--text-secondary`, etc. Maintain legible contrast and increase sizes for hero/section titles.
4. **Layout Safety**: SafeViewport enforces padding for header/sidebar/mobile nav; align pages left when needed but keep cosmic radial background.
5. **Fallback media**: any imagery/video needs graceful fallback (emoji badge, gradient poster) if loading fails.
