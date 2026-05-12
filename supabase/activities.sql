-- Create activities table for tracking user actions and XP
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL, -- e.g., 'SCAN', 'VERIFY', 'SOCIAL', 'REDEEM'
  xp_gained INTEGER DEFAULT 0,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for activities
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activities" ON public.activities
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" ON public.activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);
