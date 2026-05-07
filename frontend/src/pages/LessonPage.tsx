import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLessonPlayer } from '../hooks/useLessonPlayer';
import { LessonPlayer } from '../components/lesson/LessonPlayer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const LessonPage = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate     = useNavigate();

  if (!lessonId) return <Navigate to="/curriculum" replace />;

  const store  = useLessonPlayer(lessonId);
  const lesson = store.lesson;

  const track  = (lesson as { module?: { track?: { title?: string } } })?.module?.track?.title;
  const module = (lesson as { module?: { title?: string } })?.module?.title;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-bg-primary/90 backdrop-blur px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/curriculum')}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Back to curriculum"
          >
            <ArrowLeft size={20} />
          </button>
          {lesson && (
            <p className="text-sm text-gray-400 truncate">
              {track && <span>{track} · </span>}
              {module && <span>{module} · </span>}
              <span className="text-gray-200 font-medium">{lesson.title}</span>
            </p>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {store.status === 'idle' ? (
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <LessonPlayer store={store} />
          </div>
        )}
      </main>
    </div>
  );
};
