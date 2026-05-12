import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Globe, Recycle, AlertTriangle, ExternalLink, Phone } from 'lucide-react';

const RECYCLING_DB: Record<string, { color: string; links: { name: string; url: string; desc: string }[]; tips: string[]; facts: string[] }> = {
  default: {
    color: 'neon-green',
    links: [
      { name: 'Earth911 Recycling Locator', url: 'https://search.earth911.com', desc: 'Find recycling centers near you for any material type' },
      { name: 'RecycleNation', url: 'https://recyclenation.com', desc: 'Nationwide database of recycling drop-off locations' },
      { name: 'TerraCycle', url: 'https://www.terracycle.com', desc: 'Mail-in recycling for hard-to-recycle plastics' },
      { name: 'Plastic Bank', url: 'https://plasticbank.com', desc: 'Turn plastic waste into currency — social plastic movement' },
      { name: 'How2Recycle', url: 'https://how2recycle.info', desc: 'Official labeling system and recycling guidance' },
    ],
    tips: [
      'Always rinse containers before placing in recycling bin — even a little food residue can contaminate a whole batch',
      'Remove caps and lids separately — they are often a different plastic type',
      'Never put plastic bags in curbside bins — they jam sorting machines, take them to grocery store drop-offs',
      'Flatten bottles to save space and improve sorting efficiency at the facility',
      'Check the recycling number (1–7) stamped on the bottom — most curbside programs only accept #1 and #2',
    ],
    facts: [
      'Only 9% of all plastic ever produced has been recycled globally',
      'Plastic takes 400–1000 years to decompose in a landfill',
      'Recycling one plastic bottle saves enough energy to power a 60W bulb for 6 hours',
    ]
  },
  'Type 1 PET': {
    color: 'neon-green',
    links: [
      { name: 'PET Resin Association', url: 'https://www.napcor.com', desc: 'North American recycling rates and facilities for PET' },
      { name: 'Earth911 — PET Bottles', url: 'https://search.earth911.com/?what=PET+Bottles', desc: 'Find your nearest PET #1 recycling drop-off' },
      { name: 'TerraCycle PET Program', url: 'https://www.terracycle.com/en-US/brigades/drink-pouches', desc: 'Mail-in recycling for PET and drink containers' },
      { name: 'Recycle Across America', url: 'https://recycleacrossamerica.org', desc: 'Standardized recycling labels and education' },
      { name: 'Plastic Collective', url: 'https://plasticcollective.co', desc: 'Community programs turning PET into income' },
    ],
    tips: [
      'PET #1 is one of the most widely accepted plastics — your local curbside bin almost certainly takes it',
      'Remove the label if possible — it helps processing, though most facilities can handle it',
      'Crush the bottle flat and replace the cap after to prevent it from expanding during transport',
      'PET bottles can be recycled into fleece jackets, carpets, and new bottles — close the loop!',
      'Look for the ♳ symbol with "1" or "PET" printed on the bottom of the bottle',
    ],
    facts: [
      'A typical fleece jacket is made from about 25 recycled PET bottles',
      'PET is the most recycled plastic in the world by volume',
      'Recycling PET uses 79% less energy than making new PET from petroleum',
    ]
  },
  'Type 2 HDPE': {
    color: 'neon-cyan',
    links: [
      { name: 'Earth911 — HDPE', url: 'https://search.earth911.com/?what=HDPE+Bottles', desc: 'Find HDPE #2 drop-off locations near you' },
      { name: 'Curbside Value Partnership', url: 'https://curbsidevalue.org', desc: 'Improving residential recycling program effectiveness' },
      { name: 'TerraCycle HDPE', url: 'https://www.terracycle.com', desc: 'HDPE collection and recycling programs' },
      { name: 'Association of Plastic Recyclers', url: 'https://plasticsrecycling.org', desc: 'Industry standards and facility locator' },
      { name: 'Recycle Smart', url: 'https://recyclesmart.ca', desc: 'Smart sorting guides for all plastic types' },
    ],
    tips: [
      'HDPE #2 is one of the easiest to recycle — accepted by most curbside programs worldwide',
      'Milk jugs should be rinsed and caps removed before recycling',
      'HDPE can be recycled into pipes, fencing, lumber, and new containers',
      'Colored HDPE (like laundry detergent bottles) goes in the same bin as natural HDPE',
      'Don\'t compact HDPE containers too much — sorting machines need some shape to identify them',
    ],
    facts: [
      'HDPE is used to make outdoor furniture, playground equipment, and park benches from recycled material',
      'HDPE has a recycling rate of about 31% — better than average but much room to improve',
    ]
  }
};

