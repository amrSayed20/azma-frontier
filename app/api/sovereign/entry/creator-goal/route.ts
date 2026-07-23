import { NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import type { MakmanFirstCustomerJourneyRequest } from '@/src/chambers/makman-al-ghayah/MAKMAN_FIRST_CUSTOMER_JOURNEY_PIPELINE';
import { createPerceptionEndpointForOrgan } from '@/src/sovereign-nervous-system';

export const dynamic = 'force-dynamic';

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
 * A real caller must already possess a CompiledAssemblyGraph — itself the
 * output of RAS AL AMR's PrePublishingBoundary.compileForPublishing(),
 * which has no HTTP-reachable endpoint of its own yet. That remains a
 * separate, disclosed gap (see SOEL_ENGINEERING_REVIEW.ts) — not resolved
 * by this route.
 */
export async function POST(request: Request) {
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

    const result = await soel.submitCreatorGoal(body as MakmanFirstCustomerJourneyRequest);

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
