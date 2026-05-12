import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles, ArrowRight, ExternalLink, Loader2, Globe } from 'lucide-react';
import { searchService, SearchResult } from '../../services/search';
import { Shimmer } from './Shimmer';
import { useSearchParams } from 'react-router-dom';

const ChloeSearch = () => {
  const [searchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setIsOpen(true);
    try {
      const data = await searchService.searchEnvironmentalInfo(searchQuery);
      setResults(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full max-w-xl" ref={containerRef}>
      <form onSubmit={handleSearch} className="relative group z-[110]">
        <div className="absolute inset-0 bg-neon-green/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
        <div className="relative flex items-center bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden focus-within:border-neon-green/50 transition-all shadow-2xl">
          <Search className="ml-5 text-neon-green/60" size={20} />
          <input 
            type="text"
            placeholder="Ask Chloe: 'How to recycle PVC?' or 'Eco laws in India'..."
            value={query}

            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
            className="w-full bg-transparent py-5 px-4 text-sm text-white font-medium focus:outline-none placeholder:text-white/30"
          />
          {loading ? (
            <Loader2 className="mr-5 animate-spin text-neon-green" size={20} />
          ) : (
            <button type="submit" className="mr-3 p-3 bg-neon-green/10 hover:bg-neon-green/20 rounded-xl transition-colors group/btn">
              <ArrowRight className="text-neon-green group-hover/btn:translate-x-1 transition-transform" size={20} />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Overlay Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="absolute top-full left-0 right-0 mt-4 z-[100] glass-card p-8 border-neon-green/20 bg-black/90 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-[60vh] overflow-y-auto custom-scrollbar"
            >

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-neon-green" size={18} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Intelligence Sync</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Shimmer className="h-4 w-3/4 rounded-full" delay={i * 100} />
                    <Shimmer className="h-3 w-1/2 rounded-full" delay={i * 100 + 50} />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-8">
                {results.map((res, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group"
                  >
                    <a href={res.link} target="_blank" rel="noopener noreferrer" className="block space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe size={14} className="text-neon-cyan" />
                        <h4 className="font-bold text-white group-hover:text-neon-green transition-colors line-clamp-1">{res.title}</h4>
                      </div>
                      <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{res.snippet}</p>
                      <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-tighter text-white/20 group-hover:text-neon-green/60 transition-colors">
                        <span>Research Hub</span>
                        <ArrowRight size={10} />
                        <span className="truncate max-w-[200px]">{res.link}</span>
                      </div>
                    </a>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-white/20">
                  <Search size={24} />
                </div>
                <p className="text-xs text-white/40 uppercase font-black tracking-widest">No results found in repository</p>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/10">
                Powered by Chloe AI Web Intelligence
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>


    </div>
  );
};

export default ChloeSearch;
