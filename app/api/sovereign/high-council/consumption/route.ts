/**
 * AZMA OS — SOVEREIGN HIGH COUNCIL
 * Consumption Monitoring Endpoint
 *
 * Founder-only GET endpoint that returns every Creator's aggregated AI
 * consumption for the requested month. The default month is the current
 * calendar month; any past month can be queried via ?month=YYYY-MM.
 *
 * The response shape exposes:
 *   - per-creator breakdown (imageGenerations / ttsCharacters / voiceClones)
 *   - per-creator estimated cost in USD
 *   - platform totals for the month
 *   - the active cap limits (so the Founder can compare usage vs. cap at a glance)
 *
 * No cost data leaves this endpoint to any Creator-facing surface.
 * Session verification follows the same pattern as the runtime endpoint
 * (/api/sovereign/high-council/runtime/route.ts).
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage';
import { ConsumptionRepository } from '@/src/persistent-storage/consumption-repository';
import { getCurrentMonthKey } from '@/src/consumption-ledger/cost-estimator';
import { BETA_USAGE_CAP } from '@/src/consumption-ledger/consumption-cap-enforcer';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

const MONTH_KEY_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])$/;

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session || session.role !== 'founder') {
    return NextResponse.json({ error: 'Founder access required.' }, { status: 403 });
  }

  const url = new URL(request.url);
  const monthParam = url.searchParams.get('month');
  const monthKey =
    monthParam && MONTH_KEY_PATTERN.test(monthParam) ? monthParam : getCurrentMonthKey();

  const ledger = new ConsumptionRepository(getDb());
  const creatorUsage = ledger.getAllCreatorsUsage(monthKey);

  // Platform totals
  const totals = creatorUsage.reduce(
    (acc, c) => ({
      imageGenerations:   acc.imageGenerations   + c.imageGenerations,
      ttsCharacters:      acc.ttsCharacters       + c.ttsCharacters,
      voiceClones:        acc.voiceClones         + c.voiceClones,
      totalCostUsdEstimate: acc.totalCostUsdEstimate + c.totalCostUsdEstimate,
    }),
    { imageGenerations: 0, ttsCharacters: 0, voiceClones: 0, totalCostUsdEstimate: 0 },
  );

  return NextResponse.json({
    monthKey,
    betaCap: BETA_USAGE_CAP,
    creators: creatorUsage,
    platformTotals: totals,
    creatorCount: creatorUsage.length,
  });
}
