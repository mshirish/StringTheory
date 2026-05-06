import type { Subdivision } from '../../types/metronome';

const OPTIONS: { value: Subdivision; label: string; symbol: string }[] = [
  { value: 'quarter',   label: 'Quarter',   symbol: '♩' },
  { value: 'eighth',    label: 'Eighth',    symbol: '♪' },
  { value: 'sixteenth', label: 'Sixteenth', symbol: '♬' },
  { value: 'triplet',   label: 'Triplet',   symbol: '³' },
];

interface Props {
  value:    Subdivision;
  onChange: (sub: Subdivision) => void;
}

export const SubdivisionSelector = ({ value, onChange }: Props) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
      Subdivision
    </p>
    <div className="flex gap-2">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          title={opt.label}
          className={[
            'flex-1 py-2 rounded-lg border transition-all duration-150',
            'flex flex-col items-center gap-0.5',
            value === opt.value
              ? 'bg-primary border-primary text-white'
              : 'bg-bg-card border-border text-gray-300 hover:border-primary/50',
          ].join(' ')}
          aria-pressed={value === opt.value}
          aria-label={opt.label}
        >
          <span className="text-base leading-none">{opt.symbol}</span>
          <span className="text-[10px] leading-none opacity-70">{opt.label.slice(0, 3)}</span>
        </button>
      ))}
    </div>
  </div>
);
