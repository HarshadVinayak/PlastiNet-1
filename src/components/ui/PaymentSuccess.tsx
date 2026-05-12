import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Crown, Sparkles, Shield, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentSuccessProps {
  tier: 'SILVER' | 'GOLD';
  onClose: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ tier, onClose }) => {
  useEffect(() => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: tier === 'GOLD' ? ['#EAB308', '#FFFFFF', '#39FF14'] : ['#06B6D4', '#FFFFFF', '#39FF14']
    });
  }, [tier]);

  const config = {
    SILVER: {
      title: 'Silver Membership Activated',
      icon: <Sparkles size={48} className="text-cyan-400" />,
      glow: 'shadow-[0_0_50px_rgba(6,182,212,0.5)]',
      gradient: 'from-cyan-500/20 to-transparent'
    },
    GOLD: {
      title: 'Gold Environmental Access Activated',
      icon: <Crown size={48} className="text-yellow-400" />,
      glow: 'shadow-[0_0_60px_rgba(234,179,8,0.5)]',
      gradient: 'from-yellow-500/20 to-transparent'
    }
  };

  const current = config[tier];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`relative glass-card max-w-md w-full p-12 text-center border-white/10 ${current.glow}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-b ${current.gradient} pointer-events-none`} />
        
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ type: "spring", damping: 12 }}
          className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 relative z-10"
        >
          {current.icon}
        </motion.div>

        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter relative z-10">{current.title}</h2>
        <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-10 leading-relaxed relative z-10">
          Your environmental capabilities have been upgraded. Intelligence OS systems are now operating at {tier === 'GOLD' ? 'Maximum' : 'Priority'} capacity.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-12 relative z-10">
          {[
            { label: 'AI Sync', icon: Zap },
            { label: 'Security', icon: Shield },
            { label: 'Network', icon: Check }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="p-4 bg-white/5 rounded-2xl border border-white/5 flex flex-col items-center gap-2"
            >
              <item.icon size={16} className="text-neon-green" />
              <span className="text-[8px] font-black uppercase tracking-widest opacity-60">{item.label}</span>
            </motion.div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-neon-green text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10"
        >
          Continue Mission
        </button>
      </motion.div>
    </motion.div>
  );
};

export default PaymentSuccess;
