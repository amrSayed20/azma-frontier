/**
 * AZMA OS — open the Vault with a fingerprint or face.
 *
 * GET  issues the authentication challenge for this Creator's enrolled devices.
 * POST verifies the signed assertion.
 *
 * Failed attempts share the PIN's tracker: five failures inside fifteen minutes
 * closes the gate to both, so an attacker cannot simply switch tabs to get a
 * fresh budget.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { beginEntry, completeEntry } from '../../../../../src/vault/vault-biometric-service';
import {
  isPinAttemptBlocked,
  recordFailedPinAttempt,
  clearPinAttempts,
} from '../../../../../src/vault/vault-pin-service';
import type { AuthenticationResponseJSON } from '@simplewebauthn/server';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

function creatorFrom(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  return sessionId ? verifySession(sessionId) : null;
}

export async function GET(request: NextRequest) {
  const session = creatorFrom(request);
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
  }
  if (isPinAttemptBlocked(session.creatorId)) {
    return NextResponse.json(
      { status: 'blocked', message: 'محاولات كثيرة — انتظر 15 دقيقة' },
      { status: 429 },
    );
  }

  const options = await beginEntry(session.creatorId);
  if (!options) {
    return NextResponse.json({ status: 'no-device', message: 'لا جهاز مسجَّل بعد.' });
  }
  return NextResponse.json({ status: 'succeeded', options });
}

export async function POST(request: NextRequest) {
  const session = creatorFrom(request);
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
  }
  if (isPinAttemptBlocked(session.creatorId)) {
    return NextResponse.json(
      { status: 'blocked', message: 'محاولات كثيرة — انتظر 15 دقيقة' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', reason: 'invalid-request' }, { status: 400 });
  }

  const { response } = (body ?? {}) as { response?: AuthenticationResponseJSON };
  if (!response || typeof response !== 'object') {
    return NextResponse.json({ status: 'failed', reason: 'invalid-request' }, { status: 400 });
  }

  const outcome = await completeEntry(session.creatorId, response);
  if (outcome.status === 'authenticated') {
    clearPinAttempts(session.creatorId);
    return NextResponse.json({ status: 'authenticated' });
  }

  recordFailedPinAttempt(session.creatorId);
  return NextResponse.json(
    { status: 'failed', reason: outcome.reason, message: 'لم يتحقّق الجهاز.' },
    { status: 401 },
  );
}
