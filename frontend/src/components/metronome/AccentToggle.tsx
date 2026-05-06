interface Props {
  value:    boolean;
  onToggle: () => void;
}

export const AccentToggle = ({ value, onToggle }: Props) => (
  <button
    onClick={onToggle}
    className={[
      'flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-150 w-full',
      value
        ? 'bg-accent-gold/10 border-accent-gold/40 text-accent-gold'
        : 'bg-bg-card border-border text-gray-400 hover:border-primary/40',
    ].join(' ')}
    aria-pressed={value}
  >
    {/* Toggle pill */}
    <span
      className={[
        'relative flex-shrink-0 w-10 h-5 rounded-full transition-colors duration-200',
        value ? 'bg-accent-gold' : 'bg-bg-elevated',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
          value ? 'translate-x-5' : 'translate-x-0.5',
        ].join(' ')}
      />
    </span>
    <span className="text-sm font-medium select-none">Accent beat 1</span>
  </button>
);
