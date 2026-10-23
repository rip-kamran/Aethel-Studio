/**
 * Core task types for Aethel Studios.
 * All task state passes through these interfaces.
 */

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed';

export type AIProvider = 'anthropic' | 'openai' | 'gemini';

export interface Task {
  id: string;
  description: string;
  provider: AIProvider;
  status: TaskStatus;
  createdAt: string;      // ISO 8601
  updatedAt: string;      // ISO 8601
  startedAt?: string;
  completedAt?: string;
  result?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface CreateTaskInput {
  description: string;
  provider?: AIProvider;  // defaults to 'anthropic'
  maxRetries?: number;    // defaults to 2
}

export interface TaskStore {
  tasks: Record<string, Task>;
  version: number;        // incremented on each write
}
