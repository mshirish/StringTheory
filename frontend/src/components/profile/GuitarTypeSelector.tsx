// GuitarTypeSelector — three card-style options with icon, name, and a short
// description. Selected card gets a primary-coloured border + checkmark badge.

import type { GuitarType } from '../../types';

const OPTIONS: { key: GuitarType; label: string; desc: string; icon: string }[] = [
  {
    key:   'ACOUSTIC',
    label: 'Acoustic',
    desc:  'Warm, natural tone',
    icon:  '🪕',
  },
  {
    key:   'ELECTRIC',
    label: 'Electric',
    desc:  'Versatile & powerful',
    icon:  '⚡',
  },
  {
    key:   'CLASSICAL',
    label: 'Classical',
    desc:  'Nylon strings & fingerstyle',
    icon:  '🎼',
  },
];

interface Props {
  selected: GuitarType | null;
  onSelect: (value: GuitarType) => void;
  error?: string;
}

export const GuitarTypeSelector = ({ selected, onSelect, error }: Props) => (
  <div>
    <div className="grid grid-cols-3 gap-3">
      {OPTIONS.map(({ key, label, desc, icon }) => {
        const isSelected = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`relative flex flex-col items-center text-center gap-3 p-5 rounded-2xl border-2 transition-all duration-150 group
              ${isSelected
                ? 'border-primary bg-primary-subtle ring-2 ring-primary/20'
                : 'border-border bg-bg-card hover:border-primary/50 hover:bg-bg-elevated'}`}
          >
            {/* Checkmark badge */}
            {isSelected && (
              <div className="absolute top-2.5 right-2.5 bg-primary rounded-full w-5 h-5 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            <span className="text-3xl">{icon}</span>
            <div>
              <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                {label}
              </p>
              <p className={`text-xs mt-0.5 leading-snug ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                {desc}
              </p>
            </div>
          </button>
        );
      })}
    </div>
    {error && <p className="mt-3 text-sm text-red-400 flex items-center gap-1.5"><span>⚠</span> {error}</p>}
  </div>
);
