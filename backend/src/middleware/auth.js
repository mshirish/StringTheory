import { verifyAccessToken } from '../utils/jwt.js';

// Attaches the decoded user to context. Throws for protected resolvers.
export const buildAuthContext = (req) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return { user: null };

  try {
    const user = verifyAccessToken(token);
    return { user };
  } catch {
    return { user: null };
  }
};

// Use inside resolvers that require authentication
export const requireAuth = (context) => {
  if (!context.user) {
    throw new Error('UNAUTHENTICATED: You must be logged in.');
  }
  return context.user;
};
