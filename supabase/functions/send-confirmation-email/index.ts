// supabase/functions/send-confirmation-email/index.ts
// Sends a branded confirmation email to the client when admin confirms/modifies their consultation.
// Only callable by authenticated super_admin or staff.
//
// Required secrets (Supabase Dashboard > Edge Functions > Secrets):
//   RESEND_API_KEY     — from resend.com
//   FROM_EMAIL         — e.g. "Ashley M. Brows <hello@ashleymbrows.com>"
//   SITE_URL           — e.g. https://ashleymbrows.netlify.app

import { createClient } from 'npm:@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://ashleymbrows.netlify.app',
  'http://localhost:3000',
  'http://localhost:5173',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('Origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

function json(body: object, status = 200, req: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: getCorsHeaders(req) });

  try {
    // ── 1. Authenticate caller (must be staff or super_admin) ─────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401, req);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const anonKey     = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: callerUser }, error: callerError } = await callerClient.auth.getUser();
    if (callerError || !callerUser) return json({ error: 'Invalid session' }, 401, req);

    const { data: callerRole } = await callerClient
      .from('user_roles').select('role').eq('user_id', callerUser.id).single();
    if (!callerRole || !['super_admin', 'staff'].includes(callerRole.role)) {
      return json({ error: 'Forbidden' }, 403, req);
    }

    // ── 2. Parse body ─────────────────────────────────────────────────────────
    const { booking_id, email_type } = await req.json();
    // email_type: 'approved' | 'modified' | 'rescheduled' | 'cancelled'
    if (!booking_id) return json({ error: 'booking_id is required' }, 400, req);

    // ── 3. Fetch booking ──────────────────────────────────────────────────────
    const adminClient = createClient(supabaseUrl, serviceKey);
    const { data: booking, error: bErr } = await adminClient
      .from('bookings').select('*').eq('id', booking_id).single();
    if (bErr || !booking) return json({ error: 'Booking not found' }, 404, req);

    if (!booking.confirmed_date || !booking.confirmed_time) {
      return json({ error: 'Cannot send email — no confirmed date/time set yet.' }, 400, req);
    }

    // ── 4. Build email content ────────────────────────────────────────────────
    const siteUrl = Deno.env.get('SITE_URL') || 'https://ashleymbrows.netlify.app';
    const fromEmail = Deno.env.get('FROM_EMAIL') || 'Ashley M. Brows <hello@ashleymbrows.com>';

    const isModified = email_type === 'modified' || email_type === 'rescheduled';
    const isCancelled = email_type === 'cancelled';

    let subjectLine: string;
    let headlineText: string;
    let bodyText: string;

    if (isCancelled) {
      subjectLine = 'Your Consultation Request — Ashley M. Brows';
      headlineText = 'Consultation Update';
      bodyText = `We regret to inform you that your consultation request for <strong>${booking.service_name}</strong> has been cancelled. Please contact us to reschedule.`;
    } else if (isModified) {
      subjectLine = `Your Consultation Has Been Rescheduled — Ashley M. Brows`;
      headlineText = 'Your Consultation Time Has Been Updated';
      bodyText = `Your consultation time has been updated and confirmed. Please note the new date and time below.`;
    } else {
      subjectLine = `Your Consultation Is Confirmed — Ashley M. Brows`;
      headlineText = 'Your Consultation Is Confirmed';
      bodyText = `Your requested consultation time has been approved and confirmed. We look forward to seeing you!`;
    }

    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subjectLine}</title>
