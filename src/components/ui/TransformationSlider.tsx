import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface TransformationSliderProps {
  before: string;
  after: string;
  className?: string;
}

export function TransformationSlider({ before, after, className }: TransformationSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? (e as React.TouchEvent).touches[0].clientX : (e as React.MouseEvent).clientX;
    const position = ((x - rect.left) / rect.width) * 100;
    setSliderPos(Math.min(Math.max(position, 0), 100));
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative aspect-video rounded-3xl overflow-hidden cursor-ew-resize select-none border border-white/10", className)}
      onMouseMove={handleMove}
      onTouchMove={handleMove}
    >
      {/* After Image (Background) */}
      <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="After" />
      
      {/* Before Image (Foreground) */}
      <div 
        className="absolute inset-0 h-full overflow-hidden border-r-2 border-neon-green/50 shadow-[5px_0_15px_rgba(57,255,20,0.3)] z-10"
        style={{ width: `${sliderPos}%` }}
      >
        <div 
          style={{ width: containerRef.current?.clientWidth || '100vw', height: '100%' }}
          className="relative"
        >
          <img 
            src={before} 
            className="absolute inset-0 w-full h-full object-cover grayscale" 
            alt="Before" 
          />
        </div>
      </div>


      {/* Slider Handle */}
      <div 
        className="absolute inset-y-0 z-20 pointer-events-none"
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-black/80 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-2xl">
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-neon-green rounded-full animate-pulse" />
            <div className="w-1 h-3 bg-neon-green rounded-full animate-pulse [animation-delay:0.2s]" />
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="absolute bottom-6 left-6 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40 z-20">Raw Material</div>
      <div className="absolute bottom-6 right-6 px-4 py-1.5 rounded-full bg-neon-green/20 backdrop-blur-md border border-neon-green/20 text-[8px] font-black uppercase tracking-widest text-neon-green z-20">Recycled</div>
    </div>
  );
}

export default TransformationSlider;
