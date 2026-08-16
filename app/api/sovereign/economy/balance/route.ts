import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { getDb } from '../../../../../src/persistent-storage';
import { CreatorCreditRepository } from '../../../../../src/economy/credit-ledger/credit-ledger-repository';
import { TrialEntitlementService } from '../../../../../src/economy/trial/trial-entitlement-service';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

// GET /api/sovereign/economy/balance
// Returns the Creator's current AZMA Unit balance and trial status.
// Creator sees AZMA Units only — no provider costs, no USD amounts.
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const db = getDb();
  const repo = new CreatorCreditRepository(db);
  const balance = repo.getBalance(session.creatorId);

  const trialService = new TrialEntitlementService(db);
  const trialStatus = trialService.getTrialStatus(session.creatorId);

  return NextResponse.json({
    creatorId: session.creatorId,
    availableUnits: balance.availableUnits,
    reservedUnits: balance.reservedUnits,
    totalPurchased: balance.totalPurchased,
    totalSpent: balance.totalSpent,
    trial: trialStatus,
  });
}
