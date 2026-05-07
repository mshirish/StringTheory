import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Progress from '@radix-ui/react-progress';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurriculum } from '../hooks/useCurriculum';
import { TrackSelector } from '../components/curriculum/TrackSelector';
import { ModuleCard } from '../components/curriculum/ModuleCard';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { apiJson } from '../lib/api';
import type { Track } from '../types/curriculum';

// Tracks available in the app (fetched from API)
export const CurriculumPage = () => {
  const { user }                          = useAuth();
  const [allTracks, setAllTracks]         = useState<Track[]>([]);
  const [selectedId, setSelectedId]       = useState<string | null>(null);
  const [initializing, setInitializing]   = useState(false);

  const { curriculum, isLoading, error, refetch } = useCurriculum(selectedId ?? undefined);

  useEffect(() => {
    apiJson<Track[]>('/api/tracks').then(tracks => {
      setAllTracks(tracks);
      if (tracks.length && !selectedId) setSelectedId(tracks[0].id);
    }).catch(() => {});
  }, []);

  const hasProgress = curriculum
    ? curriculum.modules.some(m => m.lessons.some(l => l.userProgress !== null))
    : false;

  const totalLessons    = curriculum?.modules.reduce((s, m) => s + m.lessons.length, 0) ?? 0;
  const completedLessons = curriculum?.modules.reduce((s, m) => s + m.lessons.filter(l => l.userProgress?.status === 'completed').length, 0) ?? 0;
  const overallPercent  = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const startTrack = async () => {
    if (!selectedId) return;
    setInitializing(true);
    try {
      await apiJson(`/api/tracks/${selectedId}/initialize`, { method: 'POST' });
      refetch();
    } finally {
      setInitializing(false);
    }
  };

  const trackTabs = allTracks.map((track, i) => {
    const matchingCurriculum = track.id === selectedId ? curriculum : null;
    const pct = matchingCurriculum
      ? Math.round((matchingCurriculum.modules.reduce((s, m) => s + m.lessons.filter(l => l.userProgress?.status === 'completed').length, 0) /
          Math.max(1, matchingCurriculum.modules.reduce((s, m) => s + m.lessons.length, 0))) * 100)
      : 0;
    return { track, completionPercent: pct, isUnlocked: i === 0 };
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="sticky top-0 z-10 border-b border-border bg-bg-primary/90 backdrop-blur px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <span className="text-xl">🎸</span>
          <span className="font-bold text-gradient-gold">StringTheory</span>
          <span className="text-gray-600 mx-2">·</span>
          <span className="text-gray-300 font-semibold">Curriculum</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Track selector */}
        {allTracks.length > 0 && (
          <TrackSelector
            tabs={trackTabs}
            selectedTrackId={selectedId ?? ''}
            onChange={id => setSelectedId(id)}
          />
        )}

        {/* Overall progress */}
        {hasProgress && (
          <div className="bg-bg-card border border-border rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">{completedLessons} of {totalLessons} lessons complete</span>
              <span className="text-sm font-semibold text-primary-light">{overallPercent}%</span>
            </div>
            <Progress.Root className="relative h-2 overflow-hidden rounded-full bg-bg-elevated" value={overallPercent}>
              <Progress.Indicator
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ transform: `translateX(-${100 - overallPercent}%)` }}
              />
            </Progress.Root>
          </div>
        )}

        {/* Loading / error states */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {error && !isLoading && (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <p className="text-gray-400">{error}</p>
            <Button variant="secondary" onClick={refetch} className="flex items-center gap-2">
              <RefreshCw size={14} /> Retry
            </Button>
          </div>
        )}

        {/* Start track CTA */}
        {!isLoading && !error && curriculum && !hasProgress && (
          <div className="flex flex-col items-center gap-4 py-8 text-center bg-bg-card border border-border rounded-2xl">
            <p className="text-gray-300">You haven't started this track yet.</p>
            <Button onClick={startTrack} loading={initializing}>
              Start this track →
            </Button>
          </div>
        )}

        {/* Module list */}
        {!isLoading && curriculum?.modules && (
          <div className="flex flex-col gap-3">
            {curriculum.modules.map((mod, i) => (
              <ModuleCard key={mod.id} module={mod} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
