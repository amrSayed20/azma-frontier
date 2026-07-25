import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import type { MakmanFirstCustomerJourneyRequest } from '@/src/chambers/makman-al-ghayah/MAKMAN_FIRST_CUSTOMER_JOURNEY_PIPELINE';
import { createPerceptionEndpointForOrgan } from '@/src/sovereign-nervous-system';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * Constitutional Nervous System integration (Integration Package "The
 * First Constitutional Signals"). Reports only that a submission
 * succeeded or failed — never the goal's own content.
 */
const makmanPerception = createPerceptionEndpointForOrgan('makman-al-ghayah');

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
