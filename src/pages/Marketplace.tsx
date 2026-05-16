import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Star, ArrowUpRight, Filter, Search, Coins, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRewardStore } from '../stores/rewardStore';

const Marketplace = () => {
  const { balance, spend } = useRewardStore();

  const products = [
    {
      id: 1,
      name: "Bamboo Cutlery Set",
      price: 2500,
      image: "/cutlery.jpeg",
      tag: "Best Seller",
      rating: 4.8
    },
    {
      id: 2,
      name: "Recycled Plastic Tote",
      price: 1800,
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400",
      tag: "Eco-Friendly",
      rating: 4.9
    },
    {
      id: 3,
      name: "Solar Powered Charger",
      price: 12000,
      image: "/charger.png",
      tag: "Premium",
      rating: 4.7
    },
    {
      id: 4,
      name: "Stainless Steel Bottle",
      price: 3500,
      image: "/bottle.png",
      tag: "Essential",
      rating: 4.9
    }
  ];

  const handleRedeem = (cost: number, name: string) => {
    if (balance >= cost) {
      spend(cost, `Redeemed: ${name}`).then(success => {
        if (success) toast.success(`Successfully redeemed ${name}!`);
      });
    } else {
      toast.error('Not enough PlastiCoins.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 text-txt-primary uppercase italic">Reward <span className="text-neon-green">Marketplace</span></h1>
          <p className="text-txt-muted">Redeem your PlastiCoins for premium eco-friendly products.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted/40" size={18} />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full bg-txt-primary/5 border border-dark-border/10 rounded-xl py-2 pl-10 pr-4 text-txt-primary focus:border-neon-green outline-none transition-colors placeholder:text-txt-muted/20"
            />
          </div>
          <button className="p-2.5 bg-txt-primary/5 border border-dark-border/10 rounded-xl hover:bg-txt-primary/10 text-txt-primary">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <motion.div
            key={product.id}
            whileHover={{ y: -10 }}
            className="glass-card group overflow-hidden border-dark-border/10"
          >
            <div className="aspect-square relative overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-1 text-white">
                <Tag size={12} className="text-neon-green" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{product.tag}</span>
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10 flex items-center gap-1 text-white">
                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-bold">{product.rating}</span>
              </div>
            </div>
            <div className="p-6 space-y-4 bg-dark-glass">
              <div>
                <h3 className="text-lg font-bold text-txt-primary mb-1 line-clamp-1">{product.name}</h3>
                <div className="flex items-center gap-2 text-neon-green">
                  <Coins size={14} />
                  <span className="font-black text-sm uppercase tracking-tighter">{product.price.toLocaleString()} PLC</span>
                </div>
              </div>
              
              <button 
                onClick={() => handleRedeem(product.price, product.name)}
                className="w-full py-3 bg-txt-primary/5 hover:bg-neon-green hover:text-black rounded-xl border border-dark-border/10 hover:border-neon-green transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 text-txt-primary"
              >
                Redeem Reward <ArrowUpRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="lg:col-span-2 glass-card p-10 bg-eco-gradient relative overflow-hidden border-dark-border/10">
        <div className="relative z-10 max-w-xl">
          <h2 className="text-3xl font-black mb-4 text-white italic tracking-tighter uppercase">Unlock Premium Tiers</h2>
          <p className="text-white/80 mb-8 leading-relaxed">
            Reach 'Eco Legend' status to unlock exclusive physical products, 
            factory visits, and special event invitations.
          </p>
          <div className="flex items-center gap-4">
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-neon-green w-1/3 shadow-[0_0_10px_rgba(57,255,20,0.5)]" />
            </div>
            <span className="text-sm font-bold text-white/60 whitespace-nowrap">Tier 2 / 5</span>
          </div>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-10 text-white">
          <ShoppingBag size={200} />
        </div>
      </div>
    </motion.div>
  );
};

export default Marketplace;
