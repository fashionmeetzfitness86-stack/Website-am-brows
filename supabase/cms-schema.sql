-- Ashley M. Brows — CMS Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- Creates two tables (site_services, site_gallery) and seeds them with the
-- current hardcoded content. Public can read; only super_admin can write.

-- ─────────────────────────────────────────────────────────────
-- 1. site_services — service cards (Brows, Lip Blush, Liner, Tooth Gems)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.site_services (
  id                 text primary key,
  sort_order         int not null default 0,
  title              text not null,
  price              text not null,
  short_description  text not null,
  description        text not null,
  image_url          text not null,
  tags               text[] not null default '{}',
  variants           jsonb not null default '[]'::jsonb,
  process            jsonb not null default '[]'::jsonb,
  testimonials       jsonb not null default '[]'::jsonb,
  updated_at         timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 2. site_gallery — portfolio gallery items
-- ─────────────────────────────────────────────────────────────
create table if not exists public.site_gallery (
  id           uuid primary key default gen_random_uuid(),
  sort_order   int not null default 0,
  image_url    text not null,
  title        text not null,
  category     text not null,
  description  text not null default '',
  updated_at   timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- 3. RLS — public read, super_admin write
-- ─────────────────────────────────────────────────────────────
alter table public.site_services enable row level security;
alter table public.site_gallery  enable row level security;

drop policy if exists "site_services public read"  on public.site_services;
drop policy if exists "site_services admin write"  on public.site_services;
drop policy if exists "site_gallery public read"   on public.site_gallery;
drop policy if exists "site_gallery admin write"   on public.site_gallery;

create policy "site_services public read" on public.site_services
  for select using (true);

create policy "site_gallery public read" on public.site_gallery
  for select using (true);

create policy "site_services admin write" on public.site_services
  for all using (
    exists (select 1 from public.user_roles ur
            where ur.user_id = auth.uid() and ur.role = 'super_admin')
  );

create policy "site_gallery admin write" on public.site_gallery
  for all using (
    exists (select 1 from public.user_roles ur
            where ur.user_id = auth.uid() and ur.role = 'super_admin')
  );

-- ─────────────────────────────────────────────────────────────
-- 4. Seed site_services with current hardcoded values
-- ─────────────────────────────────────────────────────────────
insert into public.site_services (id, sort_order, title, price, short_description, description, image_url, tags, variants, process, testimonials)
values
('brows', 10, 'Brows', '$650+',
 'Powder brows and Nano/Nano Fusion brows. Soft, natural, customized.',
 'Ashley offers two brow techniques. Each is fully customized to your face shape, undertone and lifestyle. Pick the variant that suits your skin and the look you want, and book directly below.',
 '/ashley-home-feature.jpg',
 array['Powder Finish','Nano Strokes','All Skin Types'],
 '[
   {"title":"Powder Brows","price":"$650","image":"/ashley-home-feature.jpg","description":"Most popular. Done with a single-needle tattoo machine that layers small pixels of pigment into the skin until the desired amount of saturation is achieved. Can be bold and defined to your preference, or softly shaded with no harsh edges for a natural makeup look. Best suited for all skin types, especially oily and mature types. (Does not include touch-up.)"},
   {"title":"Nano / Nano Fusion Brows","price":"$700","image":"/gallery/nano-brows-1.jpg","description":"Not to be confused with microblading. Done using a machine, making it gentler on the skin and more sustainable long-term. NANO: a blend of ultra-fine, hair-like strokes for a soft natural enhancement that mimics real brow hair. FUSION: a seamless blend of Nano hair strokes and powder shading. Nano Fusion brows offer the best of both worlds, natural texture with added depth and fullness, perfect for those who want realistic detail in the front and a softly defined, fuller brow overall."}
 ]'::jsonb,
 '[
   {"step":"Consultation","description":"We map your face and select pigments that harmonize with your skin undertones."},
   {"step":"Procedure","description":"A 2 to 2.5 hour session including drawing, numbing, treatment and aftercare instructions."},
   {"step":"Perfection Session","description":"A follow-up at 6 to 12 weeks ($150) reinforces any imperfections from the heal."}
 ]'::jsonb,
 '[
   {"author":"Cindy","text":"After seeing another senior with beautiful brows created by Ashley I had to give it a try. The result was outstanding."},
   {"author":"Kyla","text":"Ashley is by far one of the best when it comes to brows. Her work is flawless."}
 ]'::jsonb),
