/**
 * Anthropic Claude integration.
 * Requires env var: ANTHROPIC_API_KEY
 */

import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is not set.');
    _client = new Anthropic({ apiKey });
  }
  return _client;
}

export interface AnthropicResponse {
  text: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}

export async function runAnthropicTask(prompt: string): Promise<AnthropicResponse> {
  const client = getClient();
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
    system:
      'You are an AI assistant for Aethel Studios, an AI-powered game development studio. ' +
      'Be concise, precise, and action-oriented.',
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Anthropic returned no text content.');
  }

  return {
    text: textBlock.text,
    model: response.model,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
