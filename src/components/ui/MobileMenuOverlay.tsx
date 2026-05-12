import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Camera, ShoppingBag, Users, User, Trophy, PlayCircle, 
  Map as MapIcon, History, Wallet as WalletIcon, X, LogOut, Settings
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';

const MobileMenuOverlay = () => {
  const { isMenuOpen, toggleMenu } = useUIStore();
  const { signOut } = useAuthStore();
  const location = useLocation();

  const menuItems = [
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
    <AnimatePresence>
      {isMenuOpen && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMenu}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute right-0 top-0 bottom-0 w-[80%] max-w-sm bg-dark-deep border-l border-white/10 p-6 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-green/20 rounded-xl flex items-center justify-center">
                  <img src="/logo.png" className="w-6 h-6 object-contain" alt="" />
                </div>
                <span className="font-black text-xl text-txt-primary">PlastiNet</span>
              </div>
              <button 
                onClick={toggleMenu}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-txt-muted"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-1 gap-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={toggleMenu}
                    className={clsx(
                      "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all border",
                      location.pathname === item.path
                        ? "bg-neon-green/10 border-neon-green/30 text-neon-green"
                        : "bg-white/5 border-transparent text-txt-muted hover:text-txt-primary hover:bg-white/10"
                    )}
                  >
                    <item.icon size={20} />
                    <span className="font-bold uppercase tracking-wider text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6 gap-3 flex flex-col">
              <button 
                onClick={() => { signOut(); toggleMenu(); }}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold uppercase tracking-wider text-sm"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenuOverlay;
