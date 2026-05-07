import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Lock, CheckCircle, Zap } from 'lucide-react';
import { ProgressRing } from './ProgressRing';
import { LessonRow } from './LessonRow';
import type { EnrichedModule } from '../../types/curriculum';

interface Props { module: EnrichedModule; index: number }

export const ModuleCard = ({ module, index }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={[
        'rounded-2xl border overflow-hidden',
        module.isLocked ? 'border-border opacity-60' : 'border-border bg-bg-card',
      ].join(' ')}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-bg-elevated/50 transition-colors"
        onClick={() => !module.isLocked && setOpen(o => !o)}
        disabled={module.isLocked}
      >
        <ProgressRing percent={module.completionPercent} size={48} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{module.title}</span>
            {module.isCompleted && (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle size={12} /> Completed
              </span>
            )}
            {module.isLocked && <Lock size={13} className="text-gray-500" />}
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
            <span>{module.lessons.length} lessons</span>
            <span className="flex items-center gap-1 text-accent-gold">
              <Zap size={10} /> {module.xpReward} XP
            </span>
          </div>
        </div>

        {!module.isLocked && (
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} className="text-gray-400" />
          </motion.div>
        )}
      </button>

      {/* ── Lesson list ────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-2 border-t border-border pt-3">
              {module.lessons.map(lesson => (
                <LessonRow key={lesson.id} lesson={lesson} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
