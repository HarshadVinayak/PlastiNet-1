-- Add verification fields to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS redemption_blocked BOOLEAN DEFAULT false;

-- Create redemption table
CREATE TABLE IF NOT EXISTS public.plc_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  plc_amount INTEGER NOT NULL CHECK (plc_amount >= 50000),
  inr_value DECIMAL NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PRODUCT', 'CASHBACK', 'DONATION')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for plc_redemptions
ALTER TABLE public.plc_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own redemptions" ON public.plc_redemptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own redemptions" ON public.plc_redemptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot update their own redemptions" ON public.plc_redemptions
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
