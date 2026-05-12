-- PlastiNet Failsafe Policy Migration
-- This script safely creates all required RLS policies for deployment.

DO $$
BEGIN
    -- 1. YOUTUBE_CREDITS POLICIES
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read curated videos' AND tablename = 'youtube_credits') THEN
        CREATE POLICY "Anyone can read curated videos" ON public.youtube_credits FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow anyone to insert videos' AND tablename = 'youtube_credits') THEN
        CREATE POLICY "Allow anyone to insert videos" ON public.youtube_credits FOR INSERT WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Auth users can update video metadata' AND tablename = 'youtube_credits') THEN
        CREATE POLICY "Auth users can update video metadata" ON public.youtube_credits FOR UPDATE USING (auth.role() = 'authenticated');
    END IF;

    -- 2. USER_SUBSCRIPTIONS POLICIES
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read their own subscriptions' AND tablename = 'user_subscriptions') THEN
        CREATE POLICY "Users can read their own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own subscriptions' AND tablename = 'user_subscriptions') THEN
        CREATE POLICY "Users can insert their own subscriptions" ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own subscriptions' AND tablename = 'user_subscriptions') THEN
        CREATE POLICY "Users can update their own subscriptions" ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- 3. ACTIVITIES POLICIES
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read their own activities' AND tablename = 'activities') THEN
        CREATE POLICY "Users can read their own activities" ON public.activities FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own activities' AND tablename = 'activities') THEN
        CREATE POLICY "Users can insert their own activities" ON public.activities FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

END
$$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
