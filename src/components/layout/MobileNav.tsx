import { Link, useLocation } from 'react-router-dom';
import { Home, Camera, Users, Map as MapIcon, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useUIStore } from '../../stores/uiStore';

const MobileNav = () => {
  const location = useLocation();
  const isChloeOpen = useUIStore(state => state.isChloeOpen);

  if (isChloeOpen) return null;

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/upload', icon: Camera, label: 'Scan' },
    { path: '/map', icon: MapIcon, label: 'Maps' },
    { path: '/community', icon: Users, label: 'Social' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden px-4 pb-4">
      <div className="glass-card border border-white/10 rounded-3xl flex items-center justify-around py-3 px-2 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={clsx(
              'flex flex-col items-center justify-center transition-all p-2 rounded-2xl min-w-[64px]',
              location.pathname === item.path 
                ? 'text-neon-green bg-neon-green/10' 
                : 'text-txt-muted'
            )}
          >
            <item.icon size={22} className={clsx(
              'transition-transform',
              location.pathname === item.path && 'scale-110'
            )} />
            <span className="text-[10px] font-bold uppercase tracking-tight mt-1">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;
