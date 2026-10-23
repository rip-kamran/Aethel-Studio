/**
 * Health check route.
 * Used by Railway to confirm the service is running.
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { listTasks } from '../store/taskStore.js';

export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get('/health', async (_req: FastifyRequest, reply: FastifyReply) => {
    const tasks = listTasks();
    return reply.send({
      status: 'ok',
      version: process.env['npm_package_version'] ?? '0.1.0',
      uptime: process.uptime(),
      taskCount: tasks.length,
      providers: {
        anthropic: Boolean(process.env['ANTHROPIC_API_KEY']),
        openai: Boolean(process.env['OPENAI_API_KEY']),
        gemini: Boolean(process.env['GEMINI_API_KEY']),
      },
    });
  });
}
