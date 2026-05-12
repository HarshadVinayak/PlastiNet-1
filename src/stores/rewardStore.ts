import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export type TransactionType = 'EARN' | 'SPEND' | 'BONUS' | 'PENALTY';

export interface WalletTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  reference_id?: string;
  created_at: string;
}

interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
  loading: boolean;
  
  fetchWallet: () => Promise<void>;
  addTransaction: (type: TransactionType, amount: number, description: string, referenceId?: string) => Promise<void>;
  spend: (amount: number, description: string) => Promise<boolean>;
  syncBalance: () => Promise<void>;
  requestRedemption: (type: string, amount: number) => Promise<{ success: boolean; message: string }>;
}

export const useRewardStore = create<WalletState>((set, get) => ({
  balance: 0,
  transactions: [],
  loading: false,

  fetchWallet: async () => {
    set({ loading: true });
    const { user } = useAuthStore.getState();
    if (!user) return;

    // 1. Fetch persistent wallet balance
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (walletError && walletError.code !== 'PGRST116') {
      console.error("Wallet fetch error:", walletError);
    }

    // 2. Fetch transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    set({ 
      balance: wallet?.balance || 0, 
      transactions: (transactions || []) as WalletTransaction[], 
      loading: false 
    });
  },

  syncBalance: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;
    
    const { data } = await supabase
      .from('wallet')
      .select('balance')
      .eq('user_id', user.id)
      .single();
    
    if (data) set({ balance: data.balance });
  },

  addTransaction: async (type, amount, description, referenceId) => {
    const { user } = useAuthStore.getState();
    if (!user) throw new Error("Authenticated user required");

    // Atomic transaction logic: Log TX then update Wallet
    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type,
        amount,
        description,
        reference_id: referenceId
      });

    if (txError) throw txError;

    // Update the wallet balance (increment or decrement)
    const multiplier = ['EARN', 'BONUS'].includes(type) ? 1 : -1;
    const { error: walletError } = await supabase.rpc('update_wallet_balance', {
      user_uuid: user.id,
      amount_change: amount * multiplier
    });

    if (walletError) {
      // Fallback if RPC is not yet defined
      const currentBalance = get().balance;
      await supabase
        .from('wallet')
        .upsert({ 
          user_id: user.id, 
          balance: currentBalance + (amount * multiplier),
          updated_at: new Date().toISOString()
        });
    }

    await get().fetchWallet();
  },

  spend: async (amount, description) => {
    const { balance } = get();
    if (balance < amount) return false;

    try {
      await get().addTransaction('SPEND', amount, description);
      return true;
    } catch (e) {
      console.error("Spend transaction failed:", e);
      return false;
    }
  },

  requestRedemption: async (type: string, amount: number) => {
    const { balance } = get();
    if (balance < amount) {
      return { success: false, message: "Insufficient PLC balance" };
    }

    try {
      await get().addTransaction('SPEND', amount, `Redemption Request: ${type}`);
      return { success: true, message: "Redemption request submitted!" };
    } catch (e: any) {
      return { success: false, message: e.message || "Redemption failed" };
    }
  }
}));
