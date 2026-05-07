import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurriculum } from '../hooks/useCurriculum';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { apiJson } from '../lib/api';
import type { Track } from '../types/curriculum';

const levelBadge: Record<string, string> = {
  BEGINNER:     'bg-emerald-400/10 text-emerald-300 border-emerald-400/30',
  INTERMEDIATE: 'bg-blue-400/10 text-blue-300 border-blue-400/30',
  ADVANCED:     'bg-purple-400/10 text-purple-300 border-purple-400/30',
};

const CurriculumWidget = () => {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(false);
  const { curriculum, isLoading, refetch } = useCurriculum(trackId ?? undefined);

  useEffect(() => {
    apiJson<Track[]>('/api/tracks')
      .then(tracks => { if (tracks.length) setTrackId(tracks[0].id); })
      .catch(() => {});
  }, []);

  if (!trackId || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const allLessons   = curriculum?.modules.flatMap(m => m.lessons) ?? [];
  const completed    = allLessons.filter(l => l.userProgress?.status === 'completed').length;
  const total        = allLessons.length;
  const hasProgress  = allLessons.some(l => l.userProgress !== null);
  const nextLesson   = allLessons.find(
    l => l.userProgress?.status === 'in_progress' || l.userProgress?.status === 'available',
  );

  const startTrack = async () => {
    setInitializing(true);
    try {
      await apiJson(`/api/tracks/${trackId}/initialize`, { method: 'POST' });
      refetch();
    } finally {
      setInitializing(false);
    }
  };

  if (!hasProgress) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <BookOpen size={36} className="text-primary-light opacity-60" />
        <div>
          <p className="font-semibold text-gray-200 mb-1">
            {curriculum?.track.title ?? 'Beginner Guitar'}
          </p>
          <p className="text-sm text-gray-500">Start your structured learning path</p>
        </div>
        <Button onClick={startTrack} loading={initializing}>
          Begin learning →
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Track header + continue CTA */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-gray-200 truncate">
            {curriculum?.track.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {completed} of {total} lessons complete
          </p>
        </div>
        {nextLesson && (
          <Button size="sm" onClick={() => navigate(`/lessons/${nextLesson.id}`)}
            className="shrink-0 flex items-center gap-1.5">
            Continue <ArrowRight size={13} />
          </Button>
        )}
      </div>

      {/* Overall progress bar */}
      <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
        />
      </div>

      {/* Module rows */}
      <div className="flex flex-col gap-2 mt-1">
        {curriculum?.modules.map(mod => {
          const modDone  = mod.lessons.filter(l => l.userProgress?.status === 'completed').length;
          const modTotal = mod.lessons.length;
          const pct      = modTotal > 0 ? Math.round((modDone / modTotal) * 100) : 0;

          return (
            <div
              key={mod.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-elevated border border-border/50"
            >
              <div className="shrink-0 w-8 h-8 rounded-full border-2 border-border flex items-center justify-center">
                {modDone === modTotal && modTotal > 0
                  ? <CheckCircle2 size={15} className="text-green-400" />
                  : <span className="text-xs font-bold text-gray-400">{pct}%</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{mod.title}</p>
                <div className="h-1 bg-bg-primary rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-primary/70 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-600 shrink-0">{modDone}/{modTotal}</span>
            </div>
          );
        })}
      </div>

      <button
        className="text-xs text-gray-500 hover:text-gray-300 transition-colors text-center pt-1"
        onClick={() => navigate('/curriculum')}
      >
        View full curriculum →
      </button>
    </div>
  );
};

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎸</span>
          <span className="font-bold text-gradient-gold">StringTheory</span>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}>Sign out</Button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Welcome banner */}
        <div className="bg-bg-secondary border border-border rounded-2xl p-8 mb-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 mb-1">Welcome back,</p>
              <h1 className="text-3xl font-bold mb-3">{user.username}</h1>
              {user.skillLevel && (
                <span className={`inline-flex items-center text-sm font-medium px-3 py-1 rounded-full border ${levelBadge[user.skillLevel]}`}>
                  {user.skillLevel.charAt(0) + user.skillLevel.slice(1).toLowerCase()} player
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Level</p>
              <p className="text-4xl font-extrabold text-accent-gold">{user.level}</p>
              <p className="text-xs text-gray-500">{user.xp} XP</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🔥', label: 'Day Streak',   value: user.streakCount ?? 0 },
            { icon: '⭐', label: 'Total XP',      value: user.xp },
            { icon: '📚', label: 'Lessons Done',  value: 0 },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-bg-card border border-border rounded-xl p-5 text-center">
              <span className="text-3xl block mb-2">{icon}</span>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Curriculum widget */}
        <div className="bg-bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-5">Your Learning Path</h2>
          <CurriculumWidget />
        </div>
      </main>
    </div>
  );
};
