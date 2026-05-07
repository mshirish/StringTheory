import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { awardXP } from '../utils/awardXP.js';

const prisma = new PrismaClient();

export const markActivityComplete = async (userId, activityId, score) => {
  const activity = await prisma.activity.findUniqueOrThrow({
    where: { id: activityId },
    include: { lesson: true },
  });

  await prisma.userActivityProgress.upsert({
    where:  { userId_activityId: { userId, activityId } },
    update: { completed: true, completedAt: new Date(), xpAwarded: true },
    create: { userId, activityId, completed: true, completedAt: new Date(), xpAwarded: true },
  });

  await awardXP(userId, activity.xpReward);

  // Ensure lesson progress row exists
  await prisma.userLessonProgress.upsert({
    where:  { userId_lessonId: { userId, lessonId: activity.lessonId } },
    update: { startedAt: { set: undefined } }, // no-op if already started
    create: { userId, lessonId: activity.lessonId, status: 'in_progress', startedAt: new Date() },
  });

  return activity;
};

export const checkLessonComplete = async (userId, lessonId) => {
  const [total, completed] = await Promise.all([
    prisma.activity.count({ where: { lessonId } }),
    prisma.userActivityProgress.count({ where: { userId, activityId: { in: (await prisma.activity.findMany({ where: { lessonId }, select: { id: true } })).map(a => a.id) }, completed: true } }),
  ]);
  return total > 0 && completed >= total;
};

export const markLessonComplete = async (userId, lessonId) => {
  const lesson = await prisma.lesson.findUniqueOrThrow({ where: { id: lessonId } });
  await prisma.userLessonProgress.upsert({
    where:  { userId_lessonId: { userId, lessonId } },
    update: { status: 'completed', completedAt: new Date() },
    create: { userId, lessonId, status: 'completed', completedAt: new Date() },
  });
  await awardXP(userId, lesson.xpReward);
  return lesson;
};

export const unlockNextLesson = async (userId, currentLessonId) => {
  const current = await prisma.lesson.findUniqueOrThrow({ where: { id: currentLessonId } });
  const next = await prisma.lesson.findFirst({
    where: { moduleId: current.moduleId, orderIndex: current.orderIndex + 1 },
  });
  if (!next) return null;
  await prisma.userLessonProgress.upsert({
    where:  { userId_lessonId: { userId, lessonId: next.id } },
    update: { status: 'available' },
    create: { userId, lessonId: next.id, status: 'available' },
  });
  return next;
};

export const checkModuleComplete = async (userId, moduleId) => {
  const lessons = await prisma.lesson.findMany({ where: { moduleId }, select: { id: true } });
  const completed = await prisma.userLessonProgress.count({
    where: { userId, lessonId: { in: lessons.map(l => l.id) }, status: 'completed' },
  });
  return lessons.length > 0 && completed >= lessons.length;
};

export const markModuleComplete = async (userId, moduleId) => {
  const module = await prisma.module.findUniqueOrThrow({ where: { id: moduleId } });
  await awardXP(userId, module.xpReward);
  return module;
};

export const unlockNextModule = async (userId, currentModuleId) => {
  const current = await prisma.module.findUniqueOrThrow({ where: { id: currentModuleId } });
  const nextModule = await prisma.module.findFirst({
    where:   { trackId: current.trackId, orderIndex: current.orderIndex + 1 },
    include: { lessons: { orderBy: { orderIndex: 'asc' }, take: 1 } },
  });
  if (!nextModule || nextModule.lessons.length === 0) return null;
  const firstLesson = nextModule.lessons[0];
  await prisma.userLessonProgress.upsert({
    where:  { userId_lessonId: { userId, lessonId: firstLesson.id } },
    update: { status: 'available' },
    create: { userId, lessonId: firstLesson.id, status: 'available' },
  });
  return nextModule;
};

export const getResumeActivity = async (userId, lessonId) => {
  const progress = await prisma.userLessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  return progress?.lastActivityId ?? null;
};

export const initializeUserTrack = async (userId, trackId) => {
  const modules = await prisma.module.findMany({
    where:   { trackId },
    orderBy: { orderIndex: 'asc' },
    include: { lessons: { orderBy: { orderIndex: 'asc' } } },
  });

  // Create locked rows for every lesson
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      await prisma.userLessonProgress.upsert({
        where:  { userId_lessonId: { userId, lessonId: lesson.id } },
        update: {},
        create: { userId, lessonId: lesson.id, status: 'locked' },
      });
    }
  }

  // Unlock the very first lesson
  if (modules[0]?.lessons[0]) {
    await prisma.userLessonProgress.update({
      where: { userId_lessonId: { userId, lessonId: modules[0].lessons[0].id } },
      data:  { status: 'available' },
    });
  }
};

export { prisma };
