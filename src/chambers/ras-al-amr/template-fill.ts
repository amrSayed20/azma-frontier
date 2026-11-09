/**
 * AZMA OS — RAS AL AMR: A TEMPLATE FILLED WITH THE CREATOR'S OWN WORK.
 *
 * ─── THE FOUNDER'S INSTRUCTION, 2026-11-09 ──────────────────────────────────
 *
 *   «املأ هذه القوالب بأصولٍ حقيقيّةٍ من الخزانة.»
 *
 *   A template preview that shows the same drawn placeholders to every
 *   Creator tells them what the SHAPE is and nothing about what THEIR film
 *   will look like. Filled with their own pictures, the same preview answers
 *   the only question they actually have: «ما الذي سيحدث لو استعملتُه؟»
 *
 * ─── WHAT THIS IS NOT ALLOWED TO DO ─────────────────────────────────────────
 *
 *   · It never invents an asset, and never borrows one that is not theirs —
 *     it is handed the Creator's own Vault and reads nothing else.
 *   · It never claims a slot is filled when it is not. A slot with no asset
 *     keeps the drawn placeholder and SAYS it is a placeholder, so a Creator
 *     is never shown their own work where there is none.
 *   · It never reorders or re-times the template. Slot durations, roles and
 *     transitions belong to the template; this chooses pictures, nothing
 *     more.
 *   · It costs nothing. Filling a preview is reading the Vault, not
 *     producing — no provider is called and no unit is held.
 */
import type { VaultAsset } from '../../vault/sovereign-vault-types';
import { AssetFamily } from '../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';

/** One template slot, with whatever the Creator's Vault could put in it. */
export interface FilledSlot {
  /** The slot's index in the template, unchanged. */
  readonly index: number;
  /** The Creator's own asset, when one could fill this slot. */
  readonly asset: VaultAsset | null;
  /**
   * True when this slot shows the template's own drawn placeholder because
   * the Vault had nothing more to give. A preview must be able to say so.
   */
  readonly isPlaceholder: boolean;
}

/** Can this asset stand in a visual slot at all? */
export function canFillVisualSlot(asset: VaultAsset): boolean {
  const uri = asset.secureStorageUri;
  if (typeof uri !== 'string' || uri.length === 0) return false;
  // A document is not a picture, whatever it is named.
  if (asset.assetFamily !== AssetFamily.MEDIA) return false;
  // Sound is never a visual slot — a narration in a picture slot would be an
  // empty frame wearing a filename. The test is the Empire's own: the same
  // CapabilityTarget the workshop's thumbnail reads, not a parsed filename.
  return asset.capabilityTarget !== CapabilityTarget.AUDIO;
}

/**
 * Fill a template's slots from the Creator's Vault.
 *
 * `slotCount` comes from the template and is never changed here. Assets are
 * taken in the order given — the caller hands them newest-first, so a Creator
 * sees their most recent work, which is what they were just looking at.
 *
 * When the Vault holds fewer visual assets than the template has slots, the
 * assets CYCLE rather than leaving a run of empty frames at the end: a
 * Creator with one picture should see the rhythm of a five-slot template, not
 * one frame and four blanks. A Vault with nothing visual leaves every slot a
 * declared placeholder.
 */
export function fillTemplateSlots(
  slotCount: number,
  vault: readonly VaultAsset[],
): readonly FilledSlot[] {
  const usable = vault.filter(canFillVisualSlot);
  const slots: FilledSlot[] = [];
  for (let index = 0; index < Math.max(0, slotCount); index += 1) {
    const asset = usable.length > 0 ? usable[index % usable.length]! : null;
    slots.push({ index, asset, isPlaceholder: asset === null });
  }
  return slots;
}

/** How many of this template's slots the Creator's own work actually fills. */
export function filledSlotCount(slots: readonly FilledSlot[]): number {
  return slots.filter((s) => !s.isPlaceholder).length;
}
