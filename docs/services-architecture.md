# Services & Turnkey Architecture (HomeFix)

## Data model

- Source of truth: `lib/servicesConfig.ts`
  - `ServiceDefinition` describes both turnkey and essential services.
  - `category: "turnkey" | "essential"` controls where a service appears.
  - `mediaFolder` maps to Supabase Storage folder under the `services` bucket.
  - `slug` powers:
    - `/services/[slug]` dynamic pages
    - `/api/services/media/[slug]` media gallery (if still active)

## Routes

- `/turnkey`
  - File: `app/turnkey/page.tsx`
  - Purpose: Landing page for all turnkey services only.
  - Implementation:
    - uses `fetchServicesConfig()`
    - filters by `category === "turnkey"`
    - renders `TurnkeyServicesSection`.

- `/services`
  - File: `app/services/page.tsx`
  - Purpose: Landing page for essential services (painter, electrician, etc.).
  - May show a small CTA linking to `/turnkey` but does not duplicate the full turnkey listing.

- `/services/[slug]`
  - File: `app/services/[slug]/page.tsx`
  - Purpose: Detail page for a single service (turnkey or essential).
  - Uses `getServiceBySlug(slug)` from `servicesConfig`.

## Components

- `components/services/TurnkeyServicesSection.tsx`
  - Reusable grid/list section for turnkey services.
  - Inputs: `services: ServiceDefinition[]`.
  - Used by:
    - `/turnkey`
    - optionally `/services` (as a teaser).

- `components/services/ServiceLanding.tsx`
  - Displays the main content for a single service.
  - Shared by turnkey and essential service pages.

- `components/services/ServiceMediaGallery.tsx`
  - Media gallery for a given service.
  - Uses `service.slug` + `mediaFolder` → `/api/services/media/[slug]` → Supabase Storage.

## Future admin integration

- Later, an admin app may replace `LOCAL_SERVICES` in `servicesConfig` with DB-backed rows.
- Frontend contract:
  - `fetchServicesConfig()` returns an array of `ServiceDefinition`.
  - `getServiceBySlug(slug)` returns a single `ServiceDefinition | undefined`.
  - Routes and components above should not care if the data came from a TS file or a DB.

Ensure this doc is committed and kept in sync when:
- Adding new services
- Changing slugs or categories
- Moving routes
