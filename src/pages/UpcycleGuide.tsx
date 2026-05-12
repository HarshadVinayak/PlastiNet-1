import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Scissors, Clock, Star, ChevronRight, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { CONFIG } from '../config';

interface Step {
  title: string;
  description: string;
  tip?: string;
}

interface Guide {
  title: string;
  tagline: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time: string;
  materials: string[];
  steps: Step[];
  proTip: string;
}

const difficultyColor = { Easy: 'text-neon-green border-neon-green/40', Medium: 'text-yellow-400 border-yellow-400/40', Hard: 'text-red-400 border-red-400/40' };

export default function UpcycleGuide() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const itemType: string = state?.itemType || 'Plastic Item';
  const idea: string = state?.idea || 'Upcycling Project';
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    generateGuide();
  }, []);

  const generateGuide = async () => {
    setLoading(true);
    try {
      const prompt = `You are Chloe AI, a creative upcycling expert. Create a detailed DIY guide for turning a "${itemType}" into: "${idea}".
Return ONLY valid JSON (no markdown):
{
  "title": "Project title",
  "tagline": "One exciting sentence about this project",
  "difficulty": "Easy",
  "time": "30 minutes",
  "materials": ["material1", "material2", "material3", "material4"],
  "steps": [
    {"title": "Step title", "description": "Very detailed 2-3 sentence instruction", "tip": "Optional pro tip for this step"},
    {"title": "Step title", "description": "Very detailed 2-3 sentence instruction"},
    {"title": "Step title", "description": "Very detailed 2-3 sentence instruction", "tip": "Optional pro tip"},
    {"title": "Step title", "description": "Very detailed 2-3 sentence instruction"},
    {"title": "Step title", "description": "Very detailed 2-3 sentence instruction"}
  ],
  "proTip": "One final expert tip for best results"
}
Make it practical, specific, and beginner-friendly. Steps should be very detailed with exact measurements or techniques where possible.`;

      const resp = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${CONFIG.API_KEYS.GROQ}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'user', content: prompt }], max_tokens: 1200 })
      });
      const data = await resp.json();
      const text = data.choices[0].message.content;
      const start = text.indexOf('{'); const end = text.lastIndexOf('}');
      if (start !== -1 && end !== -1) setGuide(JSON.parse(text.substring(start, end + 1)));
    } catch (e) {
      toast.error('Failed to generate guide, showing template');
      setGuide({
        title: `${itemType} Upcycle: ${idea}`,
        tagline: 'Give your plastic a new purpose and reduce waste!',
        difficulty: 'Easy',
        time: '20-30 minutes',
        materials: ['Scissors or craft knife', 'Sandpaper (fine grit)', 'Acrylic paint', 'Brush'],
        steps: [
          { title: 'Clean & Prepare', description: 'Wash the item thoroughly with warm soapy water. Remove all labels by soaking in warm water for 10 minutes. Let it dry completely before proceeding.', tip: 'Use a scrubber to remove stubborn adhesive residue.' },
          { title: 'Mark Your Cut Lines', description: 'Use a permanent marker and ruler to draw your cut lines. For bottles, mark a straight line around the circumference at your desired height. Measure twice before cutting.', tip: 'Wrap a piece of tape around the item to get a perfectly straight cut line.' },
          { title: 'Cut Carefully', description: 'Using sharp scissors or a craft knife, follow your marked lines. Apply steady even pressure. For curved surfaces, make small snips rather than one continuous cut.', tip: 'Heat the blade slightly for cleaner cuts on thick plastic.' },
          { title: 'Smooth the Edges', description: 'Sand all cut edges with fine-grit sandpaper in circular motions until smooth. This prevents sharp edges and gives a professional finish. Wipe away dust with a damp cloth.', tip: 'Work from coarse to fine sandpaper (80 → 220 grit) for the smoothest result.' },
          { title: 'Decorate & Finish', description: 'Apply 2-3 thin coats of acrylic paint, letting each coat dry fully (15 min) before the next. Add any decorative elements, stickers, or a clear sealant coat for durability.', tip: 'Prime with white paint first for more vibrant colors.' },
        ],
        proTip: 'Seal your finished project with a waterproof varnish to make it last for years!'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (i: number) => {
    setCompletedSteps(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-14 h-14 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin" />
      <p className="text-white/60 font-semibold">Chloe AI is crafting your guide...</p>
    </div>
  );

  if (!guide) return null;
  const dc = difficultyColor[guide.difficulty] || difficultyColor.Easy;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm font-semibold group w-auto bg-transparent border-none p-0">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Results
      </button>

      {/* Header */}
      <div className="glass-card p-8 border-neon-green/20 bg-neon-green/5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-neon-green text-xs font-black uppercase tracking-widest mb-2">🌿 Upcycle Guide — {itemType}</p>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-3">{guide.title}</h1>
            <p className="text-white/60 text-lg italic">"{guide.tagline}"</p>
          </div>
        </div>
        <div className="flex gap-4 mt-6 flex-wrap">
          <div className={`px-4 py-2 border rounded-xl text-sm font-bold ${dc}`}>{guide.difficulty}</div>
          <div className="px-4 py-2 border border-white/10 rounded-xl text-sm font-bold flex items-center gap-2">
            <Clock size={14} className="text-white/40" /> {guide.time}
          </div>
          <div className="px-4 py-2 border border-white/10 rounded-xl text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={14} className="text-neon-green" /> {completedSteps.size}/{guide.steps.length} steps done
          </div>
        </div>
      </div>

      {/* Materials */}
      <div className="glass-card p-6 border-white/10">
        <h2 className="text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-2">
          <Scissors size={18} className="text-neon-green" /> What You'll Need
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {guide.materials.map((m, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="w-6 h-6 rounded-full bg-neon-green/20 flex items-center justify-center text-neon-green text-xs font-black">{i + 1}</div>
              <span className="text-sm font-semibold text-white/80">{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
          <ChevronRight size={18} className="text-neon-green" /> Step-by-Step Instructions
        </h2>
        {guide.steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => toggleStep(i)}
            className={`glass-card p-6 border cursor-pointer transition-all ${completedSteps.has(i) ? 'border-neon-green/40 bg-neon-green/5' : 'border-white/10 hover:border-white/20'}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0 transition-colors ${completedSteps.has(i) ? 'bg-neon-green text-black' : 'bg-white/10 text-white/60'}`}>
                {completedSteps.has(i) ? <CheckCircle2 size={20} /> : i + 1}
              </div>
              <div className="flex-1">
                <h3 className={`font-black text-lg mb-2 transition-colors ${completedSteps.has(i) ? 'text-neon-green' : 'text-white'}`}>{step.title}</h3>
                <p className="text-white/70 leading-relaxed text-sm">{step.description}</p>
                {step.tip && (
                  <div className="mt-3 flex items-start gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-3">
                    <Star size={14} className="text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-yellow-300 text-xs font-semibold">{step.tip}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pro Tip */}
      <div className="glass-card p-6 border-neon-green/30 bg-neon-green/5">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-neon-green/20 rounded-xl"><Star size={20} className="text-neon-green" /></div>
          <div>
            <p className="text-neon-green text-xs font-black uppercase tracking-widest mb-1">Chloe's Pro Tip</p>
            <p className="text-white/80 text-sm leading-relaxed">{guide.proTip}</p>
          </div>
        </div>
      </div>

      {completedSteps.size === guide.steps.length && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-8 border-neon-green/40 bg-neon-green/10 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-black text-neon-green mb-2">You did it!</h2>
          <p className="text-white/60 mb-6">You've completed the upcycling project. You're helping save the planet, one item at a time!</p>
          <button onClick={() => navigate('/upload')} className="btn-primary px-8 py-3">Scan Another Item</button>
        </motion.div>
      )}
    </motion.div>
  );
}
