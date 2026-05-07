import { Router } from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { buildAuthContext } from '../middleware/auth.js';
import * as cache from '../services/cacheService.js';
import * as progress from '../services/progressService.js';

const router  = Router();
const prisma  = new PrismaClient();

// Auth middleware for REST routes
const auth = (req, res, next) => {
  const ctx = buildAuthContext(req);
  if (!ctx.user) return res.status(401).json({ error: 'Unauthorized' });
  req.userId = ctx.user.id;
  next();
};

// ── GET /api/tracks ──────────────────────────────────────────────────────────
router.get('/tracks', async (req, res) => {
  try {
    const cached = await cache.get('tracks:all');
    if (cached) return res.json(cached);

    const tracks = await prisma.track.findMany({ orderBy: { orderIndex: 'asc' } });
    await cache.set('tracks:all', tracks, 3600);
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/tracks/:trackId/curriculum ──────────────────────────────────────
router.get('/tracks/:trackId/curriculum', auth, async (req, res) => {
  const { trackId } = req.params;
  const { userId }  = req;

  try {
    // Cached structure (no user data)
    let structure = await cache.get(`track:${trackId}:structure`);
    if (!structure) {
      structure = await prisma.track.findUniqueOrThrow({
        where:   { id: trackId },
        include: {
          modules: {
            orderBy: { orderIndex: 'asc' },
            include: {
              lessons: {
                orderBy: { orderIndex: 'asc' },
                include: { _count: { select: { activities: true } } },
              },
            },
          },
        },
      });
      await cache.set(`track:${trackId}:structure`, structure, 3600);
    }

    // Fresh user progress (never cached)
    const progressRows = await prisma.userLessonProgress.findMany({
      where: { userId, lessonId: { in: structure.modules.flatMap(m => m.lessons.map(l => l.id)) } },
    });
    const progressMap = Object.fromEntries(progressRows.map(p => [p.lessonId, p]));

    // Build enriched response
    const modules = structure.modules.map(mod => {
      const lessons = mod.lessons.map(lesson => {
        const up         = progressMap[lesson.id] ?? null;
        const isLocked   = up ? up.status === 'locked' : true;
        return {
          ...lesson,
          activitiesCount: lesson._count.activities,
          userProgress:    up,
          isLocked,
        };
      });
      const completedCount  = lessons.filter(l => l.userProgress?.status === 'completed').length;
      const completionPercent = lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0;
      const isCompleted     = completedCount === lessons.length && lessons.length > 0;
      const isLocked        = mod.unlockRequires
        ? !progressRows.some(p => p.lessonId && completedCount === 0) &&
          lessons.every(l => !l.userProgress || l.userProgress.status === 'locked')
        : false;

      return { ...mod, lessons, isLocked, completionPercent, isCompleted };
    });

    res.json({ track: structure, modules });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Track not found' });
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/lessons/:lessonId ────────────────────────────────────────────────
router.get('/lessons/:lessonId', auth, async (req, res) => {
  const { lessonId } = req.params;
  const { userId }   = req;

  try {
    const lesson = await prisma.lesson.findUniqueOrThrow({
      where:   { id: lessonId },
      include: { module: { include: { track: true } }, activities: { orderBy: { orderIndex: 'asc' } } },
    });

    // Mark as in_progress if currently available
    const up = await prisma.userLessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });
    if (up?.status === 'available') {
      await prisma.userLessonProgress.update({
        where: { userId_lessonId: { userId, lessonId } },
        data:  { status: 'in_progress', startedAt: new Date() },
      });
    }

    // Activity progress
    const activityProgress = await prisma.userActivityProgress.findMany({
      where: { userId, activityId: { in: lesson.activities.map(a => a.id) } },
    });
    const apMap = Object.fromEntries(activityProgress.map(a => [a.activityId, a]));

    // Adjacent lessons
    const [prevLesson, nextLesson] = await Promise.all([
      prisma.lesson.findFirst({ where: { moduleId: lesson.moduleId, orderIndex: lesson.orderIndex - 1 } }),
      prisma.lesson.findFirst({ where: { moduleId: lesson.moduleId, orderIndex: lesson.orderIndex + 1 } }),
    ]);

    res.json({
      lesson,
      activities: lesson.activities.map(a => ({ ...a, userProgress: apMap[a.id] ?? null })),
      nextLesson,
      prevLesson,
    });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Lesson not found' });
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/activities/:activityId/complete ─────────────────────────────────
router.post('/activities/:activityId/complete', auth, async (req, res) => {
  const { activityId } = req.params;
  const { score }      = req.body;
  const { userId }     = req;

  try {
    const activity        = await progress.markActivityComplete(userId, activityId, score);
    const lessonId        = activity.lessonId;
    const lessonCompleted = await progress.checkLessonComplete(userId, lessonId);

    let moduleCompleted = false;
    let nextLessonId    = null;
    let xpAwarded       = activity.xpReward;

    if (lessonCompleted) {
      const lesson = await progress.markLessonComplete(userId, lessonId);
      xpAwarded += lesson.xpReward;
      const nextLesson = await progress.unlockNextLesson(userId, lessonId);
      nextLessonId = nextLesson?.id ?? null;

      moduleCompleted = await progress.checkModuleComplete(userId, lesson.moduleId);
      if (moduleCompleted) {
        const mod = await progress.markModuleComplete(userId, lesson.moduleId);
        xpAwarded += mod.xpReward;
        await progress.unlockNextModule(userId, lesson.moduleId);
      }
    }

    res.json({ xpAwarded, lessonCompleted, moduleCompleted, nextLessonId, newBadges: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/lessons/:lessonId/progress ──────────────────────────────────────
router.post('/lessons/:lessonId/progress', auth, async (req, res) => {
  const { lessonId }     = req.params;
  const { lastActivityId } = req.body;
  const { userId }       = req;

  try {
    await prisma.userLessonProgress.upsert({
      where:  { userId_lessonId: { userId, lessonId } },
      update: { lastActivityId },
      create: { userId, lessonId, status: 'in_progress', lastActivityId, startedAt: new Date() },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/tracks/:trackId/initialize ─────────────────────────────────────
router.post('/tracks/:trackId/initialize', auth, async (req, res) => {
  const { trackId } = req.params;
  const { userId }  = req;
  try {
    await progress.initializeUserTrack(userId, trackId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
