/**
 * Task routes.
 *
 * POST /task    — create and execute a task
 * GET  /tasks   — list all tasks (newest first)
 * GET  /task/:id — get a single task
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createTask, getTask, listTasks, updateTask } from '../store/taskStore.js';
import { runAITask } from '../ai/router.js';
import { CreateTaskInput, AIProvider } from '../types/task.js';

interface CreateTaskBody {
  description: string;
  provider?: AIProvider;
  maxRetries?: number;
}

const MAX_DESCRIPTION_LENGTH = 4000;
const VALID_PROVIDERS: AIProvider[] = ['anthropic', 'openai', 'gemini'];

export async function taskRoutes(fastify: FastifyInstance): Promise<void> {
  // POST /task
  fastify.post(
    '/task',
    async (req: FastifyRequest<{ Body: CreateTaskBody }>, reply: FastifyReply) => {
      const { description, provider = 'anthropic', maxRetries = 2 } = req.body ?? {};

      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        return reply.code(400).send({ error: 'description is required and must be a non-empty string.' });
      }
      if (description.length > MAX_DESCRIPTION_LENGTH) {
        return reply.code(400).send({ error: `description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.` });
      }
      if (!VALID_PROVIDERS.includes(provider)) {
        return reply.code(400).send({ error: `provider must be one of: ${VALID_PROVIDERS.join(', ')}.` });
      }

      const input: CreateTaskInput = { description: description.trim(), provider, maxRetries };
      const task = createTask(input);

      // Fire-and-forget — respond 202 immediately
      void executeTask(task.id, task.description, task.provider);

      return reply.code(202).send(task);
    },
  );

  // GET /tasks
  fastify.get('/tasks', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.send(listTasks());
  });

  // GET /task/:id
  fastify.get(
    '/task/:id',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const task = getTask(req.params.id);
      if (!task) return reply.code(404).send({ error: 'Task not found.' });
      return reply.send(task);
    },
  );
}

// ── Task execution with retry + exponential backoff ───────────────────────────

async function executeTask(
  taskId: string,
  description: string,
  provider: AIProvider,
): Promise<void> {
  const task = getTask(taskId);
  if (!task) return;

  updateTask(taskId, { status: 'running', startedAt: new Date().toISOString() });

  for (let attempt = 0; attempt <= task.maxRetries; attempt++) {
    try {
      const result = await runAITask(description, provider);
      updateTask(taskId, {
        status: 'completed',
        result: result.text,
        completedAt: new Date().toISOString(),
        retryCount: attempt,
      });
      return;
    } catch (err) {
      const isLastAttempt = attempt === task.maxRetries;
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (isLastAttempt) {
        updateTask(taskId, { status: 'failed', error: errorMessage, retryCount: attempt });
        console.error(`[task ${taskId}] Failed after ${attempt + 1} attempt(s): ${errorMessage}`);
      } else {
        console.warn(`[task ${taskId}] Attempt ${attempt + 1} failed, retrying: ${errorMessage}`);
        updateTask(taskId, { retryCount: attempt + 1 });
        await sleep(1000 * Math.pow(2, attempt));
      }
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
