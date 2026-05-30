// useSiteContent — fetches editable site content (services + gallery) from
// Supabase, with the hardcoded values in App.tsx as the initial fallback so
// the site renders something even if the network call is in flight or fails.

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface ServiceCMS {
  id: string;
  title: string;
  price: string;
  shortDescription: string;
  description: string;
  image: string;
  tags: string[];
  variants?: Array<{ title: string; price: string; image: string; description: string }>;
  process: Array<{ step: string; description: any }>;
  testimonials: Array<{ author: string; text: string }>;
}

export interface GalleryItemCMS {
  id?: string;
  image: string;
  title: string;
  category: string;
  description: string;
}

export function useSiteContent(defaults: { services: ServiceCMS[]; galleryItems: GalleryItemCMS[] }) {
  const [services, setServices] = useState<ServiceCMS[]>(defaults.services);
  const [galleryItems, setGalleryItems] = useState<GalleryItemCMS[]>(defaults.galleryItems);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [svcRes, galRes] = await Promise.all([
        supabase.from('site_services').select('*').order('sort_order'),
        supabase.from('site_gallery').select('*').order('sort_order'),
      ]);

      if (cancelled) return;

      if (!svcRes.error && Array.isArray(svcRes.data) && svcRes.data.length) {
        setServices(svcRes.data.map((row: any) => ({
          id: row.id,
          title: row.title,
          price: row.price,
          shortDescription: row.short_description,
          description: row.description,
          image: row.image_url,
          tags: row.tags ?? [],
          variants: row.variants ?? [],
          process: row.process ?? [],
          testimonials: row.testimonials ?? [],
        })));
      }

      if (!galRes.error && Array.isArray(galRes.data) && galRes.data.length) {
        setGalleryItems(galRes.data.map((row: any) => ({
          id: row.id,
          image: row.image_url,
          title: row.title,
          category: row.category,
          description: row.description ?? '',
        })));
      }
    };

    load();

    // Realtime: update the public site within seconds of an admin save
    const ch = supabase
      .channel('site-content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_services' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_gallery'  }, () => load())
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(ch); };
  }, []);

  return { services, galleryItems };
}
