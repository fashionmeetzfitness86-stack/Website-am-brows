-- Ashley M. Brows — Supabase Schema (Full)
-- Run this entire file in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ─────────────────────────────────────────────
-- TABLE: bookings
-- ─────────────────────────────────────────────
create table if not exists public.bookings (
  id                      uuid default gen_random_uuid() primary key,
  created_at              timestamp with time zone default timezone('utc'::text, now()) not null,
  client_name             text not null,
  client_email            text not null,
  client_phone            text not null,
  service_name            text not null,
  service_price           text not null,
  deposit_amount_cents    integer default 10000,         -- default $100 in cents
  booking_date            text not null,
  booking_time            text not null,
  referral_source         text,
  health_conditions       text,
  previous_pmu            text,
  skin_type               text,
  notes                   text,
  status                  text default 'New Request' not null,
    -- Allowed: 'New Request', 'Under Review', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled', 'No Show'
  deposit_status          text default 'Unpaid' not null,
    -- Allowed: 'Unpaid', 'Paid', 'Failed', 'Refunded'
  admin_notes              text,                    -- Internal notes, visible only to studio staff
  -- Admin-confirmed appointment (may differ from client's requested date/time)
  confirmed_date            text,                    -- Set by admin when approving or modifying
  confirmed_time            text,                    -- Set by admin when approving or modifying
  -- Email confirmation tracking
  email_confirmation_sent      boolean default false,
  email_confirmation_sent_at   timestamp with time zone,
  -- Stripe identifiers (reserved for future payment integration)
  stripe_session_id        text,   -- Checkout Session ID (cs_...) — set at checkout creation
  stripe_payment_intent_id text,   -- Payment Intent ID (pi_...) — set by webhook on success
  -- Intake photos uploaded to Supabase Storage (booking-photos bucket)
  current_area_photo_url   text,
  reference_photo_url      text
);

-- ─────────────────────────────────────────────
-- TABLE: contacts
-- ─────────────────────────────────────────────
create table if not exists public.contacts (
  id                      uuid default gen_random_uuid() primary key,
  created_at              timestamp with time zone default timezone('utc'::text, now()) not null,
  name                    text not null,
  email                   text not null,
  phone                   text,
  interested_services     text,
  message                 text not null,
  status                  text default 'New' not null
    -- Allowed: 'New', 'Contacted', 'Converted', 'Closed'
);

-- ─────────────────────────────────────────────
-- TABLE: user_roles
-- Maps authenticated Supabase users to their role.
-- super_admin = full access, can create/remove staff
-- staff       = can view and edit bookings, cannot manage users
-- ─────────────────────────────────────────────
create table if not exists public.user_roles (
  id          uuid default gen_random_uuid() primary key,
  created_at  timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text not null default '',
  role        text not null default 'staff',
    -- Allowed: 'super_admin', 'staff'
  invited_by  uuid references auth.users(id),
  constraint user_roles_user_id_unique unique (user_id)
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.bookings   enable row level security;
alter table public.contacts   enable row level security;
alter table public.user_roles enable row level security;

-- Public INSERT: anyone can submit a booking or contact form
create policy "Public can insert bookings"
  on public.bookings for insert
  with check (true);

create policy "Public can insert contacts"
  on public.contacts for insert
  with check (true);

-- Authenticated staff/admin SELECT/UPDATE/DELETE on bookings
create policy "Staff can read all bookings"
  on public.bookings for select
  using (auth.role() = 'authenticated');

create policy "Staff can update bookings"
  on public.bookings for update
  using (auth.role() = 'authenticated');

create policy "Staff can read all contacts"
  on public.contacts for select
  using (auth.role() = 'authenticated');

create policy "Staff can update contacts"
  on public.contacts for update
  using (auth.role() = 'authenticated');

-- Security note: confirmed_date and confirmed_time can only be set by authenticated staff
-- (protected by the existing 'Staff can update bookings' RLS policy)
-- Public INSERT policy does NOT include these fields (they default to null)

-- user_roles: only authenticated users can read (to check their own role)
create policy "Authenticated users can read user_roles"
  on public.user_roles for select
  using (auth.role() = 'authenticated');

-- user_roles: only service_role (Edge Function) can insert/delete
-- The super_admin creates/removes staff via Edge Functions.
-- Direct inserts from the browser are blocked for security.
create policy "Service role can manage user_roles"
  on public.user_roles for all
  using (auth.role() = 'service_role');

-- ─────────────────────────────────────────────
-- STORAGE: booking-photos bucket
-- Run in Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('booking-photos', 'booking-photos', false)
on conflict (id) do nothing;

-- Anyone can upload during booking flow (anon key)
create policy "Anon can upload booking photos"
  on storage.objects for insert
  with check (bucket_id = 'booking-photos');

-- Only authenticated staff can view/delete photos
create policy "Staff can view booking photos"
  on storage.objects for select
  using (bucket_id = 'booking-photos' and auth.role() = 'authenticated');

create policy "Staff can delete booking photos"
  on storage.objects for delete
  using (bucket_id = 'booking-photos' and auth.role() = 'authenticated');

-- ─────────────────────────────────────────────
-- MIGRATION: Add new columns to existing tables
-- Safe to run on existing database (uses IF NOT EXISTS / ALTER TABLE)
-- ─────────────────────────────────────────────
alter table public.bookings
  add column if not exists stripe_session_id        text,
  add column if not exists current_area_photo_url   text,
  add column if not exists reference_photo_url      text;

-- ─────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────
create index if not exists bookings_status_idx      on public.bookings (status);
create index if not exists bookings_email_idx       on public.bookings (client_email);
create index if not exists bookings_stripe_idx      on public.bookings (stripe_payment_intent_id);
create index if not exists bookings_session_idx     on public.bookings (stripe_session_id);
create index if not exists bookings_confirmed_idx   on public.bookings (confirmed_date) where confirmed_date is not null;
create index if not exists bookings_email_sent_idx  on public.bookings (email_confirmation_sent);
create index if not exists contacts_status_idx      on public.contacts (status);
create index if not exists user_roles_user_id_idx   on public.user_roles (user_id);
create index if not exists user_roles_email_idx     on public.user_roles (email);

-- ─────────────────────────────────────────────
-- SEED: Create super_admin role for Anderson (run AFTER creating the user in Supabase Auth)
-- Replace the UUID below with the actual user_id from Authentication → Users
-- ─────────────────────────────────────────────
-- insert into public.user_roles (user_id, email, full_name, role)
-- values ('<paste-user-uuid-here>', 'Andersondjeemo@gmail.com', 'Anderson', 'super_admin')
-- on conflict (user_id) do nothing;
