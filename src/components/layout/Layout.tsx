import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Globe } from 'lucide-react';

const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* OS Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: Math.random() * 0.3
            }}
            animate={{ 
              y: [null, Math.random() * -100],
              opacity: [null, 0.5, 0.2]
            }}
            transition={{ 
              duration: 10 + Math.random() * 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute w-1 h-1 bg-neon-green rounded-full blur-[1px]"
          />
        ))}

        {/* Global Atmospheric Blobs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-neon-green/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-cyan/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-20 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "circOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>


    </div>
  );
};

export default Layout;
