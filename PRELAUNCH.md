# PRELAUNCH.md — Ashley M. Brows Production Launch Checklist
_Complete every section in order before going live._

---

## ✅ SECTION 1 — Supabase Backend Setup

- [ ] 1.1 Create project at [supabase.com](https://supabase.com) — name: `ashley-m-brows`
- [ ] 1.2 Go to **SQL Editor → New Query** and paste + run `supabase/schema.sql`
- [ ] 1.3 Confirm `bookings` table exists in Table Editor
- [ ] 1.4 Confirm `contacts` table exists in Table Editor
- [ ] 1.5 Confirm RLS is **enabled** on both tables (green lock icon)
- [ ] 1.6 Copy **Project URL** → save as `VITE_SUPABASE_URL`
- [ ] 1.7 Copy **anon / public key** → save as `VITE_SUPABASE_ANON_KEY`
- [ ] 1.8 Copy **service_role key** → save for Edge Functions (never put in frontend)

---

## ✅ SECTION 2 — Admin User Creation

- [ ] 2.1 Go to Supabase → **Authentication → Users → Add User**
- [ ] 2.2 Enter Ashley's email address
- [ ] 2.3 Create a strong password (use a password manager)
- [ ] 2.4 Click **Create User**
- [ ] 2.5 Test login at `https://ashleymbrows.netlify.app/admin`
- [ ] 2.6 Confirm dashboard loads with live data after login

---

## ✅ SECTION 3 — Stripe Setup

- [ ] 3.1 Create account at [stripe.com](https://stripe.com) — use business email
- [ ] 3.2 Complete Stripe KYC/onboarding to enable live payments
- [ ] 3.3 Go to **Developers → API Keys**
- [ ] 3.4 Copy **Publishable key** (`pk_live_...`) → save as `VITE_STRIPE_PUBLIC_KEY`
- [ ] 3.5 Copy **Secret key** (`sk_live_...`) → save for Edge Functions (never frontend)
- [ ] 3.6 Set **webhook** endpoint URL:
  ```
  https://<your-supabase-project-ref>.supabase.co/functions/v1/stripe-webhook
  ```
- [ ] 3.7 Select event: `checkout.session.completed`
- [ ] 3.8 Copy **Signing secret** (`whsec_...`) → save as `STRIPE_WEBHOOK_SECRET`

---

## ✅ SECTION 4 — Edge Function Deployment

Install Supabase CLI (if not installed):
```bash
npm install -g supabase
```

Login and link project:
```bash
supabase login
supabase link --project-ref <your-project-ref>
```

Set secrets (run each separately):
```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SITE_URL=https://ashleymbrows.netlify.app
```

Deploy both functions:
```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

- [ ] 4.1 Secrets are set (verify: `supabase secrets list`)
- [ ] 4.2 `create-checkout-session` deployed successfully
- [ ] 4.3 `stripe-webhook` deployed successfully
- [ ] 4.4 Test function: `supabase functions serve create-checkout-session` locally

---

## ✅ SECTION 5 — Netlify Environment Variables

Go to: Netlify Dashboard → Your Site → Site Configuration → Environment Variables

Add these three variables:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | From Supabase Project Settings |
| `VITE_SUPABASE_ANON_KEY` | From Supabase Project Settings |
| `VITE_STRIPE_PUBLIC_KEY` | From Stripe Developers page |

- [ ] 5.1 `VITE_SUPABASE_URL` added to Netlify
- [ ] 5.2 `VITE_SUPABASE_ANON_KEY` added to Netlify
- [ ] 5.3 `VITE_STRIPE_PUBLIC_KEY` added to Netlify
- [ ] 5.4 Triggered a new Netlify deploy after adding vars
- [ ] 5.5 Build succeeded — no env var warnings

---

## ✅ SECTION 6 — Production Test Flow

> Use Stripe test card: `4242 4242 4242 4242` | Exp: any future | CVC: any 3 digits

- [ ] 6.1 Go to `/booking`, select a service, date, and time
- [ ] 6.2 Fill in client info form — submit → advances to Step 5 (deposit)
- [ ] 6.3 Check Supabase → `bookings` table — row created with `status: Pending Deposit`
- [ ] 6.4 Click "Pay Deposit & Confirm Booking" → redirects to Stripe Checkout
- [ ] 6.5 Complete test payment with test card
- [ ] 6.6 Redirected to `/booking/success` ✓
- [ ] 6.7 Supabase row updates: `status: Confirmed`, `deposit_status: Paid`
- [ ] 6.8 Admin dashboard shows the confirmed booking with green badge
- [ ] 6.9 Test cancelling payment → redirected to `/booking/cancelled`
- [ ] 6.10 Test contact form at `/contact` → row appears in `contacts` table
- [ ] 6.11 Admin dashboard shows new lead in Leads tab

---

## ✅ SECTION 7 — DNS & Domain Checklist

- [ ] 7.1 Domain purchased (e.g. `ashleymbrows.com`)
- [ ] 7.2 Add custom domain in Netlify: **Domain Settings → Add Custom Domain**
- [ ] 7.3 Update DNS at registrar with Netlify nameservers or CNAME
- [ ] 7.4 Wait for DNS propagation (15 min – 48 hrs)
- [ ] 7.5 HTTPS/SSL auto-provisioned by Netlify ✓
- [ ] 7.6 Update canonical URL in `index.html` to final domain
- [ ] 7.7 Update `og:url` in `index.html` to final domain
- [ ] 7.8 Update `SITE_URL` Edge Function secret to final domain
- [ ] 7.9 Update Stripe webhook endpoint URL to final domain
- [ ] 7.10 Update Stripe success/cancel URLs in Edge Function if using hardcoded domain

---

## ✅ SECTION 8 — Analytics Setup

- [ ] 8.1 Create [Google Analytics 4](https://analytics.google.com) property
- [ ] 8.2 Copy Measurement ID (G-XXXXXXXXXX)
- [ ] 8.3 Add GA4 snippet to `index.html` `<head>` (or use Netlify's snippet injection)
- [ ] 8.4 Verify data is arriving in GA4 Real-Time view
- [ ] 8.5 Optional: Set up conversion event for `/booking/success`
- [ ] 8.6 Optional: Set up [Google Search Console](https://search.google.com/search-console) and submit sitemap (`/sitemap.xml`)

---

## ✅ SECTION 9 — SEO Final Check

- [ ] 9.1 Open Graph preview — test at [opengraph.xyz](https://www.opengraph.xyz)
- [ ] 9.2 Twitter/X card preview — test at [cards-dev.twitter.com](https://cards-dev.twitter.com/validator)
- [ ] 9.3 iMessage link preview shows correct image and title
- [ ] 9.4 Google structured data — test at [schema.org validator](https://validator.schema.org)
- [ ] 9.5 `/sitemap.xml` is accessible and contains all pages
- [ ] 9.6 `/robots.txt` is accessible and correct
- [ ] 9.7 All page titles update correctly when navigating routes

---

## ✅ SECTION 10 — Security Final Check

- [ ] 10.1 `STRIPE_SECRET_KEY` NOT in any `.tsx`, `.ts`, or `index.html` file
- [ ] 10.2 `SUPABASE_SERVICE_ROLE_KEY` NOT in any frontend file
- [ ] 10.3 `.env.local` is NOT committed to git (check with `git status`)
- [ ] 10.4 RLS is enabled on `bookings` and `contacts` tables
- [ ] 10.5 Unauthenticated users cannot access `/admin` data
- [ ] 10.6 Stripe webhook signature is verified before processing (code review ✓)

---

## ✅ SECTION 11 — Backup & Recovery Notes

- **Database backups**: Supabase automatically creates daily backups on paid plans. Upgrade from free tier before launch.
- **Git**: All code is version-controlled at GitHub. Tag your launch commit: `git tag v1.0.0-launch && git push --tags`
- **Stripe**: All payment records are stored in your Stripe dashboard independently of Supabase.
- **Rollback**: To roll back to a previous deploy, use Netlify's deploy history → "Publish deploy" on any prior build.
- **Schema recovery**: Run `supabase/schema.sql` again to recreate tables if lost (idempotent with `IF NOT EXISTS`).

---

## 🚀 LAUNCH SIGN-OFF

> The platform is ready to go live when ALL boxes above are checked.
> 
> **Switch Stripe from test mode to live mode** as the final step — update `VITE_STRIPE_PUBLIC_KEY` to `pk_live_...` and `STRIPE_SECRET_KEY` Edge Function secret to `sk_live_...`, then redeploy.

**Estimated setup time**: 2–3 hours for a developer, 30 min with guidance.
**First real booking**: Should arrive within 24–48 hours of a social post linking to `/booking`.
