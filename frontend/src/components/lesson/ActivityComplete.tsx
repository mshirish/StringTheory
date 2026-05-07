import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Trophy, ArrowRight, LayoutGrid } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  xpEarned:       number;
  lessonCompleted: boolean;
  nextLessonId:    string | null;
}

export const ActivityComplete = ({ xpEarned, lessonCompleted, nextLessonId }: Props) => {
  const navigate = useNavigate();
  const count    = useMotionValue(0);
  const display  = useTransform(count, Math.round);

  useEffect(() => {
    const ctrl = animate(count, xpEarned, { duration: 1.5, ease: 'easeOut' });
    return ctrl.stop;
  }, [xpEarned]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 py-8 text-center"
    >
      {lessonCompleted && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-accent-gold/20 border-2 border-accent-gold flex items-center justify-center"
        >
          <Trophy size={36} className="text-accent-gold" />
        </motion.div>
      )}

      <div>
        <h2 className="text-2xl font-extrabold mb-1">
          {lessonCompleted ? 'Lesson complete!' : 'Activity complete!'}
        </h2>
        <p className="text-gray-400 text-sm">
          {lessonCompleted ? 'Excellent work. Keep the momentum going.' : 'On to the next activity.'}
        </p>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-5xl font-extrabold text-accent-gold">
          +<motion.span>{display}</motion.span>
        </span>
        <span className="text-xl text-accent-gold font-semibold">XP</span>
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="secondary" onClick={() => navigate('/curriculum')} className="flex items-center gap-2">
          <LayoutGrid size={15} /> Curriculum
        </Button>
        {nextLessonId && (
          <Button onClick={() => navigate(`/lessons/${nextLessonId}`)} className="flex items-center gap-2">
            Next lesson <ArrowRight size={15} />
          </Button>
        )}
      </div>
    </motion.div>
  );
};
