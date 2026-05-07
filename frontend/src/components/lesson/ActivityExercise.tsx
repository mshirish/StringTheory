import { useEffect, useRef, useState } from 'react';
import { Timer, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';
import { ProgressRing } from '../curriculum/ProgressRing';
import type { ExerciseContent } from '../../types/curriculum';

interface Props {
  content:    ExerciseContent;
  onComplete: () => void;
  loading:    boolean;
}

export const ActivityExercise = ({ content, onComplete, loading }: Props) => {
  const [started,  setStarted]  = useState(false);
  const [timeLeft, setTimeLeft] = useState(content.durationSeconds);
  const intervalRef             = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!started) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [started]);

  const elapsed  = content.durationSeconds - timeLeft;
  const percent  = Math.round((elapsed / content.durationSeconds) * 100);
  const canDone  = started;

  return (
    <div className="flex flex-col gap-6">
      <p className="text-gray-200 leading-relaxed">{content.instructions}</p>

      {content.targetBpm && (
        <div className="flex items-center justify-between bg-bg-elevated border border-border rounded-xl px-4 py-3">
          <span className="text-sm text-gray-400">Target tempo</span>
          <div className="flex items-center gap-3">
            <span className="font-bold text-accent-gold">{content.targetBpm} BPM</span>
            <a
              href="/metronome"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-primary-light hover:text-white transition-colors"
            >
              Open metronome <ExternalLink size={11} />
            </a>
          </div>
        </div>
      )}

      {/* Timer */}
      <div className="flex flex-col items-center gap-4">
        <ProgressRing percent={percent} size={96} stroke={8} />
        <p className="text-2xl font-mono font-bold">
          {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:
          {(timeLeft % 60).toString().padStart(2, '0')}
        </p>
        {!started && (
          <Button variant="secondary" onClick={() => setStarted(true)} className="flex items-center gap-2">
            <Timer size={14} /> Start timer
          </Button>
        )}
      </div>

      <Button onClick={onComplete} loading={loading} disabled={!canDone} className="w-full">
        Complete exercise →
      </Button>
    </div>
  );
};
