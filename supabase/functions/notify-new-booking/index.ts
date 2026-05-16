// supabase/functions/notify-new-booking/index.ts
// Called by a Supabase Database Webhook when a new row is inserted into public.bookings.
// Sends an email alert to all super_admins and any staff with email_notifications=true.
// Also writes an in-app notification row per recipient into public.notifications.
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, FROM_EMAIL, SITE_URL

import { createClient } from 'npm:@supabase/supabase-js@2';

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl  = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const resendKey    = Deno.env.get('RESEND_API_KEY') ?? '';
    const fromEmail    = Deno.env.get('FROM_EMAIL') ?? 'Ashley M. Brows <hello@ashleymbrows.com>';
    const siteUrl      = Deno.env.get('SITE_URL') ?? 'https://ashleymbrows.netlify.app';

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Supabase DB Webhook sends the new row as { type, table, record, ... }
    const payload = await req.json();
    const booking = payload.record;

    if (!booking || !booking.id) {
      return json({ error: 'No booking record in payload' }, 400);
    }

    // ── 1. Find all recipients ─────────────────────────────────────────────────
    // super_admins always get notified; staff only if email_notifications = true
    const { data: recipients } = await adminClient
      .from('user_roles')
      .select('user_id, email, full_name, role, email_notifications')
      .or('role.eq.super_admin,and(role.eq.staff,email_notifications.eq.true)');

    if (!recipients || recipients.length === 0) {
      return json({ success: true, message: 'No recipients configured.' });
    }

    const adminUrl = `${siteUrl}/admin`;
    const bookingDate = booking.booking_date ?? 'TBD';
    const bookingTime = booking.booking_time ?? 'TBD';

    // ── 2. Build email HTML ────────────────────────────────────────────────────
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#FBF8F4;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #EFE7DC;">
        <tr>
          <td style="background:#3B2A1A;padding:28px 40px;text-align:center;">
            <p style="margin:0;color:#E8DDD0;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;font-family:sans-serif;">Ashley M. Brows Studio</p>
            <h1 style="margin:8px 0 0;color:#FBF8F4;font-size:24px;font-weight:400;letter-spacing:0.05em;">New Consultation Request</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 24px;color:#3B2A1A;font-size:15px;line-height:1.7;">A new consultation request has been submitted. Here are the details:</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F4;border:1px solid #EFE7DC;margin-bottom:28px;">
              <tr><td style="padding:20px 24px;">
                <p style="margin:0 0 14px;color:#7F4F24;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;font-family:sans-serif;font-weight:bold;">Booking Details</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:5px 0;color:#6B5744;font-size:13px;font-family:sans-serif;width:130px;">Client Name</td>
                    <td style="padding:5px 0;color:#3B2A1A;font-size:13px;font-weight:bold;font-family:sans-serif;">${booking.client_name}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#6B5744;font-size:13px;font-family:sans-serif;">Email</td>
                    <td style="padding:5px 0;color:#3B2A1A;font-size:13px;font-family:sans-serif;">${booking.client_email}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#6B5744;font-size:13px;font-family:sans-serif;">Phone</td>
                    <td style="padding:5px 0;color:#3B2A1A;font-size:13px;font-family:sans-serif;">${booking.client_phone ?? '—'}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#6B5744;font-size:13px;font-family:sans-serif;">Service</td>
                    <td style="padding:5px 0;color:#3B2A1A;font-size:13px;font-weight:bold;font-family:sans-serif;">${booking.service_name}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#6B5744;font-size:13px;font-family:sans-serif;">Requested Date</td>
                    <td style="padding:5px 0;color:#3B2A1A;font-size:13px;font-family:sans-serif;">${bookingDate}</td>
                  </tr>
                  <tr>
                    <td style="padding:5px 0;color:#6B5744;font-size:13px;font-family:sans-serif;">Requested Time</td>
                    <td style="padding:5px 0;color:#3B2A1A;font-size:13px;font-family:sans-serif;">${bookingTime}</td>
                  </tr>
                  ${booking.health_conditions ? `<tr>
                    <td style="padding:5px 0;color:#6B5744;font-size:13px;font-family:sans-serif;">Health Notes</td>
                    <td style="padding:5px 0;color:#3B2A1A;font-size:13px;font-family:sans-serif;">${booking.health_conditions}</td>
                  </tr>` : ''}
                </table>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center">
                  <a href="${adminUrl}" style="display:inline-block;background:#3B2A1A;color:#FBF8F4;font-family:sans-serif;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;font-weight:bold;padding:14px 32px;text-decoration:none;">
                    Review in Dashboard →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #EFE7DC;text-align:center;">
            <p style="margin:0;color:#9B8B7A;font-size:11px;font-family:sans-serif;">Ashley M. Brows · 8105 Grand River Rd., Brighton, MI 48114</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // ── 3. Send emails and write notification rows ──────────────────────────────
    const notifRows = recipients.map((r: any) => ({
      user_id: r.user_id,
      type: 'new_booking',
      title: 'New Consultation Request',
      body: `${booking.client_name} requested ${booking.service_name} on ${bookingDate} at ${bookingTime}.`,
      booking_id: booking.id,
      read: false,
    }));

    // Insert in-app notifications
    await adminClient.from('notifications').insert(notifRows);

    // Send email to each recipient (if Resend key is set)
    if (resendKey) {
      const emailJobs = recipients.map((r: any) =>
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [r.email],
            subject: `New Request: ${booking.client_name} — ${booking.service_name}`,
            html: emailHtml,
          }),
        })
      );
      await Promise.allSettled(emailJobs);
    }

    return json({ success: true, recipients: recipients.length });

  } catch (err: any) {
    console.error('notify-new-booking error:', err);
    return json({ error: err.message }, 500);
  }
});
