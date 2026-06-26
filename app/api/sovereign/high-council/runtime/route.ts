import { NextResponse } from 'next/server';
import { buildSovereignHighCouncilRuntimeView } from '@/src/system-root/founder-experience/sovereign-high-council-runtime-gateway';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const founderId = url.searchParams.get('founderId') ?? 'founder-imperial';
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

    const runtimeView = buildSovereignHighCouncilRuntimeView({
      founderId,
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
