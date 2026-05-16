-- Add Country and State to users/profiles for global-to-local impact mapping
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- Create indexes for global/regional aggregation
CREATE INDEX IF NOT EXISTS idx_users_country ON public.users(country);
CREATE INDEX IF NOT EXISTS idx_users_state ON public.users(state);
CREATE INDEX IF NOT EXISTS idx_activities_country ON public.activities(country);
CREATE INDEX IF NOT EXISTS idx_activities_state ON public.activities(state);
