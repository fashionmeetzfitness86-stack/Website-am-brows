# 🚀 Ashley M. Brows — Final Pre-Launch Checklist

This document is your final QA checklist before officially opening the platform to the public. It covers technical, operational, and visual aspects of the launch.

---

## 1. Domain & DNS Verification
- [ ] **Custom Domain Live:** Confirm `ashleymbrows.com` (or primary domain) is fully propagated and pointing to Netlify.
- [ ] **SSL/HTTPS Active:** Confirm the padlock appears in the browser bar and no "Not Secure" warnings are shown.
- [ ] **Redirects Configured:** Ensure the `.netlify.app` domain redirects to your primary custom domain (if configured in Netlify settings).
- [ ] **SPA Routing Functional:** Directly visit `/login` and `/admin` in the browser to ensure no 404 errors appear upon refresh (handled by `public/_redirects`).

## 2. Admin & Security Readiness
- [ ] **Admin Login Test:** Log out and log back into `/login` using the real production Supabase credentials.
- [ ] **Access Guard Working:** Attempt to visit `/admin` in an incognito window without logging in to verify it immediately redirects you back to `/login`.
- [ ] **Production Keys Secure:** Verify Netlify Environment Variables use the `live` keys (if applicable) and Edge Functions have all required secrets (`RESEND_API_KEY`, `FROM_EMAIL`, etc.).

## 3. Real-World Booking Simulation
Run an end-to-end test pretending to be a real client:
- [ ] Select a service, date, and time.
- [ ] Fill out the intake form completely (upload a test photo if possible).
- [ ] Submit the consultation request.
- [ ] Confirm you reach the "Request Received" success screen.
- [ ] Log into the Admin Dashboard and verify the new request appears under the "New Request" status.

## 4. Email Communication Verification
- [ ] **Approve Request:** In the Admin Dashboard, click "Approve Requested Time" for your test booking.
- [ ] **Check Inbox:** Verify the test email address receives the branded HTML "Consultation Confirmed" email.
- [ ] **Visual Check:** Confirm the email looks professional on both mobile and desktop.
- [ ] **Reschedule Test:** Send a "Reschedule" email from the dashboard and verify the copy changes correctly.

## 5. Mobile & UX Polish
- [ ] **Mobile Safari/Chrome:** Open the site on a mobile device to ensure the hero image looks correct and the "Book Consultation" sticky button is easily clickable.
- [ ] **Navigation:** Open and close the mobile menu; ensure it prevents background scrolling while open.
- [ ] **Animations:** Verify scroll animations are smooth and not causing performance stutter.

## 6. Social & SEO Verification
- [ ] **Favicon:** Ensure the logo icon appears in the browser tab.
- [ ] **Open Graph (OG) Tags:** Paste your live URL into a Facebook post or iMessage and confirm the preview image and text render correctly.
- [ ] **Google Business:** Add the live website link to your Google Business Profile.

---
*Once all items are checked off, the platform is officially ready for public announcement!*
