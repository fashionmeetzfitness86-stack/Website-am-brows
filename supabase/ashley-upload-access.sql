-- Ashley M. Brows — Grant Ashley upload access to the admin dashboard.
-- Safe to re-run anytime: every statement is idempotent (won't fail if already applied).
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/kxkgvmydvkhrqudpvper/sql/new

-- 1. Make sure ashleymbrows@gmail.com is super_admin in user_roles.
update public.user_roles
set role = 'super_admin'
where email = 'ashleymbrows@gmail.com';

-- 2. Make sure the public bucket exists for photo uploads.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

-- 3. (Re)create storage policies for the bucket.
drop policy if exists "site-images public read"  on storage.objects;
drop policy if exists "site-images admin insert" on storage.objects;
drop policy if exists "site-images admin update" on storage.objects;
drop policy if exists "site-images admin delete" on storage.objects;

create policy "site-images public read"
  on storage.objects for select
  using (bucket_id = 'site-images');

create policy "site-images admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'site-images'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'super_admin'
    )
  );

create policy "site-images admin update"
  on storage.objects for update
  using (
    bucket_id = 'site-images'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'super_admin'
    )
  );

create policy "site-images admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'site-images'
    and exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role = 'super_admin'
    )
  );

-- 4. Verify — should return Ashley with role 'super_admin'.
select email, role from public.user_roles where email = 'ashleymbrows@gmail.com';
