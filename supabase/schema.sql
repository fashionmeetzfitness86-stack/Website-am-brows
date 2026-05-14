-- Supabase Schema for Ashley M. Brows

create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  service_name text not null,
  service_price text not null,
  booking_date text not null,
  booking_time text not null,
  referral_source text,
  health_conditions text,
  previous_pmu text,
  skin_type text,
  notes text,
  status text default 'Pending Deposit'::text not null, -- 'Pending Deposit', 'Confirmed', 'Waitlist', 'Cancelled'
  deposit_status text default 'Unpaid'::text not null, -- 'Unpaid', 'Paid'
  stripe_payment_intent_id text
);

create table public.contacts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text not null,
  phone text,
  interested_services text,
  message text not null,
  status text default 'New'::text not null
);

-- Enable RLS
alter table public.bookings enable row level security;
alter table public.contacts enable row level security;

-- Policies
create policy "Allow insert for bookings" on public.bookings for insert with check (true);
create policy "Allow insert for contacts" on public.contacts for insert with check (true);

create policy "Allow full access for authenticated admins" on public.bookings for all using (auth.role() = 'authenticated');
create policy "Allow full access for authenticated admins" on public.contacts for all using (auth.role() = 'authenticated');
