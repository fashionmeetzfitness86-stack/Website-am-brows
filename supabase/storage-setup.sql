-- Ashley M. Brows — Storage bucket for CMS image uploads
-- Run this in Supabase SQL Editor (after cms-schema.sql).

-- ─────────────────────────────────────────────────────────────
-- 1. Create the public bucket
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

-- ─────────────────────────────────────────────────────────────
-- 2. Policies
-- ─────────────────────────────────────────────────────────────
drop policy if exists "site-images public read"   on storage.objects;
drop policy if exists "site-images admin insert"  on storage.objects;
drop policy if exists "site-images admin update"  on storage.objects;
drop policy if exists "site-images admin delete"  on storage.objects;

-- Anyone (including unauthenticated visitors) can read uploaded photos.
create policy "site-images public read"
  on storage.objects for select
  using (bucket_id = 'site-images');

-- Only super_admins can upload, replace, or delete.
create policy "site-images admin insert"
  on storage.objects for insert
  with check (
    bucket_id = 'site-images'
    and exists (select 1 from public.user_roles ur
                where ur.user_id = auth.uid() and ur.role = 'super_admin')
  );

create policy "site-images admin update"
  on storage.objects for update
  using (
    bucket_id = 'site-images'
    and exists (select 1 from public.user_roles ur
                where ur.user_id = auth.uid() and ur.role = 'super_admin')
  );

create policy "site-images admin delete"
  on storage.objects for delete
  using (
    bucket_id = 'site-images'
    and exists (select 1 from public.user_roles ur
                where ur.user_id = auth.uid() and ur.role = 'super_admin')
  );
