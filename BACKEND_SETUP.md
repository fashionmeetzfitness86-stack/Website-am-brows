# BACKEND_SETUP.md — Ashley M. Brows

Complete step-by-step guide to connect Supabase, Stripe, and Netlify.

---

## STEP 1 — Create Your Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create a free account).
2. Click **"New Project"**.
3. Fill in:
   - **Name**: `ashley-m-brows`
   - **Database Password**: generate a strong password and save it somewhere secure
   - **Region**: choose one close to your clients (e.g. US East)
4. Click **"Create new project"** and wait ~2 minutes for it to provision.

---

## STEP 2 — Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar).
2. Click **"New query"**.
3. Open `supabase/schema.sql` from this codebase and paste the entire contents into the editor.
4. Click **"Run"** (or press Cmd+Enter).
5. You should see `Success. No rows returned.`

This creates the `bookings` and `contacts` tables with proper Row Level Security (RLS) policies.

---

## STEP 3 — Get Your Supabase API Keys

1. Go to **Project Settings → API** in Supabase.
2. Copy the following:
   - **Project URL** → this is your `VITE_SUPABASE_URL`
   - **anon / public key** → this is your `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → used only in Edge Functions (NEVER expose in frontend)

---

## STEP 4 — Create the Admin User (Ashley's login)

1. In Supabase, go to **Authentication → Users**.
2. Click **"Add user"**.
3. Enter Ashley's email and a strong password.
4. Click **"Create user"**.

> This is the email/password she will use to log into `/admin`.

---

## STEP 5 — Set Up Stripe

1. Go to [https://stripe.com](https://stripe.com) and create an account.
2. Go to **Developers → API keys**.
3. Copy:
   - **Publishable key** → `VITE_STRIPE_PUBLIC_KEY` (safe for frontend)
   - **Secret key** → `STRIPE_SECRET_KEY` (Edge Functions ONLY — never in React)

### Set up the Stripe Webhook:
1. In Stripe, go to **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://<your-supabase-project-ref>.supabase.co/functions/v1/stripe-webhook`
3. Select event: `checkout.session.completed`
4. Click **"Add endpoint"** and copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## STEP 6 — Deploy the Supabase Edge Functions

Install the Supabase CLI if you haven't:
```bash
npm install -g supabase
```

Login and link your project:
```bash
supabase login
supabase link --project-ref <your-project-ref>
```

Set Edge Function secrets:
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

---

## STEP 7 — Configure Netlify Environment Variables

1. Go to your Netlify dashboard → Your site → **Site configuration → Environment variables**.
2. Add the following variables:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `VITE_STRIPE_PUBLIC_KEY` | Your Stripe publishable key (pk_live_...) |

3. Click **"Save"** and trigger a new deploy.

> **Important:** Never add `STRIPE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to Netlify. Those only go in Supabase Edge Function secrets.

---

## STEP 8 — Local Development (.env file)

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
VITE_STRIPE_PUBLIC_KEY=pk_test_...your-stripe-test-key
```

> `.env.local` is already in `.gitignore` — it will never be committed.

---

## STEP 9 — Verify Everything Works

1. Run `npm run dev` locally.
2. Go to `http://localhost:5173/booking` and complete a test booking.
3. Check Supabase → Table Editor → `bookings` for your new row.
4. Go to `http://localhost:5173/admin` and log in with Ashley's credentials.
5. Confirm the booking appears in the dashboard.
6. Use a Stripe test card (`4242 4242 4242 4242`) to test the deposit checkout.
7. Verify the Supabase row updates to `Paid` / `Confirmed` after the webhook fires.
