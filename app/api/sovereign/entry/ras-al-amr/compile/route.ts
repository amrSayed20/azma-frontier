import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import type { SovereignCanvas } from '@/src/chambers/ras-al-amr/assembly-contracts';
import { createPerceptionEndpointForOrgan } from '@/src/sovereign-nervous-system';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

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
 * SOEL — PrePublishingBoundary.compileForPublishing and
 * VaultRehydrationBridge are untouched by this Package.
 *
 * RAS AL AMR COMPLETION PACKAGE I (2026-07-25) — SECURITY CORRECTION: this
 * route used to accept `authenticatedTenantId` as a plain, client-supplied
 * body field — a real, audit-flagged gap (Constitutional Audit debt item
 * 13). A client could set both `canvas.subscriberTenantId` and
 * `authenticatedTenantId` to any tenant id it chose, including a real
 * Creator's, and compileForPublishing's own tenant-match check would pass
 * trivially since both attacker-controlled fields agreed with each other.
 * `authenticatedTenantId` is no longer read from the request body at all —
 * it is derived exclusively from the real, server-verified session cookie,
 * exactly like every other authenticated route in this platform
 * (app/api/qiyamah/generate, etc.). `canvas.subscriberTenantId` is now
 * force-overwritten with that same real session id before compilation,
 * rather than trusting whatever the client sent — the client can no
 * longer even accidentally submit a mismatched tenant id, and
 * PrePublishingBoundary's own existing tenant-match check (untouched)
 * becomes unconditionally true by construction rather than a boundary an
 * attacker could satisfy by making two forged fields agree with each
 * other.
 *
 * OPERATIONAL LIMITATION, now resolved: the module header this route used
 * to cite ("every asset must already exist in this server process's
 * in-memory SovereignVaultManager... no wiring exists yet connecting
 * Qiyamah's own asset-generation/deposit flow to this instance") described
 * a real gap that Integration Package I already closed — SovereignVaultManager
 * is now SQLite-backed (src/persistent-storage/), and every
 * SovereignVaultManager instance in this process, including this
 * composition root's, shares that same real database via getDb(). Real
 * assets Qiyamah deposits are genuinely visible here now.
 *
 * The response of this route (a CompiledAssemblyGraph) is exactly the
 * compiledGraph field POST /api/sovereign/entry/creator-goal requires —
 * chaining the two remains a separate, not-yet-authorized package.
 */
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to compile a production.' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    if (!('canvas' in body)) {
      return NextResponse.json({ error: 'Missing required field(s)', missing: ['canvas'] }, { status: 400 });
    }

    const { canvas } = body as { canvas: unknown };

    if (typeof canvas !== 'object' || canvas === null) {
      return NextResponse.json({ error: 'canvas must be an object' }, { status: 400 });
    }

    const missing = REQUIRED_TOP_LEVEL_FIELDS.filter((field) => !(field in canvas));
    if (missing.length > 0) {
      return NextResponse.json({ error: 'canvas is missing required field(s)', missing }, { status: 400 });
    }

    // Force the real, session-verified tenant id — never trust whatever
    // subscriberTenantId the client happened to send (see header note).
    const authoritativeCanvas: SovereignCanvas = { ...(canvas as SovereignCanvas), subscriberTenantId: session.creatorId };

    const compiledGraph = await soel.compileCanvasForPublishing(authoritativeCanvas, session.creatorId);

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
    const isSecurityBreach = message.includes('Compilation Security Breach') || message.includes('Vault Security Breach');

    rasAlAmrPerception.report({
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'A compilation request failed.',
      content: null,
    });

    return NextResponse.json(
      { error: 'Sovereign Operational Entry Layer RAS AL AMR compilation request failed', message },
      { status: isSecurityBreach ? 403 : 500 },
    );
  }
}
