import React from 'react';
import { Crown, Sparkles, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumBadgeProps {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | undefined;
  showText?: boolean;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ tier, showText = true }) => {
  if (!tier || tier === 'BRONZE') return null;

  const config = {
    SILVER: {
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      glow: 'shadow-[0_0_15px_rgba(0,255,255,0.3)]',
      icon: <Sparkles size={14} />,
      label: 'Silver Member'
    },
    GOLD: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      glow: 'shadow-[0_0_20px_rgba(255,215,0,0.4)]',
      icon: <Crown size={14} />,
      label: 'Gold Elite'
    }
  };

  const current = config[tier as keyof typeof config];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${current.bg} ${current.border} ${current.color} ${current.glow} font-black uppercase tracking-widest text-[10px]`}
    >
      {current.icon}
      {showText && current.label}
    </motion.div>
  );
};

export default PremiumBadge;
