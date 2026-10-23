/**
 * OpenAI GPT integration.
 * Requires env var: OPENAI_API_KEY
 */

import OpenAI from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env['OPENAI_API_KEY'];
    if (!apiKey) throw new Error('OPENAI_API_KEY environment variable is not set.');
    _client = new OpenAI({ apiKey });
  }
  return _client;
}

export interface OpenAIResponse {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export async function runOpenAITask(prompt: string): Promise<OpenAIResponse> {
  const client = getClient();
  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 2048,
    messages: [
      {
        role: 'system',
        content:
          'You are an AI assistant for Aethel Studios, an AI-powered game development studio. ' +
          'Be concise, precise, and action-oriented.',
      },
      { role: 'user', content: prompt },
    ],
  });

  const choice = response.choices[0];
  if (!choice?.message.content) throw new Error('OpenAI returned no content.');

  return {
    text: choice.message.content,
    model: response.model,
    inputTokens: response.usage?.prompt_tokens ?? 0,
    outputTokens: response.usage?.completion_tokens ?? 0,
  };
}
