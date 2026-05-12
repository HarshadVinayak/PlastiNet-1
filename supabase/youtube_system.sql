-- 1. YOUTUBE CREDITS TABLE
CREATE TABLE IF NOT EXISTS public.youtube_credits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  video_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  thumbnail TEXT,
  channel TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_shown_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  category_tag TEXT DEFAULT 'eco',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for youtube_credits
ALTER TABLE public.youtube_credits ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read videos
CREATE POLICY "Anyone can read curated videos" ON public.youtube_credits
  FOR SELECT USING (true);

-- Allow authenticated users to update metadata (like last_shown_at)
CREATE POLICY "Auth users can update video metadata" ON public.youtube_credits
  FOR UPDATE USING (auth.role() = 'authenticated');

-- 2. INDEXING FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_yt_view_count ON public.youtube_credits(view_count);
CREATE INDEX IF NOT EXISTS idx_yt_last_shown ON public.youtube_credits(last_shown_at);
