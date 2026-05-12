import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export type HistoryType = 'SCAN' | 'RESEARCH' | 'REWARD' | 'SOCIAL';

export interface HistoryItem {
  id: string;
  user_id: string;
  type: HistoryType;
  title: string;
  description: string;
  metadata: any;
  created_at: string;
}

interface HistoryState {
  items: HistoryItem[];
  loading: boolean;
  
  fetchHistory: () => Promise<void>;
  addItem: (item: Omit<HistoryItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  clearHistory: () => Promise<void>;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchHistory: async () => {
        set({ loading: true });
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { data, error } = await supabase
          .from('unified_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("History fetch error:", error);
          set({ loading: false });
          return;
        }

        set({ items: data as HistoryItem[], loading: false });
      },

      addItem: async (itemData) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const newItem = {
          user_id: user.id,
          ...itemData,
          created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('unified_history')
          .insert(newItem)
          .select()
          .single();

        if (!error && data) {
          set(state => ({ items: [data as HistoryItem, ...state.items] }));
        }
      },

      clearHistory: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        const { error } = await supabase
          .from('unified_history')
          .delete()
          .eq('user_id', user.id);

        if (!error) {
          set({ items: [] });
        }
      }
    }),
    {
      name: 'plastinet-history-storage',
    }
  )
);
