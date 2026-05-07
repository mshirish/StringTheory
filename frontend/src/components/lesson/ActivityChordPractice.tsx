import { useState } from 'react';
import { Button } from '../ui/Button';
import { CHORD_SHAPES, GUITAR_INSTRUMENT } from '../../types/chordData';
import type { ChordPracticeContent } from '../../types/curriculum';

// @ts-ignore — @tombatossals/react-chords has no type declarations
import Chord from '@tombatossals/react-chords/lib/Chord';

interface Props {
  content:    ChordPracticeContent;
  onComplete: () => void;
  loading:    boolean;
}

export const ActivityChordPractice = ({ content, onComplete, loading }: Props) => {
  const [reps, setReps] = useState(0);
  const done = reps >= content.repsRequired;

  return (
    <div className="flex flex-col gap-6">
      {content.instructions && (
        <p className="text-gray-300 leading-relaxed">{content.instructions}</p>
      )}

      {/* Chord diagrams */}
      <div className="flex flex-wrap gap-6 justify-center">
        {content.chordIds.map(id => {
          const shape = CHORD_SHAPES[id];
          if (!shape) return (
            <div key={id} className="flex flex-col items-center gap-2">
              <div className="w-24 h-32 bg-bg-elevated rounded-xl border border-border flex items-center justify-center text-gray-500 text-xs">{id}</div>
              <span className="text-sm font-semibold">{id}</span>
            </div>
          );
          return (
            <div key={id} className="flex flex-col items-center gap-2">
              <div className="bg-white rounded-xl p-2 w-28">
                <Chord chord={shape} instrument={GUITAR_INSTRUMENT} lite={false} />
              </div>
              <span className="text-sm font-semibold">{id}</span>
            </div>
          );
        })}
      </div>

      {/* Rep counter */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-gray-400">
          Reps completed: <span className="font-bold text-white">{reps}</span> / {content.repsRequired}
        </p>
        <div className="w-full bg-bg-elevated rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 rounded-full"
            style={{ width: `${Math.min(100, (reps / content.repsRequired) * 100)}%` }}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setReps(r => Math.min(r + 1, content.repsRequired))}
          disabled={done}
          className="px-8"
        >
          Rep done ✓
        </Button>
      </div>

      <Button onClick={onComplete} loading={loading} disabled={!done} className="w-full">
        Complete practice →
      </Button>
    </div>
  );
};
