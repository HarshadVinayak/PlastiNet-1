import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Crown, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SubscriptionLockProps {
  requiredTier: 'SILVER' | 'GOLD';
  children: React.ReactNode;
  isLocked: boolean;
  message?: string;
}

const SubscriptionLock: React.FC<SubscriptionLockProps> = ({ requiredTier, children, isLocked, message }) => {
  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative group">
      <div className="filter blur-[8px] pointer-events-none transition-all duration-500">
        {children}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 border-white/10 shadow-2xl max-w-[280px] text-center"
        >
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
            requiredTier === 'GOLD' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-cyan-500/20 text-cyan-500'
          }`}>
            <Crown size={24} />
          </div>
          
          <h4 className="text-sm font-black uppercase tracking-widest mb-2">Premium Feature</h4>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6 leading-relaxed">
            {message || `This capability requires a ${requiredTier} environmental membership.`}
          </p>
          
          <Link 
            to="/premium"
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              requiredTier === 'GOLD' 
                ? 'bg-yellow-500 text-black hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                : 'bg-cyan-500 text-black hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            }`}
          >
            Unlock Now
            <ArrowRight size={12} />
          </Link>
        </motion.div>
      </div>
      
      <div className="absolute inset-0 bg-black/20 rounded-3xl z-10" />
    </div>
  );
};

export default SubscriptionLock;
