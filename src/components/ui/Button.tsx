import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'hover:bg-white/5 text-white/60 hover:text-white transition-all px-4 py-2 rounded-xl font-black uppercase tracking-widest text-[10px]',
    outline: 'border border-white/10 hover:border-neon-green/30 text-white transition-all px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]'
  };

  const sizes = {
    sm: 'px-4 py-2 text-[8px]',
    md: 'px-6 py-3 text-[10px]',
    lg: 'px-10 py-5 text-[12px]'
  };

  return (
    <button 
      className={cn(variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
