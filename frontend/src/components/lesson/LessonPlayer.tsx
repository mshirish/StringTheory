import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import { LessonProgressBar } from './LessonProgressBar';
import { ActivityVideo } from './ActivityVideo';
import { ActivityExercise } from './ActivityExercise';
import { ActivityQuiz } from './ActivityQuiz';
import { ActivityChordPractice } from './ActivityChordPractice';
import { ActivityComplete } from './ActivityComplete';
import { Button } from '../ui/Button';
import type { useLessonPlayer } from '../../hooks/useLessonPlayer';

type Store = ReturnType<typeof useLessonPlayer>;

interface Props { store: Store }

const slideVariants = {
  enter:  { x: 48, opacity: 0 },
  center: { x: 0,  opacity: 1 },
  exit:   { x: -48, opacity: 0 },
};

export const LessonPlayer = ({ store }: Props) => {
  const {
    status, lesson, activities, currentIndex,
    quizFeedback, quizQuestionIdx, isSubmitting,
    xpEarned, lessonCompleted, nextLessonId,
    startLesson, completeActivity, submitQuizAnswer, dismissQuizFeedback, retryActivity,
  } = store;

  const activity = activities[currentIndex];

  if (status === 'idle') return (
    <div className="flex items-center justify-center min-h-40">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (status === 'error') return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <AlertCircle size={36} className="text-red-400" />
      <p className="text-gray-300">{store.error ?? 'Something went wrong.'}</p>
      <Button variant="secondary" onClick={retryActivity} className="flex items-center gap-2">
        <RefreshCw size={14} /> Retry
      </Button>
    </div>
  );

  if (status === 'complete') return (
    <ActivityComplete xpEarned={xpEarned} lessonCompleted={lessonCompleted} nextLessonId={nextLessonId} />
  );

  if (status === 'intro') return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6 py-6"
    >
      <div>
        <h2 className="text-2xl font-extrabold mb-2">{lesson?.title}</h2>
        {lesson?.description && <p className="text-gray-400">{lesson.description}</p>}
        {(lesson as { difficultyNote?: string })?.difficultyNote && (
          <p className="mt-2 text-sm text-accent-gold">{(lesson as { difficultyNote?: string }).difficultyNote}</p>
        )}
      </div>
      <p className="text-sm text-gray-500">{activities.length} activities · earn up to {activities.reduce((s, a) => s + a.xpReward, 0)} XP</p>
      <Button size="lg" onClick={startLesson} className="w-full">Begin lesson →</Button>
    </motion.div>
  );

  return (
    <div className="flex flex-col gap-5">
      <LessonProgressBar total={activities.length} current={currentIndex} />

      {/* Activity renderer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentIndex}-${quizQuestionIdx}`}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2 }}
        >
          {activity?.type === 'video' && (
            <ActivityVideo
              content={activity.content as Parameters<typeof ActivityVideo>[0]['content']}
              onComplete={() => completeActivity()}
              loading={isSubmitting}
            />
          )}
          {activity?.type === 'exercise' && (
            <ActivityExercise
              content={activity.content as Parameters<typeof ActivityExercise>[0]['content']}
              onComplete={() => completeActivity()}
              loading={isSubmitting}
            />
          )}
          {activity?.type === 'quiz' && (
            <ActivityQuiz
              content={activity.content as Parameters<typeof ActivityQuiz>[0]['content']}
              questionIndex={quizQuestionIdx}
              isSubmitting={isSubmitting}
              onAnswer={submitQuizAnswer}
            />
          )}
          {activity?.type === 'chord_practice' && (
            <ActivityChordPractice
              content={activity.content as Parameters<typeof ActivityChordPractice>[0]['content']}
              onComplete={() => completeActivity(100)}
              loading={isSubmitting}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Quiz feedback overlay */}
      <AnimatePresence>
        {status === 'quiz_feedback' && quizFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className={[
              'rounded-xl border p-4 flex flex-col gap-3',
              quizFeedback.correct
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30',
            ].join(' ')}
          >
            <p className={`font-semibold ${quizFeedback.correct ? 'text-green-400' : 'text-red-400'}`}>
              {quizFeedback.correct ? '✓ Correct!' : '✗ Not quite'}
            </p>
            <p className="text-sm text-gray-300">{quizFeedback.explanation}</p>
            <Button onClick={dismissQuizFeedback} className="self-end flex items-center gap-2">
              Continue <ArrowRight size={14} />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
