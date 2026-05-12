import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, Shield, ArrowRight, Star, Globe, TrendingUp } from 'lucide-react';
import { useSubscriptionStore, SubscriptionTier } from '../stores/subscriptionStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import PaymentSuccess from '../components/ui/PaymentSuccess';

const Premium = () => {
  const { user, profile } = useAuthStore();
  const { subscription, upgradePlan } = useSubscriptionStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState<SubscriptionTier | null>(null);

  const plans = [
    {
      id: 'BRONZE',
      name: 'Bronze',
      price: '₹0',
      period: 'Forever Free',
      description: 'The foundation for your environmental journey.',
      icon: <Globe className="text-green-400" size={24} />,
      features: [
        'Unlimited Events Access',
        'Chloe AI Basic Access',
        'Plastic Verification Uploads',
        'Standard Mission Participation',
        'Community Access',
        'Leaderboard Access',
      ],
      glow: 'shadow-[0_0_30px_rgba(57,255,20,0.1)]',
      border: 'border-white/10',
      button: 'Standard Access'
    },
    {
      id: 'SILVER',
      name: 'Silver',
      price: '₹129',
      period: 'per month',
      description: 'Accelerate your impact with enhanced intelligence.',
      icon: <Sparkles className="text-cyan-400" size={24} />,
      recommended: true,
      features: [
        'Everything in Bronze',
        'Faster Chloe AI Responses',
        'Enhanced Environmental Analytics',
        'Premium Exclusive Missions',
        'Advanced Profile Customization',
        'Bonus PlastiCoin (PLC) Multipliers',
        'Priority Leaderboard Visibility',
      ],
      glow: 'shadow-[0_0_40px_rgba(0,255,255,0.2)]',
      border: 'border-cyan-500/30',
      button: 'Upgrade to Silver'
    },
    {
      id: 'GOLD',
      name: 'Gold',
      price: '₹249',
      period: 'per month',
      description: 'The ultimate ecological membership for pioneers.',
      icon: <Crown className="text-yellow-400" size={24} />,
      features: [
        'Everything in Silver',
        'Highest AI Priority Access',
        'Advanced Impact Insights',
        'Exclusive Gold AI Modes',
        'Special Sector Competitions',
        'Maximum PLC Reward Multipliers',
        'Premium Identity Effects & Glow',
        'Elite Membership Support',
      ],
      glow: 'shadow-[0_0_50px_rgba(255,215,0,0.2)]',
      border: 'border-yellow-500/40',
      button: 'Activate Gold'
    }
  ];

  const handleSubscription = async (plan: any) => {
    if (plan.id === 'BRONZE') return;
    if (subscription?.plan === plan.id) {
      toast.error('You are already on this plan');
      return;
    }

    setLoading(plan.id);

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YourKeyHere',
      amount: parseInt(plan.price.replace('₹', '')) * 100,
      currency: "INR",
      name: "PlastiNet Premium",
      description: `${plan.name} Membership`,
      image: "/logo.png",
      handler: async function (response: any) {
        try {
          await upgradePlan(plan.id as SubscriptionTier, response.razorpay_payment_id);
          setShowSuccess(plan.id as SubscriptionTier);
          toast.success(`${plan.name} Membership Activated!`, {
            duration: 5000,
            icon: '🔥'
          });
        } catch (error) {
          toast.error("Activation failed. Please contact support.");
        } finally {
          setLoading(null);
        }
      },
      prefill: {
        name: profile?.display_name || user?.email?.split('@')[0],
        email: user?.email,
      },
      theme: {
        color: plan.id === 'GOLD' ? "#EAB308" : "#06B6D4",
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      toast.error(response.error.description);
      setLoading(null);
    });
    rzp.open();
  };

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      <AnimatePresence>
        {showSuccess && (
          <PaymentSuccess 
            tier={showSuccess as 'SILVER' | 'GOLD'} 
            onClose={() => setShowSuccess(null)} 
          />
        )}
      </AnimatePresence>

      {/* Futuristic Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-neon-green text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Shield size={14} />
            Ecological Evolution
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
          >
            Unlock <span className="intelligence-gradient">Advanced</span> Intelligence
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto font-medium"
          >
            Join the elite circle of environmental guardians. Choose your evolutionary path and gain access to premium AI capabilities and maximum rewards.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ y: -12 }}
              className={`relative glass-card p-8 flex flex-col h-full ${plan.border} ${plan.glow} ${subscription?.plan === plan.id ? 'border-neon-green/50' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    {plan.icon}
                  </div>
                  {subscription?.plan === plan.id && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-neon-green flex items-center gap-1">
                      <Check size={12} /> Current Plan
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className="text-white/40 text-xs font-bold uppercase tracking-widest">{plan.period}</span>
                </div>
                <p className="text-white/50 text-sm mt-4 font-medium leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-3 group">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-neon-green/30 transition-colors">
                      <Check className="text-neon-green" size={10} />
                    </div>
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSubscription(plan)}
                disabled={loading !== null || subscription?.plan === plan.id || plan.id === 'BRONZE'}
                className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all duration-300 flex items-center justify-center gap-2 group ${
                  subscription?.plan === plan.id 
                    ? 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'
                    : plan.id === 'BRONZE'
                    ? 'bg-white/10 text-white/60 cursor-default'
                    : plan.id === 'GOLD'
                    ? 'bg-yellow-500 text-black shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-neon-green text-black shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading === plan.id ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    {plan.button}
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Feature Comparison Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 glass-card p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/5 blur-[100px] rounded-full" />
          
          <h2 className="text-3xl font-black mb-12 text-center uppercase tracking-tighter">System Capability Comparison</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Zap className="text-green-400" size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-xs mb-1">AI Processing</h4>
                  <p className="text-white/40 text-[10px] font-bold">Latency & Priority</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold px-2"><span className="text-white/60">Standard</span><span className="text-green-400">Bronze</span></div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-green-500" />
                </div>
                <div className="flex justify-between text-xs font-bold px-2 pt-2"><span className="text-white/60">Turbo</span><span className="text-cyan-400">Silver</span></div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-2/3 h-full bg-cyan-500" />
                </div>
                <div className="flex justify-between text-xs font-bold px-2 pt-2"><span className="text-white/60">Real-time</span><span className="text-yellow-400">Gold</span></div>
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-xl">
                  <Star className="text-cyan-400" size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-xs mb-1">PLC Rewards</h4>
                  <span className="text-white/40 text-[10px] font-bold">Multiplier Levels</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-white/40 text-[10px] font-black mb-1 uppercase">Bronze</p>
                  <p className="text-xl font-black">1.0x</p>
                </div>
                <div className="text-center p-4 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                  <p className="text-cyan-400 text-[10px] font-black mb-1 uppercase">Silver</p>
                  <p className="text-xl font-black">1.5x</p>
                </div>
                <div className="text-center p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                  <p className="text-yellow-400 text-[10px] font-black mb-1 uppercase">Gold</p>
                  <p className="text-xl font-black">2.5x</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <TrendingUp className="text-purple-400" size={24} />
                </div>
                <div>
                  <h4 className="font-black uppercase tracking-widest text-xs mb-1">Deep Insights</h4>
                  <span className="text-white/40 text-[10px] font-bold">Analytics Fidelity</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Check className="text-green-500" size={16} />
                  <span className="text-xs font-bold text-white/60">Basic Impact History</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="text-cyan-500" size={16} />
                  <span className="text-xs font-bold text-white/80">Regional Comparison</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="text-yellow-500" size={16} />
                  <span className="text-xs font-bold text-white">Full Prediction Engine</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust & Security Badge */}
        <div className="mt-20 flex flex-col items-center gap-6">
          <div className="flex items-center gap-8 opacity-40">
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default">
               <Shield size={20} />
               <span className="text-sm font-black uppercase tracking-widest">Secure Payments</span>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all cursor-default">
               <Zap size={20} />
               <span className="text-sm font-black uppercase tracking-widest">Instant Activation</span>
            </div>
          </div>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest text-center max-w-lg leading-loose">
            Payments are processed securely via Razorpay. Subscriptions can be cancelled at any time from your profile. Premium features are activated immediately upon successful transaction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Premium;
