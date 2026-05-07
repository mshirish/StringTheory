import type { LessonStatus } from '../../types/curriculum';

const CONFIG: Record<LessonStatus, { label: string; className: string }> = {
  locked:      { label: 'Locked',      className: 'bg-gray-700 text-gray-400' },
  available:   { label: 'Available',   className: 'bg-primary/20 text-primary-light border border-primary/30' },
  in_progress: { label: 'In progress', className: 'bg-accent-gold/15 text-accent-gold border border-accent-gold/30' },
  completed:   { label: 'Completed',   className: 'bg-green-500/15 text-green-400 border border-green-500/20' },
};

export const LessonStatusBadge = ({ status }: { status: LessonStatus }) => {
  const cfg = CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};
