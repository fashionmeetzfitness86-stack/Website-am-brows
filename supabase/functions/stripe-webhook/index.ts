// Supabase Edge Function: stripe-webhook
// Deploy with: supabase functions deploy stripe-webhook
//
// Environment variables required (set via Supabase Dashboard > Edge Functions > Secrets):
//   STRIPE_SECRET_KEY      — your Stripe secret key
//   STRIPE_WEBHOOK_SECRET  — from Stripe Dashboard > Webhooks > Signing secret
//   SUPABASE_URL           — auto-injected
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected

import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

  if (!signature) {
    console.warn('Webhook received without Stripe signature — rejected');
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2024-06-20',
  });

  // Read raw body — MUST be raw bytes for signature verification
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    // Invalid signature — do not process
    console.error('Webhook signature verification failed:', err);
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Only process checkout.session.completed
  if (event.type !== 'checkout.session.completed') {
    return new Response(JSON.stringify({ received: true, skipped: event.type }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const booking_id = session.metadata?.booking_id;

  if (!booking_id) {
    console.error('No booking_id in Stripe session metadata');
    return new Response('No booking_id in metadata', { status: 400 });
  }

  // Initialize Supabase service role client
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // Check if already confirmed — prevent duplicate updates on webhook retry
  const { data: existing } = await supabase
    .from('bookings')
    .select('id, status, deposit_status')
    .eq('id', booking_id)
    .single();

  if (existing?.deposit_status === 'Paid') {
    console.log(`Booking ${booking_id} already marked Paid — skipping duplicate webhook`);
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Update booking to Confirmed + Paid
  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      status: 'Confirmed',
      deposit_status: 'Paid',
      stripe_payment_intent_id: session.payment_intent as string ?? session.id,
    })
    .eq('id', booking_id);

  if (updateError) {
    console.error('Failed to update booking status:', updateError);
    return new Response('Failed to update booking', { status: 500 });
  }

  console.log(`Booking ${booking_id} confirmed successfully via Stripe webhook`);
  return new Response(JSON.stringify({ received: true, booking_id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
