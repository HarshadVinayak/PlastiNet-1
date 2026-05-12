import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Zap } from 'lucide-react';

interface SeasonalEventProps {
  title: string;
  endDate: Date;
  multiplier: number;
}

const SeasonalEventBanner = ({ title, endDate, multiplier }: SeasonalEventProps) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(endDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(endDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [endDate]);

  if (timeLeft.total <= 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-neon-green/20 via-blue-500/20 to-neon-cyan/20 border border-white/10 rounded-2xl p-4 md:p-6 mb-8 relative overflow-hidden group cursor-pointer"
    >
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-black/40 rounded-xl">
            <Calendar className="text-neon-green" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="text-xs font-bold uppercase tracking-widest text-neon-green">Live Event</span>
              <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-[10px] font-bold rounded flex items-center gap-1">
                <Zap size={10} /> {multiplier}x PLC
              </span>
            </div>
            <h2 className="text-xl font-black mt-1">{title}</h2>
          </div>
        </div>

        <div className="flex gap-2 font-mono font-bold text-xl">
          <TimeBox value={timeLeft.days} label="DAYS" />
          <span className="text-white/40">:</span>
          <TimeBox value={timeLeft.hours} label="HRS" />
          <span className="text-white/40">:</span>
          <TimeBox value={timeLeft.minutes} label="MIN" />
          <span className="text-white/40">:</span>
          <TimeBox value={timeLeft.seconds} label="SEC" />
        </div>
      </div>
    </motion.div>
  );
};

const TimeBox = ({ value, label }: { value: number, label: string }) => (
  <div className="flex flex-col items-center min-w-[3.5rem]">
    <div className="bg-black/40 px-3 py-2 rounded-lg border border-white/10 w-full text-center">
      {value.toString().padStart(2, '0')}
    </div>
    <span className="text-[9px] text-white/40 mt-1 uppercase tracking-wider">{label}</span>
  </div>
);

function getTimeLeft(endDate: Date) {
  const total = endDate.getTime() - Date.now();
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds };
}

export default SeasonalEventBanner;
