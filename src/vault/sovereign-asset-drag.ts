/**
 * AZMA OS — WHAT A DRAGGED SOVEREIGN ASSET CARRIES
 *
 * ─── ONE CONTRACT, ALREADY IN USE ───────────────────────────────────────────
 *
 *   رأس الأمر has dragged sovereign assets since Package XXXII, and its wire
 *   format is the whole contract: a `dataTransfer` entry whose value is the
 *   asset's own id, under this exact type.
 *
 *       e.dataTransfer.setData('application/x-ras-amr-asset-id', asset.id)
 *
 *   مكمن الغاية reads the same type rather than inventing a second one. An
 *   Empire with two drag formats for one sovereign asset has two things to
 *   keep in step, and nothing keeps them.
 *
 * ─── WHY THE NAME STILL SAYS «ras-amr», AND WHY IT IS NOT CHANGED ───────────
 *
 *   FOUNDER, 2026-10-04: «لا تغيير في عقد رأس الأمر الحالي للسحب». The wire
 *   string is that contract, and renaming it would change it. So the value is
 *   defined once HERE — owned by the Vault, which owns asset identity — and
 *   `__tests__/one-drag-contract.test.ts` proves Ras Al Amr's own literal
 *   still matches it. A drift is caught without touching the protected file.
 *
 * ─── AND WHAT IS NEVER DRAGGED ──────────────────────────────────────────────
 *
 *   Not a File, not a Blob, not bytes, not a path. An ASSET ID, which the
 *   server resolves through the ownership boundary it already has. The Vault
 *   stays the source of truth, and a drag moves a reference — never a copy.
 */

/** The `dataTransfer` type a sovereign asset is carried under. */
export const SOVEREIGN_ASSET_DRAG_TYPE = 'application/x-ras-amr-asset-id';

/**
 * Read a sovereign asset id out of a drop, or null.
 *
 * Null for a drop carrying anything else — a file from the desktop, a URL, a
 * selection of text. None of those is a sovereign asset, and treating one as
 * though it were is how a second canonical copy gets created by accident.
 */
export function readDraggedAssetId(dataTransfer: DataTransfer | null): string | null {
  if (!dataTransfer) return null;
  const id = dataTransfer.getData(SOVEREIGN_ASSET_DRAG_TYPE);
  return typeof id === 'string' && id.trim().length > 0 ? id.trim() : null;
}
