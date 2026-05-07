import { create } from 'zustand';
import { apiJson } from '../lib/api';
import type {
  Lesson, Activity, ActivityWithProgress,
  LessonResponse, CompleteActivityResponse, QuizContent,
} from '../types/curriculum';

export type PlayerStatus =
  | 'idle'
  | 'intro'
  | 'activity'
  | 'quiz_feedback'
  | 'complete'
  | 'error';

interface QuizFeedback {
  correct:     boolean;
  explanation: string;
  questionIdx: number;
}

interface LessonPlayerStore {
  status:           PlayerStatus;
  lesson:           (Lesson & { module: { title: string; track: { title: string } } }) | null;
  activities:       ActivityWithProgress[];
  currentIndex:     number;
  quizFeedback:     QuizFeedback | null;
  quizQuestionIdx:  number;
  quizAttempts:     number;
  xpEarned:         number;
  lessonCompleted:  boolean;
  moduleCompleted:  boolean;
  nextLessonId:     string | null;
  isSubmitting:     boolean;
  error:            string | null;

  loadLesson:          (lessonId: string) => Promise<void>;
  startLesson:         () => void;
  completeActivity:    (score?: number) => Promise<void>;
  submitQuizAnswer:    (answerIndex: number) => void;
  dismissQuizFeedback: () => void;
  retryActivity:       () => void;
  reset:               () => void;
}

const INITIAL: Omit<LessonPlayerStore, 'loadLesson' | 'startLesson' | 'completeActivity' | 'submitQuizAnswer' | 'dismissQuizFeedback' | 'retryActivity' | 'reset'> = {
  status: 'idle', lesson: null, activities: [], currentIndex: 0,
  quizFeedback: null, quizQuestionIdx: 0, quizAttempts: 0,
  xpEarned: 0, lessonCompleted: false, moduleCompleted: false,
  nextLessonId: null, isSubmitting: false, error: null,
};

export const useLessonPlayerStore = create<LessonPlayerStore>((set, get) => ({
  ...INITIAL,

  loadLesson: async (lessonId) => {
    set({ ...INITIAL, status: 'idle' });
    try {
      const data = await apiJson<LessonResponse>(`/api/lessons/${lessonId}`);

      // Find resume index from lastActivityId
      const progress = await apiJson<{ lastActivityId: string | null }>(
        `/api/lessons/${lessonId}`
      ).catch(() => ({ lastActivityId: null }));
      const resumeIdx = data.activities.findIndex(
        a => a.id === (data.lesson as unknown as { lastActivityId?: string }).lastActivityId
      );

      set({
        lesson:      data.lesson as LessonPlayerStore['lesson'],
        activities:  data.activities,
        currentIndex: Math.max(0, resumeIdx),
        nextLessonId: data.nextLesson?.id ?? null,
        status:      'intro',
      });
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : 'Failed to load lesson' });
    }
  },

  startLesson: () => set({ status: 'activity', currentIndex: 0, quizQuestionIdx: 0, quizAttempts: 0 }),

  completeActivity: async (score) => {
    const { activities, currentIndex } = get();
    const activity = activities[currentIndex];
    if (!activity) return;

    set({ isSubmitting: true });
    try {
      const res = await apiJson<CompleteActivityResponse>(
        `/api/activities/${activity.id}/complete`,
        { method: 'POST', body: JSON.stringify({ score }) },
      );

      const isLast = currentIndex >= activities.length - 1;
      set(s => ({
        isSubmitting:    false,
        xpEarned:        s.xpEarned + res.xpAwarded,
        lessonCompleted: res.lessonCompleted,
        moduleCompleted: res.moduleCompleted,
        nextLessonId:    res.nextLessonId ?? s.nextLessonId,
        status:          isLast ? 'complete' : 'activity',
        currentIndex:    isLast ? s.currentIndex : s.currentIndex + 1,
        quizQuestionIdx: 0,
        quizAttempts:    0,
      }));
    } catch (err) {
      set({ isSubmitting: false, status: 'error', error: err instanceof Error ? err.message : 'Failed to save progress' });
    }
  },

  submitQuizAnswer: (answerIndex) => {
    const { activities, currentIndex, quizQuestionIdx, quizAttempts } = get();
    const activity = activities[currentIndex];
    if (!activity || activity.type !== 'quiz') return;

    const content   = activity.content as QuizContent;
    const question  = content.questions[quizQuestionIdx];
    if (!question) return;

    const correct = answerIndex === question.correctIndex;
    set({
      status:       'quiz_feedback',
      quizFeedback: { correct, explanation: question.explanation, questionIdx: quizQuestionIdx },
      quizAttempts: quizAttempts + 1,
    });
  },

  dismissQuizFeedback: () => {
    const { quizFeedback, quizAttempts, activities, currentIndex, quizQuestionIdx } = get();
    if (!quizFeedback) return;

    const content    = activities[currentIndex]?.content as QuizContent;
    const totalQs    = content?.questions?.length ?? 1;
    const moreQs     = quizQuestionIdx + 1 < totalQs;

    if (quizFeedback.correct) {
      if (moreQs) {
        // Advance to next question in this quiz activity
        set({ status: 'activity', quizFeedback: null, quizQuestionIdx: quizQuestionIdx + 1, quizAttempts: 0 });
      } else {
        // All questions done — complete activity
        const score = quizAttempts === 1 ? 100 : 50;
        set({ status: 'activity', quizFeedback: null });
        get().completeActivity(score);
      }
    } else if (quizAttempts < 2) {
      // Allow one retry
      set({ status: 'activity', quizFeedback: null });
    } else {
      // Failed after retries — still complete with 0 score
      set({ status: 'activity', quizFeedback: null });
      get().completeActivity(0);
    }
  },

  retryActivity: () => set({ status: 'activity', error: null }),

  reset: () => set({ ...INITIAL }),
}));
