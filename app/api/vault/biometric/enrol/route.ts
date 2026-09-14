/**
 * AZMA OS — enrol this device to open the Vault by fingerprint or face.
 *
 * GET  issues the registration challenge.
 * POST verifies what the device signed and stores its public key.
 *
 * A Creator must already hold a session: biometric entry is a second gate on
 * the Vault, never a way around signing in.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { getDb, getCreator } from '../../../../../src/persistent-storage';
import { beginEnrolment, completeEnrolment } from '../../../../../src/vault/vault-biometric-service';
import type { RegistrationResponseJSON } from '@simplewebauthn/server';

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

  const creator = getCreator(getDb(), session.creatorId);
  const options = await beginEnrolment(
    session.creatorId,
    creator?.displayName ?? creator?.email ?? 'Creator',
  );
  return NextResponse.json({ status: 'succeeded', options });
}

export async function POST(request: NextRequest) {
  const session = creatorFrom(request);
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', reason: 'invalid-request' }, { status: 400 });
  }

  const { response, deviceLabel } = (body ?? {}) as {
    response?: RegistrationResponseJSON;
    deviceLabel?: unknown;
  };
  if (!response || typeof response !== 'object') {
    return NextResponse.json({ status: 'failed', reason: 'invalid-request' }, { status: 400 });
  }

  const label = typeof deviceLabel === 'string' && deviceLabel.trim().length > 0
    ? deviceLabel.trim().slice(0, 60)
    : null;

  const outcome = await completeEnrolment(session.creatorId, response, label);
  if (outcome.status === 'enrolled') {
    return NextResponse.json({ status: 'succeeded', message: 'سُجّل هذا الجهاز لفتح خزانتك.' });
  }
  return NextResponse.json(
    { status: 'failed', reason: outcome.reason, message: 'لم يُسجَّل هذا الجهاز. حاول مرة أخرى.' },
    { status: 400 },
  );
}
