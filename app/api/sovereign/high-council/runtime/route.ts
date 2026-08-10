import { NextRequest, NextResponse } from 'next/server';
import { buildSovereignHighCouncilRuntimeView } from '@/src/system-root/founder-experience/sovereign-high-council-runtime-gateway';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * Route-level Founder verification — closes audit debt item #14.
 * The UI gate (sovereign-high-council/layout.tsx) already redirects
 * non-Founders, but a direct API call bypassed it entirely. This check
 * mirrors the pattern already used in /api/sovereign/auth/route.ts.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session || session.role !== 'founder') {
    return NextResponse.json({ error: 'Founder access required.' }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const founderIntent =
      url.searchParams.get('intent') ??
      'Maintain constitutional coherence while selecting the most durable strategic path for the empire.';
    const parsedPathCount = Number(url.searchParams.get('pathCount') ?? '3');
    const simulationPathCount = Number.isFinite(parsedPathCount)
      ? Math.max(1, Math.min(10, Math.trunc(parsedPathCount)))
      : 3;

    const triggerParam = url.searchParams.get('trigger');
    const trigger =
      triggerParam === 'manual' || triggerParam === 'scheduled' || triggerParam === 'event-driven'
        ? triggerParam
        : 'manual';

    // Use the verified session's real Founder id instead of the client-supplied param.
    const verifiedFounderId = session.creatorId;

    const runtimeView = buildSovereignHighCouncilRuntimeView({
      founderId: verifiedFounderId,
      founderIntent,
      simulationPathCount,
      trigger,
    });

    return NextResponse.json(runtimeView);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown runtime integration error';

    return NextResponse.json(
      {
        error: 'Sovereign High Council runtime integration failed',
        message,
      },
      { status: 500 }
    );
  }
}
