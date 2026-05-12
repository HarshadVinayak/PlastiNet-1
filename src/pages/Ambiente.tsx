import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayCircle, 
  ExternalLink, 
  RefreshCw, 
  Leaf, 
  ShieldCheck, 
  BookOpen, 
  ArrowUpRight,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { youtubeService, YouTubeVideo } from '../services/youtube';
import toast from 'react-hot-toast';
import { Shimmer } from '../components/ui/Shimmer';

const KNOWLEDGE_HUBS = [
  {
    id: 'earth5r',
    name: 'Earth5R',
    description: 'Internationally acclaimed Green Education platform endorsed by the UN.',
    link: 'https://earth5r.org/',
    category: 'Community Action',
    icon: Globe,
    color: 'from-green-500/20 to-emerald-500/20'
  },
  {
    id: 'zerowaste',
    name: 'Zero Waste AI',
    description: 'Expert assistant for complex recycling legislation and sorting methods.',
    link: 'https://sifiratikvakfi.org/',
    category: 'AI Mentor',
    icon: Sparkles,
    color: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 'plasticdiary',
    name: 'My Plastic Diary',
    description: 'Digital coach providing daily tips to lower your plastic footprint.',
    link: 'http://www.myplasticdiary.co.uk/',
    category: 'Digital Coach',
    icon: BookOpen,
    color: 'from-purple-500/20 to-pink-500/20'
  },
  {
    id: 'scrapp',
    name: 'Scrapp',
    description: 'Recycling encyclopedia using barcode scanning for local disposal.',
    link: 'https://www.scrappzero.com/',
    category: 'Circular Economy',
    icon: Zap,
    color: 'from-orange-500/20 to-yellow-500/20'
  },
  {
    id: 'unep',
    name: 'UNEP',
    description: 'Global standard for environmental reports and systemic waste management.',
    link: 'https://www.unep.org/',
    category: 'Academics',
    icon: ShieldCheck,
    color: 'from-indigo-500/20 to-blue-500/20'
  }
];

