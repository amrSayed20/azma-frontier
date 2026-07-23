import { NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { createPerceptionEndpointForOrgan } from '@/src/sovereign-nervous-system';

export const dynamic = 'force-dynamic';

/**
 * Constitutional Nervous System integration (Integration Package "The
 * First Constitutional Signals"). Reports only that a consumption
 * request succeeded or failed — never who requested it or what for.
 */
const makmanPerception = createPerceptionEndpointForOrgan('makman-al-ghayah');

/**
 * Public API Surface for Consumption. Imports only from SOEL — never
 * from src/chambers/makman-al-ghayah directly — per the Runtime Boundary
 * ("Runtime shall only be exposed through the Sovereign Operational Entry
 * Layer"). Does no business validation of its own; forwards to SOEL,
 * which forwards to Makman's already-certified PublicConsumptionBoundary.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const publicationId = url.searchParams.get('publicationId');

    if (!publicationId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: publicationId' },
        { status: 400 },
      );
    }

    const requesterTenantId = url.searchParams.get('requesterTenantId') ?? undefined;
    const isAgeVerified = url.searchParams.get('isAgeVerified') === 'true';
    const isoCountryCode = url.searchParams.get('isoCountryCode') ?? undefined;

    const response = await soel.requestConsumption(
      publicationId,
      requesterTenantId,
      isAgeVerified,
      isoCountryCode,
    );

    makmanPerception.report({
      signalType: 'Availability',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'A published work was requested for consumption.',
      content: null,
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown consumption entry error';

    makmanPerception.report({
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'A consumption request failed.',
      content: null,
    });

    return NextResponse.json(
      { error: 'Sovereign Operational Entry Layer consumption request failed', message },
      { status: 500 },
    );
  }
}
