import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Camera, ShoppingBag, Users, User, Leaf, Trophy, BarChart3,
  Map as MapIcon, PieChart, PlayCircle, Sparkles, History, Search, Wallet as WalletIcon,
  Menu
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRewardStore } from '../../stores/rewardStore';
import { useUIStore } from '../../stores/uiStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import PremiumBadge from '../ui/PremiumBadge';

const Navbar = () => {
  const location = useLocation();
  const balance = useRewardStore(state => state.balance);
  const toggleChloe = useUIStore(state => state.toggleChloe);
  const toggleSearch = useUIStore(state => state.toggleSearch);
  const toggleMenu = useUIStore(state => state.toggleMenu);

  const subscription = useSubscriptionStore(state => state.subscription);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/upload', icon: Camera, label: 'Scan' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/marketplace', icon: ShoppingBag, label: 'Store' },
    { path: '/wallet', icon: WalletIcon, label: 'Wallet' },
    { path: '/community', icon: Users, label: 'Social' },
    { path: '/map', icon: MapIcon, label: 'Maps' },
    { path: '/competitions', icon: Trophy, label: 'Versus' },
    { path: '/ambiente', icon: PlayCircle, label: 'Ambiente' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass-card border-b border-dark-border/10 px-3 md:px-4 xl:px-8 py-2 md:py-3">
      <div className="max-w-[1800px] mx-auto flex justify-between items-center gap-2">
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 md:w-16 md:h-16 bg-txt-primary/5 rounded-lg md:rounded-2xl flex items-center justify-center border border-dark-border/10 group-hover:border-neon-green/30 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-neon-green/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src="/logo.png" alt="PlastiNet Logo" className="w-7 h-7 md:w-12 md:h-12 object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="-ml-1">
            <span className="text-lg md:text-2xl font-black tracking-tighter block leading-tight text-txt-primary">PlastiNet</span>
            <span className="text-[7px] md:text-[10px] text-neon-green font-bold uppercase tracking-[0.2em] opacity-80 hidden xs:block">Environmental AI</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 flex-1 justify-center">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'px-1.5 xl:px-3 py-1.5 rounded-xl flex flex-col items-center justify-center transition-all hover:bg-txt-primary/5 min-w-[60px] xl:min-w-[80px]',
                location.pathname === item.path ? 'text-neon-green bg-neon-green/5' : 'text-txt-muted hover:text-txt-primary'
              )}
            >
              <item.icon size={18} className="transition-transform group-hover:scale-110" />
              <span className="text-[9px] xl:text-[10px] font-bold uppercase tracking-tight mt-1">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
          <button
            onClick={toggleMenu}
            className="lg:hidden p-2 bg-white/5 border border-white/10 text-txt-primary rounded-lg transition-all active:scale-95"
          >
            <Menu size={18} />
          </button>

          <div className="hidden xs:block">
            <PremiumBadge tier={subscription?.plan} showText={false} />
          </div>

          <button
            onClick={toggleSearch}
            className="p-2 md:p-2.5 bg-txt-primary/5 border border-dark-border/10 text-txt-primary hover:text-neon-green rounded-lg md:rounded-xl transition-all group relative active:scale-95"
          >
            <Search size={18} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={toggleChloe}
            className="p-2 md:p-2.5 bg-neon-green text-black rounded-lg md:rounded-xl hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all group relative active:scale-95"
          >
            <Sparkles size={18} className="md:w-5 md:h-5 group-hover:rotate-12 transition-transform" />
          </button>

          <Link to="/wallet" className="bg-txt-primary/5 rounded-xl md:rounded-2xl px-2 md:px-4 py-1.5 md:py-2 border border-dark-border/10 flex items-center gap-1.5 md:gap-3 hover:bg-txt-primary/10 transition-colors cursor-pointer group/balance max-w-[80px] xs:max-w-none">
            <img src="/plasticoin.png" alt="PLC" className="w-4 h-4 md:w-6 md:h-6 object-contain animate-pulse-slow group-hover/balance:scale-110 transition-transform" />
            <div className="flex flex-col">
              <span className="text-[8px] xl:text-[10px] font-black text-txt-muted uppercase tracking-widest leading-none mb-1 hidden xl:block"></span>
              <span className="text-[11px] md:text-sm font-black text-txt-primary leading-none truncate">{balance.toLocaleString()}</span>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
