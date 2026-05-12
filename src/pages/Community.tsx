import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageSquare, Share2, Plus, MapPin, Users,
  PlayCircle, LayoutGrid, MessageCircle, Send, Loader2, AlertCircle, X
} from 'lucide-react';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useGPS } from '../hooks/useGPS';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { chloeGuardian } from '../services/guardian';
import toast from 'react-hot-toast';

const VideoFeed = lazy(() => import('./VideoFeed'));

// ── Types ──────────────────────────────────────────────────────────────────────
interface Post {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  content: string;
  location_label: string | null;
  likes: number;
  created_at: string;
  hasLiked?: boolean;
  media_url?: string | null;
  media_type?: 'image' | 'video' | null;
}

// ── Community Page ─────────────────────────────────────────────────────────────
const Community = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'reels' | 'community' | 'groups'>('feed');
  const { coords, locationLabel, status } = useGPS();
  const { profile, user } = useAuthStore();

  // Posts
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  // Reels
  const [showReelModal, setShowReelModal] = useState(false);
  const [reelVideoUrl, setReelVideoUrl] = useState('');
  const [reelDescription, setReelDescription] = useState('');
  const [uploadingReel, setUploadingReel] = useState(false);

  // Leaderboard (real sector stats)
  const [sectors, setSectors] = useState<{ sector_name: string; total_kg: number; member_count: number }[]>([]);

  // ── Fetch posts from Supabase ────────────────────────────────────────────────
  useEffect(() => {
    const fetchPosts = async () => {
      setLoadingPosts(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('type', 'post') // Only show posts in the Feed
        .order('created_at', { ascending: false })
        .limit(30);
      if (!error && data) {
        setPosts(data as Post[]);
      }
      setLoadingPosts(false);
    };
    fetchPosts();

    // Real-time subscription: new posts appear instantly
    const channel = supabase
      .channel('community-posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'type=eq.post' }, (payload) => {
        setPosts((prev) => [payload.new as Post, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Fetch sector leaderboard ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchSectors = async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .order('total_kg', { ascending: false });
      
      if (!error && data) {
        setSectors(data);
      }
    };
    fetchSectors();
  }, []);

  const handlePost = async () => {
    if (!newPostContent.trim() || !user) return;
    
    // Chloe AI Moderation Guard
    const mod = await chloeGuardian.moderateMessage(newPostContent);
    if (!mod.isSafe) {
      toast.error(`Chloe Guardian: ${mod.reason || "Content violates community standards."}`, { icon: '🛡️' });
      return;
    }

    setPosting(true);
    try {
      const insertData: any = {
        user_id: user.id,
        display_name: profile?.display_name || profile?.username || 'Eco User',
        content: mod.cleanedText || newPostContent.trim(),
        type: 'post',
        lat: coords?.lat ?? null,
        lng: coords?.lng ?? null,
        location_label: locationLabel || null,
        is_moderated: true
      };

      if (profile?.avatar_url) {
        insertData.avatar_url = profile.avatar_url;
      }

      const { error } = await supabase.from('messages').insert(insertData);
      
      if (error) {
        if (error.message.includes('avatar_url')) {
          delete insertData.avatar_url;
          const { error: retryError } = await supabase.from('messages').insert(insertData);
          if (retryError) throw new Error(retryError.message);
        } else {
          throw new Error(error.message);
        }
      }

      // Log to Unified History
      const { useHistoryStore } = await import('../stores/historyStore');
      useHistoryStore.getState().addItem({
        type: 'SOCIAL',
        title: 'Community Update',
        description: `You shared an update in ${locationLabel || 'the community'}.`,
        metadata: { content: newPostContent.trim().substring(0, 50) }
      });

      setNewPostContent('');
      toast.success('Posted to your community! 🌍');
    } catch (err: any) {
      toast.error('Failed to post: ' + err.message);
    } finally {
      setPosting(false);
    }
  };

  const handleCreateReel = async () => {
    if (!reelVideoUrl.trim() || !user) return;
    
    setUploadingReel(true);
    try {
      const { error } = await supabase.from('reels').insert({
        user_id: user.id,
        display_name: profile?.display_name || profile?.username || 'eco_analyst',
        avatar_url: profile?.avatar_url || null,
        video_url: reelVideoUrl.trim(),
        description: reelDescription.trim() || 'PlastiNet Eco-Impact Reel 🌍',
      });

      if (error) throw error;

      toast.success('Reel published to the global community! 🚀');
      setShowReelModal(false);
      setReelVideoUrl('');
      setReelDescription('');
    } catch (err: any) {
      toast.error('Reel upload failed: ' + err.message);
    } finally {
      setUploadingReel(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4">
      {/* Header & Leaderboard */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12"
      >
        <div className="lg:col-span-3 space-y-2">
          <h1 className="text-7xl font-black italic tracking-tighter uppercase leading-none">
            Global <span className="text-neon-green drop-shadow-[0_0_15px_rgba(57,255,20,0.5)]">Feed</span>
          </h1>
          <p className="text-white/40 font-black tracking-[0.4em] uppercase text-[10px]">
            AI-Moderated Environmental Intelligence Network
          </p>
        </div>
        
        {/* Sector Stats Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="glass-card p-6 bg-neon-green/5 border-neon-green/20 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <MapPin size={60} className="text-neon-green" />
          </div>
          <p className="text-[10px] font-black uppercase text-neon-green tracking-[0.3em] mb-2">Active Sector</p>
          <h3 className="text-2xl font-black italic uppercase">{locationLabel || 'Global Hub'}</h3>
          <p className="text-[10px] text-white/40 mt-1 uppercase font-bold tracking-widest">{status === 'ok' ? 'GPS Lock Verified' : 'Searching Satellites...'}</p>
        </motion.div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex items-center justify-start md:justify-center gap-2 md:gap-4 mb-8 md:mb-12 sticky top-20 z-30 py-3 md:py-4 bg-black/40 backdrop-blur-xl rounded-2xl md:rounded-full border border-white/5 mx-4 md:mx-auto max-w-2xl px-4 md:px-6 shadow-2xl overflow-x-auto no-scrollbar whitespace-nowrap">
        {[
          { id: 'feed', icon: LayoutGrid, label: 'Feed' },
          { id: 'reels', icon: PlayCircle, label: 'Reels' },
          { id: 'community', icon: Users, label: 'Community' },
          { id: 'groups', icon: MessageCircle, label: 'Groups' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="relative flex items-center gap-2 px-5 md:px-6 py-2.5 rounded-full transition-all group shrink-0"
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-neon-green rounded-full shadow-[0_0_20px_rgba(57,255,20,0.4)]"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <tab.icon size={16} className={`relative z-10 md:w-[18px] md:h-[18px] ${activeTab === tab.id ? 'text-black' : 'text-white/40 group-hover:text-white'}`} />
            <span className={`relative z-10 text-[10px] md:text-[10px] font-black uppercase tracking-widest ${activeTab === tab.id ? 'text-black' : 'text-white/40 group-hover:text-white'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'feed' && (
          <motion.div 
            key="feed"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* Sidebar Leaderboard */}
            <div className="hidden lg:block space-y-6">
              <div className="glass-card p-6 border-white/5 overflow-hidden relative">
                <div className="absolute -top-10 -left-10 w-32 h-32 bg-neon-green/5 blur-3xl" />
                <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-2 relative z-10">
                  <Users size={20} className="text-neon-green" /> Top Sectors
                </h3>
                <div className="space-y-6 relative z-10">
                  {sectors.map((s, i) => (
                    <motion.div 
                      key={s.sector_name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex justify-between items-center group/item"
                    >
                      <div className="space-y-0.5">
                        <p className="text-[8px] font-black uppercase text-white/20 tracking-[0.2em]">Rank #{i+1}</p>
                        <p className="text-sm font-black uppercase group-hover/item:text-neon-green transition-colors">{s.sector_name}</p>
                      </div>
                      <p className="text-sm font-black text-neon-green italic group-hover/item:scale-110 transition-transform">{s.total_kg}kg</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-3 space-y-8">
              {/* Post Input */}
              <motion.div 
                whileFocus={{ scale: 1.01 }}
                className="glass-card p-8 border-neon-green/20 bg-neon-green/[0.02]"
              >
                <div className="flex gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner overflow-hidden">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full object-cover" />
                    ) : (
                      <Users className="text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <textarea 
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Share environmental intelligence or action results..."
                      className="w-full bg-transparent border-none rounded-2xl p-0 text-lg font-medium focus:ring-0 outline-none min-h-[80px] placeholder:text-white/20"
                    />
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                        <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">
                          Broadcasting from {locationLabel || 'Global Hub'}
                        </p>
                      </div>
                      <button 
                        onClick={handlePost}
                        disabled={posting || !newPostContent.trim()}
                        className="btn-primary py-3 px-10 rounded-2xl"
                      >
                        {posting ? <Loader2 className="animate-spin" size={18} /> : 'Dispatch'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Feed Items */}
              <div className="space-y-6">
                {posts.map((post, idx) => (
                  <motion.div 
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass-card p-8 border-white/5 hover:border-neon-green/20 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 overflow-hidden border border-white/10 group-hover:border-neon-green/30 transition-all">
                          <img src={post.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}`} alt="" />
                        </div>
                        <div>
                          <h4 className="font-black italic uppercase tracking-tight text-xl group-hover:text-neon-green transition-colors">{post.display_name}</h4>
                          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2">
                            <MapPin size={10} className="text-neon-green" /> {post.location_label}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">
                        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white/80 leading-relaxed text-lg mb-4">{post.content}</p>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'reels' && (
          <motion.div
            key="reels"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="h-[80vh] rounded-[3rem] overflow-hidden border border-white/5 shadow-inner bg-black"
          >
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><Loader2 className="animate-spin text-neon-cyan" /></div>}>
              <VideoFeed />
            </Suspense>
          </motion.div>
        )}

        {activeTab === 'community' && (
          <motion.div
            key="community"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              {loadingPosts ? (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center text-white/40 gap-4">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="font-bold">Loading community posts…</span>
                </div>
              ) : posts.length === 0 ? (
                <div className="glass-card p-12 flex flex-col items-center justify-center text-center text-white/40 gap-4">
                  <MessageSquare size={40} className="opacity-30" />
                  <p className="font-bold text-lg">No posts yet</p>
                  <p className="text-sm">Be the first to share something with your community!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>

            <div className="space-y-6 hidden lg:block">
              {sectors.length > 0 ? (
                <div className="glass-card p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-neon-green">
                    <Users size={18} /> Sector Standings
                  </h3>
                  <div className="space-y-3">
                    {sectors.map((s, i) => (
                      <LeaderItem key={s.sector_name} name={s.sector_name} points={`${(s.total_kg / 1000).toFixed(1)}t`} rank={i + 1} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass-card p-6 border-white/5">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-neon-green">
                    <Users size={18} /> Sector Standings
                  </h3>
                  <p className="text-xs text-white/30 text-center py-4">No sector data yet — battles coming soon!</p>
                </div>
              )}
              <div className="glass-card p-6 border-neon-cyan/20 bg-neon-cyan/5">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Users size={16} className="text-neon-cyan" /> Community Posts
                </h3>
                <p className="text-3xl font-black">{posts.length}</p>
                <p className="text-xs text-white/40 mt-1">Messages in your community</p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'groups' && (
          <GroupChat coords={coords} locationLabel={locationLabel} mode="groups" />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="glass-card w-full max-w-md p-8 space-y-6 relative border-neon-cyan/30"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-neon-cyan uppercase italic">Create <span className="text-white">Reel</span></h2>
                <button onClick={() => setShowReelModal(false)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-txt-muted">Video URL</label>
                  <input 
                    type="text"
                    value={reelVideoUrl}
                    onChange={(e) => setReelVideoUrl(e.target.value)}
                    placeholder="Enter mp4/video link..."
                    className="w-full bg-txt-primary/5 border border-dark-border/10 rounded-xl px-4 py-3 text-sm focus:border-neon-cyan outline-none text-txt-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-txt-muted">Description</label>
                  <textarea 
                    value={reelDescription}
                    onChange={(e) => setReelDescription(e.target.value)}
                    placeholder="Tell the community about your impact..."
                    className="w-full bg-txt-primary/5 border border-dark-border/10 rounded-xl px-4 py-3 text-sm focus:border-neon-cyan outline-none text-txt-primary h-24 resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleCreateReel}
                disabled={uploadingReel || !reelVideoUrl.trim()}
                className="w-full py-4 bg-neon-cyan text-black rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,255,0.3)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploadingReel ? <Loader2 className="animate-spin" /> : 'Publish Reel'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Real Supabase Group Chat ───────────────────────────────────────────────────
const GroupChat = ({ coords, locationLabel, mode = 'community' }: any) => {
  const { messages, loading, sending, fetchMessages, sendMessage } = useChatStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const type = mode === 'community' ? 'sector' : 'group';

  useEffect(() => {
    fetchMessages(type, mode === 'community' ? (locationLabel || 'Global') : undefined);
  }, [locationLabel, mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input;
    setInput('');
    await sendMessage(text, type, mode === 'community' ? (locationLabel || 'Global') : undefined, locationLabel || undefined);
  };


  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-[calc(100vh-220px)] glass-card flex flex-col items-center justify-center gap-4 text-center p-8"
      >
        <AlertCircle size={40} className="text-yellow-400" />
        <h2 className="text-xl font-bold text-txt-primary">Sign in to join the chat</h2>
        <p className="text-txt-muted">You need to be logged in to send and view messages.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-[calc(100vh-220px)] glass-card flex flex-col overflow-hidden rounded-[2rem]"
    >
      {/* Header */}
      <div className={`p-5 border-b border-dark-border/10 flex items-center gap-3 shrink-0 ${
        mode === 'community' ? 'bg-neon-green/10' : 'bg-neon-cyan/10'
      }`}>
        <div className={`w-3 h-3 rounded-full animate-pulse ${
          mode === 'community' ? 'bg-neon-green' : 'bg-neon-cyan'
        }`} />
        <div>
          <p className="font-black uppercase tracking-tighter text-sm text-txt-primary">
            {mode === 'community' 
              ? (locationLabel ? `${locationLabel} Community Hub` : 'Global Community Hub') 
              : 'Private Impact Groups'}
          </p>
          <p className="text-[10px] text-txt-muted uppercase tracking-widest font-bold">
            {mode === 'community' ? 'Localized Sector Node' : 'Encrypted Group Node'} • Chloe Protected
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-3 text-txt-muted">
            <Loader2 className="animate-spin" size={20} />
            <span className="font-bold text-sm">Loading messages…</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-txt-muted">
            <MessageCircle size={40} className="opacity-30" />
            <p className="font-bold">No messages yet</p>
            <p className="text-sm">Be the first to say hello! 👋</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.user_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : ''}`}>
                  <div className="w-8 h-8 rounded-full bg-txt-primary/5 border border-dark-border/10 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                    {msg.avatar_url ? (
                      <img src={msg.avatar_url} alt={msg.display_name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-neon-green">{(msg.display_name || 'U')[0]?.toUpperCase() || '?'}</span>
                    )}
                  </div>
                  <div className={`space-y-1 ${isMe ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-txt-muted uppercase tracking-widest">
                        {isMe ? 'You' : (msg.display_name || 'Eco User')}
                      </span>
                      {msg.location_label && (
                        <span className="text-[9px] text-txt-muted/60 flex items-center gap-0.5">
                          <MapPin size={8} /> {msg.location_label}
                        </span>
                      )}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-neon-green/15 border border-neon-green/25 text-txt-primary rounded-tr-none'
                        : 'bg-txt-primary/5 border border-dark-border/10 text-txt-primary/90 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-txt-muted">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dark-border/10 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={mode === 'community' 
              ? `Message your community in ${locationLabel || 'Global'}…`
              : "Message your private group…"}
            className="flex-1 bg-txt-primary/5 border border-dark-border/10 rounded-xl px-4 py-3 text-sm focus:border-neon-green outline-none text-txt-primary"
          />
          <button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className={`px-4 py-3 rounded-xl transition-all ${
              input.trim() && !sending
                ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        {locationLabel && (
          <p className="text-[10px] text-white/20 mt-2 flex items-center gap-1">
            <MapPin size={9} /> Posting from {locationLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
      active ? 'bg-neon-green text-black' : 'text-white/40 hover:text-white'
    }`}
  >
    {icon} {label}
  </button>
);

const PostCard = ({ post }: { post: Post }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 space-y-4 hover:border-white/20 transition-colors"
  >
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/10 font-bold text-neon-green overflow-hidden">
          {post.avatar_url ? (
            <img src={post.avatar_url} alt={post.display_name} className="w-full h-full object-cover" />
          ) : (
            post.display_name?.[0]?.toUpperCase() || '?'
          )}
        </div>
        <div>
          <p className="font-bold">{post.display_name}</p>
          <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest flex items-center gap-1">
            {post.location_label && <><MapPin size={9} /> {post.location_label}</>}
          </p>
        </div>
      </div>
      <button className="text-white/20 hover:text-white"><Share2 size={18} /></button>
    </div>
    <p className="text-txt-primary/90 leading-relaxed">{post.content}</p>

    {/* Media Preview (New) */}
    {post.media_url && (
      <div className="relative rounded-2xl overflow-hidden border border-dark-border/10 bg-black/20">
        {post.media_type === 'video' ? (
          <video 
            src={post.media_url} 
            controls 
            className="w-full max-h-[400px] object-contain"
          />
        ) : (
          <img 
            src={post.media_url} 
            alt="Post content" 
            className="w-full max-h-[400px] object-contain hover:scale-105 transition-transform duration-700" 
          />
        )}
      </div>
    )}

    <div className="pt-4 border-t border-dark-border/10 flex gap-6">
      <button className="flex items-center gap-2 text-white/40 hover:text-pink-500 transition-colors">
        <Heart size={20} />
        <span className="text-sm font-bold">{post.likes || 0}</span>
      </button>
      <button className="flex items-center gap-2 text-white/40 hover:text-neon-cyan transition-colors">
        <MessageSquare size={20} />
      </button>
      <span className="ml-auto text-[10px] text-white/20">
        {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  </motion.div>
);

const LeaderItem = ({ name, points, rank }: any) => (
  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
    <div className="flex items-center gap-3">
      <span className={`text-xs font-black ${rank === 1 ? 'text-neon-green' : 'text-white/20'}`}>0{rank}</span>
      <span className="font-bold text-sm">{name}</span>
    </div>
    <span className="text-xs font-mono text-neon-green">{points}</span>
  </div>
);

export default Community;
