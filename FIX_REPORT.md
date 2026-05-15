# FIX_REPORT.md — Ashley M. Brows Platform
**Date:** May 14, 2026 | **Status:** All critical + high priority issues resolved

---

## Summary

8 issues fixed across 9 files. TypeScript: **0 errors**. Build: **✓ 8.74s clean**.

---

## Fixes Applied

### 🔴 Critical #1 — Service Detail Page Refresh Bug
**Status:** ✅ Fixed

**Change:** `/service-detail` (state-only) → `/services/:slug` (URL-based)

| File | What Changed |
|---|---|
| `src/App.tsx` | Added `useParams`, `Navigate`, `useSearchParams` imports |
| `src/App.tsx` | `ServiceDetailPage` now uses `useParams` to get `:slug`, looks up service from `services[]` array |
| `src/App.tsx` | Added `getServiceBySlug()` helper |
| `src/App.tsx` | `handleSelectService()` navigates to `/services/${service.id}` |
| `src/App.tsx` | Removed `selectedService` state from App component |
| `src/App.tsx` | Route changed from `path="/service-detail"` to `path="/services/:slug"` |
| `src/App.tsx` | `getCurrentPage()` handles `/services/:slug` paths |

**Test:** Open `/services/brows` directly in a new tab → page loads. Refresh → page loads. `/services/invalid` → "Service Not Found" message with link back to services.

---

### 🔴 Critical #2 — Admin Role Security (Null Default)
**Status:** ✅ Fixed

| File | What Changed |
|---|---|
| `src/AdminDashboard.tsx` | `fetchRole` now defaults to `null` (not `'staff'`) — users without a `user_roles` row are denied |
| `src/AdminDashboard.tsx` | Added `roleChecked` state — prevents "Access Denied" flash while role loads |
| `src/AdminDashboard.tsx` | `useEffect` now `await`s `fetchRole` before clearing `initialLoading` |
| `src/AdminDashboard.tsx` | Added **Access Denied** UI shown when `session && roleChecked && !userRole` |
| `src/AdminDashboard.tsx` | Auth state change handler resets `userRole` and `roleChecked` on sign-out |

**Test:** Log in with a Supabase Auth account that has no `user_roles` row → see "Access Denied" screen with Sign Out button. Cannot reach dashboard.

---

### 🔴 Critical #3 — Removed Staff Retain Auth Access
**Status:** ✅ Fixed

| File | What Changed |
|---|---|
| `supabase/functions/remove-staff-user/index.ts` | **NEW** — Edge Function that deletes `user_roles` row AND calls `auth.admin.deleteUser()` |
| `src/AdminDashboard.tsx` | `handleRemoveStaff` now calls `remove-staff-user` Edge Function instead of direct DB delete |

**Security:** Prevents self-removal. Prevents removing other `super_admin` accounts. Auth user fully deleted server-side — cannot log in after removal.

**Deploy required:** `supabase functions deploy remove-staff-user`

---

### 🟠 High #4 — CORS Wildcard Removed
**Status:** ✅ Fixed

| File | What Changed |
|---|---|
| `supabase/functions/create-checkout-session/index.ts` | CORS restricted to `ashleymbrows.netlify.app`, `localhost:3000`, `localhost:5173` |
| `supabase/functions/create-staff-user/index.ts` | Same CORS restriction applied |
| `supabase/functions/remove-staff-user/index.ts` | Correct CORS from day 1 |

Note: `stripe-webhook` is called by Stripe servers, not browsers — no CORS needed there.

---

### 🟠 High #5 — Dead Stripe Import Removed
**Status:** ✅ Fixed

| File | What Changed |
|---|---|
| `supabase/functions/create-staff-user/index.ts` | Removed unused `import Stripe from 'npm:stripe@14'` |

---

### 🟠 High #6 — Cancelled Booking Duplicate Issue
**Status:** ✅ Fixed

