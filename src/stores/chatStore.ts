import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { chloeGuardian } from '../services/guardian';
import toast from 'react-hot-toast';

export interface ChatMessage {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  content: string;
  type: 'chat' | 'post' | 'sector' | 'group';
  sector_id?: string;
  group_id?: string;
  location_label: string | null;
  created_at: string;
}

export interface Friendship {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  friend_profile?: any;
  sender?: {
    display_name: string;
    avatar_url: string | null;
  };
  receiver?: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface ChatState {
  messages: ChatMessage[];
  friends: Friendship[];
  requests: Friendship[];
  loading: boolean;
  sending: boolean;
  
  fetchMessages: (type: 'chat' | 'sector' | 'group', targetId?: string) => Promise<void>;
  sendMessage: (content: string, type: 'chat' | 'sector' | 'group', targetId?: string, locationLabel?: string) => Promise<void>;
  
  // Social Hub
  fetchSocial: () => Promise<void>;
  sendFriendRequest: (targetUserId: string) => Promise<void>;
  respondToRequest: (friendshipId: string, status: 'ACCEPTED' | 'BLOCKED') => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  friends: [],
  requests: [],
  loading: false,
  sending: false,

  fetchMessages: async (type, targetId) => {
    set({ loading: true });
    let query = supabase.from('messages').select('*').eq('type', type);
    
    if (type === 'sector' && targetId) query = query.eq('sector_id', targetId);
    if (type === 'group' && targetId) query = query.eq('group_id', targetId);
    
    const { data, error } = await query.order('created_at', { ascending: true }).limit(50);
    if (!error) set({ messages: data as ChatMessage[], loading: false });
    else set({ loading: false });
  },

  sendMessage: async (content, type, targetId, locationLabel) => {
    const { profile, user } = useAuthStore.getState();
    if (!user || !content.trim()) return;

    // 1. Chloe AI Moderation Guard
    const mod = await chloeGuardian.moderateMessage(content);
    if (!mod.isSafe) {
      toast.error(`Chloe Guardian: ${mod.reason || "Content violates community standards."}`);
      return;
    }

    set({ sending: true });
    const payload: any = {
      user_id: user.id,
      display_name: profile?.display_name || 'Eco User',
      avatar_url: profile?.avatar_url,
      content: mod.cleanedText || content.trim(),
      type,
      location_label: locationLabel,
      is_moderated: true
    };

    if (type === 'sector') payload.sector_id = targetId;
    if (type === 'group') payload.group_id = targetId;

    const { error } = await supabase.from('messages').insert(payload);
    if (error) toast.error("Failed to send message");
    
    set({ sending: false });
    get().fetchMessages(type, targetId);
  },

  fetchSocial: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    // Fetch accepted friends
    const { data: friends } = await supabase
      .from('friendships')
      .select('*, sender:sender_id(display_name, avatar_url), receiver:receiver_id(display_name, avatar_url)')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'ACCEPTED');

    // Fetch pending requests
    const { data: requests } = await supabase
      .from('friendships')
      .select('*, sender:sender_id(display_name, avatar_url)')
      .eq('receiver_id', user.id)
      .eq('status', 'PENDING');

    set({ 
      friends: (friends || []).map(f => ({
        ...f,
        friend_profile: f.sender_id === user.id ? f.receiver : f.sender
      })),
      requests: requests || [] 
    });
  },

  sendFriendRequest: async (targetUserId) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const { error } = await supabase.from('friendships').insert({
      sender_id: user.id,
      receiver_id: targetUserId,
      status: 'PENDING'
    });

    if (error) toast.error("Request already exists or failed");
    else toast.success("Friend request sent!");
  },

  respondToRequest: async (friendshipId, status) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status })
      .eq('id', friendshipId);

    if (!error) {
      toast.success(status === 'ACCEPTED' ? "Connection established!" : "Request declined");
      get().fetchSocial();
    }
  }
}));
