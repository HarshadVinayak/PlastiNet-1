import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { Capacitor } from '@capacitor/core';

const getRedirectUrl = () => {
  if (Capacitor.isNativePlatform()) {
    return 'com.plastinet.official://login';
  }
  return window.location.origin;
};

export type Occupation = 'School' | 'College' | 'Working';

export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  dob: string | null;
  occupation: Occupation | '';
  avatar_url: string;
  joined_at: string;
  plc_balance: number;
  subscription_tier: 'BRONZE' | 'SILVER' | 'GOLD';
  country: string;
  state: string;
  district: string;
  pincode: string;
  theme: string;
  chloe_voice: string;
  chloe_model: string;
  notifications_enabled: boolean;
  voice_output_enabled: boolean;
  streak: number;
  last_active: string;
  is_verified: boolean;
  redemption_blocked: boolean;
}

interface AuthState {
  user: any | null; // Supabase Auth User
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  initialized: boolean;
  
  initialize: () => Promise<void>;
  fetchProfile: (userId: string, email?: string, metadata?: any) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,
      isAuthenticated: false,
      initialized: false,

      fetchProfile: async (userId, email, metadata) => {
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
          
          if (error && error.code !== 'PGRST116') {
             console.error("Profile fetch error:", error);
          }

          const defaultProfile: UserProfile = {
            id: userId,
            username: email?.split('@')[0] || 'user',
            display_name: metadata?.full_name || 'Eco User',
            dob: null,
            occupation: '',
            avatar_url: '',
            joined_at: new Date().toISOString(),
            plc_balance: 0,
            subscription_tier: 'BRONZE',
            country: '',
            state: '',
            district: '',
            pincode: '',
            theme: 'dark',
            chloe_voice: 'Natural Calm',
            chloe_model: 'Llama-3.3-70b-Versatile',
            notifications_enabled: true,
            voice_output_enabled: true,
            streak: 0,
            last_active: new Date().toISOString(),
            is_verified: false,
            redemption_blocked: false
          };

          const finalProfile = { ...defaultProfile, ...profile } as UserProfile;

          if (profile) {
            await supabase.from('users').update({ last_active: new Date().toISOString() }).eq('id', userId);
          }

          set({ profile: finalProfile, isAuthenticated: true });
        } catch (error) {
          console.error("fetchProfile failed:", error);
        }
      },

      initialize: async () => {
        if (get().initialized) return;
        console.log("AuthStore: Starting Instant-Access initialization...");
        
        // 1. Instant entry for responsiveness
        set({ initialized: true, loading: false });

        // 2. Background Session Recovery
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            console.log("AuthStore: Session recovered.");
            set({ user: session.user, isAuthenticated: true });
            get().fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
          }
        }).catch(() => {});

        // 3. Persistent Auth Listener
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            set({ user: session.user, isAuthenticated: true });
            get().fetchProfile(session.user.id, session.user.email, session.user.user_metadata);
          } else {
            set({ user: null, profile: null, isAuthenticated: false });
          }
        });
      },

      signInWithGoogle: async () => {
        set({ loading: true });
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: getRedirectUrl(),
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          }
        });
        if (error) {
          set({ loading: false });
          throw error;
        }
      },

      signInWithEmail: async (email, password) => {
        set({ loading: true });
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          set({ loading: false });
          throw error;
        }
        await get().fetchProfile(data.user.id, data.user.email, data.user.user_metadata);
        set({ user: data.user, loading: false });
      },

      signUpWithEmail: async (email, password) => {
        set({ loading: true });
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          set({ loading: false });
          throw error;
        }
        if (data.user) {
          set({ user: data.user, isAuthenticated: true, loading: false });
        }
      },

      signOut: async () => {
        console.log("AuthStore: Instant Logout triggered.");
        localStorage.clear();
        sessionStorage.clear();
        set({ user: null, profile: null, isAuthenticated: false, loading: false });
        
        try {
          // Fire and forget signOut
          supabase.auth.signOut();
        } catch (e) {}

        window.location.replace('/');
      },

      updateProfile: async (updates) => {
        const { user, profile } = get();
        if (!user) return;

        // Clean up empty strings that cause DB type errors (especially for DATE columns)
        const sanitizedProfile: any = profile ? { ...profile } : {};
        if (sanitizedProfile.dob === '') sanitizedProfile.dob = null;

        const sanitizedUpdates: any = { ...updates };
        if (sanitizedUpdates.dob === '') sanitizedUpdates.dob = null;

        const { data, error } = await supabase
          .from('users')
          .upsert({ 
            id: user.id, 
            ...sanitizedProfile, 
            ...sanitizedUpdates,
            last_active: new Date().toISOString() 
          })
          .select()
          .single();

        if (error) {
          console.error("Profile update error:", error);
          throw error;
        }
        set({ profile: data as UserProfile });
      },

      uploadAvatar: async (file) => {
        const { user } = get();
        if (!user) throw new Error("Not authenticated");

        try {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          console.log(`Uploading avatar to avatars bucket at path: ${filePath}`);

          const { error: uploadError, data } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });

          if (uploadError) {
            console.error("Supabase Storage Error:", uploadError);
            if (uploadError.message.includes("bucket not found")) {
              throw new Error("Storage Error: 'avatars' bucket not found. Please create it in Supabase Dashboard.");
            }
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

          console.log("Generated Public URL:", publicUrl);

          await get().updateProfile({ avatar_url: publicUrl });
          return publicUrl;
        } catch (error: any) {
          console.error("Avatar Upload Failed:", error);
          throw error;
        }
      },

      updateEmail: async (email) => {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
      },

      updatePassword: async (password) => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      },

      deleteAccount: async () => {
        const { user } = get();
        if (!user) return;
        
        // In a real app, you'd use a service role or a DB trigger to delete the auth user.
        // Here we just clear the DB record and sign out.
        await supabase.from('users').delete().eq('id', user.id);
        await get().signOut();
      }
    }),
    {
      name: 'plastinet-auth-v2',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        profile: state.profile
      }),
    }
  )
);
