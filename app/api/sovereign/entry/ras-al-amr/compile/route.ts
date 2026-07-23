import { NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import type { SovereignCanvas } from '@/src/chambers/ras-al-amr/assembly-contracts';
import { createPerceptionEndpointForOrgan } from '@/src/sovereign-nervous-system';

export const dynamic = 'force-dynamic';

/**
 * Constitutional Nervous System integration (Integration Package "The
 * First Constitutional Signals"). Reports only that a compilation
 * succeeded or failed — never the compiled content itself.
 */
const rasAlAmrPerception = createPerceptionEndpointForOrgan('ras-al-amr');

const REQUIRED_TOP_LEVEL_FIELDS = ['canvasId', 'subscriberTenantId', 'canvasType', 'title', 'tracks'] as const;

/**
 * Public API Surface for RAS AL AMR compilation. Imports only from SOEL —
 * never from src/chambers/ras-al-amr directly — per the same Runtime
 * Boundary already enforced for Makman's routes. Performs only structural
 * request-shape validation; the business/constitutional validation
 * (tenant-authorization match, non-empty tracks, per-node Vault asset
 * ownership) is already-certified RAS AL AMR logic, reached only through
 * SOEL.
 *
 * OPERATIONAL LIMITATION, disclosed: every asset referenced by canvas.tracks[].nodes
 * must already exist in this server process's in-memory SovereignVaultManager
 * (src/sovereign-entry/composition.ts) — no wiring exists yet connecting
 * Qiyamah's own asset-generation/deposit flow to this instance. See
 * RAS_AL_AMR_ENTRY_ENGINEERING_REVIEW.ts.
 *
 * The response of this route (a CompiledAssemblyGraph) is exactly the
 * compiledGraph field POST /api/sovereign/entry/creator-goal requires —
 * chaining the two closes the Entry → RAS AL AMR → Makman journey.
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    if (!('canvas' in body) || !('authenticatedTenantId' in body)) {
      return NextResponse.json(
        { error: 'Missing required field(s)', missing: ['canvas', 'authenticatedTenantId'].filter((f) => !(f in body)) },
        { status: 400 },
      );
    }

    const { canvas, authenticatedTenantId } = body as { canvas: unknown; authenticatedTenantId: unknown };

    if (typeof authenticatedTenantId !== 'string') {
      return NextResponse.json({ error: 'authenticatedTenantId must be a string' }, { status: 400 });
    }

    if (typeof canvas !== 'object' || canvas === null) {
      return NextResponse.json({ error: 'canvas must be an object' }, { status: 400 });
    }

    const missing = REQUIRED_TOP_LEVEL_FIELDS.filter((field) => !(field in canvas));
    if (missing.length > 0) {
      return NextResponse.json({ error: 'canvas is missing required field(s)', missing }, { status: 400 });
    }

    const compiledGraph = await soel.compileCanvasForPublishing(canvas as SovereignCanvas, authenticatedTenantId);

    rasAlAmrPerception.report({
      signalType: 'State',
      relatedEvent: 'Creator Completed Goal',
      reportingAuthority: 'ras-al-amr',
      purpose: 'A production was compiled into a final assembly.',
      content: null,
    });

    return NextResponse.json(compiledGraph);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown RAS AL AMR compilation entry error';

    rasAlAmrPerception.report({
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'A compilation request failed.',
      content: null,
    });

    return NextResponse.json(
      { error: 'Sovereign Operational Entry Layer RAS AL AMR compilation request failed', message },
      { status: 500 },
    );
  }
}
