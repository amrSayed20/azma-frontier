import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { hashPassword } from '../../../../../src/authentication';
import { getDb, setVaultPinHash, getVaultPinHash, deleteVaultUnlocksForCreator } from '../../../../../src/persistent-storage';
import { checkVaultAccess, issueVaultUnlock, VAULT_LOCKED_BODY } from '../../../../../src/vault/vault-access';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
  }

  // Changing an existing PIN is a Vault operation: it needs the gate open.
  // First-time setup (no PIN yet) has no second factor to enforce.
  if (getVaultPinHash(getDb(), session.creatorId) !== null) {
    const access = checkVaultAccess(request);
    if (access.status !== 'ok') {
      return NextResponse.json(VAULT_LOCKED_BODY, { status: 403 });
    }
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
  // A new PIN invalidates every unlock minted under the old one.
  deleteVaultUnlocksForCreator(db, session.creatorId);

  // From this moment the gate is engaged for this Creator — open it for the
  // session that just set it, or the palace would refuse its own owner.
  const response = NextResponse.json({ status: 'succeeded' });
  issueVaultUnlock(response, session.creatorId);
  return response;
}
