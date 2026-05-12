import { supabase } from '../lib/supabase';

export const storageService = {
  async uploadMedia(file: File | Blob, path: string): Promise<string | null> {
    try {
      // We prioritize Supabase Storage for simplicity, but we can integrate GCS here
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Storage Service Error:', error);
      return null;
    }
  }
};
