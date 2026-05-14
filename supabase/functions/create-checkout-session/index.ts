// Supabase Edge Function: create-checkout-session
// Deploy with: supabase functions deploy create-checkout-session
//
// Environment variables required (set via Supabase Dashboard > Edge Functions > Secrets):
//   STRIPE_SECRET_KEY  — your Stripe secret key (sk_live_... or sk_test_...)
//   SUPABASE_URL       — auto-injected by Supabase runtime
//   SUPABASE_SERVICE_ROLE_KEY — auto-injected by Supabase runtime

import Stripe from 'npm:stripe@14';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { booking_id } = await req.json();

    if (!booking_id) {
      return new Response(JSON.stringify({ error: 'booking_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase with service role to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Look up the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError);
      return new Response(JSON.stringify({ error: 'Booking not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse deposit amount — "  $100 deposit" → 10000 (cents)
    const depositStr: string = booking.service_price || '100';
    const depositDollars = parseInt(depositStr.replace(/[^0-9]/g, ''), 10) || 100;
    // Use a fixed deposit amount per service rather than full price
    const depositAmount = booking.deposit_amount_cents || 10000; // default $100

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2024-06-20',
    });

    // Determine the site URL (set SITE_URL env var in Supabase secrets)
    const siteUrl = Deno.env.get('SITE_URL') || 'https://ashleymbrows.netlify.app';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Booking Deposit — ${booking.service_name}`,
              description: `Non-refundable deposit to confirm your ${booking.service_name} appointment on ${booking.booking_date} at ${booking.booking_time}.`,
              images: [`${siteUrl}/og-preview.jpg`],
            },
            unit_amount: depositAmount,
          },
          quantity: 1,
        },
      ],
      customer_email: booking.client_email,
      metadata: {
        booking_id: booking.id,
        client_name: booking.client_name,
        service_name: booking.service_name,
        booking_date: booking.booking_date,
        booking_time: booking.booking_time,
      },
      success_url: `${siteUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${siteUrl}/booking/cancelled?booking_id=${booking.id}`,
    });

    // Update booking with Stripe session ID (status still Pending Deposit until webhook fires)
    await supabase
      .from('bookings')
      .update({ stripe_payment_intent_id: session.id, status: 'Pending Deposit' })
      .eq('id', booking.id);

    return new Response(JSON.stringify({ url: session.url, session_id: session.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('create-checkout-session error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
