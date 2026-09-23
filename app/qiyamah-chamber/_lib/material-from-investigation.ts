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
/**
 * A Creation Demand crossing from Hujjah — the same envelope discipline, a
 * different thing inside it. A demand was written FOR a Chamber; an
 * investigation is raw material that a Chamber may take up. When both are
 * present the demand wins, because the Creator asked for it by name.
 */
export const DEMAND_ENVELOPE_KEY = 'azma.transfer.demand';
/** Identity kept for this tab, so a refresh re-resolves instead of forgetting. */
export const MATERIAL_KEY = 'azma.qiyamah.material';

/** What Hujjah records on the asset it keeps; read back from the Vault list. */
export interface InvestigationAssetMetadata {
  readonly originChamber?: unknown;
  readonly questionAr?: unknown;
  readonly answerAr?: unknown;
  /** 'creation-demand' when Hujjah wrote this FOR a Chamber. */
  readonly kind?: unknown;
  readonly demandAr?: unknown;
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
  // A demand was addressed to this Chamber by name; it outranks raw material.
  for (const key of [DEMAND_ENVELOPE_KEY, INVESTIGATION_ENVELOPE_KEY]) {
    const envelope = storage.getItem(key);
    if (envelope === null) continue;
    storage.removeItem(key);
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
  // A Creation Demand already says what should be made, in this Chamber's own
  // terms. Nothing is added to it: appending the raw question would dilute a
  // brief that was written deliberately.
  const demand = typeof meta?.demandAr === 'string' ? meta.demandAr.trim() : '';
  if (demand) return demand.slice(0, IDEA_BUDGET);

  const question = typeof meta?.questionAr === 'string' ? meta.questionAr.trim() : '';
  const answer = typeof meta?.answerAr === 'string' ? meta.answerAr.trim() : '';
  if (!question && !answer) return null;
  const composed = answer ? `${question}\n\n${answer}` : question;
  return composed.slice(0, IDEA_BUDGET);
}

/**
 * What became of an arrival — one value, so silence is not a possible answer.
 *
 * ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
 *
 *   MEASURED on production 2026-09-23: crossing into Qiyamah carrying an
 *   identity whose asset this Creator no longer owns produced an empty idea
 *   field, the plain label «فكرتك», and not one word about what happened.
 *   Nothing false was claimed — and nothing true was said either. The Creator
 *   was left to rebuild by hand the investigation they had just finished.
 *
 *   The four outcomes are kept apart because they are different truths and
 *   the Creator acts differently on each. «We could not reach your Vault» is
 *   not «it is not in your Vault»: the first is ours to retry, the second is
 *   theirs to know. Conflating them would be a comfortable lie.
 */
export type MaterialArrival =
  | { readonly kind: 'arrived'; readonly idea: string }
  | { readonly kind: 'vault-unreachable' }
  | { readonly kind: 'not-in-vault' }
  | { readonly kind: 'no-usable-text' };

/**
 * Decide the arrival from what the Vault answered.
 *
 * `assets === null` means the Vault could not be asked or did not answer with
 * a list — never that the material is gone.
 */
export function resolveArrival<A extends VaultAssetLike>(
  assets: readonly A[] | null,
  assetId: string,
): MaterialArrival {
  if (assets === null) return { kind: 'vault-unreachable' };
  const asset = pickInvestigationAsset(assets, assetId);
  if (!asset) return { kind: 'not-in-vault' };
  const idea = composeIdeaFromInvestigation(asset.metadata);
  if (!idea) return { kind: 'no-usable-text' };
  return { kind: 'arrived', idea };
}

/**
 * The actual condition, in the Creator's language. `null` on arrival: material
 * that is present says so by being present, in the field and in its label.
 */
export function spokenArrival(arrival: MaterialArrival): string | null {
  switch (arrival.kind) {
    case 'arrived':           return null;
    case 'vault-unreachable': return 'تعذّر الوصول إلى خزانتك الآن — لم نُحضر مادتك من حجّة الدامغة. أعد التحميل.';
    case 'not-in-vault':      return 'لم نجد مادتك من حجّة الدامغة في خزانتك.';
    case 'no-usable-text':    return 'مادتك من حجّة الدامغة لا تحمل نصاً تبدأ منه القيامة.';
  }
}
