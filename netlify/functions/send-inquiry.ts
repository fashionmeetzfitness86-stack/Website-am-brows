// send-inquiry — Netlify Function
// Receives contact form submissions and:
//   1. Sends a notification email to Ashley
//   2. Sends an auto-reply confirmation to the client
// Uses Resend for transactional email delivery.
//
// Required env vars (Netlify → Site → Build & deploy → Environment):
//   RESEND_API_KEY   — from resend.com
//   FROM_EMAIL       — e.g. "Ashley M. Brows <onboarding@resend.dev>"
//   ASHLEY_EMAIL     — destination inbox, e.g. "ashleymbrows@gmail.com"

import type { Handler } from '@netlify/functions';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS, body: 'ok' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS, body: 'Method not allowed' };
  }

  try {
    const { name, email, phone, service, city, preferredDate, message, consent } =
      JSON.parse(event.body ?? '{}');

    if (!name || !email || !message) {
      return {
        statusCode: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required fields.' }),
      };
    }
    if (!consent) {
      return {
        statusCode: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Consent is required.' }),
      };
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL ?? 'Ashley M. Brows <onboarding@resend.dev>';
    const ASHLEY_EMAIL = process.env.ASHLEY_EMAIL ?? 'ashleymbrows@gmail.com';

    if (!RESEND_API_KEY) {
      console.error('[send-inquiry] RESEND_API_KEY not set in Netlify env.');
      return {
        statusCode: 500,
        headers: { ...CORS, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Email service not configured.' }),
      };
    }

    const submittedAt = new Date().toLocaleString('en-US', {
      timeZone: 'America/Detroit',
      dateStyle: 'full',
      timeStyle: 'short',
    });

    const notifyHtml = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E4DF;">
    <div style="background:#1A1714;padding:40px 48px;text-align:center;">
      <p style="color:#C4A882;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;margin:0 0 8px;">New Inquiry</p>
      <h1 style="color:#FAF9F7;font-size:28px;font-weight:400;margin:0;letter-spacing:0.02em;">Ashley M. Brows</h1>
    </div>
    <div style="padding:48px;color:#1A1714;">
      <h2 style="font-size:22px;font-weight:400;margin:0 0 8px;">You have a new inquiry</h2>
      <p style="color:#888;font-size:12px;margin:0 0 36px;">${submittedAt} · Eastern Time</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.8;">
        <tr><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;color:#888;width:160px;">Name</td><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;font-weight:600;">${name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;color:#888;">Email</td><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;"><a href="mailto:${email}" style="color:#C4A882;">${email}</a></td></tr>
        ${phone ? `<tr><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;color:#888;">Phone</td><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;">${phone}</td></tr>` : ''}
        ${service ? `<tr><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;color:#888;">Service</td><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;">${service}</td></tr>` : ''}
        ${city ? `<tr><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;color:#888;">Location</td><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;">${city}</td></tr>` : ''}
        ${preferredDate ? `<tr><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;color:#888;">Preferred Date</td><td style="padding:10px 0;border-bottom:1px solid #F0EDE9;">${preferredDate}</td></tr>` : ''}
      </table>
      <div style="margin-top:32px;padding:24px;background:#FAF9F7;border-left:3px solid #C4A882;">
        <p style="font-size:11px;text-transform:uppercase;letter-spacing:0.3em;color:#888;margin:0 0 12px;">Message</p>
        <p style="font-size:15px;line-height:1.7;margin:0;">${String(message).replace(/\n/g, '<br>')}</p>
      </div>
      <div style="margin-top:36px;text-align:center;">
        <a href="mailto:${email}?subject=Re: Your Ashley M. Brows Inquiry" style="display:inline-block;padding:16px 40px;background:#C4A882;color:#FFFFFF;text-decoration:none;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;font-weight:700;">Reply to ${name}</a>
      </div>
    </div>
    <div style="background:#FAF9F7;padding:24px 48px;text-align:center;border-top:1px solid #E8E4DF;">
      <p style="font-size:11px;color:#BBB;margin:0;">Ashley M. Brows · Brighton MI · ashleymbrows@gmail.com</p>
    </div>
  </div>
</body></html>`;

    const replyHtml = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#FAF9F7;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:0 auto;background:#FFFFFF;border:1px solid #E8E4DF;">
    <div style="background:#1A1714;padding:40px 48px;text-align:center;">
      <p style="color:#C4A882;font-size:10px;letter-spacing:0.5em;text-transform:uppercase;margin:0 0 8px;">Studio Inquiry</p>
      <h1 style="color:#FAF9F7;font-size:28px;font-weight:400;margin:0;">Ashley M. Brows</h1>
    </div>
    <div style="padding:48px;color:#1A1714;">
      <h2 style="font-size:24px;font-weight:400;margin:0 0 20px;">Thank you, ${name}.</h2>
      <p style="font-size:15px;color:#555;line-height:1.8;margin:0 0 24px;">
        Your inquiry has been received. Ashley personally reviews every message and will be in touch within <strong>1–2 business days</strong> to discuss your service and schedule a consultation.
      </p>
      ${service ? `<div style="padding:20px 24px;background:#FAF9F7;border-left:3px solid #C4A882;margin-bottom:32px;"><p style="font-size:11px;text-transform:uppercase;letter-spacing:0.3em;color:#888;margin:0 0 8px;">Service of Interest</p><p style="font-size:15px;font-weight:600;margin:0;">${service}</p></div>` : ''}
      <p style="font-size:13px;color:#999;margin:0;">
        If you have urgent questions, email Ashley directly at <a href="mailto:ashleymbrows@gmail.com" style="color:#C4A882;">ashleymbrows@gmail.com</a>.
      </p>
    </div>
    <div style="background:#FAF9F7;padding:24px 48px;text-align:center;border-top:1px solid #E8E4DF;">
      <p style="font-size:11px;color:#BBB;margin:0;">Ashley M. Brows · Brighton MI</p>
      <p style="font-size:10px;color:#CCC;margin:8px 0 0;">This is an automated confirmation — please do not reply to this email.</p>
    </div>
  </div>
</body></html>`;

    const sendEmail = async (to: string, subject: string, html: string) => {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? `Resend error ${res.status}`);
      return data;
    };

    await sendEmail(ASHLEY_EMAIL, `New Inquiry from ${name} — Ashley M. Brows`, notifyHtml);
    try {
      await sendEmail(email, 'We received your inquiry — Ashley M. Brows', replyHtml);
    } catch (replyErr) {
      console.warn('[send-inquiry] Auto-reply failed (non-fatal):', replyErr);
    }

    return {
      statusCode: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('[send-inquiry] Unexpected error:', err);
    return {
      statusCode: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to send inquiry. Please try again.' }),
    };
  }
};
