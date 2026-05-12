import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, Trophy, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  end_time: string;
  reward_multiplier: number;
}

const EventTimer = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [timeLeft, setTimeLeft] = useState<{h: number, m: number, s: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveEvent = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gt('end_time', new Date().toISOString())
        .order('end_time', { ascending: true })
        .limit(1)
        .single();

      if (data) {
        setEvent(data);
      }
      setLoading(false);
    };

    fetchActiveEvent();
  }, []);

  useEffect(() => {
    if (!event) return;

    const timer = setInterval(() => {
      const end = new Date(event.end_time).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setEvent(null);
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        h: Math.floor((diff / (1000 * 60 * 60))),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [event]);

  if (loading) return (
    <div className="w-full h-16 bg-white/5 animate-pulse rounded-2xl border border-white/5" />
  );

  return (
    <AnimatePresence>
      {event && timeLeft && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative group cursor-pointer"
        >
          <Link to="/competitions">
            <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-neon-cyan/20 overflow-hidden">
              {/* Glow Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/10 via-transparent to-neon-green/10 opacity-50" />
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center border border-neon-cyan/30">
                  <Zap className="w-5 h-5 text-neon-cyan animate-pulse" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-cyan mb-0.5">Live Event</h4>
                  <p className="text-sm font-black text-txt-primary uppercase italic tracking-tighter line-clamp-1">
                    {event.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-mono font-black text-txt-primary">{timeLeft.h.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] font-black uppercase text-txt-muted">Hrs</span>
                  </div>
                  <span className="text-xl font-black text-txt-muted/30 -mt-4">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-mono font-black text-txt-primary">{timeLeft.m.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] font-black uppercase text-txt-muted">Min</span>
                  </div>
                  <span className="text-xl font-black text-txt-muted/30 -mt-4">:</span>
                  <div className="flex flex-col items-center">
                    <span className="text-xl font-mono font-black text-neon-green">{timeLeft.s.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] font-black uppercase text-txt-muted">Sec</span>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-3 pl-8 border-l border-white/10">
                  <Trophy className="text-neon-green" size={18} />
                  <div>
                    <p className="text-[8px] font-black uppercase text-txt-muted">Multiplier</p>
                    <p className="text-sm font-black italic text-neon-green">{event.reward_multiplier}x PLC</p>
                  </div>
                </div>

                <ChevronRight size={18} className="text-txt-muted group-hover:text-txt-primary group-hover:translate-x-1 transition-all" />
              </div>

              {/* Progress Line */}
              <div className="absolute bottom-0 left-0 h-0.5 bg-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.5)] animate-shimmer" style={{ width: '100%' }} />
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventTimer;
