import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { createPerceptionEndpointForOrgan } from '@/src/sovereign-nervous-system';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

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
 *
 * THE CORRIDOR PACKAGE — SECURITY CORRECTION (2026-07-25): this route's
 * own doc previously described requesterTenantId as "the session ID of
 * the user (undefined if guest/anonymous)" while actually reading it as
 * a plain, unverified query parameter — anyone could claim to be any
 * tenant, including a real Creator's, and PublicConsumptionBoundary's
 * "Publisher Absolute Override" or SUBSCRIPTION_ONLY/COMMERCIAL_* checks
 * would trust it outright. Genuinely public requests (guests, no cookie)
 * remain untouched — this is meant to also serve anonymous consumers.
 * The correction only concerns identity: when a real session cookie IS
 * present, requesterTenantId is derived from it, not from the query
 * string, exactly mirroring the fix already applied to ras-al-amr/compile
 * and creator-goal in this same package.
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const publicationId = url.searchParams.get('publicationId');

    if (!publicationId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: publicationId' },
        { status: 400 },
      );
    }

    const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
    const session = sessionId ? verifySession(sessionId) : null;

    const requesterTenantId = session ? session.creatorId : undefined;
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
