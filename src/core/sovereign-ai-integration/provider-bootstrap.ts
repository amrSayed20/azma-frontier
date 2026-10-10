/**
 * AZMA OS — PROVIDER SOVEREIGNTY FOUNDATION
 * Generation Provider Bootstrap
 *
 * Single module-level singleton that boots one DNAOrchestratorApi instance
 * with all three generation adapters registered.  The singleton is
 * process-scoped: one boot on first call, reused for every subsequent
 * request.
 *
 * ─── EVERY ADAPTER IS CREDENTIAL-GATED, AND NOT ONE IS AN EXCEPTION ────────
 *
 *   Magic Hour was gated from the start. OpenAI and ElevenLabs were not: they
 *   were registered unconditionally, and a provider with an absent credential
 *   throws from dispatch(). The orchestrator catches the throw and returns a
 *   'blocked' response, so the platform stayed online — but it stayed online
 *   while ADVERTISING a provider it could never reach.
 *
 *   MEASURED on production 2026-10-10: OPENAI_API_KEY and ELEVENLABS_API_KEY
 *   are both absent from the server environment. `openai-gpt-image-1` is also
 *   not a member of IMAGE_MODEL_FLEET, so the selector cannot choose it and it
 *   was never a designated production provider for حجرة القيامة — it was a
 *   superseded launch path left registered.
 *
 *   The gate is the same condition Magic Hour already used. No credential is
 *   invented, no provider is enabled, and no engine is deleted: an adapter
 *   with no key is simply not announced. The day a key is supplied through the
 *   authorized process, it registers itself with no code change.
 *
 *   The platform still stays online regardless of which credentials are
 *   present, and now its registry says only what is true.
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

/** Read at boot, not at module load, so a test may set the environment first. */
export function isOpenAIConfigured(): boolean {
  return Boolean(process.env['OPENAI_API_KEY']);
}
export function isElevenLabsConfigured(): boolean {
  return Boolean(process.env['ELEVENLABS_API_KEY']);
}

/**
 * Which gateways this process can actually dispatch to.
 *
 * Read by the chamber to answer «is this operation available?» with the truth
 * instead of with the presence of one unrelated key. It names gateways, never
 * credentials, and returns no value derived from a secret.
 */
export function configuredGatewayIds(): readonly string[] {
  const out: string[] = [];
  if (isMagicHourConfigured()) out.push('magic-hour');
  if (isOpenAIConfigured()) out.push('openai');
  return out;
}

export function getGenerationOrchestrator(): DNAOrchestratorApi {
  if (!_singleton) {
    _singleton = new DNAOrchestratorApi();
    // Each adapter is announced only when its own credential is present.
    if (isOpenAIConfigured()) {
      _singleton.registerProvider(new OpenAIImageAdapter());
      _singleton.registerProvider(new OpenAITtsAdapter());
    }
    if (isElevenLabsConfigured()) {
      _singleton.registerProvider(new ElevenLabsVoiceAdapter());
    }
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
