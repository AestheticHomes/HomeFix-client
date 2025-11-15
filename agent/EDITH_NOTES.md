# Edith Ops Codex

## Global Laws
- Palette: derive every shade from `app/globals.css` tokens (`--surface-*`, `--text-*`, `--accent-*`, badge tokens). No literal hex/rgb in components.
- Layout: route shells live inside `SafeViewport`; padding equals header height + bottom safe-area. Avoid bespoke full-height wrappers.
- Theme coherence: Estimator, Studio, Settings, Profile, Cart, My Orders, etc., must use the same tokens. New shades require a token addition, not inline colors.
- Sidebar: collapsed by default, hover expand when not pinned; chevron toggles `pinned`. Width transitions 80px ↔ 256px.
- Typography: only `text-[var(--text-…)]` utilities or shared tokenized classes. Ban ad-hoc gray literals.

## Checkout & Orders
- Dual carts: `useProductCartStore` (storefront) and `useServiceCartStore` (services). Cart page flips between them.
- Checkout page: inspects `?type=service`. Product flow hits Razorpay clone + `/mockrazorpay?type=product`; service flow shows “Book Now - Pay Later” yet still routes through `/mockrazorpay?type=service`.
- `/mockrazorpay`: reads `type`, clears the matching cart, updates ledger entries (service = scheduled, product = paid), forwards to `/checkout/success?type=...`.
- `/checkout/success`: product path renders payment summary; service path reiterates “visit fee only if you decline”.
- My Orders: IDs are `OR-` / `SR-`, amounts via INR formatter, service orders carry a visit-fee badge (“payable only if you decline”).

## Resilience & Fallbacks
- Services category icons (and any `/icons/...`) must use `CategoryIcon` with inline SVG fallback.
- Reuse the shared INR formatter everywhere (cart, orders, invoices).

## Work in Progress
- Audit remaining modules (Estimator, Studio, Settings, Profile, My Orders cards, etc.) for stray hex values.
- Introduce badge/alert tokens so components never fall back to arbitrary colors.
- Ensure Estimator + Studio consume tokens directly or via the global ThemeProvider.

## Estimator Theme Sweep (2025-04-09)
- `EstimatorForm.tsx`: single source of form controls; `CONTROL_BASE` uses `--surface-panel` + `--text-muted` placeholders; helper hints inherit tokens.
- Preview panels (`UniPreviewCanvas`, Kitchen/Wardrobe render wrappers) render on `--surface-base` for light mode, `--surface-panel-dark` under `.dark`.
- Summary view charts live inside tokenized cards; sticky footer/CTA reuse gradient tokens.
- Future estimator changes must reuse these shared components; no inline colors ever.

## Estimator Blueprint Refresh (2025-04-21)
- `UniPreviewCanvas.tsx`: TS + client-only, exports `PreviewModelProps`. Canvas + pan-zoom shells use `--surface-panel` (light) / `--surface-panel-dark`.
- Structural cards (`EstimatorShell` panels, `SummaryPanel`) reuse the same surface token + cosmic shadow mix; sticky footer mirrors it.
- Preview metadata (chips, badges, duality toggle) only use `--accent-*` / `--border-*`. Add new accents via `globals.css`.

Keep this file updated when new design laws or architectural rules are introduced.
