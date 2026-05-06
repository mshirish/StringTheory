// Central type definitions shared across the entire frontend.

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type QuestionType    = 'SINGLE_CHOICE' | 'MULTI_SELECT';
export type GuitarType      = 'ACOUSTIC' | 'ELECTRIC' | 'CLASSICAL';
export type Motivation      = 'LEARN_SONGS' | 'IMPROVE_TECHNIQUE' | 'UNDERSTAND_THEORY' | 'PLAY_WITH_FRIENDS';
export type LearningGoalId  = 'SONGS' | 'TECHNIQUE' | 'THEORY' | 'SOCIAL';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streakCount: number;
  skillLevel: DifficultyLevel | null;
  assessmentCompleted: boolean;
  goals: string[];
  // Profile setup fields
  displayName: string | null;
  guitarType: GuitarType | null;
  motivation: Motivation | null;
  profileCompleted: boolean;
  learningGoal: LearningGoalId | null;
  createdAt: string;
}

export interface QuestionOption {
  key: string;
  label: string;
  points: number;
  nextQuestionKey: string | null;
}

export interface AssessmentQuestion {
  key: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  defaultNextKey: string | null;
  displayOrder: number;
}

export interface AssessmentResult {
  placement: DifficultyLevel;
  score: number;
  goals: string[];
  description: string;
}

export interface AssessmentResponseInput {
  questionKey: string;
  answerKeys: string[];
}

// Profile setup form shape
export interface ProfileForm {
  displayName: string;
  avatarUrl: string;
  guitarType: GuitarType | null;
  motivation: Motivation | null;
}

export interface ProfileFormErrors {
  displayName?: string;
  avatarUrl?: string;
  guitarType?: string;
  motivation?: string;
}
