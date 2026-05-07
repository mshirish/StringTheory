import { useNavigate } from 'react-router-dom';
import { Lock, Clock, Zap } from 'lucide-react';
import { LessonStatusBadge } from './LessonStatusBadge';
import type { EnrichedLesson } from '../../types/curriculum';

interface Props { lesson: EnrichedLesson }

const fmt = (secs: number | null) => {
  if (!secs) return null;
  const m = Math.ceil(secs / 60);
  return `${m} min`;
};

export const LessonRow = ({ lesson }: Props) => {
  const navigate = useNavigate();
  const status   = lesson.userProgress?.status ?? 'locked';
  const clickable = !lesson.isLocked;

  return (
    <div
      onClick={() => clickable && navigate(`/lessons/${lesson.id}`)}
      className={[
        'flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-150',
        clickable
          ? 'border-border bg-bg-elevated hover:border-primary/40 hover:bg-bg-card cursor-pointer'
          : 'border-transparent bg-bg-elevated/40 cursor-not-allowed opacity-60',
      ].join(' ')}
      title={lesson.isLocked && lesson.unlockRequires ? 'Complete prerequisite lesson first' : undefined}
    >
      {lesson.isLocked && <Lock size={14} className="text-gray-600 shrink-0" />}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-100 truncate">{lesson.title}</p>
        {lesson.difficultyNote && (
          <p className="text-xs text-accent-gold mt-0.5">{lesson.difficultyNote}</p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {lesson.durationSeconds && (
          <span className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
            <Clock size={11} />
            {fmt(lesson.durationSeconds)}
          </span>
        )}
        <span className="hidden sm:flex items-center gap-1 text-xs text-accent-gold">
          <Zap size={11} />
          {lesson.xpReward} XP
        </span>
        <LessonStatusBadge status={status} />
      </div>
    </div>
  );
};
