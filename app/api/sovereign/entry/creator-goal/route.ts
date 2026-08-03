import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import type { MakmanFirstCustomerJourneyRequest } from '@/src/chambers/makman-al-ghayah/MAKMAN_FIRST_CUSTOMER_JOURNEY_PIPELINE';
import { createPerceptionEndpointForOrgan } from '@/src/sovereign-nervous-system';
import { verifySession } from '@/src/authentication';
import { SovereignVaultManager } from '@/src/vault/sovereign-vault-manager';
import { GoalRepository } from '@/src/persistent-storage/goal-repository';
import { getDb } from '@/src/persistent-storage';

// PACKAGE IX: Vault is its own already-directly-imported system elsewhere
// (e.g. app/api/vault/assets/route.ts) — not part of the Makman Runtime
// Boundary this route otherwise respects for src/chambers/makman-al-ghayah.
const vaultManager = new SovereignVaultManager();

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * Constitutional Nervous System integration (Integration Package "The
 * First Constitutional Signals"). Reports only that a submission
 * succeeded or failed — never the goal's own content.
 */
const makmanPerception = createPerceptionEndpointForOrgan('makman-al-ghayah');

/**
 * PACKAGE F — CONSTITUTIONAL CAPABILITY REVELATION
 * Lists all GoalContracts for the authenticated Creator, most recent first.
 * Enables Makman Al-Ghayah to surface the Creator's active constitutional
 * goals without requiring them to know a specific goalId.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to view your goals.' }, { status: 401 });
  }

  const db = getDb();
  const goals = new GoalRepository(db).findByTenant(session.creatorId);
  return NextResponse.json({ status: 'succeeded', goals });
}

const REQUIRED_TOP_LEVEL_FIELDS = ['compiledGraph', 'description', 'priority', 'authorization', 'commercialIntent'] as const;

/**
 * Public API Surface for Creator Goal submission. Imports only from SOEL
 * — never from src/chambers/makman-al-ghayah directly — per the Runtime
 * Boundary. Performs only structural request-shape validation (are the
 * required top-level fields present); the business/constitutional
 * validation (Goal status, identity matching, authorization checks) is
 * already-certified Makman logic, reached only through SOEL.
 *
 * A real caller must already possess a CompiledAssemblyGraph — now
 * reachable via RAS AL AMR's real POST /api/sovereign/entry/ras-al-amr/
 * compile (THE CORRIDOR PACKAGE, 2026-07-25 — closes the gap
 * SOEL_ENGINEERING_REVIEW.ts previously disclosed as unresolved).
 *
 * THE CORRIDOR PACKAGE — SECURITY CORRECTION: this route previously had
 * no session verification at all, and nothing anywhere in the pipeline
 * (submitCreatorGoal → runFirstCustomerJourney → bridgeToDestination)
 * checked that commercialIntent.publisherTenantId belonged to the actual
 * caller, or even matched compiledGraph.subscriberTenantId. With zero
 * real callers this was theoretical; wiring a real UI to it makes it
 * live, so — mirroring the identical fix already applied to
 * ras-al-amr/compile (Ras Al Amr Completion Package I) — it is closed
 * here rather than deferred. authenticatedTenantId is derived only from
 * the real, verifySession()-checked cookie; commercialIntent.publisherTenantId
 * is force-overwritten with it; and a request whose own compiledGraph
 * carries a different subscriberTenantId (a graph belonging to another
 * Creator) is rejected outright rather than silently reassigned.
 *
 * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE, third prerequisite:
 * after a Goal is created, its goalId is written back onto every real
 * Vault asset the compiled graph referenced (via SovereignVaultManager.
 * linkGoalToAsset, imported directly — Vault sits outside the Makman
 * Runtime Boundary this route otherwise respects, same as app/api/vault/
 * assets/route.ts already does). If any linkage fails, the whole
 * request reports failure (500) rather than a false success — "no
 * partial success may be represented as constitutional completion."
 *
 * PACKAGE XV — CREATOR PACING PREFERENCE FOUNDATION: `pacingPreference`
 * is genuinely optional on the request body — this route needs no new
 * validation for it, since the body is already forwarded to SOEL as a
 * whole (`authoritativeRequest` below spreads it), matching this route's
 * own existing (lack of) runtime validation for `priority` — neither
 * field's enum membership is checked here; both are trusted the same way,
 * since the real UI only ever offers a real caller the valid options.
 *
 * PACKAGE XVI — CREATOR TRANSITION PREFERENCE FOUNDATION: `transitionPreference`
 * is genuinely optional too, same treatment — forwarded as part of the
 * whole body, no new validation added.
 */
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to submit a Goal for distribution.' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const missing = REQUIRED_TOP_LEVEL_FIELDS.filter((field) => !(field in body));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'Missing required field(s)', missing },
        { status: 400 },
      );
    }

    const { compiledGraph, commercialIntent } = body as MakmanFirstCustomerJourneyRequest;

    if (compiledGraph.subscriberTenantId !== session.creatorId) {
      return NextResponse.json(
        { error: `Distribution Security Breach: Tenant [${session.creatorId}] attempted to submit a compiled assembly belonging to another sovereign owner.` },
        { status: 403 },
      );
    }

    const authoritativeRequest: MakmanFirstCustomerJourneyRequest = {
      ...(body as MakmanFirstCustomerJourneyRequest),
      commercialIntent: { ...commercialIntent, publisherTenantId: session.creatorId },
    };

    const result = await soel.submitCreatorGoal(authoritativeRequest);

    // PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE, third prerequisite:
    // write the new Goal's id back onto every real asset it was compiled
    // from. "Do not write goal identity without writing the origin
    // linkage" — if any linkage fails, the whole request is reported as
    // incomplete rather than silently returning a success that hides a
    // Goal with no honest way back to it.
    const assetIds = compiledGraph.hydratedCanvas.tracks.flatMap((track) => track.nodes.map((node) => node.assetId));
    const linkageFailures: string[] = [];
    for (const assetId of assetIds) {
      try {
        await vaultManager.linkGoalToAsset(assetId, session.creatorId, result.goal.goalId);
      } catch {
        linkageFailures.push(assetId);
      }
    }

    if (linkageFailures.length > 0) {
      return NextResponse.json(
        {
          error:
            `Goal [${result.goal.goalId}] was created, but its origin linkage failed for asset(s): ${linkageFailures.join(', ')}. ` +
            'Per Package IX, a Goal without a complete origin linkage is not a constitutionally valid closure — treat this submission as incomplete.',
          goal: result.goal,
        },
        { status: 500 },
      );
    }

    makmanPerception.report({
      signalType: 'State',
      relatedEvent: 'Creator Completed Goal',
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'A creative work was submitted for distribution.',
      content: null,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown creator goal entry error';

    makmanPerception.report({
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'A creator-goal submission failed.',
      content: null,
    });

    return NextResponse.json(
      { error: 'Sovereign Operational Entry Layer creator goal submission failed', message },
      { status: 500 },
    );
  }
}
