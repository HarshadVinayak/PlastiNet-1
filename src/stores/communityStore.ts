import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Post {
  id: string;
  user: string;
  location: string;
  content: string;
  likes: number;
  comments: number;
  type: 'text' | 'image' | 'video';
  mediaUrl?: string;
  timestamp: number;
  hasLiked: boolean;
}

interface CommunityState {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'likes' | 'comments' | 'timestamp' | 'hasLiked'>) => void;
  toggleLike: (postId: string) => void;
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      posts: [
        {
          id: 'p_1',
          user: "Arjun Sharma",
          location: "Korattur Sector A",
          content: "Just recycled 15 PET bottles today! Chloe AI helped me find the right bin near the park. Let's keep Sector A on top of the leaderboard! 🌍💪",
          likes: 42,
          comments: 5,
          type: "text",
          timestamp: Date.now() - 3600000,
          hasLiked: false
        },
        {
          id: 'p_2',
          user: "Priya Das",
          location: "Sector B",
          content: "DIY Planter from old soda bottles. Check it out!",
          likes: 128,
          comments: 12,
          type: "video",
          mediaUrl: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80&w=400",
          timestamp: Date.now() - 7200000,
          hasLiked: true
        }
      ],
      addPost: (post) => set((state) => ({
        posts: [{
          ...post,
          id: crypto.randomUUID(),
          likes: 0,
          comments: 0,
          timestamp: Date.now(),
          hasLiked: false
        }, ...state.posts]
      })),
      toggleLike: (postId) => set((state) => ({
        posts: state.posts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              likes: p.hasLiked ? p.likes - 1 : p.likes + 1,
              hasLiked: !p.hasLiked
            };
          }
          return p;
        })
      }))
    }),
    {
      name: 'plastinet-community',
    }
  )
);