</head>
<body style="margin:0;padding:0;background:#FBF8F4;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F4;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #EFE7DC;">
        <!-- Header -->
        <tr>
          <td style="background:#3B2A1A;padding:32px 40px;text-align:center;">
            <p style="margin:0;color:#E8DDD0;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;font-family:sans-serif;">Ashley M. Brows</p>
            <h1 style="margin:8px 0 0;color:#FBF8F4;font-size:28px;font-weight:400;letter-spacing:0.05em;">${headlineText}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 24px;color:#3B2A1A;font-size:16px;line-height:1.7;">Dear <strong>${booking.client_name}</strong>,</p>
            <p style="margin:0 0 32px;color:#6B5744;font-size:15px;line-height:1.8;">${bodyText}</p>
            ${!isCancelled ? `
            <!-- Appointment Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF8F4;border:1px solid #EFE7DC;margin-bottom:32px;">
              <tr><td style="padding:24px 28px;">
                <p style="margin:0 0 16px;color:#7F4F24;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;font-family:sans-serif;font-weight:bold;">Your Confirmed Consultation</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;color:#6B5744;font-size:13px;font-family:sans-serif;width:140px;">Service</td>
                    <td style="padding:6px 0;color:#3B2A1A;font-size:13px;font-weight:bold;font-family:sans-serif;">${booking.service_name}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6B5744;font-size:13px;font-family:sans-serif;">Confirmed Date</td>
                    <td style="padding:6px 0;color:#3B2A1A;font-size:13px;font-weight:bold;font-family:sans-serif;">${booking.confirmed_date}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6B5744;font-size:13px;font-family:sans-serif;">Confirmed Time</td>
                    <td style="padding:6px 0;color:#3B2A1A;font-size:13px;font-weight:bold;font-family:sans-serif;">${booking.confirmed_time}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#6B5744;font-size:13px;font-family:sans-serif;">Location</td>
                    <td style="padding:6px 0;color:#3B2A1A;font-size:13px;font-family:sans-serif;">Stay Gold Beauty, 8105 Grand River Rd., Brighton, MI 48114</td>
                  </tr>
                </table>
              </td></tr>
            </table>
            ` : ''}
            <!-- Notes from admin if any -->
            ${booking.admin_notes ? `<p style="margin:0 0 24px;padding:16px 20px;background:#EFE7DC;color:#3B2A1A;font-size:14px;line-height:1.7;font-family:sans-serif;"><strong>Note from Ashley:</strong> ${booking.admin_notes}</p>` : ''}
            <p style="margin:0 0 8px;color:#6B5744;font-size:14px;line-height:1.7;font-family:sans-serif;">If you have any questions, reply to this email or reach us at <a href="mailto:ashleymbrows@gmail.com" style="color:#7F4F24;">ashleymbrows@gmail.com</a>.</p>
            <p style="margin:0 0 32px;color:#6B5744;font-size:14px;line-height:1.7;font-family:sans-serif;">Please review our <a href="${siteUrl}/policies" style="color:#7F4F24;">booking policies</a> before your appointment.</p>
            <p style="margin:0;color:#3B2A1A;font-size:15px;">Warmly,<br/><strong>Ashley Miller</strong><br/><span style="color:#7F4F24;font-size:13px;font-family:sans-serif;">Ashley M. Brows</span></p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #EFE7DC;text-align:center;">
            <p style="margin:0;color:#9B8B7A;font-size:11px;font-family:sans-serif;">8105 Grand River Rd., Brighton, MI 48114 · <a href="mailto:ashleymbrows@gmail.com" style="color:#7F4F24;">ashleymbrows@gmail.com</a></p>
            <p style="margin:8px 0 0;color:#C5B8AC;font-size:10px;font-family:sans-serif;letter-spacing:0.2em;text-transform:uppercase;">© ${new Date().getFullYear()} Ashley M. Brows. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // ── 5. Send via Resend ────────────────────────────────────────────────────
    const resendKey = Deno.env.get('RESEND_API_KEY') ?? '';
    if (!resendKey) {
      console.warn('RESEND_API_KEY not set — email skipped in development');
      // Still mark as sent so we don't block the workflow in dev
    } else {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromEmail,
          to: [booking.client_email],
          subject: subjectLine,
          html: emailHtml,
        }),
      });
      if (!resendRes.ok) {
        const errBody = await resendRes.text();
        console.error('Resend error:', errBody);
        return json({ error: 'Email delivery failed: ' + errBody }, 500, req);
      }
    }

    // ── 6. Update booking — mark email sent ───────────────────────────────────
    await adminClient.from('bookings').update({
      email_confirmation_sent: true,
      email_confirmation_sent_at: new Date().toISOString(),
    }).eq('id', booking_id);

    console.log(`Confirmation email sent for booking ${booking_id} to ${booking.client_email}`);
    return json({ success: true, email: booking.client_email }, 200, req);

  } catch (err) {
    console.error('send-confirmation-email error:', err);
    return json({ error: 'Internal server error' }, 500, req);
  }
});
