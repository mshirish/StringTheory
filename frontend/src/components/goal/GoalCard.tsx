import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import type { GoalOption } from '../../constants/goalOptions';
import type { LearningGoalId } from '../../types';

interface Props {
  goal: GoalOption;
  selected: boolean;
  onSelect: (id: LearningGoalId) => void;
}

export const GoalCard = ({ goal, selected, onSelect }: Props) => {
  const Icon = goal.icon;

  return (
    <motion.button
      layoutId={`goal-card-${goal.id}`}
      onClick={() => onSelect(goal.id)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={[
        'relative w-full text-left rounded-2xl border p-5 cursor-pointer',
        'transition-shadow duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        selected
          ? 'border-accent-gold bg-bg-elevated shadow-[0_0_20px_2px_rgba(239,159,39,0.18)]'
          : 'border-border bg-bg-card hover:border-primary/60 hover:bg-bg-elevated',
      ].join(' ')}
      aria-pressed={selected}
    >
      {/* Selected checkmark badge */}
      {selected && (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-3 right-3 text-accent-gold"
        >
          <CheckCircle size={20} />
        </motion.span>
      )}

      {/* Icon + label */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className={[
            'flex items-center justify-center w-10 h-10 rounded-xl',
            selected ? 'bg-accent-gold/20 text-accent-gold' : 'bg-bg-elevated text-gray-400',
          ].join(' ')}
        >
          <Icon size={20} />
        </span>
        <div>
          <p className={`font-bold text-base leading-tight ${selected ? 'text-white' : 'text-gray-100'}`}>
            {goal.label}
          </p>
          <p className="text-xs text-gray-400">{goal.tagline}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-300 leading-relaxed mb-4">{goal.description}</p>

      {/* Footer metadata */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{goal.weeklyCommitment}</span>
        <span className="font-semibold text-accent-gold">+{goal.xpBonus} XP bonus</span>
      </div>
    </motion.button>
  );
};
