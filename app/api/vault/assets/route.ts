import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';
import { SovereignVaultManager } from '../../../../src/vault/sovereign-vault-manager';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const vaultManager = new SovereignVaultManager();

/**
 * INTEGRATION PACKAGE II — THE FIRST CREATOR-VISIBLE INTEGRATION
 * (2026-07-25): the real Sovereign Vault Palace's data source. Mirrors
 * /api/qiyamah/generations exactly — same session gate, same shape of
 * response. Surfaces only assets already durably deposited by
 * Integration Package I (src/qiyamah-generation); no new business logic.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized', message: 'Sign in to see your Vault.' }, { status: 401 });
  }

  const assets = await vaultManager.listAssetsForTenant(session.creatorId);
  return NextResponse.json({ status: 'succeeded', assets });
}