const getRecycleData = (classification: string) => {
  const key = Object.keys(RECYCLING_DB).find(k => classification?.toLowerCase().includes(k.toLowerCase()) && k !== 'default');
  return RECYCLING_DB[key || 'default'];
};

export default function RecycleGuide() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const itemType: string = state?.itemType || 'Plastic Item';
  const classification: string = state?.classification || 'Plastic';
  const data = getRecycleData(classification);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-semibold group w-auto bg-transparent border-none p-0">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Results
      </button>

      {/* Header */}
      <div className="glass-card p-8 border-neon-green/20 bg-neon-green/5">
        <p className="text-neon-green text-xs font-black uppercase tracking-widest mb-2">♻️ Recycling Guide — {classification}</p>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-3">How to Recycle Your {itemType}</h1>
        <p className="text-white/60 text-lg">Everything you need to properly recycle this item — programs, centers, and links to participate.</p>
      </div>

      {/* Quick Tips */}
      <div className="glass-card p-6 border-white/10">
        <h2 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-yellow-400" /> Before You Recycle — Critical Steps
        </h2>
        <div className="space-y-3">
          {data.tips.map((tip, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              className="flex items-start gap-3 bg-white/5 rounded-xl p-4 border border-white/5">
              <div className="w-6 h-6 rounded-full bg-neon-green/20 flex items-center justify-center text-neon-green text-xs font-black flex-shrink-0 mt-0.5">{i + 1}</div>
              <p className="text-white/80 text-sm leading-relaxed">{tip}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recycling Links */}
      <div className="space-y-4">
        <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
          <Globe size={18} className="text-neon-green" /> Recycling Programs & Websites
        </h2>
        {data.links.map((link, i) => (
          <motion.a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass-card p-5 border border-white/10 hover:border-neon-green/40 transition-all flex items-center justify-between gap-4 group block">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-neon-green/10 rounded-xl group-hover:bg-neon-green/20 transition-colors flex-shrink-0">
                <Recycle size={20} className="text-neon-green" />
              </div>
              <div>
                <p className="font-bold text-white group-hover:text-neon-green transition-colors">{link.name}</p>
                <p className="text-white/50 text-sm mt-0.5">{link.desc}</p>
                <p className="text-neon-green/60 text-xs mt-1 font-mono">{link.url.replace('https://', '')}</p>
              </div>
            </div>
            <ExternalLink size={18} className="text-white/20 group-hover:text-neon-green transition-colors flex-shrink-0" />
          </motion.a>
        ))}
      </div>

      {/* Find Local Center */}
      <div className="glass-card p-6 border-neon-cyan/20 bg-neon-cyan/5">
        <h2 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <MapPin size={18} className="text-neon-cyan" /> Find Your Nearest Recycling Center
        </h2>
        <p className="text-white/60 text-sm mb-4">Use these tools to locate recycling drop-off points specific to your area:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'Earth911 Locator', url: 'https://search.earth911.com', icon: '🌍' },
            { name: 'RecycleNow (UK)', url: 'https://www.recyclenow.com/recycling-locator', icon: '🇬🇧' },
            { name: 'iRecycle App', url: 'https://irecycle.com', icon: '📱' },
            { name: 'Google Maps: "recycling near me"', url: 'https://maps.google.com/?q=recycling+center+near+me', icon: '🗺️' },
          ].map((loc, i) => (
            <a key={i} href={loc.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-cyan/40 rounded-xl p-4 transition-all group">
              <span className="text-xl">{loc.icon}</span>
              <div>
                <p className="text-sm font-bold text-white group-hover:text-neon-cyan transition-colors">{loc.name}</p>
              </div>
              <ExternalLink size={14} className="text-white/20 group-hover:text-neon-cyan ml-auto transition-colors" />
            </a>
          ))}
        </div>
      </div>

      {/* Facts */}
      <div className="glass-card p-6 border-white/10">
        <h2 className="text-lg font-black uppercase tracking-widest mb-4">💡 Why It Matters</h2>
        <div className="space-y-3">
          {data.facts.map((fact, i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
              <span className="text-neon-green font-black text-lg flex-shrink-0">→</span>
              <p className="text-white/70 text-sm leading-relaxed">{fact}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 border-neon-green/20 text-center">
        <p className="text-white/60 text-sm mb-4">Finished recycling? Go back and complete your action shot to earn your next PLC reward!</p>
        <button onClick={() => navigate(-1)} className="btn-primary px-8 py-3">← Back to My Scan</button>
      </div>
    </motion.div>
  );
}
