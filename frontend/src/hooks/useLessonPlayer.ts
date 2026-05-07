import { useEffect } from 'react';
import { useLessonPlayerStore } from '../stores/lessonPlayerStore';
import { api } from '../lib/api';

export const useLessonPlayer = (lessonId: string) => {
  const store = useLessonPlayerStore();

  useEffect(() => {
    store.loadLesson(lessonId);
    return () => store.reset();
  }, [lessonId]);

  // Persist resume position whenever currentIndex advances
  const currentActivity = store.activities[store.currentIndex];
  useEffect(() => {
    if (!currentActivity || store.status !== 'activity') return;
    api(`/api/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ lastActivityId: currentActivity.id }),
    }).catch(() => {});
  }, [lessonId, currentActivity?.id, store.status]);

  // Fire achievement event when lesson completes with XP
  useEffect(() => {
    if (store.lessonCompleted && store.xpEarned > 0) {
      window.dispatchEvent(
        new CustomEvent('achievement', {
          detail: { id: `lesson-${store.lesson?.id}`, label: `Completed: ${store.lesson?.title}`, xp: store.xpEarned },
        }),
      );
    }
  }, [store.lessonCompleted]);

  return store;
};
