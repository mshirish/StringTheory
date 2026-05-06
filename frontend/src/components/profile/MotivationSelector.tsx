// MotivationSelector — four card-style options in a 2×2 grid. Same selected-
// state pattern as GuitarTypeSelector (primary border + checkmark badge).

import type { Motivation } from '../../types';

const OPTIONS: { key: Motivation; label: string; desc: string; icon: string }[] = [
  {
    key:   'LEARN_SONGS',
    label: 'Learn Songs',
    desc:  'Play the tracks you love',
    icon:  '🎵',
  },
  {
    key:   'IMPROVE_TECHNIQUE',
    label: 'Improve Technique',
    desc:  'Get sharper, cleaner playing',
    icon:  '🎯',
  },
  {
    key:   'UNDERSTAND_THEORY',
    label: 'Music Theory',
    desc:  'Understand how it all works',
    icon:  '📚',
  },
  {
    key:   'PLAY_WITH_FRIENDS',
    label: 'Play Together',
    desc:  'Jam sessions & band life',
    icon:  '🤝',
  },
];

interface Props {
  selected: Motivation | null;
  onSelect: (value: Motivation) => void;
  error?: string;
}

export const MotivationSelector = ({ selected, onSelect, error }: Props) => (
  <div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {OPTIONS.map(({ key, label, desc, icon }) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`relative flex items-center gap-4 text-left p-5 rounded-2xl border-2 transition-all duration-150
              ${isSelected
                ? 'border-primary bg-primary-subtle ring-2 ring-primary/20'
                : 'border-border bg-bg-card hover:border-primary/50 hover:bg-bg-elevated'}`}
          >
            {/* Icon bubble */}
            <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-colors
              ${isSelected ? 'bg-primary/20' : 'bg-bg-elevated group-hover:bg-bg-secondary'}`}>
              {icon}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                {label}
              </p>
              <p className={`text-xs mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                {desc}
              </p>
            </div>

            {/* Checkmark */}
            {isSelected && (
              <div className="flex-shrink-0 bg-primary rounded-full w-5 h-5 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
    {error && <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5"><span>⚠</span> {error}</p>}
  </div>
);
