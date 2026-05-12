-- PlastiNet Versus & Streaks System Upgrade

-- Add streak tracking to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_streak_date DATE;

-- Update events table for Versus features
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'global';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS participants_count INTEGER DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS team_a_score INTEGER DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS team_b_score INTEGER DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS team_a_name TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS team_b_name TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create Competition Timeline table
CREATE TABLE IF NOT EXISTS public.competition_timeline (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id),
  content TEXT NOT NULL,
  type TEXT DEFAULT 'milestone', -- 'milestone', 'action', 'result'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.competition_timeline ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read timeline.'
    ) THEN
        CREATE POLICY "Anyone can read timeline." ON public.competition_timeline FOR SELECT USING (true);
    END IF;
END $$;

-- Insert a dummy event for testing the timer if none exists
INSERT INTO public.events (title, description, start_time, end_time, category, team_a_name, team_b_name)
VALUES (
  'Global Plastic Purge 2026', 
  'The biggest cleanup event of the year. Every kg counts double!',
  NOW(), 
  NOW() + INTERVAL '3 days',
  'global',
  'North Sector',
  'South Sector'
) ON CONFLICT DO NOTHING;
