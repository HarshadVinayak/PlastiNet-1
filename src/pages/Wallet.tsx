import { motion } from 'framer-motion';
import { Coins, RefreshCw, ArrowUpRight, Wallet as WalletIcon, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { useRewardStore } from '../stores/rewardStore';
import toast from 'react-hot-toast';

const Wallet = () => {
  const { balance, spend } = useRewardStore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto space-y-12 pb-20"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-txt-primary uppercase italic tracking-tighter">World <span className="text-neon-cyan">Wallet</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-txt-muted">Global Environmental Finance & Wealth Redistribution</p>
        </div>
        <div className="flex items-center gap-3 glass-card px-6 py-3 border-neon-cyan/20 bg-neon-cyan/5">
          <ShieldCheck className="text-neon-cyan" size={18} />
          <span className="text-xs font-black uppercase tracking-widest text-txt-primary">Global Impact Node</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-2 glass-card p-10 bg-eco-gradient relative overflow-hidden border-dark-border/10">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 mb-4">Total PlastiNet Credits</p>
            <div className="flex items-center gap-6 mb-8">
              <h2 className="text-7xl font-black text-white italic tracking-tighter">
                {balance.toLocaleString()}
              </h2>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-neon-green italic">PLC</span>
                <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Global Credits</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[8px] font-black uppercase text-white/40 mb-1">Estimated Value (USD)</p>
                <p className="text-xl font-black text-white italic">${(balance / 100).toFixed(2)}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[8px] font-black uppercase text-white/40 mb-1">Impact Tier</p>
                <p className="text-xl font-black text-neon-cyan italic">GLOBAL ELITE</p>
              </div>
              <div className="hidden md:block p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                <p className="text-[8px] font-black uppercase text-white/40 mb-1">World Rank</p>
                <p className="text-xl font-black text-neon-green italic">#2,104</p>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 p-12 opacity-10 text-white">
            <WalletIcon size={250} />
          </div>
        </div>

        {/* Global Withdrawal Panel */}
        <div className="glass-card p-8 border-neon-cyan/20 bg-neon-cyan/5 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-txt-primary uppercase italic tracking-tighter">
              <Zap className="text-neon-cyan" size={24} /> Redemptions
            </h3>
            <div className="space-y-6">
              <div className="p-4 bg-black/20 rounded-xl border border-dark-border/10">
                <div className="flex justify-between text-xs mb-3">
                  <span className="text-txt-muted uppercase font-bold tracking-widest">Market Rate</span>
                  <span className="text-txt-primary font-bold">100 PLC = $1.00</span>
                </div>
                <div className="h-px bg-dark-border/10 mb-3" />
                <p className="text-[10px] text-txt-muted leading-relaxed">
                  Funds are disbursed globally via PayPal, Stripe, or International Wire Transfer.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <button 
              onClick={() => {
                if (balance >= 500) {
                  spend(balance, "International Withdrawal (PayPal/Bank)");
                  toast.success("Request sent to Global Finance Hub!");
                } else {
                  toast.error("Minimum 500 PLC required for world withdrawal.");
                }
              }}
              className="w-full py-4 bg-neon-cyan text-black rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:scale-105 transition-transform"
            >
              Withdraw to Global Hub
            </button>
            <p className="text-[9px] text-center text-txt-muted uppercase tracking-tighter">Verified by PlastiNet International</p>
          </div>
        </div>
      </div>

      <section className="space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-txt-primary uppercase italic tracking-tighter">Impact <span className="text-neon-green">Donations</span></h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-txt-muted">Distribute wealth to verified international environmental & social leaders</p>
          </div>
          <div className="px-6 py-2 bg-neon-green/10 border border-neon-green/20 rounded-full text-neon-green text-[10px] font-black uppercase tracking-[0.2em]">
            Verified Distribution Portals
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Global NGOs */}
          <div className="glass-card p-8 border-dark-border/10 space-y-8 relative overflow-hidden bg-white/[0.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 blur-[50px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-txt-primary flex items-center gap-4 uppercase italic mb-2">
                <Coins size={28} className="text-neon-green" />
                Environmental Forces
              </h3>
              <p className="text-sm text-txt-muted leading-relaxed max-w-md mb-8">
                Donate your global credits or direct funds to the world's most powerful environmental protectors.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "WWF International", url: "https://www.worldwildlife.org/", desc: "Nature conservation worldwide" },
                  { name: "Ocean Conservancy", url: "https://oceanconservancy.org/", desc: "Fighting for trash-free seas" },
                  { name: "Greenpeace", url: "https://www.greenpeace.org/international/", desc: "Global environmental activism" },
                  { name: "Rainforest Alliance", url: "https://www.rainforest-alliance.org/", desc: "Protecting world forests" }
                ].map((org) => (
                  <ImpactLink key={org.name} org={org} color="neon-green" />
                ))}
              </div>
            </div>
          </div>

          {/* Child Help & Rights */}
          <div className="glass-card p-8 border-dark-border/10 space-y-8 relative overflow-hidden bg-white/[0.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-[50px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-txt-primary flex items-center gap-4 uppercase italic mb-2">
                <div className="w-7 h-7 bg-pink-500/10 rounded-lg flex items-center justify-center">
                  <Zap size={18} className="text-pink-500" />
                </div>
                Child Help & Rights
              </h3>
              <p className="text-sm text-txt-muted leading-relaxed max-w-md mb-8">
                Support education, nutrition, and protection for children worldwide.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "CRY (Child Rights)", url: "https://www.cry.org/", desc: "India's leading child rights NGO" },
                  { name: "Smile Foundation", url: "https://www.smilefoundationindia.org/", desc: "Education & healthcare for children" },
                  { name: "Akshaya Patra", url: "https://www.akshayapatra.org/", desc: "World's largest mid-day meal program" },
                  { name: "Save the Children", url: "https://www.savethechildren.in/", desc: "Life-saving health and education" }
                ].map((org) => (
                  <ImpactLink key={org.name} org={org} color="pink-500" />
                ))}
              </div>
            </div>
          </div>

          {/* Old Age Homes & Elder Care */}
          <div className="glass-card p-8 border-dark-border/10 space-y-8 relative overflow-hidden bg-white/[0.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-txt-primary flex items-center gap-4 uppercase italic mb-2">
                <div className="w-7 h-7 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <RefreshCw size={18} className="text-amber-500" />
                </div>
                Elder Care & Welfare
              </h3>
              <p className="text-sm text-txt-muted leading-relaxed max-w-md mb-8">
                Providing healthcare, dignity, and housing for our senior citizens.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "HelpAge India", url: "https://www.helpageindia.org/", desc: "Elderly welfare and healthcare" },
                  { name: "Dignity Foundation", url: "https://www.dignityfoundation.com/", desc: "Active aging and companionship" },
                  { name: "Agewell Foundation", url: "https://www.agewellfoundation.org/", desc: "Social welfare for the elderly" },
                  { name: "Global Seniors", url: "#", desc: "Network expansion active" }
                ].map((org) => (
                  <ImpactLink key={org.name} org={org} color="amber-500" />
                ))}
              </div>
            </div>
          </div>

          {/* Worldwide Sharing */}
          <div className="glass-card p-8 border-dark-border/10 space-y-8 relative overflow-hidden bg-white/[0.02]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/5 blur-[50px] rounded-full" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black text-txt-primary flex items-center gap-4 uppercase italic mb-2">
                <RefreshCw size={28} className="text-neon-cyan" />
                Global Sharing
              </h3>
              <p className="text-sm text-txt-muted leading-relaxed max-w-md mb-8">
                Connect with circular economy networks across every continent to share resources.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Olio Global", url: "https://olioapp.com/", desc: "Universal resource sharing" },
                  { name: "Freecycle Network", url: "https://www.freecycle.org/", desc: "Global gift & reuse network" },
                  { name: "Earth5R", url: "https://earth5r.org/", desc: "Global sustainability research" },
                  { name: "Planet Hub", url: "#", desc: "Network expansion active" }
                ].map((org) => (
                  <ImpactLink key={org.name} org={org} color="neon-cyan" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

const ImpactLink = ({ org, color }: { org: any; color: string }) => (
  <a 
    href={org.url}
    target="_blank"
    rel="noopener noreferrer"
    className={`group p-5 bg-txt-primary/5 border border-dark-border/10 rounded-3xl hover:border-${color}/50 hover:bg-${color}/5 transition-all`}
  >
    <div className="flex justify-between items-start mb-2">
      <span className={`font-black text-sm text-txt-primary group-hover:text-${color} transition-colors`}>{org.name}</span>
      <ExternalLink size={14} className="text-txt-muted group-hover:text-white" />
    </div>
    <p className="text-[10px] text-txt-muted font-medium leading-tight">{org.desc}</p>
  </a>
);

export default Wallet;
