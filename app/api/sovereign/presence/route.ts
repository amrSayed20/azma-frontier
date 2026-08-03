import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';
import { getDb, listGenerationsForCreator, listCanvasesForTenant } from '../../../../src/persistent-storage';
import { GoalRepository } from '../../../../src/persistent-storage/goal-repository';
import { cinemaLedger } from '../../../../src/sovereign-entry/composition';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * IMPERIAL EXPERIENCE PACKAGE E — THE IMPERIAL PRESENCE LAYER
 *
 * Single read-only aggregation of every constitutional state already
 * durably recorded by the Empire. No new engines. No new database tables.
 * No business logic. Only what has already been certified is surfaced.
 *
 * Reads from four repositories in one pass:
 *   generation_records  → Qiyamah creative state
 *   sovereign_canvases  → Ras Al Amr direction state
 *   cinematic_ledger    → Makman production state
 *   goals               → Al Hujjah investigative state
 *
 * The Foyer consumes this to reveal constitutional presence to the Creator
 * without requiring them to open a single chamber.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to reveal your Empire.' },
      { status: 401 },
    );
  }

  const db = getDb();
  const creatorId = session.creatorId;

  const generations = listGenerationsForCreator(db, creatorId);
  const canvases = listCanvasesForTenant(db, creatorId);
  const productions = cinemaLedger.listProductionsForCreator(creatorId);
  const goals = new GoalRepository(db).findByTenant(creatorId);

  const ACTIVE_STATUSES = new Set(['CREATED', 'PLANNED', 'IN_PROGRESS', 'BLOCKED']);

  return NextResponse.json({
    status: 'succeeded',
    presence: {
      qiyamah: {
        creationCount: generations.length,
        mostRecentPrompt: generations[0]?.prompt ?? null,
        mostRecentAt: generations[0]?.generatedAt ?? null,
      },
      rasAlAmr: {
        savedCanvasCount: canvases.length,
        mostRecentTitle: canvases[0]?.title ?? null,
        mostRecentSavedAt: canvases[0]?.savedAt ?? null,
      },
      makman: {
        productionCount: productions.length,
        mostRecentTitle: productions[0]?.title ?? null,
        mostRecentRenderStatus: productions[0]?.renderStatus ?? null,
        hasProcessingProduction: productions.some((p) => p.renderStatus === 'PROCESSING'),
      },
      hujjah: {
        goalCount: goals.length,
        hasActiveGoal: goals.some((g) => ACTIVE_STATUSES.has(g.status as string)),
        mostRecentGoalTitle: goals[0]?.title ?? null,
      },
    },
  });
}
