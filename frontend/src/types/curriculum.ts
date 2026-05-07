export interface Track {
  id:          string;
  slug:        string;
  title:       string;
  description: string | null;
  orderIndex:  number;
}

export interface Module {
  id:             string;
  trackId:        string;
  title:          string;
  description:    string | null;
  orderIndex:     number;
  xpReward:       number;
  unlockRequires: string | null;
}

export interface Lesson {
  id:              string;
  moduleId:        string;
  title:           string;
  description:     string | null;
  durationSeconds: number | null;
  orderIndex:      number;
  xpReward:        number;
  unlockRequires:  string | null;
  difficultyNote:  string | null;
  activitiesCount: number;
}

export interface Activity {
  id:         string;
  lessonId:   string;
  type:       ActivityType;
  title:      string | null;
  orderIndex: number;
  content:    ActivityContent;
  xpReward:   number;
}

export type ActivityType = 'video' | 'exercise' | 'quiz' | 'chord_practice';

export interface VideoContent {
  videoUrl:          string;
  transcript:        string;
  chapterTimestamps: number[];
}

export interface ExerciseContent {
  instructions:    string;
  durationSeconds: number;
  targetBpm?:      number;
  micCheckRequired: boolean;
}

export interface QuizQuestion {
  question:     string;
  options:      string[];
  correctIndex: number;
  explanation:  string;
}

export interface QuizContent {
  questions: QuizQuestion[];
}

export interface ChordPracticeContent {
  chordIds:       string[];
  holdDurationMs: number;
  repsRequired:   number;
  instructions?:  string;
}

export type ActivityContent =
  | VideoContent
  | ExerciseContent
  | QuizContent
  | ChordPracticeContent;

export interface UserLessonProgress {
  id:             string;
  userId:         string;
  lessonId:       string;
  status:         LessonStatus;
  startedAt:      string | null;
  completedAt:    string | null;
  score:          number | null;
  attempts:       number;
  lastActivityId: string | null;
}

export type LessonStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export interface UserActivityProgress {
  id:          string;
  userId:      string;
  activityId:  string;
  completed:   boolean;
  completedAt: string | null;
  xpAwarded:   boolean;
}

// ── API response shapes ──────────────────────────────────────────────────────

export type EnrichedLesson = Lesson & {
  userProgress: UserLessonProgress | null;
  isLocked:     boolean;
};

export type EnrichedModule = Module & {
  lessons:           EnrichedLesson[];
  isLocked:          boolean;
  completionPercent: number;
  isCompleted:       boolean;
};

export interface CurriculumResponse {
  track:   Track;
  modules: EnrichedModule[];
}

export type ActivityWithProgress = Activity & {
  userProgress: UserActivityProgress | null;
};

export interface LessonResponse {
  lesson:     Lesson & { module: Module & { track: Track } };
  activities: ActivityWithProgress[];
  nextLesson: Lesson | null;
  prevLesson: Lesson | null;
}

export interface CompleteActivityResponse {
  xpAwarded:       number;
  lessonCompleted: boolean;
  moduleCompleted: boolean;
  nextLessonId:    string | null;
  newBadges:       unknown[];
}
