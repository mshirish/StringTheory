export const typeDefs = `#graphql
  enum DifficultyLevel {
    BEGINNER
    INTERMEDIATE
    ADVANCED
  }

  enum LearningGoalType {
    SONGS
    TECHNIQUE
    THEORY
    SOCIAL
  }

  enum GuitarType {
    ACOUSTIC
    ELECTRIC
    CLASSICAL
  }

  enum Motivation {
    LEARN_SONGS
    IMPROVE_TECHNIQUE
    UNDERSTAND_THEORY
    PLAY_WITH_FRIENDS
  }

  enum QuestionType {
    SINGLE_CHOICE
    MULTI_SELECT
  }

  type AssessmentQuestionOption {
    key: String!
    label: String!
    points: Int!
    nextQuestionKey: String
  }

  type AssessmentQuestion {
    key: String!
    text: String!
    type: QuestionType!
    options: [AssessmentQuestionOption!]!
    defaultNextKey: String
    displayOrder: Int!
  }

  type AssessmentResult {
    placement: DifficultyLevel!
    score: Int!
    goals: [String!]!
    description: String!
  }

  input AssessmentResponseInput {
    questionKey: String!
    answerKeys: [String!]!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    avatarUrl: String
    level: Int!
    xp: Int!
    xpToNextLevel: Int!
    streakCount: Int!
    lastActivityDate: String
    skillLevel: DifficultyLevel
    assessmentCompleted: Boolean!
    goals: [String!]!
    displayName: String
    guitarType: GuitarType
    motivation: Motivation
    profileCompleted: Boolean!
    learningGoal: LearningGoalType
    createdAt: String!
    achievements: [Achievement!]
    progress: [UserProgress!]
  }

  input UpdateProfileInput {
    displayName: String!
    avatarUrl:   String!
    guitarType:  GuitarType!
    motivation:  Motivation!
  }

  type Course {
    id: ID!
    title: String!
    description: String
    difficultyLevel: DifficultyLevel!
    thumbnailUrl: String
    totalLessons: Int!
    estimatedMinutes: Int
    lessons: [Lesson!]
    createdAt: String!
  }

  type Lesson {
    id: ID!
    courseId: ID!
    title: String!
    description: String
    videoUrl: String
    tabUrl: String
    durationSeconds: Int
    xpReward: Int!
    order: Int!
  }

  type Achievement {
    id: ID!
    name: String!
    description: String!
    iconUrl: String
    xpReward: Int!
    earnedAt: String
  }

  type UserProgress {
    id: ID!
    lessonId: ID!
    lesson: Lesson
    completed: Boolean!
    completedAt: String
  }

  type LeaderboardEntry {
    rank: Int!
    userId: ID!
    username: String!
    avatarUrl: String
    xp: Int!
    level: Int!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  type LessonCompletionResult {
    xpEarned: Int!
    totalXp: Int!
    newLevel: Int
    leveledUp: Boolean!
    newAchievements: [Achievement!]
    streakCount: Int!
    streakBroken: Boolean!
  }

  type PresignedUpload {
    uploadUrl: String!
    key: String!
    publicUrl: String!
  }

  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: User
    courses(difficultyLevel: DifficultyLevel, limit: Int, offset: Int): [Course!]!
    course(id: ID!): Course
    lesson(id: ID!): Lesson
    leaderboard(limit: Int): [LeaderboardEntry!]!
    myProgress: [UserProgress!]!
    assessmentQuestions: [AssessmentQuestion!]!
    myAssessment: AssessmentResult
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(token: String!): AuthPayload!
    completeLesson(lessonId: ID!): LessonCompletionResult!
    getUploadUrl(filename: String!, contentType: String!): PresignedUpload!
    submitAssessment(responses: [AssessmentResponseInput!]!): AssessmentResult!
    retakeAssessment: Boolean!
    updateProfile(input: UpdateProfileInput!): User!
    setLearningGoal(goal: LearningGoalType!): User!
  }

  type Subscription {
    leaderboardUpdated: [LeaderboardEntry!]!
    userLeveledUp(userId: ID!): User
  }
`;
