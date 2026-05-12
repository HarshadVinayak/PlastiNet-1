-- Run this in your Supabase SQL Editor to fix the Wallet & Rewards system!

-- 1. Create Wallet Table
CREATE TABLE IF NOT EXISTS public.wallet (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    balance INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('EARN', 'SPEND', 'BONUS', 'PENALTY')),
    amount INTEGER NOT NULL,
    description TEXT,
    reference_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create the missing update_wallet_balance RPC (Remote Procedure Call)
-- This is what the app tries to call when you click "Skip and collect base points"
CREATE OR REPLACE FUNCTION public.update_wallet_balance(user_uuid UUID, amount_change INTEGER)
RETURNS void AS $$
BEGIN
    INSERT INTO public.wallet (user_id, balance, updated_at)
    VALUES (user_uuid, amount_change, now())
    ON CONFLICT (user_id) DO UPDATE 
    SET balance = public.wallet.balance + amount_change,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Set up Row Level Security (RLS) so the app can actually use these tables
ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to prevent errors
DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallet;
DROP POLICY IF EXISTS "Users can update own wallet" ON public.wallet;
DROP POLICY IF EXISTS "Users can insert own wallet" ON public.wallet;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

-- Policies for wallet (users can only see and update their own wallet)
CREATE POLICY "Users can view own wallet" ON public.wallet FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallet FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallet" ON public.wallet FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for transactions (users can only see and insert their own transactions)
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Trigger to automatically create a wallet when a user is created
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallet (user_id, balance)
    VALUES (NEW.id, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists then create it
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;
CREATE TRIGGER on_auth_user_created_wallet
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();
