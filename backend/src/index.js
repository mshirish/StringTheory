import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { Server as SocketIOServer } from 'socket.io';

import { typeDefs } from './graphql/schema/index.js';
import { resolvers } from './graphql/resolvers/index.js';
import { buildAuthContext } from './middleware/auth.js';
import { initSocket } from './socket/index.js';
import pool from './config/database.js';
import redis from './config/redis.js';
import curriculumRouter from './routes/curriculum.js';

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const app = express();
  const httpServer = http.createServer(app);

  // Socket.io — attach to same HTTP server
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });
  initSocket(io);

  // Apollo GraphQL server
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (formattedError, error) => {
      // Don't expose internal errors in production
      if (process.env.NODE_ENV === 'production') {
        const safeMessages = ['UNAUTHENTICATED', 'FORBIDDEN'];
        const isSafe = safeMessages.some((m) => formattedError.message.startsWith(m));
        return isSafe
          ? formattedError
          : { message: 'Internal server error', locations: formattedError.locations };
      }
      return formattedError;
    },
  });

  await apolloServer.start();

  app.use(
    cors({
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(bodyParser.json());

  // Health check
  app.get('/health', async (_, res) => {
    const dbOk = await pool.query('SELECT 1').then(() => true).catch(() => false);
    const redisOk = await redis.ping().then(() => true).catch(() => false);
    res.json({ status: 'ok', db: dbOk, redis: redisOk });
  });

  // REST curriculum API
  app.use('/api', curriculumRouter);

  // GraphQL endpoint — context injects decoded user from JWT
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        ...buildAuthContext(req),
        io,
      }),
    })
  );

  // Verify DB and Redis connectivity before accepting traffic
  await pool.query('SELECT 1');
  console.log('PostgreSQL connected');

  await redis.connect();
  console.log('Redis connected');

  httpServer.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`GraphQL playground: http://localhost:${PORT}/graphql`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
