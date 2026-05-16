-- Add location columns to profiles for permanent regional identity
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS pincode TEXT;

-- Create indexes for faster user lookup by region
CREATE INDEX IF NOT EXISTS idx_profiles_district ON public.profiles(district);
CREATE INDEX IF NOT EXISTS idx_profiles_pincode ON public.profiles(pincode);
