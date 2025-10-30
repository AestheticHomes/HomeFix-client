# HomeFix India — Portable Cleanup Summary

- Date: 2025-10-13 05:48 UTC

## Directory

- Source: /mnt/data/homefix-india-cleanup/homefix-india -cleanup
- Output: /mnt/data/homefix-india-clean

## Deleted Files

- next.config.cjs

## Headers Added

- next.config.js
- postcss.config.js
- tailwind.config.js
- app/layout.js
- app/page.js
- app/admin/layout.js
- app/admin/page.js
- app/admin/bookings/page.js
- app/admin/content/GoodsManager.js
- app/admin/content/page.js
- app/admin/login/page.js
- app/admin/notifications/page.js
- app/api/auth.js
- app/api/book.js
- app/api/services.js
- app/api/admin/reports/export/route.js
- app/api/auth/otp/route.js
- app/api/auth/verify/route.js
- app/api/bookings/route.js
- app/api/bookings/cancel/route.js
- app/api/bookings/reschedule/route.js
- app/api/bookings/[id]/route.js
- app/api/clients/route.js
- app/api/goods/exports/route.js
- app/api/goods/import/route.js
- app/api/otp/route.js
- app/api/otp/verify/route.js
- app/api/profile/route.js
- app/api/profile/update/route.js
- app/api/services/route.js
- app/api/test-db/route.js
- app/api/verify-email/route.js
- app/bookings/page.js
- app/cart/page.js
- app/checkout/page.js
- app/devtools/page.js
- app/login/page.js
- app/profile/page.js
- app/services/page.js
- app/unauthorized/page.js
- app/util/sendEmail.js
- components/BookingForm.js
- components/BottomNav.js
- components/CartContext.js
- components/ClientLayout.js
- components/HeroFX.js
- components/InstallFAB.js
- components/MapPicker.js
- components/MapPicker.jsx
- components/ModalCenter.jsx
- components/Navbar.js
- components/PWAPrompt.js
- components/RateCard.js
- components/ServiceCard.jsx
- components/Sidebar.js
- components/ThemeToggle.js
- components/UserProvider.js
- components/admin/AdminHeader.js
- components/ui/badge.js
- components/ui/button.js
- components/ui/calendar.js
- components/ui/card.js
- components/ui/dialog.js
- components/ui/progress.js
- components/ui/tabs.js
- components/ui/toast.jsx
- components/ui/toaster.js
- components/ui/toaster.jsx
- components/ui/use-toast.js
- hooks/use-toast.js
- lib/auth.js
- lib/goods.js
- lib/supabaseClient.js
- lib/supabaseServer.js
- lib/twilio.js
- lib/util.js
- lib/utils.js
- public/sw.js
- public/workbox-e43f5367.js
- supabase/functions/verify-and-sync-profile.ts
- supabase/functions/notify-booking-status/index.ts
- supabase/functions/notify-email-verified/index.ts
- supabase/functions/notify-user-signup/index.ts
- supabase/functions/send-booking-email/index.ts

## Header Skipped (already had a header or error)

- (none)

## .env Audit (masked)

| Variable | Status | Comment |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | ✅ | present |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ | present |
| SUPABASE_SERVICE_ROLE_KEY | ✅ | present |
| SUPABASE_URL | ✅ | present |
| SUPABASE_KEY | ✅ | present |
| TWILIO_ACCOUNT_SID | ✅ | present |
| TWILIO_AUTH_TOKEN | ✅ | present |
| TWILIO_VERIFY_SERVICE_SID | ✅ | present |
| TEST_PHONE_1 | ✅ | present |
| TEST_PHONE_2 | ✅ | present |
| TEST_OTP_CODE | ✅ | present |
| NEXT_PUBLIC_GOOGLE_MAPS_KEY | ✅ | present |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | ✅ | present |