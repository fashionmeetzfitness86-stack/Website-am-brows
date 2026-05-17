# Ashley M. Brows — Launch Checklist
> Version 1.0 — Final Pre-Launch QA · Updated May 2026

---

## ✅ DEPLOYMENT

- [ ] Netlify deploy is live at `https://ashleymbrows.netlify.app`
- [ ] Custom domain (if applicable) has DNS pointing to Netlify
- [ ] HTTPS is active (padlock shows in browser)
- [ ] `public/_redirects` contains `/* /index.html 200` for SPA routing
- [ ] `/login` loads correctly when navigated to directly (no 404)
- [ ] `/admin` loads correctly when navigated to directly (redirects to login if unauthenticated)
- [ ] `/gallery` loads correctly on hard refresh
- [ ] `/booking` loads correctly on hard refresh
- [ ] No `404` errors on any direct URL navigation

---

## ✅ ENVIRONMENT VARIABLES (Netlify → Site Settings → Environment Variables)

- [ ] `VITE_SUPABASE_URL` — set to your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` — set to your Supabase anon/public key
- [ ] Both variables are scoped to `Production` and `Deploy Preview`
- [ ] Site redeploys after env vars are added

---

## ✅ SUPABASE SETUP

- [ ] Schema applied (`supabase/schema.sql` run in SQL Editor)
- [ ] `bookings` table exists with all columns
- [ ] `contacts` table exists
- [ ] `user_roles` table exists
- [ ] RLS enabled on all three tables
- [ ] All RLS policies created (public INSERT, authenticated SELECT/UPDATE)
- [ ] `booking-photos` storage bucket exists and is private
- [ ] Storage policies applied (anon upload, authenticated view/delete)
- [ ] Super admin user created in Supabase Auth → Users
- [ ] Super admin `user_roles` row inserted with `role = 'super_admin'`
- [ ] Anderson can log in at `/login` and access `/admin`

---

## ✅ EDGE FUNCTIONS (Supabase Dashboard → Edge Functions)

All functions must be deployed: `supabase functions deploy <name>`

- [ ] `create-staff-user` — deployed
- [ ] `remove-staff-user` — deployed
- [ ] `update-staff-user` — deployed
- [ ] `send-confirmation-email` — deployed
- [ ] `stripe-webhook` — deployed (even if Stripe is not yet active)
- [ ] `notify-new-booking` — deployed

**Edge Function Secrets** (Supabase → Edge Functions → Manage Secrets):
- [ ] `RESEND_API_KEY` — from resend.com (required for confirmation emails)
- [ ] `FROM_EMAIL` — e.g. `Ashley M. Brows <hello@ashleymbrows.com>`
- [ ] `SITE_URL` — `https://ashleymbrows.netlify.app`
- [ ] `STRIPE_SECRET_KEY` — (if Stripe active)
- [ ] `STRIPE_WEBHOOK_SECRET` — (if Stripe active)

---

## ✅ FULL BOOKING FLOW TEST

Run this end-to-end before launch:

- [ ] Visit `/booking` as an anonymous user
- [ ] Select a service
- [ ] Pick a date (Tue–Fri only should be available)
- [ ] Pick a time
- [ ] Fill in all required fields (name, email, phone, health, policy)
- [ ] Submit — step 5 confirmation screen appears
- [ ] Row appears in Supabase → `bookings` table with `status = 'New Request'`
- [ ] Admin sees it in `/admin` → Requests tab
- [ ] Admin opens booking, sets confirmed date/time, clicks "Save Confirmed Time"
- [ ] Admin clicks "Send Confirmation Email" — client receives email
- [ ] `email_confirmation_sent = true` in the database row

---

## ✅ ADMIN LOGIN + ACCESS

- [ ] Navigate to `/login` — login form appears
- [ ] Login with wrong password — error message appears (not a crash)
- [ ] Login with non-staff account — "Access Denied" screen appears
- [ ] Login with super_admin credentials — dashboard loads
- [ ] Requests tab shows bookings
- [ ] Leads tab shows contact form submissions
- [ ] Team tab visible for super_admin only
- [ ] Staff member (non-super_admin) cannot see Team tab
- [ ] Logout button works and redirects to `/login`

---

## ✅ CONTACT FORM TEST

- [ ] Visit `/contact`
- [ ] Submit form with empty fields — validation errors appear
- [ ] Submit valid form — "Message Sent" confirmation appears
- [ ] Row appears in Supabase → `contacts` table
- [ ] Admin sees the lead in `/admin` → Leads tab

---

## ✅ SEO / META

- [ ] Favicon appears in browser tab (logo.png)
- [ ] Page title updates per route (check `/gallery`, `/booking`, `/artist`)
- [ ] Meta description updates per route
- [ ] OG preview looks correct when shared on iMessage/WhatsApp (paste URL in WhatsApp to test)
- [ ] Twitter card renders with image
- [ ] `robots.txt` allows crawling (`/public/robots.txt`)
- [ ] `sitemap.xml` present at `/sitemap.xml`
- [ ] Structured data (BeautySalon schema) visible in browser source

---

## ✅ MOBILE QA

Test on real device or Chrome DevTools mobile emulation (375px, 414px):

- [ ] Hero text scales — no overflow
- [ ] Sticky "Book Now" bar appears at bottom on mobile
- [ ] Mobile menu opens and closes
- [ ] Mobile menu scroll lock works (background does not scroll)
- [ ] Booking flow steps are readable on small screens
- [ ] Gallery grid is 2 columns on mobile
- [ ] Gallery modal is usable on mobile (not cut off)
- [ ] Admin dashboard — not required to be fully mobile-optimised (desktop tool)

---

## ✅ PERFORMANCE

- [ ] Images load with `loading="lazy"` (gallery, Instagram feed)
- [ ] `ashley-portrait.jpg` (hero/about) loads fast — consider compressing if >500KB
- [ ] No console errors in production build
- [ ] No failed network requests (check Network tab in DevTools)
- [ ] Animations are smooth (no jank on mid-range Android)

---

## ✅ SECURITY

- [ ] `/admin` redirects to `/login` for unauthenticated users
- [ ] Non-staff authenticated user sees "Access Denied" (not dashboard data)
- [ ] No API keys visible in browser DevTools → Sources (search for `sk_`, `eyJ`)
- [ ] Supabase anon key is safe to be public (it is — RLS protects the data)
- [ ] `VITE_` prefix keys are the only ones in the frontend bundle

---

## 🚀 LAUNCH

- [ ] All items above checked
- [ ] Final Netlify deploy triggered
- [ ] Ashley has logged in and confirmed she can see the dashboard
- [ ] Instagram bio / other links updated to point to the new URL
