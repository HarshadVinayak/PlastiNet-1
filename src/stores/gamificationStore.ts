import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export interface GlobalImpact {
  plasticSavedKg: number;
  co2OffsetKg: number;
  waterSavedL: number;
  synced?: boolean;
}

interface GamificationState {
  streak: number;
  level: number;
  xp: number;
  lastActive: number | null;
  impact: GlobalImpact;
  updateActivity: () => Promise<void>;
  addImpact: (plasticWeightKg: number) => Promise<void>;
  syncWithSupabase: () => Promise<void>;
}

const XP_PER_LEVEL = 1000;

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      streak: 12,
      level: 14,
      xp: 450,
      lastActive: Date.now() - 24 * 60 * 60 * 1000,
      impact: {
        plasticSavedKg: 4.2,
        co2OffsetKg: 8.1,
        waterSavedL: 12.5,
        synced: true
      },

      updateActivity: async () => {
        const { lastActive, streak } = get();
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        let newStreak = streak;
        if (lastActive) {
          const daysSince = Math.floor((now - lastActive) / oneDay);
          if (daysSince === 1) newStreak += 1;
          else if (daysSince > 1) newStreak = 0; // Streak broken
        } else {
          newStreak = 1;
        }

        set({ streak: newStreak, lastActive: now });
        get().syncWithSupabase();
      },

      addImpact: async (plasticWeightKg: number) => {
        const { impact, xp, level } = get();
        
        const newImpact = {
          plasticSavedKg: Number((impact.plasticSavedKg + plasticWeightKg).toFixed(2)),
          co2OffsetKg: Number((impact.co2OffsetKg + plasticWeightKg * 1.9).toFixed(2)),
          waterSavedL: Number((impact.waterSavedL + plasticWeightKg * 3).toFixed(2)),
          synced: false
        };

        const gainedXp = Math.round(plasticWeightKg * 100);
        let newXp = xp + gainedXp;
        let newLevel = level;

        if (newXp >= XP_PER_LEVEL) {
          newLevel += Math.floor(newXp / XP_PER_LEVEL);
          newXp = newXp % XP_PER_LEVEL;
        }

        set({ impact: newImpact, xp: newXp, level: newLevel });
        get().syncWithSupabase();
      },

      syncWithSupabase: async () => {
        const userId = useAuthStore.getState().user?.id;
        if (!userId) return;

        const { level, xp, impact } = get();

        try {
          // Update user level and xp
          await supabase.from('users').update({ eco_level: level, xp: xp }).eq('id', userId);

          // If impact is unsynced, update sector/org if implemented (Placeholder for later)
          if (!impact.synced) {
            set({ impact: { ...impact, synced: true } });
          }
        } catch (e) {
          console.warn("Offline mode: Gamification state queued.");
        }
      }
    }),
    {
      name: 'plastinet-gamification',
    }
  )
);
