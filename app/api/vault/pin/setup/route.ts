import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { hashPassword } from '../../../../../src/authentication';
import { getDb, setVaultPinHash } from '../../../../../src/persistent-storage';
import { issueVaultUnlock } from '../../../../../src/vault/vault-access';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
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

  const pinHash = await hashPassword(pin);
  const db = getDb();
  setVaultPinHash(db, session.creatorId, pinHash);

  // From this moment the gate is engaged for this Creator — open it for the
  // session that just set it, or the palace would refuse its own owner.
  const response = NextResponse.json({ status: 'succeeded' });
  issueVaultUnlock(response, session.creatorId);
  return response;
}
