import { QIYAMAH_COST_TRUTH, CREDIT_USD } from '../economy/cost-engine/qiyamah-cost-truth';
import { OperationType } from './consumption-ledger-contracts';

/**
 * AZMA OS — ما كلَّفت العمليّةُ فعلًا، أو أنّه مجهول.
 *
 * ─── WHAT THIS REPLACES, AND WHY IT HAD TO ──────────────────────────────────
 *
 *   `cost-estimator.ts` carried a PUBLISHED RATE CARD — OpenAI's, dated
 *   2026-08 — and wrote its numbers into `consumption_records` as the cost of
 *   every image, every speech generation and every voice clone:
 *
 *     image        $0.040  (DALL-E 3 standard)   · MEASURED: $0.1357
 *                                                  nano-banana-2 via Magic Hour
 *     speech       $0.015 / 1000 chars (tts-1)   · the provider is ElevenLabs
 *     voice clone  $0.300 «conservative»         · no measurement exists
 *
 *   Every one of those three describes a provider that did not serve the
 *   request. The image figure understates the measured cost by 3.4×. And the
 *   table it writes into is the Empire's COST DISCOVERY record — the thing
 *   consulted on the day a capability is priced. A rate card in that column
 *   is misleading exactly where it is trusted.
 *
 *   The Empire's own rule, from `qiyamah-cost-truth.ts`: «THE BASIS IS WHAT
 *   AZMA PAID, not what the provider advertises. A marketing price describes
 *   a stranger's purchase, not ours.»
 *
 * ─── THE THREE STATES, KEPT APART ───────────────────────────────────────────
 *
 *   MEASURED   read from a production this Empire actually paid for, in the
 *              provider's own unit, converted at the acquisition basis.
 *   ESTIMATED  derived from something real but not from our own invoice.
 *              Nothing returns this today; it exists so that the day a
 *              figure IS an estimate, it cannot be mistaken for a measurement.
 *   UNKNOWN    never measured. **`null`, never zero.** A zero in a cost
 *              column is read as «free» by the next person to open it.
 *
 *   RULED BY THE OWNER, 2026-11-02: «الفصل بين التكلفة المقيسة، والتكلفة
 *   المقدرة، والتكلفة المجهولة» · «تسجيل غير المقيس بوصفه null» · «عدم
 *   استخدام تكلفة تقديرية باعتبارها حقيقة محاسبية».
 *
 *   And: «هذا إصلاح لدقة البيانات؛ لا تمنحه صلاحية تغيير أرصدة المبدعين أو
 *   أسعارهم.» Nothing here is read by the gate, by any price, or by any
 *   balance. It writes a record and nothing else.
 */

export type CostBasisState = 'MEASURED' | 'ESTIMATED' | 'UNKNOWN';

export interface ResolvedProviderCost {
  /** USD this operation cost the Empire, or null when nobody has measured it. */
  readonly usd: number | null;
  readonly basis: CostBasisState;
  /** The provider that actually served it, or null when that is unsettled. */
  readonly provider: string | null;
  /** Where the number came from — a production, a ruling, or nothing. */
  readonly source: string;
  /** When it was measured, as the cost truth records it. */
  readonly measuredOn: string | null;
}

const UNKNOWN = (reason: string): ResolvedProviderCost => ({
  usd: null,
  basis: 'UNKNOWN',
  provider: null,
  source: reason,
  measuredOn: null,
});

/** One entry of the measured truth, converted to USD at the acquisition basis. */
function fromCostTruth(capability: string, credits: number): ResolvedProviderCost {
  const entry = QIYAMAH_COST_TRUTH.find((c) => c.capability === capability);
  if (!entry || entry.credits === null || entry.basis === 'UNKNOWN') {
    return UNKNOWN(`qiyamah-cost-truth has no measured figure for ${capability}`);
  }
  return {
    usd: credits * CREDIT_USD,
    basis: entry.basis === 'MEASURED' ? 'MEASURED' : 'ESTIMATED',
    provider: entry.provider,
    source: `qiyamah-cost-truth · ${capability} · ${entry.measuredFrom ?? 'basis adopted by ruling'}`,
    measuredOn: entry.effectiveFrom,
  };
}

/**
 * What one recorded operation cost the Empire.
 *
 * `units` is the record's own quantity — images, characters, seconds — in the
 * unit that operation counts in. It is multiplied only where the measured
 * figure is per-unit; where the measurement is per-operation it is ignored,
 * and where there is no measurement it changes nothing.
 */
export function resolveProviderCost(
  operationType: OperationType,
  units: number,
): ResolvedProviderCost {
  switch (operationType) {
    case OperationType.IMAGE_GENERATION: {
      // MEASURED: 100 provider credits per image, nano-banana-2 through
      // Magic Hour — the binding every live image road actually dispatches to.
      const perImage = fromCostTruth('IMAGE_GENERATION', 100);
      if (perImage.usd === null) return perImage;
      return { ...perImage, usd: perImage.usd * Math.max(1, units) };
    }

    case OperationType.TEXT_TO_SPEECH:
      // The three voice roads run on ElevenLabs, whose charge is per
      // CHARACTER and has never been measured for this Empire. The cost
      // truth records `VOICE_AND_TTS` as UNKNOWN in terms, and the OpenAI
      // rate card that used to answer here describes another provider.
      return UNKNOWN(
        'ElevenLabs charges per character and no AZMA production has been measured; '
        + 'qiyamah-cost-truth records VOICE_AND_TTS as UNKNOWN',
      );

    case OperationType.VOICE_CLONE:
      return UNKNOWN(
        'ElevenLabs voice cloning has never been measured for this Empire; '
        + 'the former $0.300 figure was a conservative guess with no source',
      );

    default:
      return UNKNOWN(`no measured provider cost is recorded for ${operationType}`);
  }
}
