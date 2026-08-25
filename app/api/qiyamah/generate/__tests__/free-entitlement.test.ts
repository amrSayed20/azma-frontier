/**
 * Qiyamah Generate Route — Free-Entitlement Path Tests
 *
 * Validates the critical ordering fix: trial entitlement must be checked
 * BEFORE the cost catalog lookup. A Creator with remaining trial must
 * never be blocked by CostUnavailableError.
 *
 * Tests cover:
 *   - Creator with trial remaining → proceeds without cost lookup
 *   - Creator with no trial + cost unavailable → blocked (503)
 *   - Creator with no trial + paid balance → proceeds with reservation
 *   - Founder → bypasses all economic checks
 */

// ─── Mocks (must be before imports) ──────────────────────────────────────────

const mockVerifySession = jest.fn();
const mockGetDb = jest.fn(() => 'fake-db');
const mockGenerateImage = jest.fn();
const mockGetBalance = jest.fn();
const mockReserve = jest.fn();
const mockSettle = jest.fn();
const mockRelease = jest.fn();
const mockHasRemainingTrial = jest.fn();
const mockClaimTrial = jest.fn();
const mockCostEstimate = jest.fn();
const mockLedgerRecord = jest.fn();

jest.mock('../../../../../src/authentication', () => ({
  verifySession: (...args: unknown[]) => mockVerifySession(...args),
}));

jest.mock('../../../../../src/persistent-storage', () => ({
  getDb: () => mockGetDb(),
}));

jest.mock('../../../../../src/qiyamah-generation', () => ({
  generateImage: (...args: unknown[]) => mockGenerateImage(...args),
}));

jest.mock('../../../../../src/economy/credit-ledger/credit-ledger-repository', () => ({
  CreatorCreditRepository: jest.fn().mockImplementation(() => ({
    getBalance: mockGetBalance,
    reserve:    mockReserve,
    settle:     mockSettle,
    release:    mockRelease,
  })),
}));

jest.mock('../../../../../src/economy/cost-engine/azma-cost-engine', () => ({
  AzmaUnitCostEngine: jest.fn().mockImplementation(() => ({
    estimate: mockCostEstimate,
  })),
}));

jest.mock('../../../../../src/economy/trial/trial-entitlement-service', () => ({
  TrialEntitlementService: jest.fn().mockImplementation(() => ({
    hasRemainingTrial: mockHasRemainingTrial,
    claimTrial:        mockClaimTrial,
  })),
}));

jest.mock('../../../../../src/persistent-storage/consumption-repository', () => ({
  ConsumptionRepository: jest.fn().mockImplementation(() => ({
    record: mockLedgerRecord,
  })),
}));

