/**
 * AZMA OS — CONSUMPTION LEDGER
 * Cost Estimator — ⚠ SUPERSEDED, 2026-11-02. NOT A COST AUTHORITY.
 *
 * ─── WHY THESE THREE FUNCTIONS ARE NO LONGER CALLED ─────────────────────────
 *
 *   Every rate below describes a PROVIDER THAT DID NOT SERVE THE REQUEST:
 *
 *     image        $0.040 (DALL-E 3)   · the Empire uses nano-banana-2 through
 *                                        Magic Hour, MEASURED at $0.1357 —
 *                                        this understated it by 3.4×
 *     speech       $0.015 / 1000 chars · the provider is ElevenLabs, whose
 *                       (OpenAI tts-1)   charge has never been measured here
 *     voice clone  $0.300              · a «conservative estimate» with no
 *                                        source and no measurement
 *
 *   And they were written into `consumption_records` — the Empire's own COST
 *   DISCOVERY record, the table consulted on the day a capability is priced.
 *   A rate card in that column is misleading exactly where it is trusted.
 *
 *   RULED BY THE OWNER, 2026-11-02: «إزالة الافتراضات التي تستخدم أسعار مزود
 *   مختلف باعتبارها تكلفة للعملية الفعلية».
 *
 *   The authority is now `provider-cost-basis.ts`, which answers from the
 *   measured truth or answers `null` — and `getCurrentMonthKey` below is the
 *   only thing in this file that any live road still uses.
 *
 *   The three functions are KEPT and not deleted: they are the historical
 *   record of what every pre-2026-11-02 row in `consumption_records` was
 *   computed with, and deleting them would make those rows unexplainable.
 *   Nothing may call them again.
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
