import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, MapPin, Zap, AlertTriangle, ArrowRight, GraduationCap, Building2, Trophy, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGPS } from '../hooks/useGPS';

const OrgDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'municipality' | 'school' | 'ngo'>('municipality');
  const { locationLabel, status } = useGPS();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalKg: 0,
    loading: true
  });

  useEffect(() => {
    const fetchOrgStats = async () => {
      // Get real count from Supabase users table
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get real count from messages (proxy for activity)
      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });

      // Get real kg from sector_stats
      const { data: sectorData } = await supabase
        .from('sector_stats')
        .select('total_kg');
      
      const totalKg = sectorData?.reduce((acc, curr) => acc + Number(curr.total_kg), 0) || 0;

      setStats({
        totalUsers: userCount || 0,
        activeToday: msgCount || 0,
        totalKg: totalKg,
        loading: false
      });
    };

    fetchOrgStats();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Versus</span>
          </button>
          <h1 className="text-4xl font-black tracking-tight mb-2">Partner Analytics</h1>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-neon-green">
              <MapPin size={16} />
              <span className="text-sm font-bold uppercase tracking-wider">
                {status === 'ok' && locationLabel ? locationLabel : 'Global Network'}
              </span>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <TabButton active={activeTab === 'municipality'} onClick={() => setActiveTab('municipality')} icon={<Building2 size={14}/>} label="Municipality" />
              <TabButton active={activeTab === 'school'} onClick={() => setActiveTab('school')} icon={<GraduationCap size={14}/>} label="School Mode" />
              <TabButton active={activeTab === 'ngo'} onClick={() => setActiveTab('ngo')} icon={<Users size={14}/>} label="NGO Partners" />
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="btn-secondary py-2">Export Report</button>
          <button className="btn-primary py-2">Manage Sectors</button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'school' ? (
          <SchoolView key="school" />
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >

      {/* Top Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Users" 
          value={stats.loading ? '...' : stats.totalUsers.toLocaleString()} 
          trend="Real-time count" 
          icon={<Users />} 
        />
        <MetricCard 
          title="Activity Log" 
          value={stats.loading ? '...' : stats.activeToday.toLocaleString()} 
          trend="Total interactions" 
          icon={<Zap />} 
        />
        <MetricCard 
          title="Plastic Diverted" 
          value={stats.loading ? '...' : `${(stats.totalKg / 1000).toFixed(2)} Tons`} 
          trend="Verified impact" 
          icon={<TrendingUp />} 
        />
        <MetricCard 
          title="Security" 
          value="Healthy" 
          trend="0 flags today" 
          icon={<AlertTriangle />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="text-neon-cyan" />
              Live Impact Visualization
            </h3>
          </div>
          
          <div className="h-64 flex flex-col items-center justify-center border-b border-l border-white/10 pl-2 pb-2">
            <div className="text-white/20 text-center space-y-2">
              <BarChart3 size={40} className="mx-auto" />
              <p className="font-bold">Real-time sector breakdown coming soon</p>
              <p className="text-xs uppercase tracking-widest">Awaiting sector-specific deployment</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 flex flex-col">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Zap className="text-yellow-400" />
            Live Event Feed
          </h3>
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <div className="text-white/20 space-y-2">
              <Zap size={32} className="mx-auto opacity-20" />
              <p className="text-sm font-bold">No live verifications</p>
              <p className="text-[10px] uppercase tracking-widest">Connect your municipal node</p>
            </div>
          </div>
        </div>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
      active ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.3)]' : 'text-white/40 hover:text-white'
    }`}
  >
    {icon} {label}
  </button>
);

const SchoolView = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8"
  >
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard title="School Nodes" value="Offline" trend="Deployment pending" icon={<GraduationCap />} />
      <MetricCard title="Student Reach" value="0" trend="No active sessions" icon={<Users />} color="text-neon-cyan" />
      <MetricCard title="Prize Pool" value="Locked" trend="Min 5 schools required" icon={<Trophy />} color="text-yellow-400" />
    </div>

    <div className="glass-card p-12 text-center space-y-4">
      <GraduationCap size={48} className="mx-auto text-white/10" />
      <h3 className="text-xl font-bold">School Gamification Mode</h3>
      <p className="text-white/40 max-w-sm mx-auto">
        This portal allows schools to compete in zero-waste challenges. 
        Contact PlastiNet Support to register your institution.
      </p>
    </div>
  </motion.div>
);

const MetricCard = ({ title, value, trend, icon, color = "text-neon-green" }: any) => (
  <div className="glass-card p-6 border-white/5 hover:border-white/20 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <h4 className="text-white/60 font-semibold text-sm uppercase tracking-wider">{title}</h4>
      <div className={`p-2 bg-white/5 rounded-lg ${color}`}>{icon}</div>
    </div>
    <p className="text-3xl font-black mb-2">{value}</p>
    <p className="text-sm text-white/40">{trend}</p>
  </div>
);

export default OrgDashboard;
