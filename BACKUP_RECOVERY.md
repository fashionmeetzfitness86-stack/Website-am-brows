# Ashley M. Brows — Backup & Recovery Guide
> Platform Resilience Reference · Updated May 2026

---

## Architecture Overview

The Ashley M. Brows platform has three main components:

| Component | Service | Recovery If Lost |
|---|---|---|
| Frontend (React app) | Netlify | Redeploy from GitHub in 2 minutes |
| Database | Supabase (PostgreSQL) | Restore from backup or re-run schema |
| File Storage | Supabase Storage | Client photos (non-critical) |
| Edge Functions | Supabase Deno | Redeploy via CLI |

---

## Regular Backup Recommendations

### 1. Database Exports (Monthly Minimum)

Export all booking and contact data from Supabase regularly:

**Option A — CSV export:**
1. Supabase Dashboard → Table Editor
2. Open `bookings` table
3. Click **"Download CSV"** (top right)
4. Repeat for `contacts` and `user_roles`

**Option B — SQL dump:**
Supabase Pro plans include automatic daily backups. For free-tier projects, set a reminder to export manually.

```bash
# If you have the Supabase CLI installed:
supabase db dump --linked > backup-$(date +%Y%m%d).sql
```

### 2. Code Repository

Ensure the codebase is pushed to GitHub regularly. All source files are in `c:\Users\Anderson\Website-am-brows`.

```bash
git add .
git commit -m "Checkpoint — [date]"
git push origin main
```

---

## Recovery Scenarios

---

### Scenario A — Netlify Deploy Is Down

**Symptoms:** Site is unreachable. Netlify status page shows an incident.

**Recovery:**
1. Check [https://www.netlifystatus.com](https://www.netlifystatus.com)
2. If Netlify is down globally — wait for resolution (usually < 1 hour)
3. If only your deploy is broken — go to Netlify Dashboard → Deploys → click the last successful deploy → "Publish Deploy"
4. If the deploy itself is broken — check the deploy log for errors, fix, push again

---

### Scenario B — Lost Access to Admin Dashboard

**Symptoms:** Ashley cannot log in. Credentials don't work.

**Recovery:**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Open your project → **Authentication** → **Users**
3. Find the user email
4. Click the user → **Reset Password** or **Send magic link**
5. If the `user_roles` row is missing (causing "Access Denied"):

```sql
-- Run in Supabase SQL Editor:
-- Replace the UUID with the actual user ID from Authentication > Users
INSERT INTO public.user_roles (user_id, email, full_name, role)
VALUES ('<paste-user-uuid-here>', 'Andersondjeemo@gmail.com', 'Anderson', 'super_admin')
ON CONFLICT (user_id) DO NOTHING;
```

---

### Scenario C — Database Accidentally Wiped / Corrupted

**Symptoms:** Bookings or contacts data is missing.

**Recovery — from CSV backup:**
1. Supabase Dashboard → Table Editor → `bookings`
2. Click **"Insert rows"** → upload the CSV
3. Repeat for `contacts`

**Recovery — full schema reset (last resort):**
1. Supabase Dashboard → SQL Editor
2. Paste and run the full contents of `supabase/schema.sql`
3. Note: This uses `IF NOT EXISTS` — safe to run on a live database
4. Re-insert the super_admin `user_roles` row (see Scenario B)

---

### Scenario D — Edge Function Errors

**Symptoms:** Confirmation emails not sending, staff creation/removal failing.

**Check:**
1. Supabase Dashboard → Edge Functions → click the function → **Logs**
2. Look for error messages

**Common fixes:**
| Error | Fix |
|---|---|
| `RESEND_API_KEY not set` | Add the key in Edge Functions → Secrets |
| `Function not found` | Deploy with `supabase functions deploy <name>` |
| `Unauthorized` | Check the caller is logged in with a valid JWT |
| `Forbidden` | Verify the user has the correct role in `user_roles` |

**Redeploy all functions (requires Supabase CLI):**
```bash
supabase link --project-ref <your-project-ref>
supabase functions deploy create-staff-user
supabase functions deploy remove-staff-user
supabase functions deploy update-staff-user
supabase functions deploy send-confirmation-email
supabase functions deploy notify-new-booking
supabase functions deploy stripe-webhook
```

---

### Scenario E — Storage Photos Lost

**Symptoms:** Client intake photos not displaying in admin dashboard.

**Context:** Photos are stored in the private `booking-photos` Supabase Storage bucket. If a photo is deleted from storage, the URL in the booking row still exists but the image returns a 404.

**Recovery:**
- Photos cannot be recovered once deleted from storage.
- The booking record itself (form data, health conditions, notes) is unaffected.
- Ask the client to resubmit photos if needed.

**Prevention:**
- Do not manually delete files from the `booking-photos` bucket unless intentional.
- The "Delete" button in the admin dashboard only deletes the database row, not the storage file.

---

### Scenario F — Netlify Environment Variables Missing

**Symptoms:** Site loads but shows a startup error, or Supabase calls all fail.

**Recovery:**
1. Netlify Dashboard → Site Settings → Environment Variables
2. Add the following:
   - `VITE_SUPABASE_URL` — from Supabase → Settings → API
   - `VITE_SUPABASE_ANON_KEY` — from Supabase → Settings → API (anon / public key)
3. Trigger a new deploy: Netlify → Deploys → "Trigger deploy"

---

## Key Credentials & Locations

> ⚠️ Keep these secure. Never commit secrets to Git.

| Credential | Location |
|---|---|
| Supabase Project URL | Supabase Dashboard → Settings → API |
| Supabase Anon Key | Supabase Dashboard → Settings → API |
| Supabase Service Role Key | Supabase Dashboard → Settings → API (never expose publicly) |
| Netlify Site URL | Netlify Dashboard → Site Overview |
| Resend API Key | resend.com → API Keys |
| Admin Login | Supabase Auth → Users |

---

## Contact & Support

| Service | Support URL |
|---|---|
| Netlify | support.netlify.com |
| Supabase | supabase.com/support |
| Resend (email) | resend.com/docs |

---

## Emergency Contacts

- **Developer:** Anderson — Andersondjeemo@gmail.com
- **Studio Owner:** Ashley Miller — ashleymbrows@gmail.com
