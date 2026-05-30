-- ═══════════════════════════════════════════════════════════════
-- ASHLEY M. BROWS — Dashboard CMS Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ─── TABLE: gallery_items ───────────────────────────────────────
create table if not exists public.gallery_items (
  id           uuid default gen_random_uuid() primary key,
  created_at   timestamp with time zone default timezone('utc', now()) not null,
  url          text not null,
  storage_path text not null,
  type         text not null default 'photo', -- 'photo' | 'video'
  caption      text not null default '',
  category     text not null default 'Other',
  sort_order   int  not null default 0
);

alter table public.gallery_items enable row level security;

create policy "Public can view gallery"
  on public.gallery_items for select using (true);

create policy "Authenticated can manage gallery"
  on public.gallery_items for all
  using (auth.role() = 'authenticated');

-- ─── TABLE: services_cms ────────────────────────────────────────
create table if not exists public.services_cms (
  id                uuid default gen_random_uuid() primary key,
  created_at        timestamp with time zone default timezone('utc', now()) not null,
  title             text not null default '',
  price             text not null default '',
  short_description text not null default '',
  description       text not null default '',
  image_url         text not null default '',
  tags              text[] not null default '{}',
  sort_order        int   not null default 0,
  is_active         boolean not null default true
);

alter table public.services_cms enable row level security;

create policy "Public can view active services"
  on public.services_cms for select using (true);

create policy "Authenticated can manage services"
  on public.services_cms for all
  using (auth.role() = 'authenticated');

-- ─── TABLE: site_content ────────────────────────────────────────
create table if not exists public.site_content (
  key     text primary key,
  value   text not null default '',
  label   text not null default '',
  section text not null default 'general'
);

alter table public.site_content enable row level security;

create policy "Public can view site content"
  on public.site_content for select using (true);

create policy "Authenticated can manage site content"
  on public.site_content for all
  using (auth.role() = 'authenticated');

-- ─── STORAGE: gallery bucket ────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

create policy "Public can view gallery storage"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "Authenticated can upload to gallery"
  on storage.objects for insert
  with check (bucket_id = 'gallery' and auth.role() = 'authenticated');

create policy "Authenticated can delete from gallery"
  on storage.objects for delete
  using (bucket_id = 'gallery' and auth.role() = 'authenticated');

-- ─── SEED: site_content default values ──────────────────────────
insert into public.site_content (key, value, label, section) values
  ('hero_tagline',       'Ashley Miller + Founder',                                                                              'Hero Tagline (above headline)',          'hero'),
  ('hero_headline_1',    'Cosmetic',                                                                                              'Hero Headline Line 1',                   'hero'),
  ('hero_headline_2',    'Tattoo',                                                                                                'Hero Headline Line 2 (italic)',          'hero'),
  ('hero_description',   'Permanent makeup in Brighton, Michigan. Brows, lip blush, eyeliner and decorative work — meticulous, customized, and made to look like you.', 'Hero Description Paragraph', 'hero'),
  ('about_eyebrow',      'The Studio',                                                                                            'About Section Label',                    'about'),
  ('about_headline',     'Precision meets artistry.',                                                                             'About Section Headline',                 'about'),
  ('about_body',         'Ashley M. Brows is a private cosmetic tattoo studio in Brighton, Michigan, specializing in soft, hyper-realistic permanent makeup that looks like it belongs on you.', 'About Body Text', 'about'),
  ('footer_tagline',     'Cosmetic Tattoo Studio · Brighton, Michigan',                                                          'Footer Tagline',                         'footer'),
  ('seo_title',          'Ashley M. Brows — Cosmetic Tattoo Studio, Brighton MI',                                                'Page Title (SEO)',                       'seo'),
  ('seo_description',    'Permanent makeup in Brighton, Michigan. Specializing in powder brows, lip blush and defining liner.',  'Meta Description (SEO)',                 'seo')
on conflict (key) do nothing;

-- ─── SEED: services_cms default services ────────────────────────
insert into public.services_cms (title, price, short_description, description, image_url, tags, sort_order, is_active) values
  (
    'Signature Brows', '$650',
    'Soft powder-shaded brows tailored to your unique face.',
    'The Ashley M. signature technique delivers soft, powder-shaded brows using a custom blend of pigments matched to your natural hair color and skin tone. Results last 1–3 years depending on skin type and lifestyle.',
    '/gallery/brows-before-after.jpg',
    ARRAY['Powder Brows','All Skin Types','2.5 Hours'],
    1, true
  ),
  (
    'Ashley M. Lip Blush', '$650',
    'A watercolor tint that enhances your lips'' natural shape and color.',
    'Lip blush is a soft watercolor pigment technique that enhances your natural lip shape and adds the perfect amount of color. Results last 2–4 years.',
    '/gallery/lip-blush-before-healed.jpg',
    ARRAY['Lip Blush','Natural Color','2 Hours'],
    2, true
  ),
  (
    'Defining Liner', '$400+',
    'From subtle lash enhancement to a softly shaded winged liner.',
    'Lash Enhancement ($400) is a thin tattooed line just between your lashes. Shaded Lash Enhancement ($450) adds thickness. Shaded Eyeliner ($550) is a softly shaded winged liner using three blended tones.',
    '/gallery/lash-enhancement-before-after.jpg',
    ARRAY['Lash Enhancement','Soft Wing','3 Blended Tones'],
    3, true
  )
on conflict do nothing;
