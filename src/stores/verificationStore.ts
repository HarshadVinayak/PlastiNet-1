import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

interface VerificationSession {
  id: string;
  user_id: string;
  beforeImage: string | null;
  beforeData: any | null;
  duringImage: string | null;
  duringData: any | null;
  afterImage: string | null;
  afterData: any | null;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  total_reward: number;
  timestamp: number;
}

interface VerificationState {
  session: VerificationSession | null;
  startSession: (image: string, data: any) => Promise<void>;
  setDuring: (image: string, data: any) => Promise<void>;
  completeSession: (afterImage: string, afterData: any, reward: number) => Promise<void>;
  clearSession: () => void;
  isSessionValid: () => boolean;
}

export const useVerificationStore = create<VerificationState>((set, get) => ({
  session: null,
  
  startSession: async (image, data) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const newSession = {
      user_id: user.id,
      before_image: image,
      classification: data.type || 'Plastic',
      status: 'IN_PROGRESS',
    };

    const { data: dbSession, error } = await supabase
      .from('impact_sessions')
      .insert(newSession)
      .select()
      .single();

    if (error) {
      console.error("Failed to start session in DB:", error);
      return;
    }

    set({
      session: {
        id: dbSession.id,
        user_id: user.id,
        beforeImage: image,
        beforeData: data,
        duringImage: null,
        duringData: null,
        afterImage: null,
        afterData: null,
        status: 'IN_PROGRESS',
        total_reward: 0,
        timestamp: Date.now(),
      }
    });
  },

  setDuring: async (image, data) => {
    const { session } = get();
    if (!session) return;

    const { error } = await supabase
      .from('impact_sessions')
      .update({ during_image: image })
      .eq('id', session.id);

    if (!error) {
      set({ session: { ...session, duringImage: image, duringData: data } });
    }
  },

  completeSession: async (afterImage, afterData, reward) => {
    const { session } = get();
    if (!session) return;

    const { error } = await supabase
      .from('impact_sessions')
      .update({ 
        after_image: afterImage,
        status: 'COMPLETED',
        total_reward: reward
      })
      .eq('id', session.id);

    if (!error) {
      set({ session: null });
    }
  },

  clearSession: () => set({ session: null }),
  
  isSessionValid: () => {
    const { session } = get();
    if (!session) return false;
    const elapsed = Date.now() - session.timestamp;
    return elapsed > 10000 && elapsed < 3600000;
  }
}));
