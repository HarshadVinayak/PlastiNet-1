import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Music2, UserPlus, Coins, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const VideoFeed = () => {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReels = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('reels')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error("Reels fetch error:", error);
      } else if (data && data.length > 0) {
        setReels(data);
      }
      setLoading(false);
    };

    fetchReels();
  }, []);

  if (loading) {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-neon-cyan" size={40} />
        <p className="text-neon-cyan font-black uppercase tracking-widest text-xs">Syncing Reels...</p>
      </div>
    );
  }

  // Fallback if no real reels exist yet
  if (reels.length === 0) {
    return (
      <div className="h-full w-full bg-black flex flex-col items-center justify-center gap-6 p-8 text-center">
        <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Share2 size={40} className="text-white/20" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic">No Reels Yet</h2>
        <p className="text-white/40 text-sm max-w-xs">Be the first analyst to share an eco-impact reel with the global community!</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 top-[80px] bg-black z-10 overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
    >
      {reels.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </motion.div>
  );
};

const VideoCard = ({ video }: any) => {
  const [liked, setLiked] = useState(false);

  return (
    <div className="h-full w-full snap-start relative flex flex-col justify-center items-center">
      {/* Video Content */}
      <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
        {video.video_url ? (
          <video 
            src={video.video_url} 
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <div className="text-white/10 flex flex-col items-center">
            <Music2 size={80} className="animate-spin-slow mb-4" />
            <p className="font-black text-4xl uppercase tracking-[0.2em]">Video Error</p>
          </div>
        )}
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
      
      <div className="absolute bottom-8 left-8 right-20 pointer-events-none">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold overflow-hidden">
              {video.avatar_url ? (
                <img src={video.avatar_url} alt={video.display_name} className="w-full h-full object-cover" />
              ) : (
                (video.display_name || 'E')[0]
              )}
            </div>
            <p className="font-bold text-lg text-white">@{video.display_name || 'eco_analyst'}</p>
            <button className="px-3 py-1 bg-neon-cyan text-black text-[10px] font-black rounded-full uppercase pointer-events-auto">
              Follow
            </button>
          </div>
          <p className="text-white/80 line-clamp-2 max-w-md">{video.description}</p>
          <div className="flex items-center gap-2 text-neon-cyan text-sm font-bold">
            <Music2 size={14} />
            <span>Original Sound - {video.display_name || 'Eco Analyst'}</span>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-8 right-6 flex flex-col items-center gap-6 pointer-events-auto">
        <ActionButton 
          active={liked} 
          onClick={() => setLiked(!liked)} 
          icon={<Heart className={liked ? 'fill-red-500 text-red-500' : ''} />} 
          count={video.likes_count || 0} 
        />
        <ActionButton icon={<MessageCircle />} count="842" />
        <ActionButton icon={<Share2 />} count="Share" />
        <div className="w-12 h-12 rounded-full border-2 border-neon-cyan p-1 animate-spin-slow">
           <div className="w-full h-full bg-neon-cyan/20 rounded-full flex items-center justify-center">
             <Coins size={20} className="text-neon-cyan" />
           </div>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, count, active, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 group">
    <div className={`p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-transform active:scale-90 group-hover:bg-white/10 text-white`}>
      {icon}
    </div>
    <span className="text-[10px] font-bold text-white/60">{count}</span>
  </button>
);

export default VideoFeed;
