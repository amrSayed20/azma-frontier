import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/signup — CLOSED.
 *
 * ─── WHAT WAS MEASURED HERE ─────────────────────────────────────────────────
 *
 *   A POST carrying any string that matched
 *
 *       /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *
 *   produced a Creator account AND set a session cookie in the same response.
 *   That regular expression checks that a string LOOKS like an address. It was
 *   the only thing between a stranger and an account.
 *
 *   Nothing in this repository could prove a person could receive mail at that
 *   address: zero matches for emailVerified, verificationToken or any
 *   confirmation flow, and no column on `creators` to hold such a fact even if
 *   one had existed. So every account here rested on an assertion nobody
 *   checked, and the session — the thing that grants access — was created
 *   before any of it could have been checked.
 *
 * ─── WHAT REPLACED IT ───────────────────────────────────────────────────────
 *
 *   The address is now the RESULT of a verified identity, never the evidence
 *   for one. Registration begins at /api/auth/google/start, and an account
 *   exists only after the server has verified a provider's assertion — its
 *   signature, issuer, audience, expiry and nonce — with `email_verified` read
 *   from the verified payload and from nowhere else.
 *
 *   This route answers 410 rather than 404, and names the door. A 404 reads as
 *   a broken Empire to anyone holding an old link; a closed path should say
 *   that it is closed and where to go instead.
 */
export async function POST() {
  return NextResponse.json(
    {
      status: 'failed',
      reason: 'registration-requires-verified-identity',
      message: 'أنشئ حسابك عبر جوجل. البريدُ وحده لا يُثبت أنّه لك.',
      registerAt: '/api/auth/google/start',
    },
    { status: 410 },
  );
}
