import type { TimeSignature } from '../../types/metronome';

const OPTIONS: TimeSignature[] = ['2/4', '3/4', '4/4', '6/8'];

interface Props {
  value:    TimeSignature;
  onChange: (ts: TimeSignature) => void;
}

export const TimeSignatureSelector = ({ value, onChange }: Props) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
      Time Signature
    </p>
    <div className="flex gap-2">
      {OPTIONS.map(ts => (
        <button
          key={ts}
          onClick={() => onChange(ts)}
          className={[
            'flex-1 py-2 rounded-lg text-sm font-bold border transition-all duration-150',
            value === ts
              ? 'bg-primary border-primary text-white'
              : 'bg-bg-card border-border text-gray-300 hover:border-primary/50',
          ].join(' ')}
          aria-pressed={value === ts}
        >
          {ts}
        </button>
      ))}
    </div>
  </div>
);
