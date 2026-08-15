/**
 * AZMA OS — CONSUMPTION LEDGER
 * Cost Estimator
 *
 * Pure functions — no external calls, no side effects.
 * Produces USD cost estimates for each AI operation type based on
 * published provider pricing at the time of this package's construction.
 *
 * These are ESTIMATES used for internal cost discovery, not billing
 * amounts. When real invoice data becomes available, this file is the
 * single place to update rates.
 *
 * Provider pricing reference (2026-08):
 *   OpenAI DALL-E 3 standard 1024×1024 : $0.040 / image
 *   OpenAI DALL-E 3 HD      1024×1024  : $0.080 / image
 *   OpenAI TTS-1  (standard)           : $0.015 / 1 000 characters
 *   OpenAI TTS-1-HD                    : $0.030 / 1 000 characters
 *   Voice cloning (provider-dependent) : $0.300 / clone (conservative estimate)
 */

/** Returns estimated USD cost for one image generation. */
export function estimateImageGenerationCost(quality: 'standard' | 'hd' = 'standard'): number {
  return quality === 'hd' ? 0.080 : 0.040;
}

/** Returns estimated USD cost for a TTS call of `characterCount` characters. */
export function estimateTtsCost(characterCount: number, model: 'tts-1' | 'tts-1-hd' = 'tts-1'): number {
  const ratePerThousand = model === 'tts-1-hd' ? 0.030 : 0.015;
  return (characterCount / 1000) * ratePerThousand;
}

/** Returns estimated USD cost for one voice clone operation. */
export function estimateVoiceCloneCost(): number {
  return 0.300;
}

/** Returns the 'YYYY-MM' key for the month containing the given timestamp (default: now). */
export function getCurrentMonthKey(timestamp: number = Date.now()): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
