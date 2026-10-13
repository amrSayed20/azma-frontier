/**
 * AZMA OS — WHAT TO CALL ONE OF THE CREATOR'S OWN ASSETS
 *
 * ─── WHY THIS EXISTS AS ITS OWN RULE ────────────────────────────────────────
 *
 *   MEASURED 2026-10-13 on the deployed release: the Creator owned 49 images
 *   and 45 clips, and the picker named every clip with the SAME sentence —
 *   «مقطعٌ في خزانتك», forty-five identical rows. A name that cannot tell one
 *   asset from its neighbour is not a name; it is the shape of a name.
 *
 *   The rule lives here rather than inside the chamber's own component for one
 *   plain reason: it is a rule, it is testable without a browser, and a rule
 *   buried in three thousand lines of screen is a rule nobody can check.
 */

/** One of the Creator's assets, as the picker needs to show it. */
export interface VaultPick {
  readonly assetId: string;
  readonly url: string;
  readonly kind: 'VISUAL' | 'MOTION' | 'AUDIO';
  /** What this one is, in a sentence no sibling shares. */
  readonly nameAr: string;
  readonly createdAtMs: number | null;
  readonly pixelWidth: number | null;
  readonly pixelHeight: number | null;
}

const ARABIC_DATE = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long' });

/**
 * The asset's name, taken from what the asset itself records.
 *
 * In order of how much it actually says: the act that produced it, then the
 * hand that uploaded it, then the day it arrived. Every branch ends in
 * something that differs between two assets — because that is the entire job.
 *
 * It invents nothing. An asset whose metadata says nothing and whose date is
 * missing gets the only honest answer left, and that case is the one the
 * picker's own thumbnail then has to carry.
 */
export function assetNameAr(a: {
  readonly derivation?: string;
  readonly createdAt?: number;
  readonly metadata?: Record<string, unknown> | null;
}): string {
  const made = a.metadata && typeof a.metadata.mutationInstructionAr === 'string'
    ? a.metadata.mutationInstructionAr.trim()
    : '';
  const day = typeof a.createdAt === 'number' ? ARABIC_DATE.format(new Date(a.createdAt)) : '';
  if (made.length > 0) return day ? `${made} · ${day}` : made;
  if (a.derivation === 'UPLOADED') return day ? `رفعتَه ${day}` : 'رفعتَه بنفسك';
  return day ? `أُودِع ${day}` : 'أصلٌ في خزانتك';
}

/**
 * The Vault family an input name means.
 *
 * The catalog names inputs as the act sees them — `asset`, `video-asset`,
 * `audio-asset`, `face-asset`. The Vault stores families. This is the ONE
 * translation between them, so the picker, the drop area and the server cannot
 * disagree about what may fill a slot.
 */
export function familyOfInput(input: string | undefined): 'VISUAL' | 'MOTION' | 'AUDIO' {
  if (input === 'audio-asset') return 'AUDIO';
  if (input === 'video-asset') return 'MOTION';
  return 'VISUAL';
}

export const FAMILY_AR: Readonly<Record<'VISUAL' | 'MOTION' | 'AUDIO', string>> = {
  VISUAL: 'صورة', MOTION: 'مقطعاً', AUDIO: 'صوتاً',
};

export type DropVerdict =
  | { readonly ok: true; readonly assetId: string }
  | { readonly ok: false; readonly reasonAr: string | null };

/**
 * May this dropped asset fill this slot?
 *
 * A pure rule, so it can be proven without a browser — and so no second caller
 * can answer it differently. Three ways to refuse, and NONE of them touches a
 * selection already made: a Creator who drops the wrong thing must not lose
 * the right thing they chose a moment ago.
 *
 * A malformed or foreign payload refuses in SILENCE. They dragged something
 * that was never ours, and scolding them for it would be noise.
 */
export function dropVerdict(raw: string | null, accepts: 'VISUAL' | 'MOTION' | 'AUDIO'): DropVerdict {
  if (!raw) return { ok: false, reasonAr: null };
  let payload: { assetId?: unknown; kind?: unknown };
  try { payload = JSON.parse(raw) as typeof payload; } catch { return { ok: false, reasonAr: null }; }
  if (typeof payload.assetId !== 'string' || payload.assetId.length === 0) {
    return { ok: false, reasonAr: null };
  }
  if (payload.kind !== accepts) {
    return {
      ok: false,
      reasonAr: `هذا ${FAMILY_AR[payload.kind as 'VISUAL'] ?? 'أصل'}، وهذا الموضع يَقبل ${FAMILY_AR[accepts]}.`,
    };
  }
  return { ok: true, assetId: payload.assetId };
}

/**
 * What is true about an asset besides its name — and only what is measured.
 *
 * Dimensions come from the Vault's own columns. No duration is claimed here: a
 * clip's length is read from the file by the browser that draws it, and a clip
 * nobody has read yet simply does not mention one.
 */
export function assetMetaAr(a: Pick<VaultPick, 'kind' | 'pixelWidth' | 'pixelHeight'>): string {
  const bits: string[] = [];
  if (a.kind === 'MOTION') bits.push('مقطع');
  else if (a.kind === 'AUDIO') bits.push('صوت');
  if (a.pixelWidth && a.pixelHeight) bits.push(`${a.pixelWidth}×${a.pixelHeight}`);
  return bits.join(' · ');
}
