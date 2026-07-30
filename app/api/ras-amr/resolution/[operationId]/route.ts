/**
 * GET /api/ras-amr/resolution/[operationId]
 *
 * Resolves a CINEMATIC production operation: checks with the fleet provider,
 * deposits the resulting asset in the Sovereign Vault, then records COMPLETED
 * status in the Cinematic Ledger.
 *
 * Safe to call multiple times — the gateway throws "already been completed"
 * when the operation is already DEPOSITED; the route maps this to a
 * deterministic `succeeded / COMPLETED` response so clients can poll safely.
 *
 * Tenant isolation is enforced inside AsynchronousResolutionGateway:
 * it checks that the operation's subscriberTenantId matches the authenticated
 * session before doing anything. The Cinematic Ledger update that follows
 * relies on that upstream check — it operates on operationId only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { fleetRuntime, cinemaLedger } from '../../../../../src/sovereign-entry/composition';
import { RenderStatus } from '../../../../../src/chambers/makman-al-ghayah/rendering-bridge';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ operationId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to check production status.' },
      { status: 401 },
    );
  }

  const { operationId } = await params;

  try {
    const vaultAsset = await fleetRuntime.resolutionGateway.checkAndResolveOperation(
      operationId,
      session.creatorId,
    );

    if (!vaultAsset) {
      return NextResponse.json({ status: 'processing' });
    }

    cinemaLedger.updateProductionStatusByOperationId(
      operationId,
      RenderStatus.COMPLETED,
      vaultAsset.assetId,
    );

    return NextResponse.json({
      status: 'succeeded',
      renderStatus: RenderStatus.COMPLETED,
      vaultAssetId: vaultAsset.assetId,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';

    if (message.includes('already been completed')) {
      return NextResponse.json({ status: 'succeeded', renderStatus: RenderStatus.COMPLETED });
    }
    if (message.includes('Security Breach') || message.includes('not authorized')) {
      return NextResponse.json(
        { status: 'failed', reason: 'forbidden', message: 'You are not authorized to access this operation.' },
        { status: 403 },
      );
    }
    if (message.includes('not found')) {
      return NextResponse.json(
        { status: 'failed', reason: 'not-found', message: 'Operation not found.' },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { status: 'failed', reason: 'resolution-error', message: 'Production resolution failed.' },
      { status: 500 },
    );
  }
}
