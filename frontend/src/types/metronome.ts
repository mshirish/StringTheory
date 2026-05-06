export type TimeSignature = '2/4' | '3/4' | '4/4' | '6/8';
export type Subdivision   = 'quarter' | 'eighth' | 'sixteenth' | 'triplet';

export interface MetronomeState {
  bpm:           number;       // 40–240
  isPlaying:     boolean;
  timeSignature: TimeSignature;
  subdivision:   Subdivision;
  accentBeat1:   boolean;
  currentBeat:   number;       // 0-indexed, for visual indicator
  volume:        number;       // 0–1
}
