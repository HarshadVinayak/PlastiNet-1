-- 1. FIX USERS TABLE SCHEMA
-- Add all missing columns required by the UserProfile interface
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dob TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plc_balance INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'BRONZE' CHECK (subscription_tier IN ('BRONZE', 'SILVER', 'GOLD'));
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chloe_voice TEXT DEFAULT 'Natural Calm';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chloe_model TEXT DEFAULT 'Llama-3.3-70b-Versatile';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS voice_output_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. SETUP STORAGE FOR AVATARS
-- Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the 'avatars' bucket
-- Allow public access to read avatars
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatars
CREATE POLICY "User Avatar Upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to update their own avatars
CREATE POLICY "User Avatar Update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatars
CREATE POLICY "User Avatar Delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );
