import { NextRequest, NextResponse } from 'next/server';
import { logOut, verifySession } from '../../../../src/authentication';
import { getDb, deleteVaultUnlocksForCreator } from '../../../../src/persistent-storage';
import { VAULT_UNLOCK_COOKIE } from '../../../../src/vault/vault-access';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    // Signing out closes the Vault gate too: every outstanding unlock of
    // this Creator dies with the session, not twelve hours later.
    const session = verifySession(sessionId);
    if (session) {
      deleteVaultUnlocksForCreator(getDb(), session.creatorId);
    }
    logOut(sessionId);
  }

  const response = NextResponse.json({ status: 'succeeded' });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(VAULT_UNLOCK_COOKIE);
  return response;
}
