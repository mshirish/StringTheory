import { useState } from 'react';
import ReactPlayer from 'react-player';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';
import type { VideoContent } from '../../types/curriculum';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Player = ReactPlayer as any;

interface Props {
  content:    VideoContent;
  onComplete: () => void;
  loading:    boolean;
}

export const ActivityVideo = ({ content, onComplete, loading }: Props) => {
  const [watched,        setWatched]        = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [videoError,     setVideoError]     = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Player */}
      <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
        {videoError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated">
            <p className="text-sm text-gray-400">Video unavailable — you can still mark it as watched.</p>
          </div>
        ) : (
          <Player
            url={content.videoUrl}
            controls
            width="100%"
            height="100%"
            onError={() => setVideoError(true)}
            onProgress={({ played }: { played: number }) => { if (played >= 0.8) setWatched(true); }}
          />

        )}
      </div>

      {/* Mark watched */}
      <Button
        onClick={onComplete}
        loading={loading}
        disabled={!watched && !videoError}
        className="w-full"
      >
        {watched || videoError ? 'Mark as watched →' : 'Watch 80% to continue'}
      </Button>

      {/* Transcript */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          onClick={() => setTranscriptOpen(o => !o)}
        >
          <span>Transcript</span>
          {transcriptOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {transcriptOpen && (
          <p className="px-4 pb-4 text-sm text-gray-400 leading-relaxed border-t border-border pt-3">
            {content.transcript}
          </p>
        )}
      </div>
    </div>
  );
};
