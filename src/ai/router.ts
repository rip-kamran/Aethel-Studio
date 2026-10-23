/**
 * AI provider router.
 * Dispatches a task to the correct provider and returns a normalised result.
 */

import { AIProvider } from '../types/task.js';
import { runAnthropicTask } from './anthropic.js';
import { runOpenAITask } from './openai.js';
import { runGeminiTask } from './gemini.js';

export interface AIResult {
  text: string;
  provider: AIProvider;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
}

export async function runAITask(prompt: string, provider: AIProvider): Promise<AIResult> {
  switch (provider) {
    case 'anthropic': {
      const r = await runAnthropicTask(prompt);
      return { text: r.text, provider, model: r.model, inputTokens: r.inputTokens, outputTokens: r.outputTokens };
    }
    case 'openai': {
      const r = await runOpenAITask(prompt);
      return { text: r.text, provider, model: r.model, inputTokens: r.inputTokens, outputTokens: r.outputTokens };
    }
    case 'gemini': {
      const r = await runGeminiTask(prompt);
      return { text: r.text, provider, model: r.model };
    }
  }
}
