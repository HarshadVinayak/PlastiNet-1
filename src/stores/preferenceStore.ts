import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserPreferences {
  accessibility: 'walking' | 'cycling' | 'driving' | 'wheelchair';
  habits: string[]; // e.g., 'morning_commute', 'weekend_warrior'
  homeAddress?: string;
  workAddress?: string;
}

interface PreferenceState {
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

export const usePreferenceStore = create<PreferenceState>()(
  persist(
    (set) => ({
      preferences: {
        accessibility: 'walking',
        habits: [],
      },
      updatePreferences: (newPrefs) => set((state) => ({
        preferences: { ...state.preferences, ...newPrefs }
      })),
    }),
    {
      name: 'plastinet-user-preferences',
    }
  )
);