('lips', 20, 'Lip Blush', '$650',
 'A wash of color restored to your lips, fuller, defined, youthful.',
 'Lip Blush (or "watercolor lips") is another form of cosmetic tattooing. Immediate results look bright, bold and lipstick-like but heal down to a tint/stain. Great for covering fordyce spots, scars, pale lips, defining borders and neutralizing dark pigmentation, all while staying within your natural vermillion border. Lasts 2 to 4 years.',
 '/lip-blush.webp',
 array['Watercolor Lips','Defined Border','Lasts 2-4 Years'],
 '[]'::jsonb,
 '[
   {"step":"Color Theory","description":"We analyze your natural lip tones and neutralize any blue or purple where needed."},
   {"step":"Design","description":"We define the borders, cupid''s bow and corners while respecting your natural lip shape."},
   {"step":"Heal & Bloom","description":"Lips heal in 5 to 7 days, then color blooms back through over a few weeks."}
 ]'::jsonb,
 '[]'::jsonb),
('liner', 30, 'Defining Liner', '$400+',
 'From subtle lash enhancement to a softly shaded winged liner.',
 'Lash Enhancement ($400) is a thin tattooed line just between your lashes, making them appear darker and fuller at the base. Shaded Lash Enhancement ($450) adds thickness. Shaded Eyeliner ($550) is a softly shaded winged liner using three blended tones, customized to your eye shape. Bottom/lower-lid eyeliner is not offered at this time.',
 '/gallery/lash-enhancement-before-after.jpg',
 array['Lash Enhancement','Soft Wing','3 Blended Tones'],
 '[]'::jsonb,
 '[
   {"step":"Style Selection","description":"We pick the depth, thickness and shape that suits your eye and lifestyle."},
   {"step":"Symmetry Check","description":"Mirror-perfect alignment confirmed before any pigment is laid down."},
   {"step":"Pigment Fill","description":"Worked between or above the lashes for a dense, natural-looking line or wing."}
 ]'::jsonb,
 '[]'::jsonb),
('tooth-gems', 40, 'Tooth Gems', '$60+',
 'Crystal and gold tooth gems, from a single crystal to a full disco tooth.',
 'Tooth gems are non-permanent decorative jewels applied to the surface of the tooth. Single crystals start at $60, with options for multi-crystal sets ($100 / $125), gold applications ($120 and up), and a full "disco tooth" ($250). Email ashleymbrows@gmail.com with a screenshot of your pick to book.',
 '/gallery/tooth-gems.jpg',
 array['Crystals','Gold Gems','Non-Permanent'],
 '[]'::jsonb,
 '[
   {"step":"Pick Your Gem","description":"Browse the vendor catalogues then email your selection."},
   {"step":"Application","description":"A quick, non-invasive application with dental-grade adhesive, no drilling, no damage."},
   {"step":"Wear & Enjoy","description":"Gems typically last several months to a year with normal wear; they can be added to or removed any time."}
 ]'::jsonb,
 '[]'::jsonb)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────
-- 5. Seed site_gallery with current items
-- ─────────────────────────────────────────────────────────────
insert into public.site_gallery (sort_order, image_url, title, category, description) values
(10, '/gallery/brows-nano-portrait.jpg',    'Nano Fusion',     'Signature Brows', '3 Hour Procedure · Hair Strokes + Powder Shading'),
(20, '/gallery/lip-blush-before-healed.jpg','Lip Blush',       'Lip Blush',       '2 Hour Procedure · Soft Watercolor Tint'),
(30, '/gallery/brows-before-after.jpg',     'Powder Brows',    'Signature Brows', '2.5 Hour Procedure · Soft Shaded Finish'),
(40, '/gallery/lash-enhancement-before-after.jpg','Shaded Eyeliner','Defining Liner','2 Hour Procedure · Softly Shaded Wing'),
(50, '/gallery/lip-blush-glossy.jpg',       'Ombre Lip Blush', 'Lip Blush',       '2.5 Hour Procedure · Gradient Tint'),
(60, '/gallery/powder-brows-portrait.jpg',  'Powder Brows',    'Signature Brows', '2.5 Hour Procedure · All Skin Types'),
(70, '/gallery/ashley-portfolio-may22.jpg', 'Nano Fusion',     'Signature Brows', '3 Hour Procedure · Realistic Hair Strokes')
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- 6. Storage bucket for image uploads (Stage 3)
--    Run this AFTER creating the bucket in Dashboard → Storage → Create bucket
--    Bucket name: site-images   |   Public: ON
-- ─────────────────────────────────────────────────────────────
-- Storage policies (run after bucket exists):
-- drop policy if exists "site-images public read" on storage.objects;
-- create policy "site-images public read" on storage.objects
--   for select using (bucket_id = 'site-images');
-- drop policy if exists "site-images admin write" on storage.objects;
-- create policy "site-images admin write" on storage.objects
--   for insert with check (
--     bucket_id = 'site-images' and exists (
--       select 1 from public.user_roles ur
--       where ur.user_id = auth.uid() and ur.role = 'super_admin'
--     )
--   );
