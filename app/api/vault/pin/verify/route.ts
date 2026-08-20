import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { verifyPassword } from '../../../../../src/authentication';
import { getDb, getVaultPinHash } from '../../../../../src/persistent-storage';
import { isPinAttemptBlocked, recordFailedPinAttempt, clearPinAttempts } from '../../../../../src/vault/vault-pin-service';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
  }

  if (isPinAttemptBlocked(session.creatorId)) {
    return NextResponse.json({ status: 'blocked', message: 'محاولات كثيرة — انتظر 15 دقيقة' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', reason: 'invalid-request' }, { status: 400 });
  }

  const pin = (body as Record<string, unknown>)?.pin;

  if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-pin', message: 'PIN must be exactly 4 digits.' },
      { status: 400 },
    );
  }

  const db = getDb();
  const storedHash = getVaultPinHash(db, session.creatorId);

  if (storedHash === null) {
    return NextResponse.json({ status: 'no-pin' });
  }

  const isValid = await verifyPassword(pin, storedHash);

  if (!isValid) {
    recordFailedPinAttempt(session.creatorId);
    return NextResponse.json({ status: 'incorrect', message: 'PIN غير صحيح' });
  }

  clearPinAttempts(session.creatorId);
  return NextResponse.json({ status: 'authenticated' });
}
