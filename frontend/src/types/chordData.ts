export interface ChordShape {
  frets:    number[];   // -1 = muted, 0 = open
  fingers:  number[];
  barres:   { fromString: number; toString: number; fret: number }[];
  capo:     boolean;
  baseFret: number;
}

export const CHORD_SHAPES: Record<string, ChordShape> = {
  Em: { frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], barres: [], capo: false, baseFret: 1 },
  Am: { frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], barres: [], capo: false, baseFret: 1 },
  G:  { frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3], barres: [], capo: false, baseFret: 1 },
  D:  { frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], barres: [], capo: false, baseFret: 1 },
  C:  { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], barres: [], capo: false, baseFret: 1 },
  F:  { frets: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], barres: [{ fromString: 1, toString: 6, fret: 1 }], capo: false, baseFret: 1 },
  Bm: { frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barres: [{ fromString: 1, toString: 5, fret: 2 }], capo: false, baseFret: 1 },
};

export const GUITAR_INSTRUMENT = {
  strings:       6,
  fretsOnChord:  4,
  name:          'Guitar',
  keys:          [] as string[],
  tunings:       { standard: ['E', 'A', 'D', 'G', 'B', 'e'] },
};
