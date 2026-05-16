import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, Leaf, ArrowUpRight, ArrowLeft, Loader2 } from 'lucide-react';

import { useEffect, useState } from 'react';
import { impactService, RegionalImpact } from '../services/impactService';
import { useLocationStore } from '../stores/locationStore';

const ImpactAnalytics = () => {
  const navigate = useNavigate();
  const { district, pincode } = useLocationStore();
  const [data, setData] = useState<RegionalImpact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImpact = async () => {
      setLoading(true);
      const result = await impactService.getRegionalImpact(district, pincode);
      setData(result);
      setLoading(false);
    };
    loadImpact();
  }, [district, pincode]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-white/40">
        <Loader2 className="animate-spin text-neon-green" size={48} />
        <p className="font-black uppercase tracking-widest animate-pulse">Aggregating Regional Proof...</p>
      </div>
    );
  }

  if (!data) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-7xl mx-auto space-y-8 pb-12"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-4 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-widest">Back to Map</span>
          </button>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic">Regional Impact: {data.district}</h1>
          <p className="text-white/60">Live environmental intelligence for PIN: <span className="text-neon-cyan font-bold">{data.pincode}</span></p>
        </div>
        <button className="btn-secondary py-2 hidden md:block">Download {data.district} Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Plastic Removed" value={`${data.totalPlasticKg.toLocaleString()} kg`} trend="+18% vs last month" icon={<Leaf />} />
        <StatCard title="CO2 Emissions Offset" value={`${data.co2OffsetKg.toLocaleString()} kg`} trend="+12% vs last month" icon={<TrendingUp />} color="text-neon-cyan" />
        <StatCard title="Local Active Contributors" value={data.activeContributors.toLocaleString()} trend="+45 new this week" icon={<Users />} color="text-blue-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase italic">
            <TrendingUp className="text-neon-green" /> 6-Month Predictive Trajectory ({data.district})
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPlastic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f3ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" />
                <YAxis stroke="rgba(255,255,255,0.2)" />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="plastic" stroke="#39FF14" fillOpacity={1} fill="url(#colorPlastic)" name="Plastic (kg)" />
                <Area type="monotone" dataKey="co2" stroke="#00f3ff" fillOpacity={1} fill="url(#colorCo2)" name="CO2 Offset (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4 uppercase italic">Weekly Participation</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyParticipation}>
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  />
                  <Bar dataKey="users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6 border-neon-cyan/20 bg-neon-cyan/5">
            <h3 className="font-bold mb-2 flex items-center gap-2 uppercase italic">
              <ArrowUpRight className="text-neon-cyan" /> AI Forecast: {data.district}
            </h3>
            <p className="text-sm text-white/70 leading-relaxed">
              Based on current momentum, <span className="text-white font-bold">{data.district}</span> is projected to reach <span className="font-bold text-neon-cyan">carbon neutrality</span> for plastic waste within 4.2 months. 
              Implementing a School-Mode drive in PIN <span className="text-neon-cyan font-bold">{data.pincode}</span> could accelerate this by 18%.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, trend, icon, color = "text-neon-green" }: any) => (
  <div className="glass-card p-6 border-white/5 hover:border-white/20 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <h4 className="text-white/60 font-semibold text-sm uppercase tracking-wider">{title}</h4>
      <div className={`p-2 bg-white/5 rounded-lg ${color}`}>{icon}</div>
    </div>
    <p className="text-3xl font-black mb-2">{value}</p>
    <p className="text-sm text-white/40">{trend}</p>
  </div>
);

export default ImpactAnalytics;
