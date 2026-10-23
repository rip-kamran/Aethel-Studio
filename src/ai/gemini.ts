/**
 * Google Gemini integration.
 * Requires env var: GEMINI_API_KEY
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

let _genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!_genAI) {
    const apiKey = process.env['GEMINI_API_KEY'];
    if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set.');
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

export interface GeminiResponse {
  text: string;
  model: string;
}

export async function runGeminiTask(prompt: string): Promise<GeminiResponse> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemPrompt =
    'You are an AI assistant for Aethel Studios, an AI-powered game development studio. ' +
    'Be concise, precise, and action-oriented.\n\n';

  const result = await model.generateContent(systemPrompt + prompt);
  const text = result.response.text();
  if (!text) throw new Error('Gemini returned no text content.');

  return { text, model: 'gemini-1.5-flash' };
}
