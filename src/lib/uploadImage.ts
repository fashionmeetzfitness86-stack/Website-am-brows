// uploadImage — uploads a local File to the Supabase 'site-images' bucket
// and returns the public URL. Used by the admin CMS to swap photos.

import { supabase } from './supabase';

const BUCKET = 'site-images';

export async function uploadImage(file: File, folder: 'gallery' | 'services' = 'gallery'): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeBase = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]+/g, '-').slice(0, 60) || 'image';
  const path = `${folder}/${Date.now()}-${safeBase}.${ext}`;

  const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || `image/${ext}`,
  });
  if (upErr) throw new Error(upErr.message);

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return pub.publicUrl;
}
