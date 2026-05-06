interface Props {
  current: number; // 1-based
  total: number;
}

export const ProgressBar = ({ current, total }: Props) => (
  <div className="flex items-center gap-3">
    <div className="flex gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i < current ? 'w-8 bg-accent-gold' : 'w-4 bg-bg-card border border-border'
          }`}
        />
      ))}
    </div>
    <span className="text-sm text-gray-500 tabular-nums">{current} / {total}</span>
  </div>
);
