import { motion } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { GOAL_OPTIONS } from '../../constants/goalOptions';
import { Button } from '../ui/Button';
import type { LearningGoalId } from '../../types';

interface Props {
  open: boolean;
  goalId: LearningGoalId | null;
  loading: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export const GoalConfirmModal = ({ open, goalId, loading, onConfirm, onBack }: Props) => {
  const goal = GOAL_OPTIONS.find((g) => g.id === goalId);
  if (!goal) return null;

  const Icon = goal.icon;

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onBack(); }}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

        {/* Panel */}
        <Dialog.Content
          className="fixed z-50 inset-0 flex items-end sm:items-center justify-center p-4"
          aria-describedby="goal-confirm-desc"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="bg-bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl"
          >
            {/* Close button */}
            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </Dialog.Close>

            {/* Goal preview */}
            <div className="flex items-center gap-4 mb-5">
              <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-gold/15 text-accent-gold">
                <Icon size={28} />
              </span>
              <div>
                <Dialog.Title className="text-xl font-bold">{goal.label}</Dialog.Title>
                <p className="text-sm text-gray-400">{goal.tagline}</p>
              </div>
            </div>

            <p id="goal-confirm-desc" className="text-sm text-gray-300 leading-relaxed mb-4">
              {goal.description}
            </p>

            <p className="text-xs text-gray-500 mb-1">{goal.suggestedPath}</p>
            <p className="text-xs text-gray-500 mb-6">Commitment: {goal.weeklyCommitment}</p>

            {/* XP bonus callout */}
            <div className="flex items-center gap-3 bg-accent-gold/10 border border-accent-gold/20 rounded-xl px-4 py-3 mb-6">
              <span className="text-2xl">⚡</span>
              <div>
                <p className="text-sm font-semibold text-accent-gold">+{goal.xpBonus} XP Welcome Bonus</p>
                <p className="text-xs text-gray-400">Credited instantly when you confirm this goal.</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={onBack} disabled={loading}>
                Go Back
              </Button>
              <Button className="flex-1" onClick={onConfirm} loading={loading}>
                Confirm Goal
              </Button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
