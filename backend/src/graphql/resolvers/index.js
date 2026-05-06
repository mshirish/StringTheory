import { authResolvers } from './auth.js';
import { courseResolvers } from './course.js';
import { gamificationResolvers } from './gamification.js';
import { assessmentResolvers } from './assessment.js';
import { profileResolvers } from './profile.js';
import { goalResolvers } from './goal.js';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...courseResolvers.Query,
    ...gamificationResolvers.Query,
    ...assessmentResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...gamificationResolvers.Mutation,
    ...assessmentResolvers.Mutation,
    ...profileResolvers.Mutation,
    ...goalResolvers.Mutation,
  },
  Course: courseResolvers.Course,
  UserProgress: courseResolvers.UserProgress,
};
