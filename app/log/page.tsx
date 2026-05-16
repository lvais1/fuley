'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Clock, Sparkles, X } from 'lucide-react';
import Navigation from '@/components/Navigation';
import MealCard from '@/components/MealCard';
import { useAppStore } from '@/lib/store';
import { analyzeFood } from '@/lib/food-analyzer';
import { generateId, minutesSince } from '@/lib/utils';

const QUICK_LOGS = [
  'Chicken and rice',
  '2 eggs and toast',
  'Protein shake and banana',
  'Oatmeal with berries',
  'Greek yogurt',
  'Tuna salad',
  'Pasta with chicken',
  'Rice cakes with peanut butter',
];

const ANALYSIS_MESSAGES = [
  'Estimating macros...',
  'Calculating digestion load...',
  'Checking carb availability...',
  'Building readiness impact...',
];

export default function LogPage() {
  const { foodEntries, addFoodEntry, removeFoodEntry } = useAppStore();
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const recentEntries = foodEntries.filter(e => minutesSince(e.timestamp) <= 480);

  const logMeal = async (text: string) => {
    if (!text.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisStep(0);

    // Simulate progressive analysis
    for (let i = 0; i < ANALYSIS_MESSAGES.length; i++) {
      await new Promise(r => setTimeout(r, 175));
      setAnalysisStep(i);
    }

    const analysis = analyzeFood(text.trim());
    const entry = {
      id: generateId(),
      text: text.trim(),
      timestamp: new Date().toISOString(),
      analysis,
    };

    addFoodEntry(entry);
    setJustAdded(entry.id);
    setInput('');
    setIsAnalyzing(false);
    setAnalysisStep(0);

    setTimeout(() => setJustAdded(null), 2000);
  };

  const handleSubmit = () => logMeal(input);

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-bg)' }}>
      <div className="px-5 pt-14">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black">Log Fuel</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-2)' }}>
            Describe what you ate — no exact grams needed
          </p>
        </div>

        {/* Input area */}
        <motion.div
          className="glass rounded-3xl p-4 mb-4"
          style={{ border: isAnalyzing ? '1px solid rgba(0,255,148,0.3)' : '1px solid rgba(255,255,255,0.08)' }}
          animate={{ boxShadow: isAnalyzing ? '0 0 20px rgba(0,255,148,0.1)' : 'none' }}
        >
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. chicken and rice, 2 eggs..."
              disabled={isAnalyzing}
              className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[rgba(255,255,255,0.2)]"
              style={{ color: 'var(--color-text-1)' }}
            />
            <div className="flex items-center gap-2">
              {input.length > 0 && !isAnalyzing && (
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
                whileTap={{ scale: 0.92 }}
                onClick={handleSubmit}
                disabled={!input.trim() || isAnalyzing}
                className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all"
                style={{
                  background: input.trim() && !isAnalyzing ? 'var(--color-green)' : 'rgba(255,255,255,0.06)',
                  color: input.trim() && !isAnalyzing ? '#080B12' : 'var(--color-text-3)',
                }}
              >
                <Send size={16} />
              </motion.button>
            </div>
          </div>

          {/* Analysis progress */}
          <AnimatePresence>
            {isAnalyzing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-3 mt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2 mb-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles size={14} style={{ color: 'var(--color-green)' }} />
                    </motion.div>
                    <span className="text-xs font-medium" style={{ color: 'var(--color-green)' }}>
                      {ANALYSIS_MESSAGES[analysisStep]}
                    </span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--color-green)' }}
                      animate={{ width: `${((analysisStep + 1) / ANALYSIS_MESSAGES.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quick log chips */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-3)' }}>
            Quick log
          </p>
          <div className="flex flex-wrap gap-2">
            {QUICK_LOGS.map(q => (
              <motion.button
                key={q}
                whileTap={{ scale: 0.95 }}
                onClick={() => logMeal(q)}
                disabled={isAnalyzing}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--color-text-2)',
                }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Success toast */}
        <AnimatePresence>
          {justAdded && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 p-3 rounded-2xl mb-4"
              style={{ background: 'rgba(0,255,148,0.08)', border: '1px solid rgba(0,255,148,0.2)' }}
            >
              <span style={{ color: 'var(--color-green)' }}>✓</span>
              <span className="text-sm font-medium" style={{ color: 'var(--color-text-1)' }}>
                Meal logged and analyzed
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's meals */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} style={{ color: 'var(--color-text-3)' }} />
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-3)' }}>
              Today&apos;s fuel log ({recentEntries.length})
            </h2>
          </div>

          {recentEntries.length === 0 ? (
            <EmptyState />
          ) : (
            recentEntries.map(entry => (
              <MealCard key={entry.id} entry={entry} onRemove={removeFoodEntry} />
            ))
          )}
        </div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-3)' }}>
            <span style={{ color: 'var(--color-green)', fontWeight: 600 }}>💡 Tip: </span>
            You don&apos;t need exact weights. Just describe your meal naturally — &ldquo;big bowl of pasta&rdquo; or &ldquo;light chicken salad&rdquo; works perfectly.
          </p>
        </motion.div>
      </div>

      <Navigation />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center py-12 text-center"
    >
      <span className="text-5xl mb-4">🍽️</span>
      <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-text-2)' }}>Nothing logged yet today</p>
      <p className="text-xs max-w-48" style={{ color: 'var(--color-text-3)' }}>
        Type your last meal above or pick from quick log
      </p>
    </motion.div>
  );
}
