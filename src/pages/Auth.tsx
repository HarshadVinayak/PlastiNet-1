import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Chrome, ArrowRight, UserPlus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        toast.success('Welcome back to PlastiNet!');
      } else {
        await signUpWithEmail(email, password);
        toast.success("Account created! Let's set up your profile.");
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Google Auth failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-green/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-cyan/10 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card p-10 border border-dark-border/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green via-neon-cyan to-neon-green" />
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-txt-primary/5 rounded-2xl flex items-center justify-center border border-dark-border/10 mx-auto mb-6 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
              <img src="/logo.png" alt="PlastiNet" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic mb-2 text-txt-primary">
              {isLogin ? 'Welcome Back' : 'Join PlastiNet'}
            </h1>
            <p className="text-txt-muted text-sm">
              {isLogin ? 'Enter your credentials to access your eco-dashboard.' : 'Create an account to start your impact journey.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-txt-muted group-focus-within:text-neon-green transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-txt-primary/5 border border-dark-border/10 rounded-xl py-3 pl-12 pr-4 text-txt-primary placeholder:text-txt-muted/30 focus:outline-none focus:border-neon-green/50 transition-all"
                  placeholder="Email Address"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-txt-muted group-focus-within:text-neon-green transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-txt-primary/5 border border-dark-border/10 rounded-xl py-3 pl-12 pr-4 text-txt-primary placeholder:text-txt-muted/30 focus:outline-none focus:border-neon-green/50 transition-all"
                  placeholder="Password"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-neon-green text-black rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : isLogin ? (
                <><LogIn size={18} /> Sign In</>
              ) : (
                <><UserPlus size={18} /> Create Account</>
              )}
            </motion.button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-dark-border/10" />
            <span className="text-xs font-bold text-txt-muted uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-dark-border/10" />
          </div>

          <button
            onClick={handleGoogleAuth}
            className="w-full mt-8 py-3 bg-txt-primary/5 border border-dark-border/10 hover:bg-txt-primary/10 rounded-xl flex items-center justify-center gap-3 transition-colors"
          >
            <Chrome className="text-txt-primary" size={20} />
            <span className="font-bold text-txt-primary">Google</span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-txt-muted text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-neon-green font-bold hover:underline"
            >
              {isLogin ? 'Create Account' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
