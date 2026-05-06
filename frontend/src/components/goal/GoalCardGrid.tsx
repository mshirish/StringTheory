import { motion } from 'framer-motion';
import { GoalCard } from './GoalCard';
import { GOAL_OPTIONS } from '../../constants/goalOptions';
import type { LearningGoalId } from '../../types';

interface Props {
  selected: LearningGoalId | null;
  onSelect: (id: LearningGoalId) => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } },
};

export const GoalCardGrid = ({ selected, onSelect }: Props) => (
  <motion.div
    variants={containerVariants}
    initial="hidden"
    animate="visible"
    className="grid grid-cols-1 sm:grid-cols-2 gap-4"
  >
    {GOAL_OPTIONS.map((goal) => (
      <motion.div key={goal.id} variants={itemVariants}>
        <GoalCard
          goal={goal}
          selected={selected === goal.id}
          onSelect={onSelect}
        />
      </motion.div>
    ))}
  </motion.div>
);
