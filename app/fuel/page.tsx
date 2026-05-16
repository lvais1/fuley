'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Sparkles, X, Clock } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAppStore } from '@/lib/store';
import { createFuelQuery } from '@/lib/ai-coach';
import { formatTime } from '@/lib/utils';
import type { FuelQuery } from '@/types';

const QUICK_PROMPTS = [
  'I have a Pull workout in 90 minutes',
  'I have Legs in 45 minutes',
  "I'm hungry but training soon",
  'I feel heavy after eating',
  'I need energy for my workout',
  'I just ate pasta, can I train?',
  'I feel low on energy',
  'What should I eat for Push day?',
];

const URGENCY_STYLES = {
  now: {
    border: 'rgba(0,255,148,0.3)',
    bg: 'rgba(0,255,148,0.06)',
    badge: 'rgba(0,255,148,0.15)',
    color: 'var(--color-green)',
    label: 'Eat Now',
    glow: '0 0 24px rgba(0,255,148,0.15)',
  },
  soon: {
    border: 'rgba(255,107,53,0.3)',
    bg: 'rgba(255,107,53,0.06)',
    badge: 'rgba(255,107,53,0.15)',
    color: 'var(--color-orange)',
    label: 'Eat Soon',
    glow: '0 0 24px rgba(255,107,53,0.15)',
  },
  wait: {
    border: 'rgba(255,59,92,0.3)',
    bg: 'rgba(255,59,92,0.06)',
    badge: 'rgba(255,59,92,0.15)',
    color: 'var(--color-red)',
    label: 'Wait',
    glow: '0 0 24px rgba(255,59,92,0.15)',
  },
};

function ResponseCard({ query }: { query: FuelQuery }) {
  const r = query.response;
  const style = URGENCY_STYLES[r.urgency];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="mb-4 rounded-3xl overflow-hidden"
      style={{ border: `1px solid ${style.border}`, background: style.bg, boxShadow: style.glow }}
    >
      {/* Card header */}
      <div className="px-4 pt-4 pb-3 flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl"
          style={{ background: style.badge }}
        >
          {r.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
              style={{ background: style.badge, color: style.color }}
            >
              {style.label}
            </span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>
              {formatTime(query.createdAt)}
            </span>
          </div>
          <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-3)' }}>
            "{query.text}"
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="px-4 pb-3">
        <p className="text-sm font-semibold leading-relaxed mb-3" style={{ color: 'var(--color-text-1)' }}>
          {r.recommendation}
        </p>

        {/* Timing */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
          style={{ background: `${style.color}12`, border: `1px solid ${style.color}20` }}
        >
          <Clock size={13} style={{ color: style.color }} />
          <span className="text-xs font-semibold" style={{ color: style.color }}>{r.timing}</span>
        </div>

        {/* What to eat */}
        {r.whatToEat.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-green)' }}>
              ✓ What to eat
            </p>
            <div className="space-y-1">
              {r.whatToEat.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: 'var(--color-green)' }}
                  />
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-2)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What to avoid */}
        {r.toAvoid.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-red)' }}>
              ✗ Avoid
            </p>
            <div className="space-y-1">
              {r.toAvoid.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: 'var(--color-red)' }}
                  />
                  <span className="text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function FuelPage() {
  const router = useRouter();
  const { foodEntries, todayWorkoutType, fuelHistory, addFuelQuery } = useAppStore();
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleAsk(text: string) {
    if (!text.trim() || isThinking) return;
    setInput('');
    setIsThinking(true);

    // Simulate AI "thinking" delay for premium feel
    await new Promise(r => setTimeout(r, 700 + Math.random() * 400));

    const query = createFuelQuery(text.trim(), foodEntries, todayWorkoutType);
    addFuelQuery(query);
    setIsThinking(false);
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-bg)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-[100px] opacity-15"
          style={{ background: 'var(--color-green)' }}
        />
      </div>

      <div className="relative px-5 pt-14">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-2xl flex items-center justify-center glass"
          >
            <ArrowLeft size={18} style={{ color: 'var(--color-text-2)' }} />
          </button>
          <div>
            <h1 className="text-xl font-black">What Should I Eat Now?</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-2)' }}>Ask your AI fueling coach</p>
          </div>
        </div>

        {/* Input */}
        <motion.div
          className="glass rounded-3xl p-4 mb-4"
          animate={{
            borderColor: isThinking ? 'rgba(0,255,148,0.35)' : 'rgba(255,255,255,0.08)',
            boxShadow: isThinking ? '0 0 20px rgba(0,255,148,0.12)' : 'none',
          }}
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={isThinking ? { rotate: 360 } : { rotate: 0 }}
              transition={isThinking ? { duration: 1.2, repeat: Infinity, ease: 'linear' } : {}}
            >
              <Sparkles size={18} style={{ color: isThinking ? 'var(--color-green)' : 'var(--color-text-3)' }} />
            </motion.div>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk(input)}
              placeholder="Ask anything — e.g. 'Pull in 90 min'"
              disabled={isThinking}
              className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[rgba(255,255,255,0.2)]"
              style={{ color: 'var(--color-text-1)' }}
            />
            <div className="flex items-center gap-2">
              {input.length > 0 && !isThinking && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={() => setInput('')}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)' }}
                >
                  <X size={12} style={{ color: 'var(--color-text-3)' }} />
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAsk(input)}
                disabled={!input.trim() || isThinking}
                className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all"
                style={{
                  background: input.trim() && !isThinking ? 'var(--color-green)' : 'rgba(255,255,255,0.06)',
                  color: input.trim() && !isThinking ? '#080B12' : 'var(--color-text-3)',
                }}
              >
                <Send size={15} />
              </motion.button>
            </div>
          </div>

          {/* Thinking animation */}
          <AnimatePresence>
            {isThinking && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--color-green)' }}
                        animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-green)' }}>
                    Analyzing your fuel state...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick prompts */}
        {fuelHistory.length === 0 && !isThinking && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-3)' }}>
              Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map(p => (
                <motion.button
                  key={p}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAsk(p)}
                  className="px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'var(--color-text-2)',
                  }}
                >
                  {p}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Responses */}
        <div>
          {fuelHistory.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
                Recent advice
              </p>
              {fuelHistory.length > 1 && (
                <p className="text-[10px]" style={{ color: 'var(--color-text-3)' }}>
                  {fuelHistory.length} queries
                </p>
              )}
            </div>
          )}
          {fuelHistory.map(q => (
            <ResponseCard key={q.id} query={q} />
          ))}
        </div>

        {/* Empty state */}
        {fuelHistory.length === 0 && !isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center py-12 text-center"
          >
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.2)' }}
            >
              <Sparkles size={28} style={{ color: 'var(--color-green)' }} />
            </div>
            <p className="text-base font-bold mb-2">Your AI Fueling Coach</p>
            <p className="text-sm max-w-64 leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
              Ask anything about what to eat, when to eat, and how to fuel your workout.
            </p>
          </motion.div>
        )}
      </div>

      <Navigation />
    </div>
  );
}
