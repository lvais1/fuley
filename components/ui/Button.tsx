'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  fullWidth,
  className,
  type = 'button',
}: ButtonProps) {
  const base = 'relative inline-flex items-center justify-center font-semibold rounded-2xl transition-all select-none overflow-hidden';

  const variants = {
    primary: 'bg-green text-bg shadow-[0_0_20px_rgba(0,255,148,0.3)] hover:shadow-[0_0_30px_rgba(0,255,148,0.5)] active:scale-[0.97]',
    secondary: 'glass text-text-1 hover:bg-[rgba(255,255,255,0.08)] active:scale-[0.97]',
    ghost: 'text-text-2 hover:text-text-1 hover:bg-[rgba(255,255,255,0.05)] active:scale-[0.97]',
    danger: 'bg-red text-white shadow-[0_0_20px_rgba(255,59,92,0.3)] hover:shadow-[0_0_30px_rgba(255,59,92,0.5)] active:scale-[0.97]',
  };

  const sizes = {
    sm: 'h-8 px-4 text-sm gap-1.5',
    md: 'h-11 px-5 text-sm gap-2',
    lg: 'h-13 px-7 text-base gap-2.5',
    xl: 'h-16 px-8 text-lg gap-3',
  };

  return (
    <motion.button
      type={type}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-40 cursor-not-allowed',
        className,
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {children}
        </span>
      ) : children}
    </motion.button>
  );
}
