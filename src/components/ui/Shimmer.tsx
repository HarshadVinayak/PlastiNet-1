import { cn } from '../../utils/cn';

interface ShimmerProps {
  className?: string;
  delay?: number;
}

export function Shimmer({ className, delay = 0 }: ShimmerProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-white/5 rounded-2xl",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    />
  );
}
