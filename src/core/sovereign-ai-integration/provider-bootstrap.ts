/**
 * AZMA OS — PROVIDER SOVEREIGNTY FOUNDATION
 * Generation Provider Bootstrap
 *
 * Single module-level singleton that boots one DNAOrchestratorApi instance
 * with all three generation adapters registered.  The singleton is
 * process-scoped: one boot on first call, reused for every subsequent
 * request.
 *
 * A provider with an absent credential will throw from its dispatch()
 * call.  The MultiProviderOrchestrator catches that throw, increments the
 * fallback counter, and returns a 'blocked' NormalizedAIResponse.  The
 * platform stays online regardless of which credentials are present or
 * absent.
 *
 * resetGenerationOrchestratorForTests() is the only door for re-seeding
 * in test environments — production code must never call it.
 */

import { DNAOrchestratorApi } from '../dna-orchestrator-runtime';
import { OpenAIImageAdapter } from './adapters/openai-image-adapter';
import { OpenAITtsAdapter } from './adapters/openai-tts-adapter';
import { ElevenLabsVoiceAdapter } from './adapters/elevenlabs-voice-adapter';
import {
  MagicHourImageAdapter,
  MagicHourVideoAdapter,
  MagicHourTtsAdapter,
  isMagicHourConfigured,
} from './adapters/magic-hour-adapter';

let _singleton: DNAOrchestratorApi | null = null;

export function getGenerationOrchestrator(): DNAOrchestratorApi {
  if (!_singleton) {
    _singleton = new DNAOrchestratorApi();
    _singleton.registerProvider(new OpenAIImageAdapter());
    _singleton.registerProvider(new OpenAITtsAdapter());
    _singleton.registerProvider(new ElevenLabsVoiceAdapter());
    // Magic Hour adapters: registered only if API key is present.
    // Generation routes do NOT route to these adapters until the AZMA Unit
    // cost catalog entries are updated from pending-discovery to available.
    if (isMagicHourConfigured()) {
      _singleton.registerProvider(new MagicHourImageAdapter());
      _singleton.registerProvider(new MagicHourVideoAdapter());
      _singleton.registerProvider(new MagicHourTtsAdapter());
    }
  }
  return _singleton;
}

export function resetGenerationOrchestratorForTests(): void {
  _singleton = null;
}
