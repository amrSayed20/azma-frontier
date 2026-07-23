/**
 * AZMA OS — FOUNDER ACCESS FOUNDATION
 * The Founder Gate
 *
 * Per "The Founder Identity Resolution": one authentication system, no
 * competing Founder definition. This is a thin, testable wrapper around
 * the already-certified Authentication Foundation's own verifySession()
 * — it adds nothing new, it only asks the one additional question every
 * Founder-only surface needs: is this specifically a Founder session,
 * not merely any authenticated session?
 */

import { verifySession } from '../authentication';
import type { VerifiedSession } from '../authentication';

export function verifyFounderSession(sessionId: string | undefined | null): VerifiedSession | null {
  if (!sessionId) return null;

  const session = verifySession(sessionId);
  if (!session || session.role !== 'founder') return null;

  return session;
}
