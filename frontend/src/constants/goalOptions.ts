import { Music, Zap, BookOpen, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { LearningGoalId } from '../types';

export interface GoalOption {
  id: LearningGoalId;
  label: string;
  tagline: string;
  description: string;
  suggestedPath: string;
  weeklyCommitment: string;
  xpBonus: number;
  icon: LucideIcon;
}

export const GOAL_OPTIONS: GoalOption[] = [
  {
    id: 'SONGS',
    label: 'Learn Songs',
    tagline: 'Play music you actually love',
    description:
      'Follow song-based lessons with tabs, chords, and backing tracks. Build a real repertoire you can perform.',
    suggestedPath: "Starts with: Wonderwall, Knockin' on Heaven's Door",
    weeklyCommitment: '15–20 min/day',
    xpBonus: 150,
    icon: Music,
  },
  {
    id: 'TECHNIQUE',
    label: 'Improve Technique',
    tagline: 'Master the fundamentals',
    description:
      'Targeted drills for finger strength, picking accuracy, and speed. Build the muscle memory that unlocks everything else.',
    suggestedPath: 'Starts with: Chromatic exercises, Alternate picking',
    weeklyCommitment: '20–25 min/day',
    xpBonus: 175,
    icon: Zap,
  },
  {
    id: 'THEORY',
    label: 'Understand Theory',
    tagline: 'Learn why music works',
    description:
      'Scales, chords, keys, and progressions explained on the fretboard. Stop memorising — start understanding.',
    suggestedPath: 'Starts with: Major scale, Chord construction',
    weeklyCommitment: '15–20 min/day',
    xpBonus: 200,
    icon: BookOpen,
  },
  {
    id: 'SOCIAL',
    label: 'Play With Others',
    tagline: 'Jam, collab, perform',
    description:
      'Learn rhythm, timing, and communication for band settings. Develop the skills that make you a great ensemble player.',
    suggestedPath: 'Starts with: Rhythm fundamentals, 12-bar blues',
    weeklyCommitment: '15–20 min/day',
    xpBonus: 150,
    icon: Users,
  },
];