jest.mock('../../../../../src/consumption-ledger/cost-estimator', () => ({
  estimateImageGenerationCost: jest.fn(() => 0.001),
  getCurrentMonthKey:          jest.fn(() => '2026-08'),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { POST } from '../route';
import { CostUnavailableError } from '../../../../../src/economy/cost-engine/cost-engine-types';
import { TrialExhaustedError } from '../../../../../src/economy/trial/trial-entitlement-types';
import { NextRequest } from 'next/server';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRequest(body: Record<string, unknown> = { prompt: 'a sovereign vista' }) {
  return new NextRequest('http://localhost/api/qiyamah/generate', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Cookie: 'azma_session=test-session-id' },
    body:    JSON.stringify(body),
  });
}

const CREATOR_SESSION = { creatorId: 'creator-test', role: 'creator' };
const FOUNDER_SESSION = { creatorId: 'founder-1', role: 'founder' };
const SUCCESSFUL_ASSET = { status: 'succeeded', asset: { assetId: 'img-1', assetUrl: '/generated-assets/img-1.png', prompt: 'a sovereign vista', style: null, generatedAt: new Date().toISOString(), originalIdea: null } };

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('Qiyamah Generate Route — Free-Entitlement Path', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifySession.mockReturnValue(CREATOR_SESSION);
    mockGenerateImage.mockResolvedValue(SUCCESSFUL_ASSET);
    mockReserve.mockReturnValue({ reservationId: 'res-1' });
    mockGetBalance.mockReturnValue({ availableUnits: 0 });
    mockHasRemainingTrial.mockReturnValue(false);
    mockClaimTrial.mockReturnValue({ usedCount: 1 });
    mockCostEstimate.mockReturnValue({ estimatedAzmaUnits: 10, availability: 'available' });
  });

  // ── FREE-ENTITLEMENT PATH ─────────────────────────────────────────────────

  it('Creator with trial remaining → succeeds without calling costEngine.estimate', async () => {
    mockHasRemainingTrial.mockReturnValue(true);

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(json.status).toBe('succeeded');
    // Cost engine must NOT be called — free entitlement bypasses cost lookup
    expect(mockCostEstimate).not.toHaveBeenCalled();
    expect(mockClaimTrial).toHaveBeenCalled();
  });

  it('Creator with trial remaining → succeeds even when cost catalog would throw CostUnavailableError', async () => {
    mockHasRemainingTrial.mockReturnValue(true);
    // Cost engine would throw if called — but it must not be called on the trial path
    mockCostEstimate.mockImplementation(() => {
      throw new CostUnavailableError('image-generation', 'magic-hour', 'pending-discovery');
    });

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(json.status).toBe('succeeded');
    expect(json.reason).toBeUndefined();
    expect(mockCostEstimate).not.toHaveBeenCalled();
  });

  it('trial claim is used after successful generation (usedTrial=true), not paid credit', async () => {
    mockHasRemainingTrial.mockReturnValue(true);

    await POST(makeRequest());

    // Third arg is the raw IP — may be undefined in test environments, so check only what matters
    const [calledCreatorId, calledCapability] = mockClaimTrial.mock.calls[0] as [string, string];
    expect(calledCreatorId).toBe('creator-test');
    expect(calledCapability).toBe('image');
    expect(mockReserve).not.toHaveBeenCalled();
    expect(mockSettle).not.toHaveBeenCalled();
  });

  // ── COST-UNAVAILABLE AFTER TRIAL EXHAUSTED ────────────────────────────────

  it('Creator with no trial + cost unavailable → 503 (cost-unavailable), not 402', async () => {
    mockHasRemainingTrial.mockReturnValue(false);
    mockCostEstimate.mockImplementation(() => {
      throw new CostUnavailableError('image-generation', 'magic-hour', 'pending-discovery');
    });

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(503);
    expect(json.reason).toBe('cost-unavailable');
  });

  it('cost-unavailable message does not expose engineering internals to the Creator', async () => {
    mockHasRemainingTrial.mockReturnValue(false);
    mockCostEstimate.mockImplementation(() => {
      throw new CostUnavailableError('image-generation', 'magic-hour', 'pending-discovery');
    });

    const res = await POST(makeRequest());
    const json = await res.json();

    // Message must not say "Cost for this operation is not yet available. Generation blocked."
    expect(json.message).not.toContain('Generation blocked');
    // Must be user-facing and honest
    expect(json.message).toBeTruthy();
  });

  // ── PAID PATH ─────────────────────────────────────────────────────────────

  it('Creator with no trial + sufficient paid balance → proceeds with unit reservation', async () => {
    mockHasRemainingTrial.mockReturnValue(false);
    mockGetBalance.mockReturnValue({ availableUnits: 100 });
    mockCostEstimate.mockReturnValue({ estimatedAzmaUnits: 10, availability: 'available' });

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(json.status).toBe('succeeded');
    expect(mockReserve).toHaveBeenCalled();
    expect(mockSettle).toHaveBeenCalled();
  });

  it('Creator with no trial + insufficient balance → 402 payment-required', async () => {
    mockHasRemainingTrial.mockReturnValue(false);
    mockGetBalance.mockReturnValue({ availableUnits: 5 });
    mockCostEstimate.mockReturnValue({ estimatedAzmaUnits: 10, availability: 'available' });

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(402);
    expect(json.reason).toBe('payment-required');
    expect(mockReserve).not.toHaveBeenCalled();
  });

  // ── FOUNDER PATH ──────────────────────────────────────────────────────────

  it('Founder bypasses all economic checks — no cost lookup, no trial claim', async () => {
    mockVerifySession.mockReturnValue(FOUNDER_SESSION);

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(json.status).toBe('succeeded');
    expect(mockCostEstimate).not.toHaveBeenCalled();
    expect(mockHasRemainingTrial).not.toHaveBeenCalled();
    expect(mockClaimTrial).not.toHaveBeenCalled();
    expect(mockReserve).not.toHaveBeenCalled();
  });

  // ── TRIAL EXHAUSTED RACE CONDITION ────────────────────────────────────────

  it('if hasRemainingTrial returns true but claimTrial throws TrialExhaustedError → 402 (race guard)', async () => {
    mockHasRemainingTrial.mockReturnValue(true);
    mockClaimTrial.mockImplementation(() => {
      throw new TrialExhaustedError('image', 'creator-test');
    });

    const res = await POST(makeRequest());
    const json = await res.json();

    expect(res.status).toBe(402);
    expect(json.reason).toBe('payment-required');
  });
});
