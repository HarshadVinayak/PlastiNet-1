import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  BarChart3, 
  Database, 
  ShieldCheck, 
  Zap, 
  Clock, 
  AlertCircle,
  LayoutDashboard,
  Cpu
} from 'lucide-react';
import { usageService, ApiUsageLog } from '../services/usage';

const QuotaDashboard = () => {
  const [logs, setLogs] = useState<ApiUsageLog[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('api_telemetry') || '[]');
    setLogs(data.reverse());
    setStats(usageService.getStats());
  }, []);

  const totalRequests = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <LayoutDashboard className="text-neon-green" /> System Telemetry
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            Managed by Chloe Intelligence • Real-time Monitoring
          </p>
        </div>
        <div className="flex gap-4">
          <div className="px-4 py-2 glass-card border-neon-green/20 bg-neon-green/5 text-neon-green text-xs font-black">
            STABLE v1.0.4
          </div>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Zap className="text-yellow-400" />}
          label="API Requests"
          value={totalRequests.toString()}
          trend="+12% today"
        />
        <StatCard 
          icon={<Cpu className="text-neon-cyan" />}
          label="System Health"
          value="99.9%"
          trend="OPTIMAL"
        />
        <StatCard 
          icon={<Clock className="text-purple-400" />}
          label="Avg Latency"
          value="142ms"
          trend="-20ms improvement"
        />
        <StatCard 
          icon={<Database className="text-orange-400" />}
          label="Storage Usage"
          value="4.2 GB"
          trend="8% of quota"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Service Quotas */}
        <div className="lg:col-span-2 glass-card p-8 border-white/5 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <BarChart3 size={20} className="text-neon-green" /> Service Consumption
          </h3>
          <div className="space-y-6">
            <QuotaItem label="YouTube Data v3" value={stats['YouTube'] || 0} limit={10000} color="bg-red-500" />
            <QuotaItem label="Google Maps (Places/JS)" value={stats['Maps'] || 0} limit={5000} color="bg-blue-500" />
            <QuotaItem label="Cloud Vision" value={stats['Vision'] || 0} limit={1000} color="bg-neon-green" />
            <QuotaItem label="Custom Search" value={stats['Search'] || 0} limit={100} color="bg-orange-500" />
          </div>
        </div>

        {/* Live Logs */}
        <div className="glass-card p-8 border-white/5 flex flex-col h-[500px]">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
            <Activity size={20} className="text-neon-cyan" /> Live Requests
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
            {logs.length > 0 ? logs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-[10px]">
                <div className="flex flex-col">
                  <span className="font-bold text-white/80">{log.service}</span>
                  <span className="text-white/40 truncate max-w-[120px]">{log.endpoint}</span>
                </div>
                <div className="text-right">
                  <div className={`font-mono ${log.status < 400 ? 'text-neon-green' : 'text-red-500'}`}>
                    {log.status}
                  </div>
                  <div className="text-white/20">{log.latency}ms</div>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20 space-y-4">
                <ShieldCheck size={48} />
                <p className="text-xs uppercase font-black tracking-widest">No request logs yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend }: any) => (
  <div className="glass-card p-6 border-white/5 hover:border-white/10 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-2xl">{icon}</div>
      <div className="text-[10px] font-black text-neon-green bg-neon-green/10 px-2 py-1 rounded-full uppercase tracking-tighter">
        {trend}
      </div>
    </div>
    <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{label}</p>
    <p className="text-3xl font-black mt-1">{value}</p>
  </div>
);

const QuotaItem = ({ label, value, limit, color }: any) => {
  const percent = Math.min((value / limit) * 100, 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
        <span className="text-white/60">{label}</span>
        <span className="text-white/40">{value} / {limit}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          className={`h-full ${color} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
        />
      </div>
    </div>
  );
};

export default QuotaDashboard;
