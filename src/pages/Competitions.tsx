import { motion } from 'framer-motion';
import { Trophy, Swords, Zap, ChevronRight, MapPin, Loader2, BarChart3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useGPS } from '../hooks/useGPS';
import toast from 'react-hot-toast';

interface SectorStat {
  id: string;
  sector_name: string;
  total_kg: number;
  member_count: number;
}

const Competitions = () => {
  const { locationLabel, status } = useGPS();
  const [sectors, setSectors] = useState<SectorStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('sector_stats')
        .select('*')
        .order('total_kg', { ascending: false });

      if (error) {
        toast.error('Failed to load sector stats');
      } else if (data) {
        setSectors(data);
      }
      setLoading(false);
    };

    fetchSectors();

    // Subscribe to realtime updates for sector stats
    const channel = supabase
      .channel('sector-stats-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sector_stats' },
        () => {
          fetchSectors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const featuredA = sectors[0];
  const featuredB = sectors[1];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="flex justify-end mb-4">
        <Link 
          to="/org-dashboard" 
          className="flex items-center gap-2 px-4 py-2 bg-txt-primary/5 hover:bg-txt-primary/10 rounded-xl border border-dark-border/10 transition-all group"
        >
          <BarChart3 size={18} className="text-neon-green" />
          <span className="text-sm font-bold text-txt-primary">B2B Portal</span>
          <ChevronRight size={14} className="text-txt-muted group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-green/10 rounded-full border border-neon-green/20 mb-6">
          <Trophy className="text-neon-green" size={16} />
          <span className="text-sm font-bold uppercase tracking-widest text-neon-green">Civic Esports</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-txt-primary uppercase italic">Sector Battles</h1>
        <p className="text-txt-secondary text-lg">
          {status === 'ok' && locationLabel ? (
            <>Representing <b className="text-neon-green">{locationLabel}</b>. Compete against neighboring communities to earn massive PLC multipliers.</>
          ) : (
            <>Compete against neighboring communities to earn massive PLC multipliers and unlock civic upgrades.</>
          )}
        </p>
      </div>

      {loading ? (
        <div className="glass-card p-12 flex items-center justify-center gap-3 text-txt-muted">
          <Loader2 className="animate-spin text-neon-green" size={24} />
          <span className="font-bold">Loading battles…</span>
        </div>
      ) : sectors.length >= 2 ? (
        <div className="glass-card p-8 md:p-12 border-neon-cyan/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-neon-green/10" />
          
          <div className="flex flex-col items-center justify-center text-center relative z-10">
            <p className="text-neon-cyan font-bold uppercase tracking-widest text-sm mb-8">Current Mega-Event</p>
            
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full justify-center">
              {/* Team A */}
              <div className="flex-1 text-right">
                <h2 className="text-3xl font-black mb-2 text-txt-primary uppercase italic tracking-tighter">{featuredA.sector_name}</h2>
                <div className="flex items-center justify-end gap-2 text-txt-muted mb-4">
                  <MapPin size={16} /> {featuredA.member_count} Active Members
                </div>
                <p className="text-4xl font-mono text-neon-green font-bold">{featuredA.total_kg.toLocaleString()} kg</p>
              </div>

              {/* VS */}
              <div className="relative">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center border-4 border-white/10 z-10 relative shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <Swords size={24} className="text-white/60" />
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-1 bg-white/5 -z-10" />
              </div>

              {/* Team B */}
              <div className="flex-1 text-left">
                <h2 className="text-3xl font-black mb-2 text-txt-primary uppercase italic tracking-tighter">{featuredB.sector_name}</h2>
                <div className="flex items-center justify-start gap-2 text-txt-muted mb-4">
                  <MapPin size={16} /> {featuredB.member_count} Active Members
                </div>
                <p className="text-4xl font-mono text-blue-400 font-bold">{featuredB.total_kg.toLocaleString()} kg</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-2xl mt-12">
              <div className="flex justify-between text-sm font-bold uppercase tracking-widest mb-3">
                <span className="text-neon-green">Leading: {featuredA.sector_name}</span>
                <span className="text-txt-muted">Battle in Progress</span>
              </div>
              <div className="h-4 rounded-full flex overflow-hidden border border-dark-border/10 bg-black/40">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(featuredA.total_kg / (featuredA.total_kg + featuredB.total_kg)) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-neon-green shadow-[0_0_10px_rgba(57,255,20,0.5)]"
                />
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(featuredB.total_kg / (featuredA.total_kg + featuredB.total_kg)) * 100}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>

            <button className="btn-primary mt-10 px-8 py-4 text-lg shadow-[0_0_20px_rgba(57,255,20,0.3)] bg-neon-green text-black font-black uppercase italic tracking-tighter hover:scale-105 transition-transform">
              Contribute to {featuredA.sector_name}
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-12 text-center space-y-4 border-dark-border/10">
          <Swords size={48} className="mx-auto text-txt-muted/30" />
          <h2 className="text-2xl font-bold text-txt-primary">No Active Battles</h2>
          <p className="text-txt-muted max-w-sm mx-auto">
            Wait for your community to reach enough members to start a new Sector Battle!
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        <div className="glass-card p-6 border-dark-border/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-txt-primary">
            <Zap className="text-yellow-400" /> High-Impact Missions
          </h3>
          <div className="space-y-3">
            <MissionItem title="The Great Plastic Purge" reward="2x PLC Multiplier" participants="Realtime" />
            <MissionItem title="E-Waste Drive" reward="Exclusive Badge" participants="Upcoming" />
          </div>
        </div>

        <div className="glass-card p-6 border-dark-border/10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-txt-primary">
            <Trophy className="text-neon-cyan" /> Regional Standings
          </h3>
          <div className="space-y-3">
            {sectors.length > 0 ? (
              sectors.slice(0, 3).map((s, i) => (
                <StandingItem key={s.id} rank={i + 1} name={s.sector_name} points={s.total_kg.toLocaleString()} />
              ))
            ) : (
              <p className="text-txt-muted/40 text-center py-8">No stats yet</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MissionItem = ({ title, reward, participants }: any) => (
  <div className="flex justify-between items-center p-4 bg-txt-primary/5 hover:bg-txt-primary/10 transition-colors rounded-xl border border-dark-border/10 cursor-pointer group">
    <div>
      <h4 className="font-bold mb-1 text-txt-primary">{title}</h4>
      <p className="text-xs text-txt-muted">{participants}</p>
    </div>
    <div className="text-right flex items-center gap-4">
      <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest">{reward}</span>
      <ChevronRight size={16} className="text-txt-muted group-hover:text-txt-primary group-hover:translate-x-1 transition-all" />
    </div>
  </div>
);

const StandingItem = ({ rank, name, points }: any) => (
  <div className="flex justify-between items-center p-4 bg-txt-primary/5 rounded-xl border border-dark-border/10">
    <div className="flex items-center gap-4">
      <span className={`text-lg font-black ${rank === 1 ? 'text-neon-cyan' : rank === 2 ? 'text-txt-primary/80' : 'text-txt-muted/40'}`}>#{rank}</span>
      <span className="font-bold text-txt-primary">{name}</span>
    </div>
    <span className="font-mono text-neon-cyan font-bold">{points} kg</span>
  </div>
);

export default Competitions;