| File | What Changed |
|---|---|
| `src/BookingResultPages.tsx` | "Try Again" now navigates to `/booking?retry=${bookingId}` |
| `src/App.tsx` | `BookingPage` reads `?retry=` param, sets `step=5` and `bookingId` directly |
| `src/App.tsx` | Booking summary cached to `sessionStorage` at step 4→5 transition |
| `src/App.tsx` | On retry, cached summary (service, date, time) restored from `sessionStorage` |

**Result:** Cancelled user returns to the Stripe deposit step with their existing `booking_id` — no duplicate row created.

---

### 🟠 High #7 — Stripe Payment ID Naming Fixed
**Status:** ✅ Fixed

| File | What Changed |
|---|---|
| `supabase/functions/create-checkout-session/index.ts` | Now stores `session.id` in `stripe_session_id` (not `stripe_payment_intent_id`) |
| `supabase/schema.sql` | Added `stripe_session_id text` column |
| `supabase/schema.sql` | Added `ALTER TABLE` migration for existing databases |

`stripe_payment_intent_id` is now exclusively set by the webhook (`pi_...`). No more column confusion.

---

### 🟠 High #8 — Photo Uploads Now Saved to Storage
**Status:** ✅ Fixed

| File | What Changed |
|---|---|
| `src/App.tsx` | `handleSubmit` uploads both photos to `booking-photos` Storage bucket before insert |
| `src/App.tsx` | `current_area_photo_url` and `reference_photo_url` saved to booking row |
| `supabase/schema.sql` | Added `booking-photos` Storage bucket with RLS policies |
| `supabase/schema.sql` | Added `current_area_photo_url`, `reference_photo_url` columns |

Upload is **non-blocking** — if an upload fails (network issue), the booking still proceeds without photos. Staff can view photos in Supabase Storage Dashboard linked from the booking record.

---

### 🟡 Polish Fixes
**Status:** ✅ Fixed

| Issue | File | Fix |
|---|---|---|
| Dead "Our Standards" footer button | `App.tsx` | Now links to Policies page |
| Dead "Aftercare" footer button | `App.tsx` | Now links to Contact page |
| "Terms" linked to Privacy page | `App.tsx` | Now links to Policies page |
| Empty testimonials blank box (Liner service) | `App.tsx` | Shows "coming soon" placeholder |
| Scroll-to-top `<div>` not accessible | `App.tsx` | Changed to `<button>` with `aria-label` |

---

## Build Results

```
✓ TSC --noEmit: 0 errors
✓ vite build: ✓ built in 8.74s
  dist/assets/index.css   44.48 kB (gzip: 7.96 kB)
  dist/assets/index.js   699.46 kB (gzip: 200.84 kB)
```

**Pre-existing warnings (not regressions):**
- CSS `@import` order — Tailwind v4 `@import url(Google Fonts)` must precede `@theme` block (cosmetic)
- Chunk size > 500KB — single-file SPA; acceptable for this app size

---

## Deployment Checklist (Required After This PR)

- [ ] Run `supabase functions deploy remove-staff-user` (new function)
- [ ] Run `supabase functions deploy create-checkout-session` (CORS + session ID fix)
- [ ] Run `supabase functions deploy create-staff-user` (CORS + dead import fix)
- [ ] Run the schema migration in Supabase SQL Editor:
  ```sql
  alter table public.bookings
    add column if not exists stripe_session_id text,
    add column if not exists current_area_photo_url text,
    add column if not exists reference_photo_url text;
  ```
- [ ] Create `booking-photos` Storage bucket (see schema.sql Storage section)

---

## Remaining Audit Items (Not Blocking Launch)

| Priority | Issue | Status |
|---|---|---|
| 🟡 | Calendar slots not conflict-checked (hardcoded Tue–Fri) | Open — Ashley confirms manually |
| 🟡 | `birthDate` field not validated or saved to DB | Open |
| 🟡 | Instagram feed uses hardcoded mock engagement counts | Open |
| 🟡 | Gallery "Technical Insight" text is generic across all items | Open |
| 🟡 | `@google/genai` unused dependency in package.json | Open |
| 🟡 | `express` / `dotenv` in production deps (should be devDeps) | Open |
| 🟡 | OG card uses portrait photo (not 1200×630 format) | Open |
