/**
 * AZMA OS — a Creation Demand arriving at the Chamber it was written for.
 *
 * ─── WHAT A DEMAND IS ────────────────────────────────────────────────────────
 *
 *   الحُجّة الدامغة investigates and then states what should be created. That
 *   statement is a Creation Demand: a sovereign Vault asset owned by the
 *   Creator, carrying the identity of the investigation that justifies it, and
 *   addressed to exactly one Chamber — because a scene, a production arc and
 *   an objective are different things and a single generic brief serves none.
 *
 * ─── WHY THIS IS SHARED ──────────────────────────────────────────────────────
 *
 *   Three Chambers receive demands and the discipline is identical in all
 *   three: the envelope is journey state, read once and removed once; the
 *   identity is a Vault assetId; the content is resolved through the Vault's
 *   own ownership boundary and never carried by the browser. Written three
 *   times it would drift three ways. It is written once, purely, so it can be
 *   tested without a DOM, a server or a session — and each Chamber supplies
 *   only what is genuinely its own: where the demand lands.
 */

/** The narrowest thing a storage needs to offer. */
export interface DemandStorage {
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

export const DEMAND_ENVELOPE_KEY = 'azma.transfer.demand';

export type DemandDestinationId = 'qiyamah-chamber' | 'ras-amr' | 'makman-al-ghayah';

export interface DemandEnvelope {
  readonly assetId: string;
  readonly destination: DemandDestinationId;
}

export interface DemandAssetLike {
  readonly assetId: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Take the demand addressed to THIS Chamber, and consume the envelope.
 *
 * A demand written for Ras Al Amr must not be taken up by Makman merely
 * because the Creator walked there instead: the Creator chose a destination,
 * and honouring that choice is the whole point of addressing a demand. The
 * envelope is still removed either way — journey state must not linger and be
 * mistaken later for a fresh arrival.
 */
export function takeDemandFor(
  storage: DemandStorage,
  here: DemandDestinationId,
): string | null {
  const raw = storage.getItem(DEMAND_ENVELOPE_KEY);
  if (raw === null) return null;
  storage.removeItem(DEMAND_ENVELOPE_KEY);
  try {
    const parsed = JSON.parse(raw) as Partial<DemandEnvelope>;
    if (typeof parsed.assetId !== 'string' || parsed.assetId.length === 0) return null;
    return parsed.destination === here ? parsed.assetId : null;
  } catch {
    return null;
  }
}

/** What became of the arrival — one value, so silence is not a possible answer. */
export type DemandArrival =
  | { readonly kind: 'arrived'; readonly demandAr: string; readonly questionAr: string | null }
  | { readonly kind: 'vault-unreachable' }
  | { readonly kind: 'not-in-vault' }
  | { readonly kind: 'not-a-demand' };

/**
 * Resolve the demand from what the Vault says this Creator owns.
 *
 * `assets === null` means the Vault could not be asked — never that the demand
 * is gone. Ownership is the Vault's decision, already made: an asset is in
 * this Creator's list or it does not exist for them, so a forged or stale
 * identity naming someone else's asset resolves to nothing.
 */
export function resolveDemand<A extends DemandAssetLike>(
  assets: readonly A[] | null,
  assetId: string,
): DemandArrival {
  if (assets === null) return { kind: 'vault-unreachable' };
  const asset = assets.find((a) => a.assetId === assetId);
  if (!asset) return { kind: 'not-in-vault' };
  const meta = asset.metadata ?? {};
  const demandAr = typeof meta.demandAr === 'string' ? meta.demandAr.trim() : '';
  if (meta.kind !== 'creation-demand' || demandAr.length === 0) return { kind: 'not-a-demand' };
  return {
    kind: 'arrived',
    demandAr,
    questionAr: typeof meta.questionAr === 'string' && meta.questionAr.trim().length > 0
      ? meta.questionAr.trim()
      : null,
  };
}

/**
 * The actual condition, in the Creator's language. `null` on arrival: a demand
 * that is present says so by being present, in the field it landed in.
 */
export function spokenDemandArrival(arrival: DemandArrival): string | null {
  switch (arrival.kind) {
    case 'arrived':           return null;
    case 'vault-unreachable': return 'تعذّر الوصول إلى خزانتك الآن — لم نُحضر مطالبتك. أعد التحميل.';
    case 'not-in-vault':      return 'لم نجد مطالبتك في خزانتك.';
    case 'not-a-demand':      return 'ما وصل ليس مطالبةً إنشائيّة.';
  }
}
