import { useCallback, useRef } from 'react';
import { useMetronome } from '../../hooks/useMetronome';
import { BPMDial } from './BPMDial';
import { BeatIndicator } from './BeatIndicator';
import { TimeSignatureSelector } from './TimeSignatureSelector';
import { SubdivisionSelector } from './SubdivisionSelector';
import { AccentToggle } from './AccentToggle';

interface MetronomeProps {
  isCompact?: boolean;
}

// ── Core component ───────────────────────────────────────────────────────────
export const Metronome = ({ isCompact = false }: MetronomeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const m = useMetronome();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          m.isPlaying ? m.stop() : m.play();
          break;
        case 'ArrowUp':
          e.preventDefault();
          m.setBPM(m.bpm + (e.shiftKey ? 5 : 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          m.setBPM(m.bpm - (e.shiftKey ? 5 : 1));
          break;
        case 't':
        case 'T':
          m.tapTempo();
          break;
      }
    },
    [m],
  );

  if (isCompact) {
    return (
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={[
          'w-80 bg-bg-card border border-border rounded-2xl p-4',
          'flex flex-col gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary',
        ].join(' ')}
      >
        {/* Beat indicator */}
        <BeatIndicator
          beatsPerBar={m.beatsPerBar}
          currentBeat={m.currentBeat}
          accentBeat1={m.accentBeat1}
          isPlaying={m.isPlaying}
          subdivision={m.subdivision}
          subdivsPerBeat={m.subdivsPerBeat}
        />

        {/* Dial + controls row */}
        <div className="flex items-start gap-4">
          <BPMDial
            bpm={m.bpm}
            isPlaying={m.isPlaying}
            isTapping={m.isTapping}
            isCompact
            onBPMChange={m.setBPM}
            onPlay={m.play}
            onStop={m.stop}
            onTap={m.tapTempo}
          />
          <div className="flex-1 flex flex-col gap-2 pt-1">
            <TimeSignatureSelector value={m.timeSignature} onChange={m.setTimeSignature} />
            <SubdivisionSelector   value={m.subdivision}   onChange={m.setSubdivision} />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <AccentToggle value={m.accentBeat1} onToggle={m.toggleAccent} />
          </div>
        </div>

        {/* Volume */}
        <VolumeSlider value={m.volume} onChange={m.setVolume} />
      </div>
    );
  }

  // ── Full-page layout ───────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
    >
      <div className="max-w-md mx-auto flex flex-col gap-6">
        {/* Beat indicator */}
        <div className="bg-bg-card border border-border rounded-2xl px-6 py-2">
          <BeatIndicator
            beatsPerBar={m.beatsPerBar}
            currentBeat={m.currentBeat}
            accentBeat1={m.accentBeat1}
            isPlaying={m.isPlaying}
            subdivision={m.subdivision}
            subdivsPerBeat={m.subdivsPerBeat}
          />
        </div>

        {/* Dial */}
        <div className="bg-bg-card border border-border rounded-2xl py-8 flex justify-center">
          <BPMDial
            bpm={m.bpm}
            isPlaying={m.isPlaying}
            isTapping={m.isTapping}
            isCompact={false}
            onBPMChange={m.setBPM}
            onPlay={m.play}
            onStop={m.stop}
            onTap={m.tapTempo}
          />
        </div>

        {/* Settings */}
        <div className="bg-bg-card border border-border rounded-2xl p-5 flex flex-col gap-5">
          <TimeSignatureSelector value={m.timeSignature} onChange={m.setTimeSignature} />
          <SubdivisionSelector   value={m.subdivision}   onChange={m.setSubdivision} />
          <AccentToggle value={m.accentBeat1} onToggle={m.toggleAccent} />
          <VolumeSlider value={m.volume} onChange={m.setVolume} />
        </div>

        {/* Keyboard shortcut hint */}
        <p className="text-center text-xs text-gray-600">
          Space to play/stop · ↑↓ adjust BPM · Shift+↑↓ ±5 · T tap tempo
        </p>
      </div>
    </div>
  );
};

// ── Volume slider ─────────────────────────────────────────────────────────────
const VolumeSlider = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm text-gray-400 w-14 shrink-0">Volume</span>
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      className="flex-1 accent-primary h-1.5 cursor-pointer"
      aria-label="Volume"
    />
    <span className="text-xs text-gray-500 w-8 text-right">
      {Math.round(value * 100)}
    </span>
  </div>
);

// ── Page and Panel exports ────────────────────────────────────────────────────

export const MetronomePanel = () => <Metronome isCompact />;

export default function MetronomePage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-10 border-b border-border bg-bg-primary/90 backdrop-blur px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <span className="text-xl">🎸</span>
          <span className="font-bold text-gradient-gold">StringTheory</span>
          <span className="text-gray-600 mx-2">·</span>
          <span className="text-gray-300 font-semibold">Metronome</span>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold mb-1">Metronome</h1>
          <p className="text-gray-400 text-sm">
            Click on the dial and drag up/down to change BPM. Click to focus, then use keyboard shortcuts.
          </p>
        </div>
        <Metronome />
      </main>
    </div>
  );
}
