import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase Configuration: Missing environment variables. Chloe is running in offline/guest mode.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co', 
  supabaseKey || 'placeholder-key'
);
