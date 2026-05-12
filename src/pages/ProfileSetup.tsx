import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Briefcase, Camera, Image as ImageIcon, ArrowRight, Check } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ProfileSetup = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { updateProfile, uploadAvatar } = useAuthStore();
  const navigate = useNavigate();

  // Step 1 State
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [dob, setDob] = useState<string | null>(null);
  const [occupation, setOccupation] = useState<'School' | 'College' | 'Working' | ''>('');

  // Step 2 State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleNextStep = () => {
    if (!username || !displayName || !dob || !occupation) {
      toast.error('Please fill in all details.');
      return;
    }
    setStep(2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. First update the textual profile data
      await updateProfile({
        username,
        display_name: displayName,
        dob,
        occupation
      });

      // 2. Then upload avatar if present
      if (avatarFile) {
        await uploadAvatar(avatarFile);
      }
      
      toast.success('Profile setup complete!');
      
      // 3. Force a small delay then redirect to ensure state is synchronized
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete profile setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-neon-green/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-2">Setup Profile</h1>
          <p className="text-white/60">Step {step} of 2</p>
        </div>

        <div className="glass-card p-8 border border-white/10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-white/40 font-bold group-focus-within:text-neon-green">@</span>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-neon-green/50 transition-all"
                      placeholder="Username (unique)"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-white/40 group-focus-within:text-neon-green transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-neon-green/50 transition-all"
                      placeholder="Display Name"
                    />
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-white/40 group-focus-within:text-neon-green transition-colors" />
                    </div>
                    <input
                      type="date"
                      value={dob || ''}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-neon-green/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest pl-1">Occupation</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['School', 'College', 'Working'].map((occ) => (
                        <button
                          key={occ}
                          onClick={() => setOccupation(occ as any)}
                          className={`py-3 rounded-xl border text-sm font-bold transition-all ${
                            occupation === occ 
                              ? 'bg-neon-green/20 border-neon-green text-neon-green' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                          }`}
                        >
                          {occ}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextStep}
                  disabled={loading}
                  className="w-full py-4 bg-neon-green text-black rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <>Next <ArrowRight size={18} /></>}
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8 flex flex-col items-center"
              >
                <div className="w-32 h-32 rounded-full border-4 border-neon-green/30 p-1 relative group overflow-hidden">
                  <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center overflow-hidden relative">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-white/20" />
                    )}
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-bold text-white">Change</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <button 
                    onClick={() => galleryRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <ImageIcon className="text-neon-cyan" />
                    <span className="text-sm font-bold">Gallery</span>
                  </button>
                  <button 
                    onClick={() => cameraRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Camera className="text-neon-green" />
                    <span className="text-sm font-bold">Camera</span>
                  </button>
                </div>
                
                <p className="text-xs text-white/40 text-center uppercase tracking-widest font-bold">Max 10MB • JPEG, JPG, PNG</p>

                <input type="file" ref={galleryRef} accept="image/jpeg, image/png, image/jpg" className="hidden" onChange={handleFileSelect} />
                <input type="file" ref={cameraRef} accept="image/*" capture="user" className="hidden" onChange={handleFileSelect} />

                <div className="flex gap-4 w-full">
                  <button onClick={() => setStep(1)} className="flex-1 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-white/10 transition-colors">
                    Back
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleFinish}
                    disabled={loading}
                    className="flex-[2] py-4 bg-neon-green text-black rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] transition-all disabled:opacity-50"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <>Finish <Check size={18} /></>}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
