/**
 * AZMA OS — A DOOR THAT OPENS ONCE, FOR ONE ASSET, FOR MINUTES
 *
 * ─── WHY ANY PUBLIC DOOR EXISTS AT ALL ──────────────────────────────────────
 *
 *   Instagram's Content Publishing API does not accept bytes. It accepts a URL
 *   and fetches the file with Meta's own servers. Every sovereign asset in this
 *   Empire sits behind a session and an ownership check, so without a door
 *   Instagram cannot be published to — not badly, at all.
 *
 * ─── AND WHY IT NEEDS NO TABLE ──────────────────────────────────────────────
 *
 *   The grant IS the token. It names one asset, one owner and one expiry, and
 *   it is sealed with the Empire's own key by the same AES-256-GCM vault that
 *   holds Creators' provider tokens. Nothing is written down, so nothing can
 *   be left behind: a grant expires by arithmetic rather than by a sweep that
 *   must be remembered.
 *
 *   Forging one requires the server key. Replaying one buys nothing once the
 *   minutes are spent. And because the owner is sealed inside, a grant minted
 *   for one Creator's asset cannot be pointed at another's.
 *
 * ─── WHAT IT IS NOT ─────────────────────────────────────────────────────────
 *
 *   Not a publication, not a share link, not `sovereign_public_links` — which
 *   serves a finished film under Article 9.3 and can be withdrawn by its owner
 *   forever. This is a few minutes of read access for a machine, and it is
 *   never shown to a human.
 */

import { encryptToken, decryptToken, isTokenVaultConfigured } from './token-vault';

/** Long enough for Meta to fetch a file, short enough to be worthless after. */
export const MEDIA_GRANT_TTL_MS = 10 * 60 * 1000;

interface Grant {
  readonly a: string;   // assetId
  readonly o: string;   // ownerId
  readonly e: number;   // expires at, ms
}

/**
 * Seal a grant for one asset. Returns null when the vault has no key — the
 * same refusal the vault makes everywhere, never a weaker fallback.
 */
export function mintMediaGrant(assetId: string, ownerId: string, nowMs: number = Date.now()): string | null {
  if (!isTokenVaultConfigured()) return null;
  const grant: Grant = { a: assetId, o: ownerId, e: nowMs + MEDIA_GRANT_TTL_MS };
  // base64url so the sealed value survives a URL path untouched.
  return encodeURIComponent(encryptToken(JSON.stringify(grant)));
}

/**
 * Open a grant, or return null.
 *
 * Null for a malformed token, a tampered one, one sealed under a different
 * key, and one whose minutes are spent. The caller answers all four the same
 * way — 404 — so a token cannot be probed for which kind of wrong it is.
 */
export function openMediaGrant(token: string, nowMs: number = Date.now()): { assetId: string; ownerId: string } | null {
  let raw: string | null;
  try {
    raw = decryptToken(decodeURIComponent(token));
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const grant = JSON.parse(raw) as Partial<Grant>;
    if (typeof grant.a !== 'string' || typeof grant.o !== 'string' || typeof grant.e !== 'number') return null;
    if (grant.e <= nowMs) return null;
    return { assetId: grant.a, ownerId: grant.o };
  } catch {
    return null;
  }
}
