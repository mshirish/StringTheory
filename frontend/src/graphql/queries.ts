import { gql } from '@apollo/client';

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      avatarUrl
      level
      xp
      xpToNextLevel
      streakCount
      skillLevel
      assessmentCompleted
      goals
      displayName
      guitarType
      motivation
      profileCompleted
      learningGoal
      createdAt
    }
  }
`;

export const ASSESSMENT_QUESTIONS_QUERY = gql`
  query AssessmentQuestions {
    assessmentQuestions {
      key
      text
      type
      options {
        key
        label
        points
        nextQuestionKey
      }
      defaultNextKey
      displayOrder
    }
  }
`;
