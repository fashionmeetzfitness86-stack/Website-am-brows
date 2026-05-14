# STRIPE_SUPABASE_QA.md — Payment Integration Test Checklist
_Use this checklist every time you deploy or make backend changes._

Use Stripe test card: `4242 4242 4242 4242` | Exp: any future date | CVC: any 3 digits

---

## Section 1 — Database Setup

| # | Test | Expected Result | Status |
|---|---|---|---|
| 1.1 | Run `supabase/schema.sql` in SQL Editor | No errors, tables created | ☐ |
| 1.2 | Confirm `bookings` table exists | Visible in Table Editor | ☐ |
| 1.3 | Confirm `contacts` table exists | Visible in Table Editor | ☐ |
| 1.4 | Confirm RLS is enabled on both tables | Green lock icon in Table Editor | ☐ |

---

## Section 2 — Booking Form → Supabase Insert

| # | Test | Expected Result | Status |
|---|---|---|---|
| 2.1 | Go to `/booking`, complete all 4 steps | No errors, advances to Step 5 | ☐ |
| 2.2 | Check Supabase → `bookings` table | Row inserted with `status: Pending Deposit`, `deposit_status: Unpaid` | ☐ |
| 2.3 | Submit with missing required fields | Inline validation errors shown | ☐ |
| 2.4 | Submit without policy checkbox | "Please acknowledge our policies" error shown | ☐ |
| 2.5 | Submit on mobile (iPhone Safari) | Form works, advances correctly | ☐ |

---

## Section 3 — Stripe Checkout Session

| # | Test | Expected Result | Status |
|---|---|---|---|
| 3.1 | Reach Step 5, click "Pay Deposit & Confirm Booking" | Loading state shown, then redirect to Stripe | ☐ |
| 3.2 | Verify Stripe Checkout page shows correct service name | e.g. "Booking Deposit — Signature Brows" | ☐ |
| 3.3 | Verify deposit amount is correct | $100 for Brows/Lips, $75 for Liner | ☐ |
| 3.4 | Verify client email is pre-filled on Stripe page | Matches what was entered in form | ☐ |
| 3.5 | If Edge Function not deployed, error message shown | "Unable to connect to payment…" error displayed cleanly | ☐ |

---

## Section 4 — Successful Payment

| # | Test | Expected Result | Status |
|---|---|---|---|
| 4.1 | Complete payment with test card `4242 4242 4242 4242` | Redirect to `/booking/success` | ☐ |
| 4.2 | Success page shows booking reference | 8-char booking ID visible | ☐ |
| 4.3 | Check Supabase `bookings` row | `status: Confirmed`, `deposit_status: Paid` | ☐ |
| 4.4 | Check Admin Dashboard | Booking shows as Confirmed + Paid | ☐ |
| 4.5 | Stripe webhook does not duplicate update | Row not double-updated on retry | ☐ |

---

## Section 5 — Cancelled Payment

| # | Test | Expected Result | Status |
|---|---|---|---|
| 5.1 | Click "Back" or close Stripe page | Redirect to `/booking/cancelled` | ☐ |
| 5.2 | Cancelled page shows correct message | "Your deposit was not completed" | ☐ |
| 5.3 | Booking row in Supabase unchanged | `status: Pending Deposit`, `deposit_status: Unpaid` | ☐ |
| 5.4 | "Try Again" button works | Returns to `/booking` | ☐ |

---

## Section 6 — Admin Dashboard

| # | Test | Expected Result | Status |
|---|---|---|---|
| 6.1 | Visit `/admin` without login | Login gate shown, no data visible | ☐ |
| 6.2 | Login with wrong credentials | Error message shown | ☐ |
| 6.3 | Login with correct credentials | Dashboard loads with live data | ☐ |
| 6.4 | Refresh page after login | Session persists, still logged in | ☐ |
| 6.5 | Dashboard shows Pending Deposit bookings | Amber badge displayed | ☐ |
| 6.6 | Dashboard shows Confirmed + Paid bookings | Green badge displayed | ☐ |
| 6.7 | Leads tab shows contact form submissions | All fields visible | ☐ |
| 6.8 | Sign Out button works | Returns to login screen | ☐ |

---

## Section 7 — Contact Form

| # | Test | Expected Result | Status |
|---|---|---|---|
| 7.1 | Submit contact form at `/contact` | Success confirmation shown | ☐ |
| 7.2 | Check Supabase → `contacts` table | Row inserted with `status: New` | ☐ |
| 7.3 | Submit with missing fields | Validation errors shown | ☐ |

---

## Section 8 — Routing & Deployment

| # | Test | Expected Result | Status |
|---|---|---|---|
| 8.1 | Navigate directly to `ashleymbrows.netlify.app/booking` | Booking page loads (not 404) | ☐ |
| 8.2 | Navigate directly to `/admin` | Login screen loads | ☐ |
| 8.3 | Navigate directly to `/booking/success` | Success page loads | ☐ |
| 8.4 | Refresh any deep-link route | No 404 error (due to `_redirects`) | ☐ |
| 8.5 | Confirm Netlify env vars are set | Build succeeds with no placeholder warnings | ☐ |

---

## Section 9 — Security Verification

| # | Check | Verified |
|---|---|---|
| 9.1 | `STRIPE_SECRET_KEY` is NOT in any `.tsx`, `.ts`, or `.env` frontend files | ☐ |
| 9.2 | `SUPABASE_SERVICE_ROLE_KEY` is NOT in any frontend files | ☐ |
| 9.3 | Public users cannot `SELECT` from `bookings` (RLS blocks it) | ☐ |
| 9.4 | `/admin` data is only visible after login | ☐ |
| 9.5 | Stripe webhook verifies signature before processing | ☐ (code reviewed) |

---

## Final Sign-Off

> ✅ The platform is **production-ready** when all items above are checked.
> 
> Do NOT go live until Sections 3, 4, and 6 are fully verified with live Stripe and Supabase keys.
