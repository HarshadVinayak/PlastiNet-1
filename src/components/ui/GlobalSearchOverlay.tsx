import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, ArrowRight, Globe, Loader2, ShieldAlert, History } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { searchService, SearchResult } from '../../services/search';
import { useAIStore } from '../../stores/aiStore';
import { Shimmer } from './Shimmer';

const GlobalSearchOverlay = () => {
  const { isSearchOpen, toggleSearch } = useUIStore();
  const { sendMessage } = useAIStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [moderationError, setModerationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setModerationError(null);
    }
  }, [isSearchOpen]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setModerationError(null);
    setResults([]);

    try {
      // 1. CHLOE MODERATION LAYER
      const { moderationService } = await import('../../services/moderation');
      const { isRelevant, message } = moderationService.checkRelevance(query);

      if (!isRelevant) {
        setModerationError(message || "Chloe: This search doesn't seem related to our eco-mission.");
        setLoading(false);
        return;
      }


      // 2. FETCH RESULTS
      const data = await searchService.searchEnvironmentalInfo(query);
      setResults(data);

      // 3. LOG TO HISTORY
      if (data.length > 0) {
        const { useHistoryStore } = await import('../../stores/historyStore');
        useHistoryStore.getState().addItem({
          type: 'RESEARCH',
          title: `Research: ${query}`,
          description: `Synchronized intelligence for "${query}". Found ${data.length} relevant sources.`,
          metadata: { query, resultsCount: data.length }
        });
      }


    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[6000] bg-black/95 backdrop-blur-3xl flex flex-col p-8 md:p-20 overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-neon-green/10 border border-neon-green/20 rounded-2xl flex items-center justify-center">
                <Search className="text-neon-green" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-txt-primary">Research <span className="text-neon-green">Intelligence</span></h2>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-txt-muted">Chloe Web Sync v1.2</p>
              </div>
            </div>
            <button 
              onClick={toggleSearch}
              className="w-12 h-12 bg-txt-primary/5 hover:bg-txt-primary/10 rounded-2xl flex items-center justify-center transition-all group border border-dark-border/10"
            >
              <X className="group-hover:rotate-90 transition-transform text-txt-primary" />
            </button>
          </div>

          {/* Search Box */}
          <div className="max-w-4xl mx-auto w-full">
            <form onSubmit={handleSearch} className="relative group mb-12">
              <div className="absolute inset-0 bg-neon-green/10 blur-[100px] opacity-50 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex items-center bg-dark-glass border border-dark-border/10 rounded-3xl overflow-hidden focus-within:border-neon-green/50 transition-all shadow-2xl">
                <Search className="ml-8 text-txt-muted" size={28} />
                <input 
                  ref={inputRef}
                  type="text"
                  placeholder="Ask Chloe: 'How to upcycle PVC pipes?' or 'New recycling tech 2024'..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent py-8 px-6 text-xl font-medium focus:outline-none placeholder:text-txt-muted/30 text-txt-primary"
                />
                {loading ? (
                  <Loader2 className="mr-8 animate-spin text-neon-green" size={28} />
                ) : (
                  <button type="submit" className="mr-4 p-4 bg-neon-green/10 hover:bg-neon-green/20 rounded-2xl transition-colors group/btn">
                    <ArrowRight className="text-neon-green group-hover/btn:translate-x-2 transition-transform" size={28} />
                  </button>
                )}
              </div>
            </form>

            {/* Content Area */}
            <div className="h-[60vh] overflow-y-auto custom-scrollbar pr-4">
              <AnimatePresence mode="wait">
                {moderationError ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center space-y-6"
                  >
                    <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 animate-pulse">
                      <ShieldAlert size={40} />
                    </div>
                    <div className="space-y-2 max-w-md">
                      <h3 className="text-xl font-bold uppercase italic tracking-tighter text-txt-primary">Chloe Moderation</h3>
                      <p className="text-txt-secondary leading-relaxed">{moderationError}</p>
                    </div>
                  </motion.div>
                ) : loading ? (
                  <div className="space-y-12 py-10">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-4">
                        <Shimmer className="h-8 w-3/4 rounded-2xl opacity-20" delay={i * 100} />
                        <Shimmer className="h-20 w-full rounded-2xl opacity-10" delay={i * 100 + 50} />
                        <Shimmer className="h-4 w-1/4 rounded-full opacity-5" delay={i * 100 + 100} />
                      </div>
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-12 py-10 pb-40">
                    {results.map((res, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card p-8 border-dark-border/10 hover:border-neon-green/30 transition-all group relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <a href={res.link} target="_blank" rel="noopener noreferrer" className="block space-y-4 relative z-10">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Globe size={18} className="text-neon-cyan" />
                              <h4 className="text-2xl font-black italic tracking-tighter text-txt-primary group-hover:text-neon-green transition-colors">{res.title}</h4>
                            </div>
                            <div className="p-2 bg-txt-primary/5 border border-dark-border/10 rounded-lg group-hover:bg-neon-green group-hover:text-black transition-all">
                              <ArrowRight size={20} className="-rotate-45 text-txt-primary group-hover:text-black" />
                            </div>
                          </div>
                          <p className="text-txt-secondary leading-relaxed text-lg line-clamp-3">{res.snippet}</p>
                          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-txt-muted group-hover:text-neon-green/60 transition-colors">
                            <span className="px-2 py-1 bg-txt-primary/5 rounded border border-dark-border/10">Research Hub</span>
                            <span className="truncate max-w-sm">{res.link}</span>
                          </div>
                        </a>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-40 text-center space-y-6 opacity-20">
                    <Search size={80} className="text-txt-muted" />
                    <p className="text-xs uppercase font-black tracking-[0.5em] text-txt-muted">Chloe Web Sync Ready</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="mt-auto pt-12 border-t border-dark-border/10 flex justify-between items-center text-txt-muted">
            <div className="flex items-center gap-3">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">PlastiNet Intelligence Platform</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-neon-green rounded-full shadow-[0_0_8px_rgba(57,255,20,1)]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Vision Sync Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-neon-cyan rounded-full shadow-[0_0_8px_rgba(0,255,255,1)]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Cloud Layer Active</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearchOverlay;
