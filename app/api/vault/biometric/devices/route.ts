/**
 * AZMA OS — the devices enrolled to open this Creator's Vault.
 *
 * GET    lists them.
 * DELETE removes one, for a device lost, sold, or no longer trusted.
 *
 * Public keys are never returned: a Creator needs to recognise their devices,
 * not read their key material.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { getDb, listVaultCredentials, deleteVaultCredential } from '../../../../../src/persistent-storage';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

function creatorFrom(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  return sessionId ? verifySession(sessionId) : null;
}

export async function GET(request: NextRequest) {
  const session = creatorFrom(request);
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
  }

  const devices = listVaultCredentials(getDb(), session.creatorId).map((c) => ({
    credentialId: c.credentialId,
    deviceLabel: c.deviceLabel,
    createdAt: c.createdAt,
    lastUsedAt: c.lastUsedAt,
  }));

  return NextResponse.json({ status: 'succeeded', devices });
}

export async function DELETE(request: NextRequest) {
  const session = creatorFrom(request);
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
  }

  const credentialId = new URL(request.url).searchParams.get('credentialId');
  if (!credentialId) {
    return NextResponse.json({ status: 'failed', reason: 'invalid-request' }, { status: 400 });
  }

  // Scoped to this Creator, so one Creator can never unenrol another's device.
  const removed = deleteVaultCredential(getDb(), credentialId, session.creatorId);
  if (!removed) {
    return NextResponse.json({ status: 'failed', reason: 'not-found' }, { status: 404 });
  }
  return NextResponse.json({ status: 'succeeded' });
}
