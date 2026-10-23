/**
 * JSON-file-backed task store.
 *
 * Atomic writes: write to .tmp then rename, so a crash mid-write
 * never corrupts the store. Replace with SQLite in Phase 1.
 */

import fs from 'fs';
import path from 'path';
import { Task, TaskStore, CreateTaskInput } from '../types/task.js';
import { v4 as uuidv4 } from 'uuid';

const DATA_DIR = process.env['DATA_DIR'] ?? path.join(process.cwd(), 'data');
const STORE_PATH = path.join(DATA_DIR, 'tasks.json');
const TEMP_PATH = path.join(DATA_DIR, 'tasks.json.tmp');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore(): TaskStore {
  ensureDataDir();
  if (!fs.existsSync(STORE_PATH)) {
    return { tasks: {}, version: 0 };
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    return JSON.parse(raw) as TaskStore;
  } catch {
    console.error('[taskStore] Failed to parse store; starting with empty state.');
    return { tasks: {}, version: 0 };
  }
}

function writeStore(store: TaskStore): void {
  ensureDataDir();
  store.version += 1;
  const serialised = JSON.stringify(store, null, 2);
  fs.writeFileSync(TEMP_PATH, serialised, 'utf-8');
  fs.renameSync(TEMP_PATH, STORE_PATH);
}

// ── Public API ────────────────────────────────────────────────────────────────

export function createTask(input: CreateTaskInput): Task {
  const store = readStore();
  const now = new Date().toISOString();
  const task: Task = {
    id: uuidv4(),
    description: input.description,
    provider: input.provider ?? 'anthropic',
    status: 'pending',
    createdAt: now,
    updatedAt: now,
    retryCount: 0,
    maxRetries: input.maxRetries ?? 2,
  };
  store.tasks[task.id] = task;
  writeStore(store);
  return task;
}

export function getTask(id: string): Task | undefined {
  const store = readStore();
  return store.tasks[id];
}

export function listTasks(): Task[] {
  const store = readStore();
  return Object.values(store.tasks).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function updateTask(id: string, patch: Partial<Task>): Task | undefined {
  const store = readStore();
  const existing = store.tasks[id];
  if (!existing) return undefined;
  const updated: Task = {
    ...existing,
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  store.tasks[id] = updated;
  writeStore(store);
  return updated;
}
