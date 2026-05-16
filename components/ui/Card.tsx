'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: 'green' | 'orange' | 'red' | 'none';
  animate?: boolean;
  delay?: number;
}

export default function Card({ children, className, onClick, glow = 'none', animate = false, delay = 0 }: CardProps) {
  const glowStyles: Record<string, string> = {
    green: 'border-[rgba(0,255,148,0.2)] shadow-[0_0_20px_rgba(0,255,148,0.08)]',
    orange: 'border-[rgba(255,107,53,0.2)] shadow-[0_0_20px_rgba(255,107,53,0.08)]',
    red: 'border-[rgba(255,59,92,0.2)] shadow-[0_0_20px_rgba(255,59,92,0.08)]',
    none: '',
  };

  const Wrapper = animate ? motion.div : 'div';
  const animProps = animate
    ? { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.4, ease: 'easeOut' as const } }
    : {};

  return (
    <Wrapper
      {...animProps}
      onClick={onClick}
      className={cn(
        'glass rounded-3xl p-4',
        glowStyles[glow],
        onClick && 'cursor-pointer active:scale-[0.98] transition-transform',
        className,
      )}
    >
      {children}
    </Wrapper>
  );
}