const Ambiente = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadVideos = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      console.log('Ambiente: Initializing load flow...');
      
      // 1. Fetch from Supabase via service
      const data = await youtubeService.getCuratedVideos(10);
      
      console.log(`Ambiente: DISPLAYED COUNT = ${data.length} videos.`);
      
      if (data.length > 0) {
        const fetchedAt = data[0].fetched_at ? new Date(data[0].fetched_at).getTime() : Date.now();
        const diffHours = Math.floor((Date.now() - fetchedAt) / (1000 * 60 * 60));
        setLastUpdated(diffHours === 0 ? 'Just now' : `${diffHours}h ago`);
      } else {
        setLastUpdated('Syncing...');
      }
      
      setVideos(data);
      
      // 2. Background Sync: Only if data is low, NOT on every refresh
      if (data.length < 5) {
        console.log('Ambiente: Low video count detected, triggering background sync.');
        const newBatch = await youtubeService.fetchNewVideos(false);
        if (newBatch) {
          console.log(`Ambiente: FETCHED COUNT = ${newBatch.length} videos.`);
        }
      }
    } catch (error) {
      console.error('Ambiente load error:', error);
      toast.error('Failed to load curator feed');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadVideos();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('Ambiente: Initializing real-time synchronization with YouTube API...');
      
      // 1. Force fetch fresh videos from API
      const result = await youtubeService.fetchNewVideos(true);
      
      if (!result || result.length === 0) {
        toast.error('Sync failed: Content pool is optimal or API limit reached.');
        return;
      }

      // 2. Reload curated videos from DB
      const freshData = await youtubeService.getCuratedVideos(10);
      setVideos(freshData);
      
      toast.success(`Chloe AI synchronized ${result.length} fresh masterclasses!`);
    } catch (e: any) {
      console.error('Refresh failed:', e);
      toast.error(e.message || 'Failed to sync fresh content');
    } finally {
      setRefreshing(false);
    }
  };



  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-6xl mx-auto space-y-12"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 rounded-full border border-neon-green/20">
          <Leaf className="text-neon-green" size={16} />
          <span className="text-xs font-bold uppercase tracking-widest text-neon-green">Ambiente Feed</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
          Content Intelligence <span className="text-white/40">by Chloe</span>
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto italic">
          "A curated discovery system for the eco-conscious mind. Updated every 24 hours with precision."
        </p>
      </div>

      {/* Knowledge Hubs Section */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Community Action Hubs</h2>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {KNOWLEDGE_HUBS.map((hub) => (
            <motion.a
              key={hub.id}
              href={hub.link}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5, scale: 1.02 }}
              className={`glass-card p-8 group relative overflow-hidden flex flex-col justify-between border-white/5 hover:border-white/20 transition-all duration-500 rounded-[2.5rem] bg-gradient-to-br ${hub.color}`}
            >
              <div className="absolute top-6 right-6 p-3 bg-white/5 rounded-2xl group-hover:bg-neon-green group-hover:text-black transition-all duration-500">
                <ArrowUpRight size={24} />
              </div>
              
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                  <hub.icon className="text-white/40 group-hover:text-white transition-colors" />
                </div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                  {hub.category}
                </span>
                <h3 className="text-2xl font-black">{hub.name}</h3>
                <p className="text-white/60 text-sm leading-relaxed group-hover:text-white/80 transition-colors">
                  {hub.description}
                </p>
              </div>

              <div className="mt-8 flex items-center gap-2 text-xs font-bold text-white/40 group-hover:text-white transition-colors">
                <span>Visit Ecosystem</span>
                <div className="w-1 h-1 bg-white/20 rounded-full" />
                <span>External Hub</span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* YouTube Section */}
      <section className="space-y-8 pb-12">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <PlayCircle className="text-red-500" />
              Curated Masterclass
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <span className="text-neon-green">Curated by Chloe AI</span>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <span className="text-white/40">Updated {lastUpdated}</span>
            </div>
          </div>
          
          <button 
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={20} className={`text-neon-green ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>

        <div className="relative min-h-[300px]">
          <AnimatePresence mode="wait">
            {loading || refreshing ? (
              <div key="loading" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Shimmer className="aspect-video rounded-[2rem]" delay={i * 100} />
                    <div className="px-2 space-y-2">
                      <Shimmer className="h-4 w-3/4 rounded-full" delay={i * 100 + 50} />
                      <Shimmer className="h-3 w-1/2 rounded-full" delay={i * 100 + 100} />
                    </div>
                  </div>
                ))}
              </div>
            ) : videos.length > 0 ? (
              <motion.div 
                key="videos"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {videos.map((video, idx) => (
                  <motion.div
                    key={video.video_id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative"
                  >
                    <a 
                      href={`https://youtube.com/watch?v=${video.video_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block space-y-4"
                    >
                      <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/5 group-hover:border-neon-green/30 transition-all duration-500 shadow-2xl bg-black">
                        <img 
                          src={video.thumbnail || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80'} 
                          alt={video.title} 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-14 h-14 bg-neon-green rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(57,255,20,0.5)]">
                            <PlayCircle size={32} />
                          </div>
                        </div>
                        <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                            {video.category_tag || 'Eco'}
                          </span>
                        </div>
                      </div>
                      <div className="px-2">
                        <h4 className="font-bold line-clamp-2 group-hover:text-neon-green transition-colors leading-tight">
                          {video.title || 'Environmental Masterclass'}
                        </h4>
                        <p className="text-xs text-white/40 mt-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-neon-green/40" />
                          {video.channel || 'Eco Channel'}
                        </p>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-6 glass-card rounded-[3rem] border-white/5 bg-white/5"
              >
                <div className="w-20 h-20 rounded-full bg-neon-green/10 flex items-center justify-center text-neon-green shadow-[0_0_40px_rgba(57,255,20,0.1)] border border-neon-green/20">
                  <Globe size={40} className={refreshing ? 'animate-spin' : 'animate-pulse'} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight">Ecosystem Sync Required</h3>
                  <p className="text-white/40 text-sm max-w-sm mx-auto">
                    The curated repository is currently empty. Chloe AI needs to synchronize with the global environmental database.
                  </p>
                </div>
                <button 
                  onClick={() => loadVideos(true)}
                  disabled={refreshing}
                  className="btn-primary py-3 px-10 flex items-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                  <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                  <span className="relative font-black uppercase tracking-widest text-sm">
                    {refreshing ? 'Synchronizing...' : 'Initialize Full Sync'}
                  </span>
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        <div className="flex justify-center pt-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/10 flex items-center gap-2">
            Content powered by YouTube Data API v3 • Managed by Chloe Intelligence
          </p>
        </div>
      </section>
    </motion.div>
  );
};

export default Ambiente;
