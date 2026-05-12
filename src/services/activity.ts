import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/authStore';

export const logActivity = async (type: string, xp: number, details: string) => {
  const { user } = useAuthStore.getState();
  if (!user) return;

  try {
    console.log(`[Activity Log] Type: ${type}, XP: ${xp}, Details: ${details}`);
    
    // Attempt to insert into activities table
    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: user.id,
        type,
        xp_gained: xp,
        details,
        created_at: new Date().toISOString()
      });

    if (error) {
      if (error.code === '42P01') {
        console.warn("Activities table missing. Please run the activities migration.");
      } else {
        console.error("Activity logging error:", error);
      }
    }
  } catch (err) {
    console.error("Activity logger failed:", err);
  }
};
