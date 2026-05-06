import type { Subdivision } from '../../types/metronome';

interface Props {
  beatsPerBar:    number;
  currentBeat:    number;
  accentBeat1:    boolean;
  isPlaying:      boolean;
  subdivision:    Subdivision;
  subdivsPerBeat: number;
}

// Individual beat circle — instant on, slow fade off
const BeatCircle = ({
  index, isActive, isAccent,
}: { index: number; isActive: boolean; isAccent: boolean }) => {
  const baseColor  = isAccent ? '#EF9F27' : '#534AB7';
  const dimOpacity = isAccent ? 0.25 : 0.2;

  return (
    <div
      key={index}
      style={{
        width:           '2rem',
        height:          '2rem',
        borderRadius:    '50%',
        border:          `2px solid ${isActive ? baseColor : isAccent ? '#EF9F2740' : '#2e2e5a'}`,
        backgroundColor: isActive ? baseColor : 'transparent',
        opacity:         isActive ? 1 : dimOpacity,
        transform:       isActive ? 'scale(1.25)' : 'scale(1)',
        // Instant on, gradual off
        transition:      isActive ? 'none' : 'all 0.18s ease-out',
        boxShadow:       isActive ? `0 0 12px 2px ${baseColor}88` : 'none',
        flexShrink:      0,
      }}
    />
  );
};

// Small subdivision dot between beats
const SubDot = ({ isActive }: { isActive: boolean }) => (
  <div
    style={{
      width:           '0.45rem',
      height:          '0.45rem',
      borderRadius:    '50%',
      backgroundColor: isActive ? '#534AB7' : '#2e2e5a',
      opacity:         isActive ? 0.9 : 0.4,
      transition:      isActive ? 'none' : 'background-color 0.15s ease-out',
      flexShrink:      0,
    }}
  />
);

export const BeatIndicator = ({
  beatsPerBar, currentBeat, accentBeat1, isPlaying, subdivision, subdivsPerBeat,
}: Props) => {
  const hasSubDivs = subdivision !== 'quarter';

  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {Array.from({ length: beatsPerBar }, (_, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <BeatCircle
            index={i}
            isActive={isPlaying && currentBeat === i}
            isAccent={i === 0 && accentBeat1}
          />
          {/* Subdivision dots between beats (not after the last beat) */}
          {hasSubDivs && i < beatsPerBar - 1 && (
            <div className="flex items-center gap-1">
              {Array.from({ length: subdivsPerBeat - 1 }, (_, s) => (
                <SubDot
                  key={s}
                  isActive={false}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
