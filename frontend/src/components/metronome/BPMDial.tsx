import { useRef, useState } from 'react';
import { Play, Square, Music } from 'lucide-react';

// ── Arc geometry ─────────────────────────────────────────────────────────────
const FULL_SIZE    = 180;
const COMPACT_SIZE = 136;
const CX = 0.5;  // fraction of size
const CY = 0.5;
const RADIUS_FRAC  = 0.41; // as fraction of size
const STROKE_FULL  = 8;
const STROKE_COMP  = 6;
const START_ANGLE  = 135; // degrees from 12 o'clock, clockwise
const SWEEP        = 270;
const BPM_MIN      = 40;
const BPM_MAX      = 240;

const toPoint = (size: number, angleDeg: number, r: number) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [size * CX + r * Math.cos(rad), size * CY + r * Math.sin(rad)];
};

const arcPath = (size: number, r: number, start: number, end: number): string => {
  const sweep = end - start;
  if (sweep <= 0.5) return '';
  const [sx, sy] = toPoint(size, start, r);
  const [ex, ey] = toPoint(size, end, r);
  const large = sweep > 180 ? 1 : 0;
  return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
};

// ── Tempo marking data ───────────────────────────────────────────────────────
const TEMPO_MARKS = [
  { name: 'Largo',    bpm: 50  },
  { name: 'Andante',  bpm: 80  },
  { name: 'Moderato', bpm: 100 },
  { name: 'Allegro',  bpm: 132 },
  { name: 'Presto',   bpm: 180 },
];

const TEMPO_RANGES = [
  { name: 'Grave',       min: 40,  max: 59  },
  { name: 'Largo',       min: 60,  max: 65  },
  { name: 'Adagio',      min: 66,  max: 75  },
  { name: 'Andante',     min: 76,  max: 107 },
  { name: 'Moderato',    min: 108, max: 119 },
  { name: 'Allegro',     min: 120, max: 155 },
  { name: 'Vivace',      min: 156, max: 167 },
  { name: 'Presto',      min: 168, max: 199 },
  { name: 'Prestissimo', min: 200, max: 240 },
];

const getTempoName = (bpm: number) =>
  TEMPO_RANGES.find(t => bpm >= t.min && bpm <= t.max)?.name ?? '';

// ── Component ────────────────────────────────────────────────────────────────
interface Props {
  bpm:         number;
  isPlaying:   boolean;
  isTapping:   boolean;
  isCompact:   boolean;
  onBPMChange: (bpm: number) => void;
  onPlay:      () => void;
  onStop:      () => void;
  onTap:       () => void;
}

