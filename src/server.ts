/**
 * Aethel Studios — main server entry point.
 */

import Fastify from 'fastify';
import staticPlugin from '@fastify/static';
import path from 'path';
import { healthRoutes } from './routes/health.js';
import { taskRoutes } from './routes/tasks.js';

const HOST = process.env['HOST'] ?? '0.0.0.0';
const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

async function start(): Promise<void> {
  const fastify = Fastify({
    logger: {
      level: process.env['LOG_LEVEL'] ?? 'info',
    },
  });

  await fastify.register(staticPlugin, {
    root: path.join(process.cwd(), 'public'),
    prefix: '/',
  });

  await fastify.register(healthRoutes);
  await fastify.register(taskRoutes);

  const shutdown = async (): Promise<void> => {
    fastify.log.info('Shutting down...');
    await fastify.close();
    process.exit(0);
  };
  process.on('SIGTERM', () => { void shutdown(); });
  process.on('SIGINT',  () => { void shutdown(); });

  try {
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Aethel Studios running on http://${HOST}:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

void start();
