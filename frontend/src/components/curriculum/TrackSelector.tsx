import * as Tabs from '@radix-ui/react-tabs';
import { Lock } from 'lucide-react';
import type { Track, CurriculumResponse } from '../../types/curriculum';

interface TrackTab {
  track:             Track;
  completionPercent: number;
  isUnlocked:        boolean;
}

interface Props {
  tabs:            TrackTab[];
  selectedTrackId: string;
  onChange:        (trackId: string) => void;
}

export const TrackSelector = ({ tabs, selectedTrackId, onChange }: Props) => (
  <Tabs.Root value={selectedTrackId} onValueChange={onChange}>
    <Tabs.List className="flex gap-2 p-1 bg-bg-card border border-border rounded-2xl">
      {tabs.map(({ track, completionPercent, isUnlocked }) => (
        <Tabs.Trigger
          key={track.id}
          value={track.id}
          disabled={!isUnlocked}
          title={!isUnlocked ? 'Complete the previous track to unlock' : undefined}
          className={[
            'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150',
            'data-[state=active]:bg-primary data-[state=active]:text-white',
            'data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-200',
            !isUnlocked ? 'opacity-50 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {!isUnlocked && <Lock size={12} />}
          <span>{track.title}</span>
          {completionPercent > 0 && (
            <span className={[
              'text-xs px-1.5 py-0.5 rounded-full font-normal',
              completionPercent === 100 ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-gray-400',
            ].join(' ')}>
              {Math.round(completionPercent)}%
            </span>
          )}
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  </Tabs.Root>
);
