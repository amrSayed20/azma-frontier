import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';
import { createCheckoutSession } from '../../../../src/billing';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ status: 'failed', message: 'Sign in to subscribe.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const origin = request.nextUrl.origin;
  const successUrl = (body as { successUrl?: unknown })?.successUrl;
  const cancelUrl = (body as { cancelUrl?: unknown })?.cancelUrl;

  try {
    const result = await createCheckoutSession(
      session.creatorId,
      typeof successUrl === 'string' ? successUrl : `${origin}/qiyamah-chamber`,
      typeof cancelUrl === 'string' ? cancelUrl : `${origin}/qiyamah-chamber`,
    );
    return NextResponse.json({ status: 'succeeded', checkoutUrl: result.checkoutUrl });
  } catch (error) {
    return NextResponse.json(
      { status: 'failed', message: error instanceof Error ? error.message : 'Could not start checkout.' },
      { status: 502 },
    );
  }
}
