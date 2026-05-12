-- PlastiNet Subscription System Schema
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Update users table to include subscription_tier
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_tier text DEFAULT 'BRONZE';

-- 2. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  plan text NOT NULL, -- 'BRONZE', 'SILVER', 'GOLD'
  status text NOT NULL, -- 'ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING'
  razorpay_payment_id text,
  razorpay_order_id text,
  razorpay_subscription_id text,
  start_date timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  expiry_date timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- 3. Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "Users can read their own subscriptions." 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- 5. Trigger to sync subscription_tier to users table
CREATE OR REPLACE FUNCTION public.handle_subscription_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET subscription_tier = NEW.plan
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_subscription_update();
