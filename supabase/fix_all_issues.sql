-- PlastiNet Comprehensive Schema Fix
-- This script fixes the 'subscription_tier' missing column error and 'Bucket not found' error.

-- 1. FIX USERS TABLE
-- Add all columns required by authStore and profile
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dob TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plc_balance INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'BRONZE';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chloe_voice TEXT DEFAULT 'Natural Calm';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS chloe_model TEXT DEFAULT 'Llama-3.3-70b-Versatile';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS voice_output_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. CREATE USER_SUBSCRIPTIONS TABLE (Matching code in subscriptionStore.ts)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan TEXT NOT NULL, -- 'BRONZE', 'SILVER', 'GOLD'
  status TEXT NOT NULL, -- 'ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_subscription_id TEXT,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS for subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscriptions
DROP POLICY IF EXISTS "Users can read their own subscriptions." ON public.user_subscriptions;
CREATE POLICY "Users can read their own subscriptions." 
ON public.user_subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- 3. SYNC TRIGGER FOR SUBSCRIPTION TIER
CREATE OR REPLACE FUNCTION public.handle_subscription_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET subscription_tier = NEW.plan
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_subscription_change ON public.user_subscriptions;
CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_update();

-- 4. SETUP STORAGE FOR AVATARS
-- Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up access policies for the 'avatars' bucket
-- Note: We use DO blocks to avoid errors if policies already exist

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Public Access'
    ) THEN
        CREATE POLICY "Public Access" ON storage.objects
        FOR SELECT USING (bucket_id = 'avatars');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'User Avatar Upload'
    ) THEN
        CREATE POLICY "User Avatar Upload" ON storage.objects
        FOR INSERT WITH CHECK (
            bucket_id = 'avatars' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'User Avatar Update'
    ) THEN
        CREATE POLICY "User Avatar Update" ON storage.objects
        FOR UPDATE USING (
            bucket_id = 'avatars' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'User Avatar Delete'
    ) THEN
        CREATE POLICY "User Avatar Delete" ON storage.objects
        FOR DELETE USING (
            bucket_id = 'avatars' AND 
            auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END
$$;

-- 5. RELOAD SCHEMA CACHE (Optional but helpful)
NOTIFY pgrst, 'reload schema';
