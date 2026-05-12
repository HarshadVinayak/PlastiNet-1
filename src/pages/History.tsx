import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History as HistoryIcon, TrendingUp, ArrowDownRight, ArrowUpRight, 
  Camera, Search, Sparkles, Filter, Globe
} from 'lucide-react';
import { useHistoryStore, HistoryType } from '../stores/historyStore';
import { useRewardStore } from '../stores/rewardStore';

const HistoryPage = () => {
  const { items, fetchHistory, loading } = useHistoryStore();
  const [filter, setFilter] = useState<HistoryType | 'ALL'>('ALL');

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredItems = filter === 'ALL' ? items : items.filter(i => i.type === filter);

  const getTypeIcon = (type: HistoryType) => {
    switch (type) {
      case 'SCAN': return <Camera size={20} />;
      case 'RESEARCH': return <Search size={20} />;
      case 'REWARD': return <TrendingUp size={20} />;
      case 'SOCIAL': return <Globe size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  const getTypeColor = (type: HistoryType) => {
    switch (type) {
      case 'SCAN': return 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20';
      case 'RESEARCH': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'REWARD': return 'text-neon-green bg-neon-green/10 border-neon-green/20';
      case 'SOCIAL': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-white/40 bg-white/5 border-white/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="glass-card p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-neon-green/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-neon-green/10 border border-neon-green/20 rounded-2xl text-neon-green">
              <HistoryIcon size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter">Impact <span className="text-neon-green">Ledger</span></h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Unified Activity Sync v2.0</p>
            </div>
          </div>
          <p className="text-white/60 text-lg max-w-xl">A complete historical record of your environmental actions, verified scans, and intelligence searches.</p>
        </div>
      </div>

      <div className="glass-card p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-neon-green" />
            Activity Stream
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {['ALL', 'SCAN', 'RESEARCH', 'REWARD', 'SOCIAL'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  filter === f 
                    ? 'bg-neon-green text-black border-neon-green shadow-[0_0_15px_rgba(57,255,20,0.3)]' 
                    : 'bg-white/5 text-white/40 border-white/10 hover:border-white/20'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.length > 0 ? filteredItems.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex justify-between items-center p-6 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-neon-green/20 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`p-4 rounded-2xl border transition-all group-hover:scale-110 duration-500 ${getTypeColor(item.type)}`}>
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <p className="font-black text-xl italic tracking-tighter uppercase group-hover:text-neon-green transition-colors">{item.title}</p>
                    <p className="text-sm text-white/40 leading-relaxed max-w-md">{item.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                        {new Date(item.created_at).toLocaleDateString()} — {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
                
                {item.type === 'REWARD' && item.metadata?.amount && (
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-2xl font-black text-neon-green">+{item.metadata.amount}</span>
                      <img src="/plasticoin.png" alt="PLC" className="w-6 h-6 object-contain" />
                    </div>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest mt-1">Impact Credits</p>
                  </div>
                )}
              </motion.div>
            )) : (
              <div className="text-center py-24 space-y-6">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/10">
                  <HistoryIcon size={40} />
                </div>
                <div className="space-y-1">
                  <p className="text-white/60 font-black uppercase tracking-widest">Repository Empty</p>
                  <p className="text-sm text-white/20 uppercase tracking-tighter">Awaiting first environmental interaction...</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default HistoryPage;

