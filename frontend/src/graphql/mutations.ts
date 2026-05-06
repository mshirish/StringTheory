import { gql } from '@apollo/client';

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    username
    email
    avatarUrl
    level
    xp
    skillLevel
    assessmentCompleted
    goals
    displayName
    guitarType
    motivation
    profileCompleted
    learningGoal
  }
`;

export const REGISTER_MUTATION = gql`
  ${USER_FIELDS}
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      user { ...UserFields }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  ${USER_FIELDS}
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user { ...UserFields }
    }
  }
`;

export const SUBMIT_ASSESSMENT_MUTATION = gql`
  mutation SubmitAssessment($responses: [AssessmentResponseInput!]!) {
    submitAssessment(responses: $responses) {
      placement
      score
      goals
      description
    }
  }
`;

export const RETAKE_ASSESSMENT_MUTATION = gql`
  mutation RetakeAssessment {
    retakeAssessment
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  ${USER_FIELDS}
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      ...UserFields
    }
  }
`;

export const SET_LEARNING_GOAL_MUTATION = gql`
  mutation SetLearningGoal($goal: LearningGoalType!) {
    setLearningGoal(goal: $goal) {
      id
      learningGoal
    }
  }
`;

export const GET_UPLOAD_URL_MUTATION = gql`
  mutation GetUploadUrl($filename: String!, $contentType: String!) {
    getUploadUrl(filename: $filename, contentType: $contentType) {
      uploadUrl
      key
      publicUrl
    }
  }
`;
