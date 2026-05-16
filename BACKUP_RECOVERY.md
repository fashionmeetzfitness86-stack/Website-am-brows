# 🛡️ Ashley M. Brows — Backup & Recovery Procedures

While Supabase and Netlify are highly reliable, having a structured backup and recovery plan ensures business continuity in the event of an emergency.

---

## 1. Database Backups (Supabase)

Supabase automatically handles daily backups for your database on their paid plans (Pro plan and above). For the free tier, backups must be managed manually.

### How to export data manually (CSV):
1. Log into your **Supabase Dashboard**.
2. Go to the **Table Editor**.
3. Select the `bookings` table.
4. Click the **Export** button in the top right corner.
5. Select **Export as CSV**.
6. Repeat this process for the `contacts` table.
7. *Recommendation:* Do this weekly or bi-weekly and save the files in a secure, encrypted cloud folder (e.g., Google Drive, Dropbox) to keep a physical copy of your clients' data.

### Point-in-Time Recovery (PITR):
If you upgrade to the Supabase Pro plan, you gain access to **Point-in-Time Recovery (PITR)**. This allows you to revert your database to any specific second in the past (up to 7 days), preventing data loss in case of accidental deletion.

---

## 2. Source Code Backups (GitHub)

The entire application's source code is hosted on **GitHub**.
- Every change is tracked via version control.
- If the website code breaks or a bad deployment occurs, you can easily "revert" to the previous working commit.
- **Action:** Ensure you do not delete the GitHub repository. It acts as the ultimate backup of the actual website structure and logic.

---

## 3. Deployment Recovery (Netlify)

Netlify automatically keeps a history of every single deployment. If a new deployment introduces a bug, you can instantly rollback.

### How to Rollback a Deployment:
1. Log into your **Netlify Dashboard**.
2. Select your site (`ashleymbrows`).
3. Click on the **Deploys** tab.
4. You will see a list of all historical deployments. 
5. Find the last known working deploy (marked as "Published" in the past).
6. Click on it, then click **Publish Deploy**.
7. The website will instantly revert to that exact version without affecting the Supabase database.

---

## 4. Edge Functions & Secrets

If you ever need to recreate the Supabase project from scratch:
1. You will need to run the `supabase/schema.sql` file to recreate the tables.
2. You will need to re-deploy the edge functions via the CLI:
   `supabase functions deploy remove-staff-user`
   `supabase functions deploy send-confirmation-email`
3. You will need to re-add your secrets to the new Supabase project:
   `RESEND_API_KEY`, `FROM_EMAIL`, `SITE_URL`

Keep a secure record of your API Keys (Resend, Stripe if ever re-enabled) in a password manager (like 1Password or Bitwarden). Never store them in plain text files.
