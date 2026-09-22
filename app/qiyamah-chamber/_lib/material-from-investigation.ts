/**
 * AZMA OS — Qiyamah
 * Material from the Chamber of Evidence: the pure half.
 *
 * ─── THE CONTRACT THIS ENCODES ──────────────────────────────────────────────
 *
 *   Three things cross from Hujjah into Qiyamah and they are never the same
 *   thing:
 *
 *     journey state      `azma.transfer.investigation` in sessionStorage —
 *                        an envelope, read once and removed once
 *     material identity  the Vault assetId inside that envelope
 *     material content   the Vault asset itself — owned by the Creator,
 *                        resolved through the Vault's own list, never
 *                        carried by the browser
 *
 *   Everything here is pure so the contract can be tested without a DOM,
 *   a server, or a session. The component does the fetching.
 */

/** The narrowest thing a storage needs to offer. */
export interface EnvelopeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const INVESTIGATION_ENVELOPE_KEY = 'azma.transfer.investigation';
/** Identity kept for this tab, so a refresh re-resolves instead of forgetting. */
export const MATERIAL_KEY = 'azma.qiyamah.material';

/** What Hujjah records on the asset it keeps; read back from the Vault list. */
export interface InvestigationAssetMetadata {
  readonly originChamber?: unknown;
  readonly questionAr?: unknown;
  readonly answerAr?: unknown;
}

export interface VaultAssetLike {
  readonly assetId: string;
  readonly metadata?: InvestigationAssetMetadata | Record<string, unknown>;
}

/** Qiyamah's idea input accepts this many characters; so does the generation prompt. */
export const IDEA_BUDGET = 1000;

/**
 * Take the material identity for this arrival.
 *
 * The envelope wins and is consumed — journey state must not linger. An
 * envelope without an identity (the shape written before 2026-09-22 carried
 * evidence and no assetId) names nothing sovereign and yields null, and it
 * is still removed: it can never be resolved, so keeping it would only let
 * a later arrival mistake it for material. With no envelope, the identity
 * kept for this tab is answered, so a refresh finds the same asset again.
 */
export function takeMaterialIdentity(storage: EnvelopeStorage): string | null {
  const envelope = storage.getItem(INVESTIGATION_ENVELOPE_KEY);
  if (envelope !== null) {
    storage.removeItem(INVESTIGATION_ENVELOPE_KEY);
    const assetId = assetIdOf(envelope);
    if (assetId) storage.setItem(MATERIAL_KEY, JSON.stringify({ assetId }));
    return assetId;
  }
  const kept = storage.getItem(MATERIAL_KEY);
  return kept === null ? null : assetIdOf(kept);
}

function assetIdOf(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as { assetId?: unknown };
    return typeof parsed.assetId === 'string' && parsed.assetId.length > 0 ? parsed.assetId : null;
  } catch {
    return null;
  }
}

/**
 * Pick the investigation asset out of what the Vault says this Creator owns.
 *
 * Ownership is the Vault's decision, already made: an asset is in the list
 * or it does not exist for this Creator. This only adds the one check the
 * Vault cannot make for Qiyamah — that the asset is an investigation from
 * Hujjah, and not any other asset whose id an envelope happened to carry.
 */
export function pickInvestigationAsset<A extends VaultAssetLike>(assets: readonly A[], assetId: string): A | null {
  const asset = assets.find((a) => a.assetId === assetId);
  if (!asset) return null;
  return asset.metadata?.originChamber === 'hujjah-al-damighah' ? asset : null;
}

/**
 * The idea Qiyamah can take up from a kept investigation: the question, and
 * the synthesized answer when there is one, within the idea's budget.
 */
export function composeIdeaFromInvestigation(meta: InvestigationAssetMetadata | Record<string, unknown> | undefined): string | null {
  const question = typeof meta?.questionAr === 'string' ? meta.questionAr.trim() : '';
  const answer = typeof meta?.answerAr === 'string' ? meta.answerAr.trim() : '';
  if (!question && !answer) return null;
  const composed = answer ? `${question}\n\n${answer}` : question;
  return composed.slice(0, IDEA_BUDGET);
}
