import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Zap, Info, CheckCircle2, AlertTriangle, Gift, CreditCard, Heart } from 'lucide-react';
import { useRewardStore } from '../stores/rewardStore';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

type RedemptionType = 'PRODUCT' | 'CASHBACK' | 'DONATION';

const Redeem = () => {
  const navigate = useNavigate();
  const { balance, requestRedemption } = useRewardStore();
  const { profile } = useAuthStore();
  const [amount, setAmount] = useState<number>(50000);
  const [type, setType] = useState<RedemptionType>('CASHBACK');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!profile?.is_verified) {
      toast.error("Account verification required for redemptions.");
      return;
    }

    setLoading(true);
    try {
      const result = await requestRedemption(type, amount);
      if (result.success) {
        setSuccess(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Redemption failed");
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { 
      id: 'CASHBACK', 
      name: 'Cashback', 
      icon: <CreditCard size={24} />, 
      desc: 'Convert PLC to INR in your digital wallet.',
      color: 'text-neon-green',
      bg: 'bg-neon-green/10',
      border: 'border-neon-green/20'
    },
    { 
      id: 'PRODUCT', 
      name: 'Eco Products', 
      icon: <Gift size={24} />, 
      desc: 'Redeem PLC for exclusive eco-friendly merchandise.',
      color: 'text-neon-cyan',
      bg: 'bg-neon-cyan/10',
      border: 'border-neon-cyan/20'
    },
    { 
      id: 'DONATION', 
      name: 'Donation', 
      icon: <Heart size={24} />, 
      desc: 'Convert PLC to donations for environmental causes.',
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20'
    }
  ];

  if (success) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-neon-green/20 rounded-full flex items-center justify-center text-neon-green"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-4xl font-black uppercase tracking-tighter">Request Received</h1>
        <p className="text-white/60 font-medium max-w-md">
          Your redemption request is being processed. Our team will verify the transaction and update your status within 24-48 hours.
        </p>
        <button
          onClick={() => navigate('/wallet')}
          className="px-8 py-4 bg-neon-green text-black font-black uppercase tracking-widest rounded-2xl hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all"
        >
          Back to Wallet
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Wallet</span>
        </button>
        <div className="flex items-center gap-2 bg-neon-cyan/10 text-neon-cyan px-4 py-1.5 rounded-full border border-neon-cyan/20">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Secure Redemption</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="md:col-span-7 space-y-6">
          <div className="glass-card p-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Zap size={24} className="text-neon-green" />
              Redeem PlastiCoins
            </h2>

            <div className="space-y-8">
              {/* Type Selection */}
              <div className="space-y-4">
                <p className="text-xs font-black text-white/40 uppercase tracking-widest">Select Redemption Type</p>
                <div className="grid grid-cols-1 gap-3">
                  {types.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setType(t.id as RedemptionType)}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                        type === t.id 
                          ? `${t.bg} ${t.border} border-opacity-100` 
                          : 'bg-white/5 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className={`${type === t.id ? t.color : 'text-white/40'}`}>
                        {t.icon}
                      </div>
                      <div className="flex-1">
                        <p className={`font-black uppercase tracking-tight ${type === t.id ? 'text-white' : 'text-white/60'}`}>{t.name}</p>
                        <p className="text-[10px] text-white/40 font-bold">{t.desc}</p>
                      </div>
                      {type === t.id && (
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${t.bg} ${t.color}`}>
                          <CheckCircle2 size={14} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-white/40 uppercase tracking-widest">Amount to Redeem</p>
                  <p className="text-xs font-black text-neon-green uppercase tracking-widest">Max: {balance.toLocaleString()}</p>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min={50000}
                    max={balance}
                    step={1000}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-3xl font-black text-white focus:outline-none focus:border-neon-green transition-all"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <img 
                      src="/plasticoin.png" 
                      alt="PLC" 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/7036/7036798.png'; }}
                      className="w-8 h-8 object-contain" 
                    />
                    <span className="text-sm font-black text-white/20 uppercase tracking-widest">PLC</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  {[50000, 100000, 250000, 500000].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        amount === val ? 'bg-neon-green text-black' : 'bg-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {val >= 1000000 ? `${val/1000000}M` : `${val/1000}K`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          {!profile?.is_verified && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex gap-4">
              <AlertTriangle className="text-red-500 shrink-0" size={24} />
              <div>
                <p className="font-black text-white uppercase tracking-tight">Verification Required</p>
                <p className="text-xs text-white/60 font-medium mt-1">
                  Your account is currently unverified. To ensure security and prevent fraud, redemptions are only available to verified users.
                </p>
                <button 
                  onClick={() => navigate('/profile')}
                  className="mt-4 text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline"
                >
                  Complete Verification in Profile →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Preview & Info */}
        <div className="md:col-span-5 space-y-6">
          <div className="glass-card p-8 bg-gradient-to-br from-neon-green/5 to-transparent">
            <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-6">Conversion Summary</h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-white/60 font-bold">PLC Amount</span>
                <span className="font-black">{amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-white/60 font-bold">Internal Rate</span>
                <span className="text-xs font-black text-white/40 uppercase tracking-widest">1000 PLC = ₹1</span>
              </div>
              <div className="pt-4 flex flex-col items-center gap-2">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Value</p>
                <h4 className="text-5xl font-black text-neon-green tracking-tighter">₹{(amount / 1000).toFixed(2)}</h4>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">INR EQUIVALENT</p>
              </div>

              <button
                disabled={loading || amount < 50000 || amount > balance || !profile?.is_verified}
                onClick={handleSubmit}
                className="w-full py-5 bg-neon-green text-black font-black uppercase tracking-[0.2em] rounded-2xl mt-4 disabled:opacity-20 disabled:grayscale transition-all hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Confirm Redemption</>
                )}
              </button>
              
              {amount < 50000 && (
                <p className="text-[10px] text-red-400 font-bold text-center uppercase tracking-widest flex items-center justify-center gap-1">
                  <Info size={12} />
                  Min. Threshold: 50,000 PLC
                </p>
              )}
            </div>
          </div>

          <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
              <Info size={14} className="text-neon-cyan" />
              Redemption Rules
            </h4>
            <ul className="space-y-3">
              {[
                "All requests are manually verified by admins.",
                "Process takes 24-48 hours.",
                "One request per 24 hours allowed.",
                "Suspicious activity leads to account freeze."
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-2 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  <div className="w-1 h-1 rounded-full bg-neon-cyan mt-1.5 shrink-0" />
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Redeem;
