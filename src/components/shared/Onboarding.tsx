import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Leaf, Shield, Users, TrendingUp, ArrowRight, Zap, Globe, Brain, CheckCircle2 } from 'lucide-react';

interface SlideProps {
  onNext: () => void;
  onSkip: () => void;
  isLast?: boolean;
}

const ParticleBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-neon-green/20 rounded-full"
        initial={{ 
          x: Math.random() * window.innerWidth, 
          y: Math.random() * window.innerHeight 
        }}
        animate={{
          y: [null, Math.random() * -100],
          opacity: [0, 0.5, 0],
          scale: [0, 1.5, 0]
        }}
        transition={{
          duration: Math.random() * 5 + 5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    ))}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(57,255,20,0.05),transparent_70%)]" />
  </div>
);

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'welcome',
      title: "Welcome to PlastiNet",
      subtitle: "An AI-powered environmental participation platform.",
      icon: <Globe className="text-neon-cyan" size={48} />,
      bg: "bg-[#0a0a0a]",
      content: (
        <div className="relative flex items-center justify-center h-64">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute w-48 h-48 border border-neon-green/10 rounded-full"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute w-40 h-40 border border-neon-cyan/10 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-32 h-32 bg-neon-green/10 rounded-full blur-2xl"
          />
          <Globe className="text-neon-green relative z-10 animate-pulse" size={64} />
        </div>
      )
    },
    {
      id: 'chloe',
      title: "Meet Chloe AI",
      subtitle: "Analyze plastic, generate reuse ideas, and track environmental impact.",
      icon: <Brain className="text-neon-green" size={48} />,
      bg: "bg-[#0c0c0c]",
      content: (
        <div className="space-y-4 w-full max-w-xs">
          {[
            { label: "Scanning Material...", delay: 0 },
            { label: "Detecting Plastic Type...", delay: 1 },
            { label: "Estimating Impact...", delay: 2 },
            { label: "Generating Reuse Blueprint...", delay: 3 }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: item.delay }}
              className="flex items-center gap-3 p-3 glass-card bg-white/5 border-white/10"
            >
              <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/60">{item.label}</span>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: item.delay + 0.2 }}
                className="ml-auto h-1 w-12 bg-neon-green/20 rounded-full overflow-hidden"
              >
                <div className="h-full bg-neon-green w-3/4" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'impact',
      title: "Turn Action Into Impact",
      subtitle: "Upload transformations and earn verified environmental rewards.",
      icon: <Zap className="text-yellow-400" size={48} />,
      bg: "bg-[#080a08]",
      content: (
        <div className="relative w-64 h-48 glass-card overflow-hidden border-white/10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=800')] bg-cover opacity-50" />
          <motion.div 
            initial={{ x: "0%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-y-0 left-0 w-1 bg-neon-green shadow-[0_0_15px_rgba(57,255,20,0.8)] z-10"
          />
          <div className="absolute top-4 right-4 bg-neon-green text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
            Verified +25 PLC
          </div>
          <div className="absolute bottom-4 left-4">
            <p className="text-[10px] font-bold uppercase text-white/60">Impact Score</p>
            <p className="text-xl font-black text-neon-green">8.4/10</p>
          </div>
        </div>
      )
    },
    {
      id: 'community',
      title: "Communities Compete",
      subtitle: "Join sectors, complete missions, and climb leaderboards.",
      icon: <Users className="text-neon-cyan" size={48} />,
      bg: "bg-[#0a0d0a]",
      content: (
        <div className="space-y-3 w-64">
          {[
            { name: "Sector 7G", score: "12.4k", color: "bg-neon-green" },
            { name: "Neon District", score: "10.1k", color: "bg-white/20" },
            { name: "Eco Squad X", score: "9.8k", color: "bg-white/10" }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
              className="flex items-center justify-between p-3 glass-card bg-white/5 border-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-white/20">0{i+1}</span>
                <span className="text-sm font-bold">{item.name}</span>
              </div>
              <span className={`text-xs font-black ${i === 0 ? 'text-neon-green' : 'text-white/40'}`}>{item.score}</span>
            </motion.div>
          ))}
        </div>
      )
    },
    {
      id: 'measurable',
      title: "Every Upload Matters",
      subtitle: "Track measurable impact powered by AI and community action.",
      icon: <TrendingUp className="text-neon-green" size={48} />,
      bg: "bg-[#0a0a0a]",
      content: (
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            <svg className="w-32 h-32 -rotate-90">
              <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <motion.circle 
                cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray="377"
                initial={{ strokeDashoffset: 377 }}
                animate={{ strokeDashoffset: 377 * 0.15 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="text-neon-green"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black">85%</span>
              <span className="text-[8px] uppercase tracking-widest text-white/40">Target</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="text-center">
              <p className="text-[10px] uppercase text-white/40">Plastic Saved</p>
              <p className="text-lg font-black text-neon-cyan">420kg</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase text-white/40">CO2 Reduced</p>
              <p className="text-lg font-black text-neon-green">1.2t</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const next = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className={`fixed inset-0 z-[9999] ${slides[currentSlide].bg} transition-colors duration-1000 flex flex-col items-center justify-center p-8 overflow-hidden font-['Plus_Jakarta_Sans']`}>
      <ParticleBackground />
      
      {/* Top Controls */}
      <div className="absolute top-12 left-8 right-8 flex justify-between items-center z-10">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-neon-green/20 rounded-lg flex items-center justify-center border border-neon-green/30">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-black tracking-tighter text-sm uppercase">PlastiNet</span>
        </motion.div>
        <button 
          onClick={onComplete}
          className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-md flex-1 flex flex-col items-center justify-center text-center space-y-12 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={slides[currentSlide].id}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 1.1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex flex-col items-center space-y-12"
          >
            <div className="p-8 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-3xl relative group">
              <div className="absolute inset-0 bg-neon-green/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              {slides[currentSlide].content}
            </div>

            <div className="space-y-4">
              <motion.h1 
                className="text-4xl md:text-5xl font-black tracking-tighter leading-tight"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.2 }}
              >
                {slides[currentSlide].title}
              </motion.h1>
              <motion.p 
                className="text-white/60 text-lg font-medium leading-relaxed max-w-[280px] mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {slides[currentSlide].subtitle}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md pb-12 flex flex-col items-center gap-10 z-10">
        {/* Pagination Dots */}
        <div className="flex gap-2.5">
          {slides.map((_, i) => (
            <motion.div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentSlide ? 'w-8 bg-neon-green shadow-[0_0_10px_rgba(57,255,20,0.5)]' : 'w-1.5 bg-white/10'
              }`}
            />
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={next}
          className="w-full h-16 bg-neon-green text-black rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest shadow-[0_10px_40px_rgba(57,255,20,0.2)] group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
          <span className="relative z-10">
            {currentSlide === slides.length - 1 ? 'Get Started' : 'Continue'}
          </span>
          <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" size={20} />
        </motion.button>
      </div>

      {/* Atmospheric Effects */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-neon-green/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-neon-cyan/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
    </div>
  );
};

export default Onboarding;
