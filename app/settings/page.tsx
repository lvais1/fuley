'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Bell, Palette, Globe, User, Brain, Trash2,
  ChevronRight, Check, Moon, Sun, Monitor,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import { useAppStore } from '@/lib/store';
import type { Theme, Language, CoachingTone, Goal } from '@/types';

// ─── Reusable toggle ───────────────────────────────────────────────────────
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <motion.button
      onClick={onToggle}
      className="relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300"
      style={{
        background: enabled ? 'var(--color-green)' : 'rgba(255,255,255,0.12)',
        boxShadow: enabled ? '0 0 12px rgba(0,255,148,0.4)' : 'none',
      }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full"
        style={{ background: enabled ? '#080B12' : 'rgba(255,255,255,0.5)' }}
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  );
}

// ─── Section header ────────────────────────────────────────────────────────
function SectionHeader({ icon, label, color = 'var(--color-green)' }: {
  icon: React.ReactNode; label: string; color?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-3 px-1">
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>
      <span className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-3)' }}>
        {label}
      </span>
    </div>
  );
}

// ─── Toggle row ────────────────────────────────────────────────────────────
function ToggleRow({
  label, detail, enabled, onToggle, accent = 'var(--color-green)',
}: { label: string; detail: string; enabled: boolean; onToggle: () => void; accent?: string }) {
  return (
    <motion.div
      className="flex items-center justify-between p-4 rounded-2xl mb-2"
      style={{
        background: enabled ? `${accent}0A` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${enabled ? `${accent}25` : 'rgba(255,255,255,0.06)'}`,
      }}
      animate={{ borderColor: enabled ? `${accent}30` : 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex-1 min-w-0 pr-4">
        <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--color-text-1)' }}>{label}</p>
        <p className="text-xs leading-snug" style={{ color: 'var(--color-text-3)' }}>{detail}</p>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </motion.div>
  );
}

// ─── Choice row ───────────────────────────────────────────────────────────
function ChoiceRow<T extends string>({
  label, value, options, onChange, accent = 'var(--color-green)',
}: {
  label: string;
  value: T;
  options: { value: T; label: string; icon?: React.ReactNode }[];
  onChange: (v: T) => void;
  accent?: string;
}) {
  return (
    <div className="p-4 rounded-2xl mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-1)' }}>{label}</p>
      <div className="flex gap-2">
        {options.map(opt => (
          <motion.button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            whileTap={{ scale: 0.94 }}
            className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: value === opt.value ? `${accent}18` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${value === opt.value ? `${accent}45` : 'rgba(255,255,255,0.08)'}`,
              color: value === opt.value ? accent : 'var(--color-text-3)',
              boxShadow: value === opt.value ? `0 0 14px ${accent}20` : 'none',
            }}
          >
            {opt.icon && <span className="text-lg">{opt.icon}</span>}
            {opt.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Profile field ─────────────────────────────────────────────────────────
function ProfileField({
  label, value, onChange, type = 'text', suffix,
}: { label: string; value: string | number; onChange: (v: string) => void; type?: string; suffix?: string }) {
  return (
    <div className="p-4 rounded-2xl mb-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--color-text-3)' }}>{label}</p>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm font-semibold outline-none"
          style={{ color: 'var(--color-text-1)' }}
        />
        {suffix && <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>{suffix}</span>}
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const router = useRouter();
  const { settings, user, updateSettings, updateProfile, reset } = useAppStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  // Local profile state
  const [localName, setLocalName] = useState(user?.name || '');
  const [localAge, setLocalAge] = useState(String(user?.age || ''));
  const [localWeight, setLocalWeight] = useState(String(user?.weightKg || ''));
  const [localGoal, setLocalGoal] = useState<Goal>(user?.goal || 'maintenance');

  const n = settings.notifications;
  const c = settings.coaching;

  function saveProfile() {
    updateProfile({
      name: localName,
      age: parseInt(localAge) || user?.age || 25,
      weightKg: parseFloat(localWeight) || user?.weightKg || 75,
      goal: localGoal,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function handleReset() {
    reset();
    router.replace('/onboarding');
  }

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--color-bg)' }}>
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 right-0 w-64 h-64 rounded-full blur-[100px] opacity-10"
          style={{ background: 'var(--color-green)' }}
        />
        <div
          className="absolute bottom-20 -left-20 w-48 h-48 rounded-full blur-[80px] opacity-8"
          style={{ background: 'var(--color-orange)' }}
        />
      </div>

      <div className="relative px-5 pt-14">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-2xl flex items-center justify-center glass"
          >
            <ArrowLeft size={18} style={{ color: 'var(--color-text-2)' }} />
          </button>
          <div>
            <h1 className="text-xl font-black">Settings</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-2)' }}>Personalize your AI coach</p>
          </div>
        </div>

        {/* ─── NOTIFICATIONS ─── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <SectionHeader icon={<Bell size={14} />} label="Notifications" color="var(--color-orange)" />
          <ToggleRow
            label="Workout Reminders"
            detail="Daily nudges to stay on track with your training"
            enabled={n.workoutReminders}
            onToggle={() => updateSettings({ notifications: { ...n, workoutReminders: !n.workoutReminders } })}
            accent="var(--color-orange)"
          />
          <ToggleRow
            label="Pre-Workout Meal Alerts"
            detail="Reminds you to eat 90 min before your scheduled session"
            enabled={n.preMealReminders}
            onToggle={() => updateSettings({ notifications: { ...n, preMealReminders: !n.preMealReminders } })}
            accent="var(--color-orange)"
          />
          <ToggleRow
            label="Hydration Reminders"
            detail="Periodic reminders to stay hydrated during the day"
            enabled={n.hydrationReminders}
            onToggle={() => updateSettings({ notifications: { ...n, hydrationReminders: !n.hydrationReminders } })}
            accent="var(--color-orange)"
          />
          <ToggleRow
            label="Workout Window Alerts"
            detail='"Your optimal training window opens in 45 min"'
            enabled={n.workoutWindowAlerts}
            onToggle={() => updateSettings({ notifications: { ...n, workoutWindowAlerts: !n.workoutWindowAlerts } })}
            accent="var(--color-green)"
          />
          <ToggleRow
            label="AI Readiness Alerts"
            detail="Smart alerts when your readiness score changes significantly"
            enabled={n.aiReadinessAlerts}
            onToggle={() => updateSettings({ notifications: { ...n, aiReadinessAlerts: !n.aiReadinessAlerts } })}
            accent="var(--color-green)"
          />
        </motion.section>

        {/* ─── THEME ─── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SectionHeader icon={<Palette size={14} />} label="Appearance" color="var(--color-green)" />
          <ChoiceRow<Theme>
            label="Theme"
            value={settings.theme}
            onChange={theme => updateSettings({ theme })}
            options={[
              { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
              { value: 'light', label: 'Light', icon: <Sun size={16} /> },
              { value: 'system', label: 'System', icon: <Monitor size={16} /> },
            ]}
          />
        </motion.section>

        {/* ─── LANGUAGE ─── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <SectionHeader icon={<Globe size={14} />} label="Language" color="var(--color-green)" />
          <ChoiceRow<Language>
            label="Display Language"
            value={settings.language}
            onChange={language => updateSettings({ language })}
            options={[
              { value: 'en', label: 'English', icon: '🇺🇸' },
              { value: 'he', label: 'עברית', icon: '🇮🇱' },
            ]}
          />
          <p className="text-xs px-1 mt-1" style={{ color: 'var(--color-text-3)' }}>
            Hebrew enables full right-to-left layout across the app.
          </p>
        </motion.section>

        {/* ─── ACCOUNT ─── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <SectionHeader icon={<User size={14} />} label="Profile" color="var(--color-text-2)" />

          <ProfileField label="Name" value={localName} onChange={setLocalName} />
          <ProfileField label="Age" value={localAge} onChange={setLocalAge} type="number" suffix="years" />
          <ProfileField label="Weight" value={localWeight} onChange={setLocalWeight} type="number" suffix="kg" />

          <ChoiceRow<Goal>
            label="Training Goal"
            value={localGoal}
            onChange={setLocalGoal}
            options={[
              { value: 'cutting', label: 'Cut' },
              { value: 'maintenance', label: 'Maintain' },
              { value: 'lean_bulk', label: 'Bulk' },
            ]}
            accent="var(--color-green)"
          />

          <motion.button
            onClick={saveProfile}
            whileTap={{ scale: 0.97 }}
            className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm mt-2 transition-all"
            style={{
              background: saved ? 'rgba(0,255,148,0.15)' : 'rgba(255,255,255,0.06)',
              border: saved ? '1px solid rgba(0,255,148,0.4)' : '1px solid rgba(255,255,255,0.08)',
              color: saved ? 'var(--color-green)' : 'var(--color-text-2)',
            }}
          >
            <AnimatePresence mode="wait">
              {saved ? (
                <motion.span
                  key="saved"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Check size={16} /> Saved
                </motion.span>
              ) : (
                <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Save Profile
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.section>

        {/* ─── AI COACHING ─── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <SectionHeader icon={<Brain size={14} />} label="AI Coach" color="var(--color-green)" />

          <ChoiceRow<CoachingTone>
            label="Coaching Tone"
            value={c.tone}
            onChange={tone => updateSettings({ coaching: { ...c, tone } })}
            options={[
              { value: 'aggressive', label: 'Intense' },
              { value: 'balanced', label: 'Balanced' },
              { value: 'gentle', label: 'Gentle' },
            ]}
          />

          <ChoiceRow<'low' | 'medium' | 'high'>
            label="Recommendation Frequency"
            value={c.recommendationFrequency}
            onChange={v => updateSettings({ coaching: { ...c, recommendationFrequency: v } })}
            options={[
              { value: 'low', label: 'Minimal' },
              { value: 'medium', label: 'Normal' },
              { value: 'high', label: 'Maximum' },
            ]}
            accent="var(--color-orange)"
          />

          <ChoiceRow<'basic' | 'detailed'>
            label="AI Insight Depth"
            value={c.insightDepth}
            onChange={v => updateSettings({ coaching: { ...c, insightDepth: v } })}
            options={[
              { value: 'basic', label: 'Basic' },
              { value: 'detailed', label: 'Detailed' },
            ]}
          />

          <ToggleRow
            label="Aggressive Reminders"
            detail="More frequent and direct nudges when you're under-fueled"
            enabled={c.aggressiveReminders}
            onToggle={() => updateSettings({ coaching: { ...c, aggressiveReminders: !c.aggressiveReminders } })}
            accent="var(--color-orange)"
          />
        </motion.section>

        {/* ─── DATA ─── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <SectionHeader icon={<Trash2 size={14} />} label="Data" color="var(--color-red)" />

          <AnimatePresence mode="wait">
            {!showResetConfirm ? (
              <motion.button
                key="reset-btn"
                onClick={() => setShowResetConfirm(true)}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-between p-4 rounded-2xl"
                style={{ background: 'rgba(255,59,92,0.06)', border: '1px solid rgba(255,59,92,0.15)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-start" style={{ color: 'var(--color-red)' }}>Reset All Data</p>
                  <p className="text-xs mt-0.5 text-start" style={{ color: 'var(--color-text-3)' }}>
                    Wipe profile, food log, and stats — cannot be undone
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--color-red)' }} />
              </motion.button>
            ) : (
              <motion.div
                key="reset-confirm"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-2xl"
                style={{ background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.3)' }}
              >
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--color-red)' }}>Are you sure?</p>
                <p className="text-xs mb-4" style={{ color: 'var(--color-text-3)' }}>
                  This will permanently delete all your data and return you to onboarding.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                    style={{ background: 'var(--color-red)', color: '#fff' }}
                  >
                    Yes, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold glass"
                    style={{ color: 'var(--color-text-2)' }}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Version */}
        <p className="text-center text-[10px] pb-2" style={{ color: 'var(--color-text-3)' }}>
          FuelReady · AI Workout Readiness Coach · v2.0
        </p>
      </div>

      <Navigation />
    </div>
  );
}
