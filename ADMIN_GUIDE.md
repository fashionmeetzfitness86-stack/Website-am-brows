# Ashley M. Brows — Admin Guide
> Studio Dashboard Reference · For Ashley Miller and Studio Staff

---

## Getting Started

### Logging In

1. Navigate to **`/login`** (or tap the copyright "Ashley M. Brows" text in the footer).
2. Enter your **email** and **password**.
3. You will be redirected to the Studio Dashboard automatically.

> **Forgot your password?** Enter your email address in the login form, then click **"Forgot Password?"** — a reset link will be sent to your inbox.

---

## The Dashboard Overview

When you log in, you'll see:

- **Stats bar at the top** — total requests, new requests, confirmed appointments, and contact leads. These update in real time.
- **Sidebar navigation** — switch between tabs: **Requests**, **Leads**, and **Team** (super admin only).
- **Search bar** — search across client names, emails, services, or dates from any tab.
- **Notification bell** — shows a red badge when new bookings come in.

---

## Managing Consultation Requests

### Viewing Requests

Click the **Requests** tab in the sidebar. All consultation submissions appear in a table.

| Column | What it shows |
|---|---|
| Client | Name, email, and phone |
| Service | Service name and price |
| Appointment | Requested date and time |
| Status | Current booking status |
| Notes | Client-entered notes (truncated) |
| Created | Submission date |

**Click any row** to open the full detail panel on the right.

### Filtering and Searching

- Use the **search bar** at the top to find by name, email, service, or date.
- Use the **status filter** buttons (All / New Request / Confirmed / Cancelled) to narrow the list.

---

## Working With a Booking (Detail Panel)

Clicking a booking row opens a slide-over panel on the right. Here's what you can do:

### 1. View Client Details
- Full name, email, phone
- Service and requested date/time
- Health conditions, skin type, previous PMU
- Client notes
- Before/reference photos (if uploaded)

Click **"View / Print Document"** to open a printable intake form.

### 2. Confirm the Appointment

**Option A — Approve their requested time:**
Click the green **"Approve Requested Time"** button. This sets the confirmed date/time to exactly what they picked and changes status to `Confirmed`.

**Option B — Set a custom time:**
Type a custom date (e.g. `June 14, 2026`) and time (e.g. `10:00 AM`) in the input fields, then click **"Save Confirmed Time"**. Status updates to `Confirmed`.

### 3. Send a Confirmation Email
Once a confirmed date/time is set, click **"Send Confirmation Email"** to send a branded email to the client. The email includes:
- The confirmed service, date, and time
- Studio location (Stay Gold Beauty, Brighton)
- A link to the booking policies
- Any admin notes you've added

> ⚠️ **You must set a confirmed date/time before sending the email.** The button will show an error if none is set.

A green ✓ **"Email sent"** indicator appears once the email has been delivered.

### 4. Add Admin Notes
Use the **"Admin Notes (Private)"** section to write internal notes visible only to studio staff. Click **"Save Notes"** to store them.

> Notes are included in the confirmation email to the client as a "Note from Ashley" if entered.

### 5. Change Status
Use the **status dropdown** in the bookings table to quickly update a booking without opening the panel:
- **New Request** — just submitted, not yet reviewed
- **Under Review** — you've seen it, deciding
- **Confirmed** — appointment locked in
- **Rescheduled** — date has changed
- **Completed** — service delivered
- **Cancelled** — no longer proceeding
- **No Show** — client did not appear

### 6. Cancel or Delete a Booking

In the bottom of the detail panel:
- **Cancel Request** — sets status to `Cancelled`. Record is kept.
- **Delete** — permanently removes the booking from the database. Use with caution.

---

## Contact Leads Tab

Contact form submissions from the website appear here. Each row shows:

- Lead name and email
- Subject / service of interest
- Message preview
- Status (New / Contacted / Converted / Closed)

> Currently, lead status can only be updated by editing the record directly in Supabase. A status dropdown for leads is on the roadmap.

---

## Team Management (Super Admin Only)

The **Team** tab is only visible to the Super Admin account.

### Adding a Staff Member

1. Fill in **Full Name**, **Email**, and **Password** (min 8 characters).
2. Click **"Create Staff Account"**.
3. Share the email and password with the staff member — they can log in immediately at `/login`.

### Editing a Staff Member

Click **Edit** next to any staff member in the team table to open their edit panel. You can update their:
- Name and email
- Access level (Staff or Super Admin)
- Password (leave blank to keep current)

### Removing a Staff Member

Click **Remove** (or use the Danger Zone in the edit panel). The staff member's account is fully deleted — they will no longer be able to log in.

> You cannot remove your own account or another Super Admin.

---

## Email Notifications

The notification bell (top right) shows a badge when new bookings come in. Click it to see recent notifications. You can clear individual notifications or all at once.

> **Note:** The notification bell requires the `notifications` table to be set up in Supabase and the `notify-new-booking` Edge Function to be deployed and registered as a database webhook. See `BACKEND_SETUP.md` for setup instructions.

---

## Quick Reference: Status Meanings

| Status | Meaning |
|---|---|
| New Request | Client just submitted — not yet reviewed |
| Under Review | You've opened it and are considering |
| Confirmed | Date/time confirmed, email sent |
| Rescheduled | Original date changed |
| Completed | Service delivered successfully |
| Cancelled | Appointment will not proceed |
| No Show | Client did not appear at confirmed time |

---

## Tips & Best Practices

- **Process new requests within 24 hours** — clients are told to expect a follow-up in 1–2 business days.
- **Always confirm date/time before sending the email** — the email pulls the confirmed fields, not the client's requested fields.
- **Check the photos** before the appointment — clients may upload a current photo and a reference/inspiration photo.
- **Use the Print Document button** to get a clean intake form PDF for your records before each appointment.
- **Keep admin notes concise** — they appear verbatim in the confirmation email if entered.

---

## Logging Out

Click **Sign Out** at the bottom of the sidebar. You will be redirected to the login page.
