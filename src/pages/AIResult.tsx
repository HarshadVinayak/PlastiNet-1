import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Recycle, 
  RefreshCcw, 
  MinusCircle, 
  ArrowRight, 
  Info, 
  Coins,
  ChevronRight,
  Share2,
  ShieldCheck,
  AlertTriangle,
  Zap,
  X,
  Loader2
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import TransformationSlider from '../components/ui/TransformationSlider';
import { useVerificationStore } from '../stores/verificationStore';
import { useRewardStore } from '../stores/rewardStore';
import { useHistoryStore } from '../stores/historyStore';
import { useEffect, useState, Suspense, lazy } from 'react';
import { compareScenes } from '../ai/verification/sceneComparator';
import toast from 'react-hot-toast';

const AIResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const step = location.state?.step || (location.state?.isVerification ? 'AFTER' : 'BEFORE');
  const isVerification = step === 'AFTER';
  const afterImage = location.state?.afterImage || null;
  const afterAnalysis = location.state?.afterAnalysis || null;
  
  const session = useVerificationStore(state => state.session);
  const clearSession = useVerificationStore(state => state.clearSession);
  const { addTransaction } = useRewardStore();
  const { addItem: logHistory } = useHistoryStore();
  
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [sceneData, setSceneData] = useState<any>(null);
  const [rewardProcessed, setRewardProcessed] = useState(false);
  const [scanLogged, setScanLogged] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'APPROVED' | 'DELAYED_REVIEW' | 'REJECTED' | null>(null);
  const [blueprint, setBlueprint] = useState<any>(null);
  const [dynamicTips, setDynamicTips] = useState<{reduce: string[], reuse: string[], recycle: string[], impact: string} | null>(null);
  const [showCoins, setShowCoins] = useState(false);

  useEffect(() => {
    const processRewards = async () => {
      if (rewardProcessed) return;

      if (step === 'BEFORE' && session?.beforeData && !scanLogged) {
        await addTransaction('EARN', 5, `Phase 1: ${session.beforeData.type} Detection`, session.id);
        await logHistory({
          type: 'SCAN',
          title: 'New Plastic Detected',
          description: `Chloe identified a ${session.beforeData.type} container.`,
          metadata: { type: session.beforeData.type, plc: 5 }
        });
        setScanLogged(true);
        setRewardProcessed(true);
      } else if (step === 'DURING' && session?.duringImage) {
        await addTransaction('EARN', 5, `Phase 2: Action Captured (Right Now)`, session.id);
        await logHistory({
          type: 'SOCIAL',
          title: 'Environmental Action',
          description: 'You were captured taking action in the field!',
          metadata: { phase: 'DURING', plc: 5 }
        });
        setRewardProcessed(true);
        toast.success("Action shot verified! +5 PLC");
      } else if (step === 'AFTER' && isVerification && session && afterImage) {
        try {
          const sceneComparison = await compareScenes(session.beforeImage!, afterImage);
          setSceneData(sceneComparison);
          
          // Final phase reward
          await addTransaction('EARN', 10, `Phase 3: Final Transformation Verified`, session.id);
          await logHistory({
            type: 'REWARD',
            title: 'Impact Cycle Complete',
            description: 'You successfully recycled and verified a waste object.',
            metadata: { phase: 'AFTER', plc: 10, similarity: sceneComparison.similarityScore }
          });
          setVerificationStatus('APPROVED');
          toast.success("Cleanup verified! +10 PLC (Lifecycle Complete)");
          setRewardProcessed(true);
        } catch (error) {
          console.error("Verification processing failed", error);
        }
      }
    };
    
    const generateBlueprint = async () => {
      if (session?.beforeData?.type) {
        setBlueprint({
          title: `Smart ${session.beforeData.type} Organizer`,
          difficulty: 'Medium',
          materials: ['Strong Scissors', 'Adhesive Tape', 'Acrylic Paint'],
          steps: [
            'Rinse the container thoroughly with warm soapy water.',
            'Measure and cut the top section at a 45-degree angle.',
            'Smooth the edges using a fine-grit sandpaper or heat.',
            'Decorate with eco-friendly paint to match your room.'
          ],
          environmentalValue: 'Prevents microplastic shedding and extends object lifecycle by 2+ years.'
        });
      }
    };

    const generateDynamicTips = async () => {
      if (!session?.beforeData?.type) return;
      const itemType = session.beforeData.type;
      const classification = session.beforeData.classification || 'plastic';
      try {
        const { aiService } = await import('../services/ai');
        const resp = await aiService.runTextCompletion(
          `You are Chloe AI. The user scanned: "${itemType}" (${classification}). Give concise eco-tips. Respond ONLY with valid JSON, no markdown:
{"reduce":["tip1","tip2"],"reuse":["tip1","tip2"],"recycle":["tip1","tip2"],"impact":"One sentence about environmental impact of this specific item if not recycled."}`,
          undefined,
          false
        );
        const start = resp.indexOf('{');
        const end = resp.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const parsed = JSON.parse(resp.substring(start, end + 1));
          setDynamicTips(parsed);
        }
      } catch (e) {
        console.warn('Dynamic tips generation failed, using defaults', e);
      }
    };
    
    processRewards();
    generateBlueprint();
    generateDynamicTips();
  }, [step, isVerification, session, afterImage, rewardProcessed, scanLogged]);

  const isApproved = step === 'AFTER' ? verificationStatus === 'APPROVED' : true;
  const displayReward = step === 'BEFORE' ? 5 : step === 'DURING' ? 5 : 10;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header Result */}
      <motion.div variants={item} className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/3 glass-card p-2 aspect-square relative overflow-hidden group">
          {session?.beforeImage ? (
            <img 
              src={session.beforeImage} 
              alt="Scanned item" 
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="w-full h-full bg-white/5 rounded-xl flex items-center justify-center">
              {isApproved ? <CheckCircle2 size={64} className="text-neon-green" /> : 
               verificationStatus === 'DELAYED_REVIEW' ? <Info size={64} className="text-yellow-400" /> :
               <AlertTriangle size={64} className="text-red-500" />}
            </div>
          )}
          {/* AI verification overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 rounded-b-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${isApproved ? 'bg-neon-green shadow-[0_0_6px_#39FF14]' : 'bg-red-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest text-neon-green">
                {step === 'BEFORE' ? 'Initial Scan by Chloe AI' : step === 'DURING' ? 'Action Captured' : 'Final Proof'}
              </span>
            </div>
            {session?.beforeData?.type && (
              <p className="text-xs text-white/80 font-semibold leading-snug">
                Identified: <span className="text-white font-bold">{session.beforeData.type}</span>
              </p>
            )}
            {session?.beforeData?.environmentalImpact && (
              <p className="text-[10px] text-white/50 mt-0.5 leading-tight line-clamp-2">
                {session.beforeData.environmentalImpact}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-5xl font-black tracking-tighter italic uppercase">
            {step === 'BEFORE' 
              ? `${session?.beforeData?.type || 'Plastic Waste'} detected` 
              : step === 'DURING'
              ? 'Action In Progress'
              : 'Recycling Verified'}
          </h1>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-[10px] text-white/40 uppercase font-bold">Category</p>
              <p className="font-bold text-neon-green">{session?.beforeData?.classification || 'Plastic Item'}</p>
            </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-[10px] text-white/40 uppercase font-bold">Complexity</p>
              <p className="font-bold text-neon-cyan">{session?.beforeData?.complexityScore ?? '—'}/100</p>
            </div>
          </div>
          
          {step === 'AFTER' && session?.beforeImage && afterImage ? (
            <div className="py-4">
              <TransformationSlider 
                before={session.beforeImage} 
                after={afterImage} 
              />
            </div>
          ) : step === 'DURING' && session?.duringImage ? (
            <div className="py-4 glass-card p-2 border-neon-cyan/20">
              <img src={session.duringImage} alt="Action" className="w-full h-64 object-cover rounded-xl" />
              <p className="text-[10px] text-center font-black uppercase text-neon-cyan tracking-widest mt-2">Verified Action Capture</p>
            </div>
          ) : (
            <p className="text-white/60 leading-relaxed text-lg italic">
              {step === 'BEFORE' 
                ? "Great find! Chloe has identified the material. Now, show us the action—capture a photo of people working or recycling this item right now!"
                : "Action confirmed. The final step is to show the finished, clean environment or the item inside the recycling hub."}
            </p>
          )}
          
          <div className="flex gap-4 pt-4">
            {verificationStatus !== 'REJECTED' && (
              <div className={`flex items-center gap-2 text-2xl font-black ${verificationStatus === 'DELAYED_REVIEW' ? 'text-yellow-400' : 'text-neon-green'}`}>
                <img 
                  src="/plasticoin.png" 
                  alt="PLC" 
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/7036/7036798.png'; }}
                  className="w-8 h-8 object-contain" 
                />
                +{displayReward} PLC earned
              </div>
            )}
            <button className="btn-secondary px-4 py-2">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* 3-Step Plan / Verification Details */}
      {!isVerification ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* REDUCE — keeps modal with detailed steps */}
          <ActionCard 
            variants={item}
            icon={<MinusCircle className="text-red-400" />}
            title="Reduce"
            color="border-red-500/20"
            steps={dynamicTips?.reduce || ["Switch to reusable alternative", "Avoid single-use packaging"]}
            onStepClick={(_step: string) => setSelectedIdea({
              title: "Reduce Strategy",
              description: "The most effective way to manage waste is to not create it in the first place.",
              steps: dynamicTips?.reduce || ["Switch to glass or stainless steel containers.", "Buy in bulk to avoid small plastic packaging.", "Request 'no plastic cutlery' on delivery apps."],
              color: "text-red-400"
            })}
            onClick={() => setSelectedIdea({
              title: "Reduce Strategy",
              description: "The most effective way to manage waste is to not create it in the first place.",
              steps: dynamicTips?.reduce || ["Switch to glass or stainless steel containers.", "Buy in bulk to avoid small plastic packaging.", "Request 'no plastic cutlery' on delivery apps."],
              color: "text-red-400"
            })}
          />
          {/* REUSE — navigates to full DIY UpcycleGuide page */}
          <ActionCard 
            variants={item}
            icon={<RefreshCcw className="text-blue-400" />}
            title="Reuse"
            color="border-blue-500/20"
            steps={dynamicTips?.reuse || ["Repurpose creatively", "Share with community"]}
            badge="Tap an idea →"
            onStepClick={(stepText: string) => navigate('/upcycle-guide', { state: { itemType: session?.beforeData?.type || 'Plastic Item', idea: stepText } })}
            onClick={() => navigate('/upcycle-guide', { state: { itemType: session?.beforeData?.type || 'Plastic Item', idea: dynamicTips?.reuse?.[0] || 'Creative upcycling project' } })}
          />
          {/* RECYCLE — navigates to RecycleGuide with links */}
          <ActionCard 
            variants={item}
            icon={<Recycle className="text-neon-green" />}
            title="Recycle"
            color="border-neon-green/20"
            steps={dynamicTips?.recycle || ["Find recycling centers", "Drop in yellow bin"]}
            badge="Links & Programs →"
            onStepClick={() => navigate('/recycle-guide', { state: { itemType: session?.beforeData?.type || 'Plastic Item', classification: session?.beforeData?.classification || 'Plastic' } })}
            onClick={() => navigate('/recycle-guide', { state: { itemType: session?.beforeData?.type || 'Plastic Item', classification: session?.beforeData?.classification || 'Plastic' } })}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div variants={item} className="glass-card p-8 border-neon-green/20 bg-neon-green/5 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-neon-green/10 rounded-2xl">
                <ShieldCheck className="text-neon-green" />
              </div>
              <h3 className="text-2xl font-bold">Verification Analysis</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Scene Consistency</span>
                  <span className="text-neon-green font-bold">{sceneData?.similarityScore || 0}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Object Removal</span>
                  <span className="text-neon-green font-bold">{afterAnalysis?.detectedAction || 'Unknown'}</span>
                </div>
              </div>
              <p className="text-white/60 text-sm italic leading-relaxed border-t border-white/5 pt-4">
                "{afterAnalysis?.reason || 'Chloe AI has confirmed the action.'}"
              </p>
            </div>
          </motion.div>

          {blueprint && (
            <motion.div variants={item} className="glass-card p-8 border-neon-cyan/20 bg-neon-cyan/5 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-neon-cyan/10 rounded-2xl">
                    <Zap className="text-neon-cyan" />
                  </div>
                  <h3 className="text-2xl font-bold">Reuse Blueprint</h3>
                </div>
                <span className="px-2 py-1 bg-white/10 rounded text-[10px] font-bold uppercase tracking-widest text-neon-cyan">
                  {blueprint.difficulty}
                </span>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-bold text-white">{blueprint.title}</h4>
                <ul className="space-y-2">
                  {blueprint.steps.slice(0, 3).map((step: string, i: number) => (
                    <li key={i} className="text-sm text-white/60 flex gap-2">
                      <span className="text-neon-cyan font-bold">{i+1}.</span> {step}
                    </li>
                  ))}
                </ul>
                <button className="text-neon-cyan text-sm font-bold flex items-center gap-1 hover:underline pt-2">
                  View Full Instructions <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Impact & Social */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 border-neon-cyan/20 bg-neon-cyan/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-neon-cyan/10 rounded-2xl">
              <Info className="text-neon-cyan" />
            </div>
            <h3 className="text-2xl font-bold">Environmental Impact</h3>
          </div>
          <p className="text-white/80 text-lg mb-6 leading-relaxed">
            {dynamicTips?.impact 
              ? dynamicTips.impact 
              : `By recycling this ${session?.beforeData?.type || 'item'}, you prevent plastic from entering the environment and reduce the demand for new raw materials.`}
          </p>
          <div className="p-4 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-white/40">Chloe AI Impact Score</span>
            <span className="font-mono text-neon-cyan">{session?.beforeData?.complexityScore || 50}/100</span>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col justify-between border-white/10">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {step === 'BEFORE' ? 'Next: Action Shot' : step === 'DURING' ? 'Next: Final Proof' : 'Impact Complete'}
            </h3>
            <p className="text-white/60 mb-6">
              {step === 'BEFORE' 
                ? 'Capture people performing the recycling action right now to earn your next +5 PLC.' 
                : step === 'DURING'
                ? 'Finish the work and upload the final result to claim your final +10 PLC.'
                : 'You have successfully completed the full impact lifecycle. 20 PLC added to your wallet.'}
            </p>
          </div>
          <div className="space-y-4">
            {step === 'AFTER' ? (
              <Link to="/upload" className="w-full btn-primary py-4 text-xl">
                Start New Impact
              </Link>
            ) : (
              <Link to="/upload" className="w-full btn-primary py-4 text-xl bg-neon-cyan text-black">
                {step === 'BEFORE' ? 'Capture "Right Now"' : 'Upload "After" Proof'}
              </Link>
            )}
            <button 
              onClick={async () => {
                if (isVerification) {
                  clearSession();
                  navigate('/');
                } else {
                  setShowCoins(true);
                  const loadingToast = toast.loading("Syncing base rewards...");
                  try {
                    await addTransaction('BONUS', 2, 'Base Scanning Points (Fast-Track)');
                    toast.success("Points collected!", { id: loadingToast });
                  } catch (e) {
                    console.error("Reward sync failed:", e);
                    toast.error("Reward sync failed, but proceeding...", { id: loadingToast });
                  } finally {
                    setTimeout(() => {
                      clearSession();
                      navigate('/');
                    }, 1200);
                  }
                }
              }}
              className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors group"
            >
              {isVerification ? 'Back to Dashboard' : 'Skip and collect base points'} 
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Idea Detail Modal Overlay */}
      <AnimatePresence>
        {selectedIdea && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedIdea(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card p-6 w-full max-w-md border-white/10 relative"
            >
              <button 
                onClick={() => setSelectedIdea(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <Info className={selectedIdea.color} />
                </div>
                <h3 className="text-xl font-bold uppercase tracking-widest">{selectedIdea.title}</h3>
              </div>
              <p className="text-white/60 text-sm mb-6 italic">"{selectedIdea.description}"</p>
              <div className="space-y-4 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Action Steps</p>
                {selectedIdea.steps.map((step: string, i: number) => (
                  <div key={i} className="flex gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                    <span className={`font-bold ${selectedIdea.color}`}>{i + 1}</span>
                    <p className="text-sm text-white/80">{step}</p>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelectedIdea(null)} className="w-full btn-primary py-3">Got it</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coin Animation Overlay */}
      <AnimatePresence>
        {showCoins && (
          <div className="fixed inset-0 pointer-events-none z-[9999]">
            {[...Array(8)].map((_, i) => (
              <motion.img
                key={i}
                src="/plasticoin.png"
                alt="PLC"
                initial={{ opacity: 0, scale: 0, x: '50vw', y: '80vh' }}
                animate={{ 
                  opacity: [0, 1, 1, 0], 
                  scale: [0, 1.5, 1, 0.5],
                  x: ['50vw', `${30 + (Math.random() * 40)}vw`, '90vw'], 
                  y: ['80vh', `${30 + (Math.random() * 40)}vh`, '5vh'] 
                }}
                transition={{ 
                  duration: 1.2, 
                  delay: i * 0.08, 
                  ease: "easeInOut",
                  times: [0, 0.2, 0.8, 1]
                }}
                className="absolute w-12 h-12 object-contain drop-shadow-[0_0_15px_#39FF14]"
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ActionCard = ({ icon, title, steps, color, badge, variants, onClick, onStepClick }: any) => (
  <motion.div 
    variants={variants} 
    className={`glass-card p-6 border ${color} transition-transform`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
        <h4 className="text-xl font-bold">{title}</h4>
      </div>
      {badge && (
        <span className="text-[10px] font-black uppercase tracking-widest text-neon-green border border-neon-green/30 px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
    <ul className="space-y-3">
      {steps.map((step: string, i: number) => (
        <li
          key={i}
          onClick={() => onStepClick ? onStepClick(step) : onClick?.()}
          className="flex gap-2 items-start text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg p-2 -mx-2 cursor-pointer group transition-all"
        >
          <span className="text-white/20 group-hover:text-neon-green transition-colors font-bold flex-shrink-0">{i + 1}.</span>
          <span className="leading-snug">{step}</span>
          <ArrowRight size={14} className="ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 text-neon-green transition-all" />
        </li>
      ))}
    </ul>
    <button
      onClick={onClick}
      className="mt-4 w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors pt-3 border-t border-white/5"
    >
      View all {title} options →
    </button>
  </motion.div>
);

export default AIResult;
