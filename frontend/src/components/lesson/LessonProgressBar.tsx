interface Props {
  total:   number;
  current: number; // 0-indexed
}

export const LessonProgressBar = ({ total, current }: Props) => (
  <div className="flex items-center gap-2 justify-center py-2">
    <span className="text-xs text-gray-500 mr-1">Activity</span>
    {Array.from({ length: total }, (_, i) => (
      <div
        key={i}
        className={[
          'rounded-full transition-all duration-300',
          i < current
            ? 'w-2.5 h-2.5 bg-primary'
            : i === current
              ? 'w-3 h-3 bg-accent-gold animate-pulse'
              : 'w-2.5 h-2.5 bg-bg-elevated border border-border',
        ].join(' ')}
      />
    ))}
    <span className="text-xs text-gray-500 ml-1">{current + 1} / {total}</span>
  </div>
);
