# Aethel Studios

An AI-powered game development studio. Three AI collaborators (Claude, ChatGPT, Gemini) coordinated through a shared task system, working together to design and build games.

## Current Status

**Milestone 0 — Foundation** (code committed, awaiting Railway deployment)

## Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Runtime | Node.js 20 LTS | Stable, cloud-native |
| Language | TypeScript 5 (strict) | Type safety, single language |
| Framework | Fastify 4 | First-class TypeScript, fast cold-starts |
| Storage | JSON file store | Zero dependencies; replaceable with SQLite in Phase 1 |
| Frontend | Vanilla HTML/JS | No build step; works on iPad Safari |
| Deployment | Railway | GitHub auto-deploy, no CLI needed |
| AI Providers | Anthropic, OpenAI, Gemini | All three wired; provider chosen per task |

## API
