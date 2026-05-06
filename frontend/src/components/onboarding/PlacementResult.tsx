import { Button } from '../ui/Button';
import type { AssessmentResult } from '../../types';

const levelConfig = {
  BEGINNER: {
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/30',
    badge: 'bg-emerald-400/20 text-emerald-300',
    icon: '🌱',
    label: 'Beginner',
  },
  INTERMEDIATE: {
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
    badge: 'bg-blue-400/20 text-blue-300',
    icon: '🎵',
    label: 'Intermediate',
  },
  ADVANCED: {
    color: 'text-accent-purple-light',
    bg: 'bg-purple-400/10 border-purple-400/30',
    badge: 'bg-purple-400/20 text-purple-300',
    icon: '🎸',
    label: 'Advanced',
  },
};

const goalLabels: Record<string, string> = {
  learn_songs:       'Learn favorite songs',
  improve_technique: 'Improve technique',
  understand_theory: 'Understand music theory',
  play_with_others:  'Play with others',
  write_music:       'Write my own music',
};

interface Props {
  result: AssessmentResult;
  onContinue: () => void;
}

export const PlacementResult = ({ result, onContinue }: Props) => {
  const config = levelConfig[result.placement];

  return (
    <div className="text-center animate-scale-in">
      <p className="text-gray-500 text-sm uppercase tracking-widest mb-4 font-medium">
        Your placement
      </p>

      <div className={`inline-flex items-center gap-3 border rounded-2xl px-8 py-5 mb-8 ${config.bg}`}>
        <span className="text-5xl">{config.icon}</span>
        <div className="text-left">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Level</p>
          <p className={`text-3xl font-extrabold ${config.color}`}>{config.label}</p>
        </div>
      </div>

      <p className="text-gray-300 leading-relaxed mb-8 max-w-sm mx-auto">{result.description}</p>

      {result.goals.length > 0 && (
        <div className="mb-8">
          <p className="text-sm text-gray-500 mb-3">Your goal</p>
          <div className="flex flex-wrap justify-center gap-2">
            {result.goals.map((g) => (
              <span key={g} className={`text-sm px-3 py-1 rounded-full font-medium ${config.badge}`}>
                {goalLabels[g] ?? g}
              </span>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onContinue} size="lg" className="px-12">
        Start Learning →
      </Button>
    </div>
  );
};
