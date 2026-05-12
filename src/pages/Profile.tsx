import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, MapPin, Check, Monitor, Moon, Sun, 
  Smartphone, Palette, Bell, Shield, User as UserIcon, 
  Camera, Crown, Sparkles, Globe, ArrowRight, Zap, X, Users 
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useChatStore } from '../stores/chatStore';
import { useGamificationStore } from '../stores/gamificationStore';
import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useUIStore } from '../stores/uiStore';
import toast from 'react-hot-toast';
import PremiumBadge from '../components/ui/PremiumBadge';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
type TabId = 'personalisation' | 'notifications' | 'social' | 'account' | 'membership';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabId>('personalisation');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Chat & Social Store
  const { friends, requests, fetchSocial, respondToRequest, sendFriendRequest } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { 
    user, 
    profile, 
    signOut, 
    updateProfile, 
    updateEmail, 
    updatePassword, 
    deleteAccount,
    uploadAvatar 
  } = useAuthStore();
  
  const { streak, level } = useGamificationStore();
  const { subscription, fetchSubscription } = useSubscriptionStore();
  const { 
    theme, 
    setTheme, 
    isVoiceEnabled, 
    setVoiceEnabled, 
    chloeVoice, 
    setChloeVoice,
    chloeModel,
    setChloeModel
  } = useUIStore();

  useEffect(() => {
    fetchSubscription();
    fetchSocial();
  }, [fetchSubscription, fetchSocial]);

  const themes = [
    { id: 'dark', name: 'Dark', icon: <Moon size={16} />, preview: 'bg-[#020402]' },
    { id: 'light', name: 'Light', icon: <Sun size={16} />, preview: 'bg-[#F8FAFC]' },
    { id: 'classic', name: 'Classic Dark', icon: <Monitor size={16} />, preview: 'bg-[#121212]' },
    { id: 'system', name: 'System', icon: <Smartphone size={16} />, preview: 'bg-gradient-to-br from-[#020402] to-[#F8FAFC]' },
  ];

  const handleUpdateField = async (field: string, value: string) => {
    if (!value) return;
    setLoading(true);
    try {
      await updateProfile({ [field]: value });
      toast.success(`${field.replace('_', ' ')} updated!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    const pass = window.prompt("Enter new password:");
    if (!pass) return;
    setLoading(true);
    try {
      await updatePassword(pass);
      toast.success("Password updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    const email = window.prompt("Enter new email address:", user?.email);
    if (!email) return;
    setLoading(true);
    try {
      await updateEmail(email);
      toast.success("Verification email sent to new address!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      await uploadAvatar(file);
      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("ARE YOU SURE? This will permanently delete your data and cannot be undone.")) {
      setLoading(true);
      try {
        await deleteAccount();
        toast.success("Account deleted.");
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-20"
    >
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />

      {/* Profile Header */}
      <div className="glass-card p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-neon-green/20 to-transparent opacity-30" />
        
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-neon-green/30 p-1">
            <div className="w-full h-full rounded-full bg-txt-primary/5 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold text-txt-primary">{(profile?.display_name || profile?.username || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-neon-green text-black rounded-full flex items-center justify-center font-bold border-4 border-dark-deep">
            {level}
          </div>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <h1 className="text-3xl font-black text-txt-primary">{profile?.display_name || profile?.username || 'Eco User'}</h1>
            <PremiumBadge tier={subscription?.plan} />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 text-txt-secondary mb-6 justify-center md:justify-start">
            <span className="flex items-center gap-1"><MapPin size={16} /> {profile?.occupation || 'Earth Enthusiast'}</span>
            <span className="hidden md:block">•</span>
            <span>Joined {new Date(profile?.joined_at || Date.now()).toLocaleDateString()}</span>
          </div>

          <div className="flex gap-4 justify-center md:justify-start">
            <button 
              onClick={signOut}
              className="px-6 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>

        <div className="hidden lg:flex gap-6 z-10">
          <div className="text-center">
            <p className="text-txt-muted text-[10px] font-black uppercase mb-1 tracking-widest">Rank</p>
            <p className="font-black text-xl text-yellow-500">Eco Elite</p>
          </div>
          <div className="text-center">
            <p className="text-txt-muted text-[10px] font-black uppercase mb-1 tracking-widest">Streak</p>
            <p className="font-black text-xl text-orange-400">{streak} Days</p>
          </div>
        </div>
      </div>

      {/* Settings Section Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Sidebar Menu */}
        <div className="md:col-span-4 space-y-2">
          <button 
            onClick={() => setActiveTab('personalisation')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'personalisation' ? 'bg-neon-green text-black shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'bg-txt-primary/5 text-txt-secondary hover:bg-txt-primary/10 hover:text-txt-primary'}`}
          >
            <Palette size={20} />
            Personalisation
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'notifications' ? 'bg-neon-green text-black shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'bg-txt-primary/5 text-txt-secondary hover:bg-txt-primary/10 hover:text-txt-primary'}`}
          >
            <Bell size={20} />
            Notifications
          </button>
          <button 
            onClick={() => setActiveTab('social')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'social' ? 'bg-neon-green text-black shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'bg-txt-primary/5 text-txt-secondary hover:bg-txt-primary/10 hover:text-txt-primary'}`}
          >
            <Users size={20} />
            Social Hub
          </button>
          <button 
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'account' ? 'bg-neon-green text-black shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'bg-txt-primary/5 text-txt-secondary hover:bg-txt-primary/10 hover:text-txt-primary'}`}
          >
            <Shield size={20} />
            Account & Security
          </button>
          <button 
            onClick={() => setActiveTab('membership')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold transition-all ${activeTab === 'membership' ? 'bg-neon-green text-black shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'bg-txt-primary/5 text-txt-secondary hover:bg-txt-primary/10 hover:text-txt-primary'}`}
          >
            <Crown size={20} />
            Membership
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-8">
          <div className="glass-card p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              
              {/* Personalisation Tab */}
              {activeTab === 'personalisation' && (
                <motion.div
                  key="personalisation"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-xl font-black mb-6 text-txt-primary">Dashboard Theme</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {themes.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id as any)}
                          className={`group relative flex flex-col items-start gap-3 p-3 rounded-xl border transition-all ${
                            theme === t.id 
                              ? 'bg-neon-green/10 border-neon-green' 
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className={`w-full aspect-[4/3] rounded-lg ${t.preview} border border-white/10 overflow-hidden relative shadow-inner`}>
                            <div className="p-2 space-y-1">
                              <div className="w-1/2 h-1 bg-neon-green/40 rounded-full" />
                              <div className="w-3/4 h-1 bg-white/10 rounded-full" />
                            </div>
                            {theme === t.id && (
                              <div className="absolute inset-0 flex items-center justify-center bg-neon-green/20">
                                <Check className="text-neon-green" size={24} />
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${theme === t.id ? 'border-neon-green' : 'border-white/20'}`}>
                              {theme === t.id && <div className="w-2 h-2 bg-neon-green rounded-full" />}
                            </div>
                            <span className="text-xs font-bold">{t.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-dark-border/10">
                    <h3 className="text-xl font-black mb-6 text-txt-primary">Chloe AI Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-txt-primary/5 p-5 rounded-xl border border-dark-border/10">
                        <p className="text-sm font-bold uppercase tracking-widest text-txt-secondary mb-3">Chloe AI Voice</p>
                        <select 
                          value={chloeVoice}
                          onChange={(e) => setChloeVoice(e.target.value)}
                          className="w-full bg-dark-deep/50 border border-dark-border/10 rounded-lg p-3 text-txt-primary focus:outline-none focus:border-neon-green transition-colors"
                        >
                          <option>Standard Female</option>
                          <option>Google US English</option>
                          <option>Eco-Tech Synth</option>
                          <option>Natural Calm</option>
                        </select>
                        <div className="flex items-center gap-2 mt-4">
                          <button 
                            onClick={() => setVoiceEnabled(!isVoiceEnabled)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${isVoiceEnabled ? 'bg-neon-green' : 'bg-txt-primary/20'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${isVoiceEnabled ? 'right-1 bg-black' : 'left-1 bg-txt-primary/60'}`} />
                          </button>
                          <span className="text-xs font-bold uppercase tracking-widest text-txt-muted">Enable TTS Voice Output</span>
                        </div>
                      </div>
                      <div className="bg-txt-primary/5 p-5 rounded-xl border border-dark-border/10">
                        <p className="text-sm font-bold uppercase tracking-widest text-txt-secondary mb-3">Chloe AI Model</p>
                        <select className="w-full bg-dark-deep/50 border border-dark-border/10 rounded-lg p-3 text-txt-primary focus:outline-none focus:border-neon-green transition-colors">
                          <option>Llama-3.3-70b-Versatile</option>
                          <option>Gemini 1.5 Flash</option>
                          <option>Mistral-8x7b</option>
                        </select>
                        <p className="text-[10px] mt-4 text-txt-muted uppercase tracking-widest">Model selection limited by membership tier</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-black mb-6 text-txt-primary">Notification Preferences</h3>
                  <div className="space-y-4">
                    {[
                      { id: 'impact', label: 'Impact Alerts & Rewards', active: true },
                      { id: 'community', label: 'Community Challenges', active: true },
                      { id: 'system', label: 'System Updates', active: false }
                    ].map(notif => (
                      <div key={notif.id} className="flex items-center justify-between p-5 bg-txt-primary/5 rounded-xl border border-dark-border/10 hover:border-dark-border/20 transition-colors">
                        <div>
                          <p className="font-bold text-txt-primary">{notif.label}</p>
                          <p className="text-sm text-txt-muted">Receive push notifications for this category.</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${notif.active ? 'bg-neon-green' : 'bg-txt-primary/20'}`}>
                          <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${notif.active ? 'right-1 bg-black' : 'left-1 bg-txt-primary/60'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Social Hub Tab */}
              {activeTab === 'social' && (
                <motion.div
                  key="social"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-txt-primary uppercase tracking-tighter">Social Hub</h3>
                    <div className="flex gap-2">
                      <div className="px-3 py-1 bg-neon-green/10 text-neon-green rounded-full text-[10px] font-black uppercase">{friends.length} Friends</div>
                      <div className="px-3 py-1 bg-pink-500/10 text-pink-500 rounded-full text-[10px] font-black uppercase">{requests.length} Requests</div>
                    </div>
                  </div>

                  {/* Friend Requests Section */}
                  {requests.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-txt-muted flex items-center gap-2">
                        <ArrowRight size={12} className="text-pink-500" /> Incoming Requests
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {requests.map(req => (
                          <div key={req.id} className="glass-card p-4 flex items-center justify-between border-pink-500/20 bg-pink-500/5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden border border-white/10">
                                <img src={req.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.sender_id}`} alt="" />
                              </div>
                              <span className="font-bold text-sm">{req.sender?.display_name || 'Eco User'}</span>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => respondToRequest(req.id, 'ACCEPTED')} className="p-2 bg-neon-green text-black rounded-lg hover:scale-105 transition-transform"><Check size={16} /></button>
                              <button onClick={() => respondToRequest(req.id, 'BLOCKED')} className="p-2 bg-white/5 text-white/40 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"><X size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search / Add Section */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-txt-muted">Connect Globally</h4>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for username or impact code..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-neon-green outline-none transition-all"
                      />
                      <button 
                        disabled={loading}
                        onClick={async () => {
                          if (!searchQuery.trim()) return;
                          setLoading(true);
                          try {
                            let targetId = searchQuery.trim();
                            
                            // If it's not a UUID, search by username
                            if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)) {
                              const { data, error } = await supabase
                                .from('profiles')
                                .select('id')
                                .eq('username', targetId)
                                .single();
                                
                              if (error || !data) {
                                toast.error("User not found. Check exact username.");
                                setLoading(false);
                                return;
                              }
                              targetId = data.id;
                            }
                            
                            await sendFriendRequest(targetId);
                            setSearchQuery('');
                          } catch (err) {
                            toast.error("Failed to process request.");
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="btn-primary px-6 py-3 disabled:opacity-50"
                      >
                        <Sparkles size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Friends List Section */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-txt-muted">Your Network</h4>
                    {friends.length === 0 ? (
                      <div className="text-center py-10 bg-white/20 rounded-3xl border border-dashed border-white/10">
                        <Users className="mx-auto text-white/10 mb-2" size={32} />
                        <p className="text-sm text-white/40">No connections established yet.</p>
                        <p className="text-[10px] text-white/20 uppercase mt-1">Start connecting to unify the world</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {friends.map(friend => (
                          <div key={friend.id} className="glass-card p-4 flex items-center gap-4 hover:border-neon-green/30 transition-colors cursor-pointer group">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 overflow-hidden relative">
                              <img src={friend.friend_profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`} alt="" />
                              <div className="absolute bottom-1 right-1 w-2 h-2 bg-neon-green rounded-full shadow-[0_0_5px_#39FF14]" />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm group-hover:text-neon-green transition-colors">{friend.friend_profile?.display_name || 'Eco Activist'}</p>
                              <p className="text-[10px] text-white/40 uppercase tracking-widest flex items-center gap-1">
                                <Zap size={8} className="text-neon-green" /> Level {Math.floor(Math.random() * 20) + 1}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Account & Security Tab */}
              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-black mb-6 text-txt-primary">Account & Security</h3>
                  <div className="space-y-4">
                    <button 
                      disabled={loading}
                      onClick={() => handleUpdateField('username', window.prompt("New Username:", profile?.username) || '')}
                      className="w-full flex items-center justify-between p-5 bg-txt-primary/5 rounded-xl border border-dark-border/10 hover:border-dark-border/20 transition-colors group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <UserIcon className="text-txt-muted group-hover:text-neon-cyan transition-colors" size={20} />
                        <span className="font-bold text-txt-primary">Change Username</span>
                      </div>
                      <span className="text-sm text-txt-muted">{profile?.username || 'Not set'}</span>
                    </button>

                    <button 
                      disabled={loading}
                      onClick={() => handleUpdateField('display_name', window.prompt("New Display Name:", profile?.display_name) || '')}
                      className="w-full flex items-center justify-between p-5 bg-txt-primary/5 rounded-xl border border-dark-border/10 hover:border-dark-border/20 transition-colors group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <UserIcon className="text-txt-muted group-hover:text-neon-cyan transition-colors" size={20} />
                        <span className="font-bold text-txt-primary">Update Display Name</span>
                      </div>
                      <span className="text-sm text-txt-muted">{profile?.display_name || 'Not set'}</span>
                    </button>

                    <button 
                      disabled={loading}
                      onClick={handleUpdatePassword}
                      className="w-full flex items-center justify-between p-5 bg-txt-primary/5 rounded-xl border border-dark-border/10 hover:border-dark-border/20 transition-colors group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="text-txt-muted group-hover:text-neon-cyan transition-colors" size={20} />
                        <span className="font-bold text-txt-primary">Change Password</span>
                      </div>
                      <span className="text-sm text-txt-muted">••••••••</span>
                    </button>

                    <button 
                      disabled={loading}
                      onClick={handleUpdateEmail}
                      className="w-full flex items-center justify-between p-5 bg-txt-primary/5 rounded-xl border border-dark-border/10 hover:border-dark-border/20 transition-colors group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <Monitor className="text-txt-muted group-hover:text-neon-cyan transition-colors" size={20} />
                        <span className="font-bold text-txt-primary">Update Email Address</span>
                      </div>
                      <span className="text-sm text-txt-muted">{user?.email}</span>
                    </button>

                    <button 
                      disabled={loading}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-between p-5 bg-txt-primary/5 rounded-xl border border-dark-border/10 hover:border-dark-border/20 transition-colors group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <Camera className="text-txt-muted group-hover:text-neon-cyan transition-colors" size={20} />
                        <span className="font-bold text-txt-primary">Change Profile Picture</span>
                      </div>
                    </button>

                    <div className="pt-8 mt-8 border-t border-red-500/20">
                      <button 
                        disabled={loading}
                        onClick={handleDeleteAccount}
                        className="w-full flex items-center justify-center p-5 bg-red-500/10 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 transition-all group font-black uppercase tracking-widest disabled:opacity-50"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Membership Tab */}
              {activeTab === 'membership' && (
                <motion.div
                  key="membership"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase tracking-tighter">Current Membership</h3>
                    <PremiumBadge tier={subscription?.plan || 'BRONZE'} />
                  </div>

                  <div className="glass-card p-8 bg-txt-primary/5 border-dark-border/10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-neon-green/5 blur-[50px] rounded-full group-hover:bg-neon-green/10 transition-all" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                      <div className={`w-24 h-24 rounded-3xl flex items-center justify-center border ${
                        subscription?.plan === 'GOLD' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                        subscription?.plan === 'SILVER' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-500' :
                        'bg-green-500/10 border-green-500/30 text-green-500'
                      }`}>
                        {subscription?.plan === 'GOLD' ? <Crown size={40} /> : 
                         subscription?.plan === 'SILVER' ? <Sparkles size={40} /> : 
                         <Globe size={40} />}
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-2xl font-black mb-1 uppercase tracking-tight text-txt-primary">{subscription?.plan || 'BRONZE'}</h4>
                        <p className="text-txt-muted text-xs font-bold uppercase tracking-widest mb-4">
                          {subscription?.status === 'ACTIVE' ? `Active until ${new Date(subscription.expiry_date).toLocaleDateString()}` : 'Standard Environmental Access'}
                        </p>
                        
                        <Link 
                          to="/premium"
                          className="inline-flex items-center gap-2 px-6 py-2 bg-txt-primary/10 hover:bg-txt-primary/20 text-txt-primary text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                          {subscription?.plan ? 'Manage / Upgrade' : 'Explore Premium Plans'}
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-txt-primary/5 rounded-2xl border border-dark-border/10 space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-txt-muted flex items-center gap-2">
                        <Shield size={12} className="text-neon-green" />
                        Membership Perks
                      </h5>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-2 text-xs font-medium text-txt-secondary">
                          <Check size={14} className="text-neon-green" />
                          Unlimited verification uploads
                        </li>
                        <li className="flex items-center gap-2 text-xs font-medium text-txt-secondary">
                          <Check size={14} className={subscription?.plan !== 'BRONZE' ? 'text-neon-green' : 'text-txt-muted'} />
                          Premium AI capabilities
                        </li>
                        <li className="flex items-center gap-2 text-xs font-medium text-txt-secondary">
                          <Check size={14} className={subscription?.plan === 'GOLD' ? 'text-neon-green' : 'text-txt-muted'} />
                          Elite reward multipliers
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-6 bg-txt-primary/5 rounded-2xl border border-dark-border/10 space-y-4">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-txt-muted flex items-center gap-2">
                        <Zap size={12} className="text-cyan-400" />
                        Support Status
                      </h5>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-xs font-bold mb-1 text-txt-primary">Impact Priority</p>
                          <div className="h-1 bg-txt-primary/10 rounded-full overflow-hidden">
                            <div className={`h-full bg-cyan-500 ${
                              subscription?.plan === 'GOLD' ? 'w-full' : 
                              subscription?.plan === 'SILVER' ? 'w-2/3' : 'w-1/3'
                            }`} />
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                          {subscription?.plan === 'GOLD' ? 'Elite' : 
                           subscription?.plan === 'SILVER' ? 'Priority' : 'Normal'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Profile;

