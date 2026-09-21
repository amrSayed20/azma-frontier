import { isChamberDestination } from '@/src/constitutional-navigation';
import type { ChamberDestination } from '@/src/constitutional-navigation';

/**
 * AZMA OS — THE IMPERIAL AWARENESS ENGINE
 * Which Chamber the Creator is actually in.
 *
 * ─── THE FIELD THAT EXISTED AND WAS NEVER WIRED ─────────────────────────────
 *
 *   `AwarenessContext.chamber` has been declared since the Awareness &
 *   Manifestation Ruling, carrying an honest admission in its own comment:
 *   "Reserved for future integration — not yet wired to a real source."
 *
 *   So the engine that decides what a Creator may do has never known which
 *   Chamber they are standing in. Every caller passes `threshold` by hand —
 *   three call sites, three hand-written strings — and the Chamber is simply
 *   absent from the decision.
 *
 *   This is the wiring, and nothing more. No new vocabulary, no second
 *   registry, no widening of what Awareness decides today.
 *
 * ─── WHY THE PATH INFORMS BUT DOES NOT DECIDE ───────────────────────────────
 *
 *   A pathname arrives from the browser, which is transport and never
 *   authority. It is therefore used only to ASK a question of the sovereign
 *   registry — `isChamberDestination` — which derives its answer from
 *   `CONTEXT_ROLES` in src/core/tongue/constitution.ts, the closed list of
 *   Chambers.
 *
 *   The consequence is the one that matters: no string a client can craft
 *   produces a Chamber identity. `/qiyamah-chamber-x`, `/../ras-amr`, a
 *   spoofed header — each resolves to null, because the registry is asked
 *   rather than the path trusted.
 *
 * ─── WHY chamber-directory AND NOT route-context ────────────────────────────
 *
 *   Two path-to-Chamber mechanisms already exist:
 *
 *     constitutional-navigation/chamber-directory.ts   DERIVES the five from
 *                                                      CONTEXT_ROLES
 *     sovereign-identity/director-stage/route-context.ts
 *                                                      hardcodes the five in
 *                                                      a hand-written Set
 *
 *   The second duplicates the vocabulary the first inherits. This builds on
 *   the derived one, so no third mechanism is created and no hand-written list
 *   is added to the Empire. The duplication in route-context is pre-existing,
 *   serves DirectorStage's scene identity (which also resolves Imperial
 *   Gates), and is reported rather than touched.
 */

/**
 * The Chamber a pathname stands in, or null.
 *
 * Null is a real answer, not a failure: the Gate, /signup, /login, the Foyer
 * and the High Council are legitimate places that are not Chambers. The
 * Tongue names that state 'universal'; this returns null so a caller must
 * handle "no Chamber" explicitly rather than receive a sentinel it might
 * mistake for one.
 */
export function resolveChamberFromPath(pathname: string | null | undefined): ChamberDestination | null {
  if (typeof pathname !== 'string') return null;

  // The first segment only. A Chamber's pathname is '/' + its id — the same
  // fact chamber-directory's getChamberPathname already depends on — so
  // nothing deeper can name a Chamber, and a nested route inside one still
  // stands in it.
  //
  // A query or fragment is cut away first. `/ras-amr?tab=gallery` genuinely
  // stands in Ras Al Amr, and reading `ras-amr?tab=gallery` as the id would
  // have answered null for a Creator who is plainly inside the Chamber.
  // (usePathname does not carry either, so this guards a caller that passes a
  // fuller address rather than a case Next.js produces.)
  //
  // It cannot loosen the refusals: `/?chamber=ras-amr` and `/#ras-amr` still
  // leave an EMPTY first segment once the query and fragment are gone.
  const firstSegment = pathname.split('/').filter(Boolean)[0]?.split(/[?#]/)[0];
  if (!firstSegment) return null;

  // The registry decides. The path only asked.
  return isChamberDestination(firstSegment) ? firstSegment : null;
}