export const BPMDial = ({
  bpm, isPlaying, isTapping, isCompact,
  onBPMChange, onPlay, onStop, onTap,
}: Props) => {
  const size        = isCompact ? COMPACT_SIZE : FULL_SIZE;
  const strokeW     = isCompact ? STROKE_COMP  : STROKE_FULL;
  const radius      = size * RADIUS_FRAC;
  const progress    = (bpm - BPM_MIN) / (BPM_MAX - BPM_MIN);
  const progressEnd = START_ANGLE + progress * SWEEP;
  const track       = arcPath(size, radius, START_ANGLE, START_ANGLE + SWEEP);
  const fill        = progress > 0.005 ? arcPath(size, radius, START_ANGLE, progressEnd) : '';

  const dragActive   = useRef(false);
  const dragStartY   = useRef(0);
  const dragStartBPM = useRef(bpm);

  const [showTempoLabel, setShowTempoLabel] = useState(false);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragActive.current   = true;
    dragStartY.current   = e.clientY;
    dragStartBPM.current = bpm;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragActive.current) return;
    const dy  = dragStartY.current - e.clientY; // up = positive
    const raw = dragStartBPM.current + dy;
    onBPMChange(Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(raw))));
  };

  const handlePointerUp = () => { dragActive.current = false; };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const dir  = e.deltaY > 0 ? -1 : 1;
    const step = e.shiftKey ? 5 : 1;
    onBPMChange(Math.max(BPM_MIN, Math.min(BPM_MAX, bpm + dir * step)));
  };

  const snapTempo = (targetBpm: number) => {
    onBPMChange(targetBpm);
    setShowTempoLabel(true);
  };

  const tempoName = getTempoName(bpm);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* ── SVG Dial ─────────────────────────────────────────────────────── */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="cursor-ns-resize select-none touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
        >
          {/* Background track */}
          <path
            d={track}
            fill="none"
            stroke="#2e2e5a"
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          {fill && (
            <path
              d={fill}
              fill="none"
              stroke="url(#dialGrad)"
              strokeWidth={strokeW}
              strokeLinecap="round"
            />
          )}
          {/* Gradient definition */}
          <defs>
            <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#534AB7" />
              <stop offset="100%" stopColor="#EF9F27" />
            </linearGradient>
          </defs>
          {/* Indicator dot at current position */}
          {(() => {
            const [dx, dy] = toPoint(size, progressEnd, radius);
            return (
              <circle
                cx={dx}
                cy={dy}
                r={strokeW / 2 + 1}
                fill="#EF9F27"
                className="pointer-events-none"
              />
            );
          })()}
          {/* BPM label in center */}
          <text
            x={size / 2}
            y={size / 2 - 4}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={isCompact ? 26 : 34}
            fontWeight="800"
            fontFamily="inherit"
            className="pointer-events-none"
          >
            {bpm}
          </text>
          <text
            x={size / 2}
            y={size / 2 + (isCompact ? 18 : 22)}
            textAnchor="middle"
            fill="#6B7280"
            fontSize={isCompact ? 9 : 11}
            fontFamily="inherit"
            className="pointer-events-none"
            letterSpacing="2"
          >
            BPM
          </text>
        </svg>
      </div>

      {/* ── Tempo name ───────────────────────────────────────────────────── */}
      {!isCompact && (
        <p className="text-sm font-semibold text-primary-light min-h-[1.25rem] text-center">
          {tempoName}
        </p>
      )}

      {/* ── Play / Stop ──────────────────────────────────────────────────── */}
      <button
        onClick={isPlaying ? onStop : onPlay}
        className={[
          'flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-150',
          isCompact ? 'px-4 py-2 text-sm' : 'px-8 py-3 text-base',
          isPlaying
            ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
            : 'bg-primary border border-primary text-white hover:bg-primary-light',
        ].join(' ')}
        aria-label={isPlaying ? 'Stop metronome' : 'Start metronome'}
      >
        {isPlaying
          ? <><Square size={isCompact ? 14 : 16} /> Stop</>
          : <><Play  size={isCompact ? 14 : 16} /> Play</>
        }
      </button>

      {/* ── Tap Tempo ────────────────────────────────────────────────────── */}
      <button
        onClick={onTap}
        className={[
          'flex items-center gap-2 rounded-xl border font-medium transition-all duration-150',
          isCompact ? 'px-3 py-1.5 text-xs' : 'px-5 py-2 text-sm',
          isTapping
            ? 'bg-accent-gold/15 border-accent-gold/50 text-accent-gold'
            : 'bg-bg-card border-border text-gray-400 hover:border-primary/40',
        ].join(' ')}
        aria-label="Tap tempo"
      >
        <Music size={isCompact ? 12 : 14} />
        {isTapping ? 'Tapping…' : 'Tap Tempo'}
      </button>

      {/* ── Common tempos ─────────────────────────────────────────────────── */}
      {!isCompact && (
        <div className="flex flex-wrap justify-center gap-1.5 max-w-xs">
          {TEMPO_MARKS.map(m => (
            <button
              key={m.name}
              onClick={() => snapTempo(m.bpm)}
              className={[
                'px-3 py-1 rounded-full text-xs border transition-all duration-150',
                bpm === m.bpm
                  ? 'bg-primary/20 border-primary text-primary-light'
                  : 'bg-bg-card border-border text-gray-400 hover:border-primary/40',
              ].join(' ')}
            >
              {m.name} <span className="opacity-60">{m.bpm}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
