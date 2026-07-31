import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * SOVEREIGN PURPOSE FOUNDATION — Constitutional Foundation Package I
 *
 * GET  — returns the authenticated Creator's Sovereign Purpose, or
 *         { purpose: null } if they have never stated one.
 * PUT  — sets (or updates) the Creator's Sovereign Purpose durably.
 *
 * The creatorId is always sourced from the verified session — a Creator
 * can only read or set their own Purpose, never another's. Both routes
 * import only from SOEL, never from src/chambers/makman-al-ghayah directly,
 * in keeping with the Runtime Boundary rule all entry routes observe.
 */

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to read your Sovereign Purpose.' }, { status: 401 });
  }

  const purpose = soel.getSovereignPurpose(session.creatorId);
  return NextResponse.json({ purpose });
}

export async function PUT(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to set your Sovereign Purpose.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const purposeStatement =
    body !== null && typeof body === 'object' && 'purposeStatement' in body
      ? (body as { purposeStatement: unknown }).purposeStatement
      : undefined;

  if (typeof purposeStatement !== 'string' || purposeStatement.trim().length === 0) {
    return NextResponse.json({ error: 'purposeStatement must be a non-empty string.' }, { status: 400 });
  }

  const purpose = soel.setSovereignPurpose(session.creatorId, purposeStatement.trim());
  return NextResponse.json({ purpose });
}
