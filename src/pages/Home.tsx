import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Camera, TrendingUp, Award, Zap, Leaf, 
  Shield, Target, Globe, ArrowRight, Activity, PlayCircle, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { TransformationSlider } from '../components/ui/TransformationSlider';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ChloeSearch from '../components/ui/ChloeSearch';
import EventTimer from '../components/ui/EventTimer';
import { youtubeService } from '../services/youtube';

const Home = () => {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 md:space-y-12">
      {/* Real-time Event Countdown */}
      <EventTimer />

      {/* Dynamic Control Header */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 glass-card p-12 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center">
                <Activity className="w-6 h-6 text-neon-green eco-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-black font-heading uppercase italic tracking-tighter text-txt-primary">Chloe <span className="text-neon-green">Online</span></h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-txt-muted">Environmental Intelligence OS v1.0.4</p>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-black font-heading uppercase tracking-tighter italic leading-[0.9] mb-12 text-txt-primary">
              Transform your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-cyan">plastic footprint</span>
            </h1>

            <div className="flex flex-wrap gap-6 mt-auto">

              <Link to="/upload">
                <Button size="lg" className="gap-3">
                  <Camera className="w-5 h-5" /> Initialize Scan
                </Button>
              </Link>

              <div className="flex items-center gap-6 px-8 rounded-2xl bg-txt-primary/5 border border-dark-border/10">
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-txt-muted mb-1">Impact Score</p>
                  <p className="text-lg font-black italic text-neon-cyan">2,840</p>
                </div>
                <div className="w-px h-8 bg-dark-border/10" />
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase text-txt-muted mb-1">Rank</p>
                  <p className="text-lg font-black italic text-txt-primary">VETERAN</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-10 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-black font-heading uppercase tracking-tighter italic mb-6 text-txt-primary">Mission <span className="text-neon-cyan">Hub</span></h3>
            <div className="space-y-4">
              {[
                { label: "Sector Alpha Cleanup", xp: "+500 XP", progress: 85 },
                { label: "Material Identification", xp: "+250 XP", progress: 40 },
                { label: "Community Protocol", xp: "+100 XP", progress: 10 }
              ].map((m, i) => (
                <div key={i} className="p-4 rounded-2xl bg-txt-primary/5 border border-dark-border/10 group hover:border-neon-green/30 transition-all cursor-pointer">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-txt-primary">{m.label}</span>
                    <span className="text-[10px] font-black text-neon-green">{m.xp}</span>
                  </div>
                  <div className="h-1.5 w-full bg-txt-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neon-green to-neon-cyan" style={{ width: `${m.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Link to="/competitions">
            <Button variant="ghost" className="w-full mt-6 gap-2 text-[10px]">
              View All Missions <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Impact Visualization */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="glass-card p-10 h-full">
            <h3 className="text-2xl font-black font-heading uppercase tracking-tighter italic mb-8 flex items-center gap-4">
              <TrendingUp className="w-6 h-6 text-neon-green" />
              Recycling <span className="text-neon-green">Progress</span>
            </h3>
            <TransformationSlider 
              before="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80" 
              after="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80"
              className="h-[300px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {[
            { label: "Global PLC Pool", value: "1.2M", icon: Zap, color: "#00FFFF" },
            { label: "Active Analysts", value: "8,450", icon: Globe, color: "#39FF14" },
            { label: "Secured Sectors", value: "142", icon: Shield, color: "#00FFFF" },
            { label: "Total Recycled", value: "85.2T", icon: Target, color: "#39FF14" }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.05 }}
              className="glass-card p-8 flex flex-col justify-center items-center text-center"
            >
              <stat.icon className="w-8 h-8 mb-4" style={{ color: stat.color }} />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
              <p className="text-3xl font-black font-heading italic">{stat.value}</p>
            </motion.div>
          ))}
        </div>
      </section>
      {/* Curated Masterclass Feed */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-2xl font-black font-heading uppercase tracking-tighter italic flex items-center gap-3">
              <PlayCircle className="w-6 h-6 text-neon-green" />
              Curated <span className="text-neon-green">Masterclass</span>
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Intelligence Feed • Managed by Chloe</p>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/ambiente" className="text-xs font-black uppercase tracking-widest text-neon-cyan hover:text-white transition-colors flex items-center gap-2">
              Enter Ambiente <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <YouTubeMiniFeed limit={3} />
        </div>
      </section>

    </div>
  );
};

// Simplified Feed Component for Dashboard
const YouTubeMiniFeed = ({ limit }: { limit: number }) => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchVideos = async (force = false) => {
    if (force) setSyncing(true);
    else setLoading(true);

    try {
      if (force) {
        const result = await youtubeService.fetchNewVideos(true);
        if (result && result.length > 0) {
          toast.success('Chloe AI synchronized fresh intelligence');
        } else {
          toast.error('Sync failed: Content pool is already optimal or API limit reached.');
        }
      }
      
      const data = await youtubeService.getCuratedVideos(limit);
      setVideos(data);
    } catch (err) {
      console.error("Feed recovery error:", err);
      toast.error('Feed synchronization interrupted.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (loading) {
    return <>
      {[1, 2, 3].map(i => (
        <div key={i} className="glass-card p-4 space-y-4">
          <div className="aspect-video bg-white/5 animate-pulse rounded-2xl" />
          <div className="space-y-2">
            <div className="h-4 bg-white/5 animate-pulse rounded-full w-3/4" />
            <div className="h-3 bg-white/5 animate-pulse rounded-full w-1/2" />
          </div>
        </div>
      ))}
    </>;
  }

  return (
    <>
      <div className="md:col-span-3 flex justify-end -mt-12 mb-4">
        <button 
          onClick={() => fetchVideos(true)}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest"
        >
          <RefreshCw size={12} className={`text-neon-green ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Syncing Intelligence...' : 'Rotate Feed'}</span>
        </button>
      </div>

      {videos.map((video, idx) => (
        <motion.div
          key={video.video_id || idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="group relative"
        >
          <a 
            href={`https://youtube.com/watch?v=${video.video_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block space-y-4"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 group-hover:border-neon-green/30 transition-all duration-500 shadow-xl bg-black">
              <img 
                src={video.thumbnail} 
                alt={video.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 bg-neon-green rounded-full flex items-center justify-center text-black">
                  <PlayCircle size={24} />
                </div>
              </div>
            </div>
            <div className="px-2">
              <h4 className="text-sm font-bold line-clamp-2 group-hover:text-neon-green transition-colors leading-tight">
                {video.title}
              </h4>
              <p className="text-[10px] text-white/40 mt-2 font-bold uppercase tracking-widest">
                {video.channel}
              </p>
            </div>
          </a>
        </motion.div>
      ))}
    </>
  );
};



export default Home;
