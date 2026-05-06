import { verifyAccessToken } from '../utils/jwt.js';

export const initSocket = (io) => {
  // Authenticate socket connections via token in handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      socket.user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId } = socket.user;
    console.log(`Socket connected: user ${userId}`);

    // Join a personal room for targeted notifications
    socket.join(`user:${userId}`);

    // Join a course room for collaborative features (future: live sessions)
    socket.on('join_course', (courseId) => {
      socket.join(`course:${courseId}`);
    });

    socket.on('leave_course', (courseId) => {
      socket.leave(`course:${courseId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user ${userId}`);
    });
  });
};

// Emit a lesson-completed event to a specific user
export const emitLessonCompleted = (io, userId, payload) => {
  io.to(`user:${userId}`).emit('lesson_completed', payload);
};

// Broadcast leaderboard updates to all connected clients
export const emitLeaderboardUpdate = (io, leaderboard) => {
  io.emit('leaderboard_updated', leaderboard);
};

// Notify a course room (e.g., "someone in your course leveled up")
export const emitCourseEvent = (io, courseId, event, payload) => {
  io.to(`course:${courseId}`).emit(event, payload);
};
