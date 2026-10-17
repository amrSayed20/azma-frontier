import { NextRequest, NextResponse } from 'next/server';
import { changePassword, verifySession, failedPasswordChangesByCreator } from '../../../../src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/auth/password — a signed-in Creator changes their password.
 * Body: { currentPassword: string, newPassword: string }
 * The current password is required; every other session of the Creator
 * ends, this one stays signed in.
 */
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!sessionId || !session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized', message: 'Sign in to change your password.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', reason: 'invalid-input', message: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const { currentPassword, newPassword } = (body ?? {}) as { currentPassword?: unknown; newPassword?: unknown };
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    return NextResponse.json({ status: 'failed', reason: 'invalid-input', message: 'The current and the new password are required.' }, { status: 400 });
  }

  if (failedPasswordChangesByCreator.isBlocked(session.creatorId)) {
    const retryAfter = failedPasswordChangesByCreator.retryAfterSeconds(session.creatorId);
    return NextResponse.json(
      { status: 'failed', reason: 'too-many-attempts', message: 'Too many incorrect attempts. Try again later.', retryAfterSeconds: retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  const outcome = await changePassword(sessionId, currentPassword, newPassword);
  if (outcome.status === 'failed') {
    if (outcome.reason === 'invalid-credentials') failedPasswordChangesByCreator.record(session.creatorId);
    return NextResponse.json(outcome, { status: outcome.reason === 'invalid-credentials' ? 403 : 400 });
  }
  failedPasswordChangesByCreator.clear(session.creatorId);
  return NextResponse.json({ status: 'succeeded' });
}
