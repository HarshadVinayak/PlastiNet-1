import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export type SubscriptionTier = 'BRONZE' | 'SILVER' | 'GOLD';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionTier;
  status: SubscriptionStatus;
  start_date: string;
  expiry_date: string;
  razorpay_payment_id?: string;
}

export const PLAN_DETAILS = {
  BRONZE: { name: 'Bronze', price: 0, multiplier: 1, priority: 'Normal' },
  SILVER: { name: 'Silver', price: 129, multiplier: 1.5, priority: 'High' },
  GOLD: { name: 'Gold', price: 249, multiplier: 2.5, priority: 'Instant' }
};

interface SubscriptionState {
  subscription: Subscription | null;
  loading: boolean;
  
  fetchSubscription: () => Promise<void>;
  upgradePlan: (plan: SubscriptionTier, paymentId: string) => Promise<void>;
  checkExpiry: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  subscription: null,
  loading: true,

  fetchSubscription: async () => {
    set({ loading: true });
    const { user } = useAuthStore.getState();
    if (!user) {
      set({ subscription: null, loading: false });
      return;
    }

    const { data, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error("Subscription fetch error:", error);
    }

    const sub = data as Subscription || {
      plan: 'BRONZE',
      status: 'ACTIVE',
      expiry_date: new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString() // Forever for bronze
    };

    set({ subscription: sub, loading: false });
    await get().checkExpiry();
  },

  upgradePlan: async (plan, paymentId) => {
    set({ loading: true });
    const { user } = useAuthStore.getState();
    if (!user) throw new Error("User not found");

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan,
        status: 'ACTIVE',
        razorpay_payment_id: paymentId,
        start_date: new Date().toISOString(),
        expiry_date: expiryDate.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    
    set({ subscription: data as Subscription, loading: false });
  },

  checkExpiry: async () => {
    const { subscription } = get();
    if (!subscription || subscription.plan === 'BRONZE') return;

    if (new Date(subscription.expiry_date) < new Date()) {
      // Downgrade to bronze
      const { user } = useAuthStore.getState();
      if (!user) return;

      await supabase
        .from('user_subscriptions')
        .update({ status: 'EXPIRED', plan: 'BRONZE' })
        .eq('user_id', user.id);
      
      await get().fetchSubscription();
    }
  }
}));
