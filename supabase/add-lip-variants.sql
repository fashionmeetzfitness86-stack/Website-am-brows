-- Adds the Ombre Lip Blush variant to the Lip Blush service.
-- Run once. From then on, edit variants directly in /admin -> Services -> Edit.

update public.site_services
set
  title = 'Lip Blush',
  price = '$650+',
  short_description = 'Lip Blush and Ombre Lip Blush. A wash of color, fuller, defined lips.',
  description = 'Lip Blush (or "watercolor lips") is another form of cosmetic tattooing. Immediate results look bright, bold and lipstick-like but heal down to a tint/stain. A wash of restored color can make lips appear fuller, more defined and more youthful. Pick the variant that suits the look you want and book directly below.',
  variants = '[
    {
      "title": "Lip Blush",
      "price": "$650",
      "image": "/gallery/lip-blush-before-healed.jpg",
      "description": "Lip Blush or watercolor lips is another form of cosmetic tattooing. Immediate results will look bright, bold and lipstick-like but will heal down to a tint or stain. Having a wash of color restored to your lips can make them appear fuller, more defined and youthful. Lip Blush is great for covering fordyce spots, scars, pale lips, defining borders, correcting asymmetries and neutralizing dark pigmentation, all while staying within the realm of your lips (vermillion border). Lasts 2 to 4 years."
    },
    {
      "title": "Ombre Lip Blush",
      "price": "$700",
      "image": "/gallery/lip-blush-glossy.jpg",
      "description": "A gradient lip technique with slightly deeper definition along the edges that fades into a lighter, softer center, creating a subtle liner effect and the illusion of fuller, more defined lips. (Does not include touch-up.)"
    }
  ]'::jsonb,
  updated_at = now()
where id = 'lips';
