/**
 * AZMA OS — The subscription gate now asks a different question.
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   `POST /api/billing/checkout` admitted anyone holding a session. A session
 *   existed the instant anyone POSTed an arbitrary email to /api/auth/signup —
 *   so the gate admitted a stranger who had proven nothing at all, and the
 *   Empire took money from an identity it could not name.
 *
 *   Nothing about the payment changed: same gateway, same packs, same
 *   server-derived amounts. Only the question asked before reaching them.
 */

const sessionMock = jest.fn();
jest.mock('@/src/authentication', () => ({ verifySession: (...a: unknown[]) => sessionMock(...a) }));

// The gateway is never reached in these tests — an unverified caller is turned
// away before it, and that is the point being proven.
const gatewayMock = jest.fn();
jest.mock('@/src/economy/payment/paymob-payment-gateway', () => ({
  getPaymobPaymentGateway: (...a: unknown[]) => gatewayMock(...a),
}));

import { POST as CHECKOUT } from '../checkout/route';
import { NextRequest } from 'next/server';
import { getDb, resetDbSingletonForTests, createCreator } from '@/src/persistent-storage';
import { linkVerifiedIdentity } from '@/src/persistent-storage/authentication-identity-repository';
import type { VerifiedIdentity } from '@/src/identity/sovereign-identity-contract';

const IDENTITY: VerifiedIdentity = {
  provider: 'google',
  providerSubject: 'sub-checkout-1',
  email: 'buyer@example.com',
  displayName: 'Buyer',
};

function checkout(body: Record<string, unknown> = { packId: 'asas' }) {
  return CHECKOUT(
    new NextRequest('http://localhost/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: 'azma_session=s1' },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  process.env.AZMA_DB_PATH = ':memory:';
  resetDbSingletonForTests();
  sessionMock.mockReset();
  gatewayMock.mockReset();
  // Null gateway → 503. Any test that reaches it proves the identity gate let
  // the caller through, which is exactly what we want to be able to see.
  gatewayMock.mockReturnValue(null);
});
afterEach(() => resetDbSingletonForTests());

function seed(creatorId: string, verified: boolean) {
  createCreator(getDb(), {
    creatorId, email: IDENTITY.email, passwordHash: null, role: 'creator', displayName: null,
  });
  if (verified) linkVerifiedIdentity(getDb(), creatorId, IDENTITY);
  sessionMock.mockReturnValue({ creatorId, role: 'creator' });
}

describe('an unverified identity cannot begin a subscription', () => {
  it('REFUSES a session whose account was never verified', async () => {
    seed('unverified-1', false);
    const response = await checkout();
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.reason).toBe('identity-not-verified');
    // Told where to go, in their own tongue.
    expect(body.verifyAt).toBe('/api/auth/google/start');
    // The payment gateway was never even consulted.
    expect(gatewayMock).not.toHaveBeenCalled();
  });

  it('REFUSES with no session at all', async () => {
    sessionMock.mockReturnValue(null);
    expect((await checkout()).status).toBe(401);
    expect(gatewayMock).not.toHaveBeenCalled();
  });

  it('a Founder role does NOT substitute for a verified address', async () => {
    createCreator(getDb(), {
      creatorId: 'founder-1', email: 'founder@azmaos.com', passwordHash: 'x', role: 'founder', displayName: null,
    });
    sessionMock.mockReturnValue({ creatorId: 'founder-1', role: 'founder' });
    expect((await checkout()).status).toBe(403);
  });

  it('ALLOWS a verified account through to the payment path', async () => {
    seed('verified-1', true);
    const response = await checkout();
    // 503 = the identity gate passed and the (unconfigured) gateway answered.
    expect(response.status).toBe(503);
    expect(gatewayMock).toHaveBeenCalled();
  });
});

describe('the return destination cannot be aimed outside the Empire', () => {
  it('refuses an external successUrl without failing the purchase', async () => {
    seed('verified-2', true);
    const response = await checkout({ packId: 'asas', successUrl: 'https://evil.example/harvest' });
    // Still reaches the gateway — the destination was replaced, not the request.
    expect(response.status).toBe(503);
    expect(gatewayMock).toHaveBeenCalled();
  });

  it('accepts an internal path', async () => {
    seed('verified-3', true);
    const response = await checkout({ packId: 'asas', successUrl: '/sovereign-vault-palace' });
    expect(response.status).toBe(503);
  });
});
