import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface AIMemory {
  commonUploads: string[];
  recyclingHabits: string[];
  preferredReuseCategories: string[];
  participationConsistency: number; // 0-100
  environmentalInterests: string[];
  synced: boolean;
}

interface AIMemoryState {
  memory: AIMemory;
  updateMemory: (updates: Partial<AIMemory>) => Promise<void>;
  logUpload: (wasteType: string) => Promise<void>;
  syncWithSupabase: () => Promise<void>;
}

export const useAIMemoryStore = create<AIMemoryState>()(
  persist(
    (set, get) => ({
      memory: {
        commonUploads: [],
        recyclingHabits: ['Weekly Sort', 'PET Bottles'],
        preferredReuseCategories: ['Planters', 'Organizers'],
        participationConsistency: 85,
        environmentalInterests: ['Ocean Cleanup', 'Circular Economy'],
        synced: true,
      },

      updateMemory: async (updates) => {
        set((state) => ({
          memory: { ...state.memory, ...updates, synced: false }
        }));
        get().syncWithSupabase();
      },

      logUpload: async (wasteType) => {
        const { memory } = get();
        
        // Add to common uploads if not already there, keep top 5
        const uploads = new Set([wasteType, ...memory.commonUploads]);
        const commonUploads = Array.from(uploads).slice(0, 5);
        
        set({
          memory: { ...memory, commonUploads, synced: false }
        });
        get().syncWithSupabase();
      },

      syncWithSupabase: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        const { memory } = get();
        if (memory.synced) return;

        try {
          const { error } = await supabase.from('ai_memory').upsert({
            user_id: userId,
            common_uploads: memory.commonUploads,
            preferences: {
              habits: memory.recyclingHabits,
              reuseCategories: memory.preferredReuseCategories,
              interests: memory.environmentalInterests
            },
            consistency_score: memory.participationConsistency
          });

          if (!error) {
            set({ memory: { ...memory, synced: true } });
          }
        } catch (e) {
          console.warn("Offline mode: AI memory sync queued.");
        }
      }
    }),
    {
      name: 'plastinet-ai-memory',
    }
  )
);
