import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'dark' | 'light' | 'classic' | 'system';

interface UIState {
  isChloeOpen: boolean;
  isSearchOpen: boolean;
  isMenuOpen: boolean;
  theme: Theme;
  isVoiceEnabled: boolean;
  chloeVoice: string;
  chloeModel: string;
  toggleChloe: () => void;
  toggleSearch: () => void;
  toggleMenu: () => void;
  setChloeOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;

  setTheme: (theme: Theme) => void;
  applyTheme: (theme: Theme) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  setChloeVoice: (voice: string) => void;
  setChloeModel: (model: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      isChloeOpen: false,
      isSearchOpen: false,
      isMenuOpen: false,
      theme: 'dark',
      isVoiceEnabled: true,
      chloeVoice: 'Standard Female',
      chloeModel: 'Llama-3.3-70b-Versatile',
      toggleChloe: () => set((state) => ({ isChloeOpen: !state.isChloeOpen })),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
      setChloeOpen: (open) => set({ isChloeOpen: open }),
      setSearchOpen: (open) => set({ isSearchOpen: open }),
      setMenuOpen: (open) => set({ isMenuOpen: open }),

      setVoiceEnabled: (enabled) => set({ isVoiceEnabled: enabled }),
      setChloeVoice: (voice) => set({ chloeVoice: voice }),
      setChloeModel: (model) => set({ chloeModel: model }),
      
      setTheme: (theme) => {
        set({ theme });
        get().applyTheme(theme);
      },

      applyTheme: (theme) => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark', 'classic-dark');

        let effectiveTheme = theme;
        if (theme === 'system') {
          effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        if (effectiveTheme === 'light') {
          root.classList.add('light');
        } else if (effectiveTheme === 'classic') {
          root.classList.add('classic-dark', 'dark');
        } else {
          root.classList.add('dark');
        }
      },
    }),
    {
      name: 'plastinet-ui-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.applyTheme(state.theme);
        }
      },
    }
  )
);
