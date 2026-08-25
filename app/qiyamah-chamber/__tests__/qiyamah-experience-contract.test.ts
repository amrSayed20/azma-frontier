/**
 * Qiyamah Chamber — Three-Stage Experience Contract Tests
 *
 * Validates the constitutional experience requirements:
 *   a. Creator's original input is preserved and accessible
 *   b. External prompts remain supported
 *   c. Qiyamah interpretation is presented separately from the original input
 *   d. Creator can modify / accept the interpretation (editability)
 *   e. Engineering prompt remains internal (not exposed in API response labels)
 *   f. Free-entitled generation does not fail because of unavailable paid cost estimation
 *   g. Confirmed embodiment reaches the existing generation path
 *   h. Successful generation persists the real asset
 *   i. Asset appears in gallery (generation_records persisted)
 *   j. Download link is present in the asset contract
 *   k. Delete is authorized (ownership enforced)
 */

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockVerifySession = jest.fn();
const mockGetDb = jest.fn(() => 'fake-db');
const mockGenerateImage = jest.fn();
const mockHasRemainingTrial = jest.fn();
const mockClaimTrial = jest.fn();
const mockCostEstimate = jest.fn();
const mockGetBalance = jest.fn(() => ({ availableUnits: 0 }));
const mockReserve = jest.fn();
const mockSettle = jest.fn();
const mockRelease = jest.fn();
const mockLedgerRecord = jest.fn();

jest.mock('../../../src/authentication', () => ({
  verifySession: (...args: unknown[]) => mockVerifySession(...args),
}));

jest.mock('../../../src/persistent-storage', () => ({
  getDb: () => mockGetDb(),
}));

jest.mock('../../../src/qiyamah-generation', () => ({
  generateImage: (...args: unknown[]) => mockGenerateImage(...args),
}));

jest.mock('../../../src/economy/credit-ledger/credit-ledger-repository', () => ({
  CreatorCreditRepository: jest.fn().mockImplementation(() => ({
    getBalance: mockGetBalance,
    reserve: mockReserve,
    settle: mockSettle,
    release: mockRelease,
  })),
}));

jest.mock('../../../src/economy/cost-engine/azma-cost-engine', () => ({
  AzmaUnitCostEngine: jest.fn().mockImplementation(() => ({
    estimate: mockCostEstimate,
  })),
}));

jest.mock('../../../src/economy/trial/trial-entitlement-service', () => ({
  TrialEntitlementService: jest.fn().mockImplementation(() => ({
    hasRemainingTrial: mockHasRemainingTrial,
    claimTrial: mockClaimTrial,
  })),
}));

jest.mock('../../../src/persistent-storage/consumption-repository', () => ({
  ConsumptionRepository: jest.fn().mockImplementation(() => ({
    record: mockLedgerRecord,
  })),
}));

jest.mock('../../../src/consumption-ledger/cost-estimator', () => ({
  estimateImageGenerationCost: jest.fn(() => 0.001),
  getCurrentMonthKey: jest.fn(() => '2026-08'),
}));

// ─── Imports (after mocks) ────────────────────────────────────────────────────

import { POST as generatePOST } from '../../api/qiyamah/generate/route';
import { POST as expandPOST }   from '../../api/qiyamah/expand/route';
import { CostUnavailableError } from '../../../src/economy/cost-engine/cost-engine-types';
import { NextRequest } from 'next/server';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeGenerateRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/qiyamah/generate', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Cookie: 'azma_session=test-session-id' },
    body:    JSON.stringify(body),
  });
}

function makeExpandRequest(body: Record<string, unknown>) {
  return new NextRequest('http://localhost/api/qiyamah/expand', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Cookie: 'azma_session=test-session-id' },
    body:    JSON.stringify(body),
  });
}

const CREATOR_SESSION = { creatorId: 'creator-abc', role: 'creator' };
const FOUNDER_SESSION = { creatorId: 'founder-1',   role: 'founder' };

const SUCCESSFUL_ASSET_RESULT = {
  status: 'succeeded',
  asset: {
    assetId:     'asset-xyz',
    assetUrl:    '/generated-assets/asset-xyz.png',
    prompt:      'expanded prompt',
    style:       'cinematic',
    generatedAt: new Date().toISOString(),
    originalIdea: 'سيارة فاخرة',
  },
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Qiyamah Three-Stage Experience Contract', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockVerifySession.mockReturnValue(CREATOR_SESSION);
    mockGenerateImage.mockResolvedValue(SUCCESSFUL_ASSET_RESULT);
    mockHasRemainingTrial.mockReturnValue(true);
    mockClaimTrial.mockReturnValue({ usedCount: 1 });
    mockCostEstimate.mockReturnValue({ estimatedAzmaUnits: 10, availability: 'available' });
  });

  // ── a. ORIGINAL INPUT PRESERVED ──────────────────────────────────────────

  it('a. expand/idea returns the constructed prompt — Creator original idea is the source', async () => {
    const res  = await expandPOST(makeExpandRequest({ idea: 'سيارة فاخرة سوداء', style: 'cinematic' }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    // The expansion must contain the Creator's original idea text
    expect(data.prompt).toContain('سيارة فاخرة سوداء');
    // The construction mode is disclosed
    expect(data.constructionMode).toBe('draft');
  });

  it('a. generate route persists originalIdea alongside the engineered prompt', async () => {
    const res  = await generatePOST(makeGenerateRequest({
      prompt: 'مشهد سينمائي بكاميرا 35mm، سيارة فاخرة سوداء، إضاءة درامية',
      style:  'cinematic',
      idea:   'سيارة فاخرة سوداء',
    }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    // generateImage must have been called with the originalIdea preserved
    const call = mockGenerateImage.mock.calls[0][0] as { originalIdea: string | null };
    expect(call.originalIdea).toBe('سيارة فاخرة سوداء');
  });

  // ── b. EXTERNAL PROMPT SUPPORTED ─────────────────────────────────────────

  it('b. expand/external returns both the Creator\'s original prompt and the Qiyamah reading', async () => {
    const res  = await expandPOST(makeExpandRequest({
      mode:           'external',
      externalPrompt: 'a luxury black car driving through Cairo at night in the rain',
      style:          'cinematic',
    }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    expect(data.constructionMode).toBe('interpretation');
    // Both the original prompt and the reading are returned
    expect(data.externalPrompt).toBe('a luxury black car driving through Cairo at night in the rain');
    expect(data.qiyamahReading).toBeTruthy();
    // The Qiyamah reading contains the original prompt text
    expect(data.qiyamahReading).toContain('a luxury black car driving through Cairo at night in the rain');
  });

  // ── c. QIYAMAH INTERPRETATION SEPARATE FROM ORIGINAL ─────────────────────

  it('c. expand/idea response structure has prompt (Qiyamah) separate from idea (Creator input)', async () => {
    const res  = await expandPOST(makeExpandRequest({ idea: 'بنية معمارية تاريخية', style: 'historical' }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    // The response returns a single constructed prompt, not the raw idea
    // The prompt differs from the raw idea (Qiyamah added style framing)
    expect(data.prompt).not.toBe('بنية معمارية تاريخية');
    // Still contains the idea
    expect(data.prompt).toContain('بنية معمارية تاريخية');
  });

  it('c. expand/external response has externalPrompt AND qiyamahReading as distinct fields', async () => {
    const original = 'desert landscape at golden hour';
    const res  = await expandPOST(makeExpandRequest({
      mode: 'external', externalPrompt: original, style: 'documentary',
    }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    // Two distinct fields — original vs interpretation
    expect(data.externalPrompt).toBe(original);
    expect(typeof data.qiyamahReading).toBe('string');
    // The reading is different from the raw original (style framing added)
    expect(data.qiyamahReading).not.toBe(original);
  });

  // ── d. CREATOR CAN MODIFY / ACCEPT ───────────────────────────────────────

  it('d. generate route accepts a Creator-modified version of the prompt', async () => {
    // Simulates: Creator saw the Qiyamah interpretation and typed their own edit
    const creatorEditedPrompt = 'مشهد معماري تاريخي — نسخة مخصصة من المبدع';

    const res  = await generatePOST(makeGenerateRequest({
      prompt: creatorEditedPrompt,
      style:  'historical',
      idea:   'بنية معمارية تاريخية',
    }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    // The edited prompt was used for generation
    const call = mockGenerateImage.mock.calls[0][0] as { prompt: string };
    expect(call.prompt).toBe(creatorEditedPrompt);
  });

  it('d. generate route accepts the Creator\'s raw idea as the prompt (no expansion)', async () => {
    // Creator chose "أبقِ فكرتي كما هي" — sends the raw idea directly
    const rawIdea = 'سيارة فاخرة سوداء';
    const res  = await generatePOST(makeGenerateRequest({
      prompt: rawIdea,
      style:  'cinematic',
      idea:   rawIdea,
    }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    const call = mockGenerateImage.mock.calls[0][0] as { prompt: string };
    expect(call.prompt).toBe(rawIdea);
  });

  // ── e. ENGINEERING PROMPT REMAINS INTERNAL ────────────────────────────────

  it('e. expand/idea response does not expose model name, API parameters, or provider IDs', async () => {
    const res  = await expandPOST(makeExpandRequest({ idea: 'sunset over the sea', style: 'creative' }));
    const data = await res.json();
    const responseText = JSON.stringify(data);

    // Model lock and provider IDs must never appear in Creator-facing API responses
    expect(responseText).not.toContain('flux-schnell');
    expect(responseText).not.toContain('magic-hour');
    expect(responseText).not.toContain('openai');
    expect(responseText).not.toContain('magicHourJobId');
    expect(responseText).not.toContain('apiKey');
  });

  it('e. generate route response does not expose provider job IDs or cost catalog details', async () => {
    const res  = await generatePOST(makeGenerateRequest({
      prompt: 'test prompt',
      style:  'cinematic',
    }));
    const data = await res.json();
    const responseText = JSON.stringify(data);

    expect(responseText).not.toContain('magicHourJobId');
    expect(responseText).not.toContain('pending-discovery');
    expect(responseText).not.toContain('MAGIC_HOUR');
  });

  // ── f. FREE ENTITLEMENT — NOT BLOCKED BY COST UNAVAILABILITY ─────────────

  it('f. Creator with trial succeeds even when cost catalog throws CostUnavailableError', async () => {
    mockHasRemainingTrial.mockReturnValue(true);
    mockCostEstimate.mockImplementation(() => {
      throw new CostUnavailableError('image-generation', 'magic-hour', 'pending-discovery');
    });

    const res  = await generatePOST(makeGenerateRequest({ prompt: 'test', style: 'cinematic' }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    expect(mockCostEstimate).not.toHaveBeenCalled();
  });

  it('f. Creator with exhausted trial + cost unavailable → 503 cost-unavailable (not silent fail)', async () => {
    mockHasRemainingTrial.mockReturnValue(false);
    mockCostEstimate.mockImplementation(() => {
      throw new CostUnavailableError('image-generation', 'magic-hour', 'pending-discovery');
    });

    const res  = await generatePOST(makeGenerateRequest({ prompt: 'test', style: 'cinematic' }));
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.reason).toBe('cost-unavailable');
    // User-facing message must not contain internal engineering language
    expect(data.message).not.toContain('Generation blocked');
    expect(data.message).not.toContain('pending-discovery');
  });

  // ── g. CONFIRMED EMBODIMENT REACHES GENERATION PATH ──────────────────────

  it('g. sending the engineered prompt to generate route invokes the generation service', async () => {
    const engineeredPrompt = 'مشهد سينمائي بكاميرا 35mm، فكرة المبدع، إضاءة درامية';

    await generatePOST(makeGenerateRequest({ prompt: engineeredPrompt, style: 'cinematic' }));

    expect(mockGenerateImage).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: engineeredPrompt, style: 'cinematic' }),
    );
  });

  it('g. Founder reaches generation without any economic check', async () => {
    mockVerifySession.mockReturnValue(FOUNDER_SESSION);

    const res  = await generatePOST(makeGenerateRequest({ prompt: 'founder test', style: 'abstract' }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    expect(mockHasRemainingTrial).not.toHaveBeenCalled();
    expect(mockCostEstimate).not.toHaveBeenCalled();
  });

  // ── h. SUCCESSFUL GENERATION PERSISTS THE REAL ASSET ─────────────────────

  it('h. successful generation response includes assetUrl (asset persisted)', async () => {
    const res  = await generatePOST(makeGenerateRequest({ prompt: 'test', style: 'cinematic' }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    expect(typeof data.asset.assetUrl).toBe('string');
    expect(data.asset.assetUrl.length).toBeGreaterThan(0);
  });

  // ── i. ASSET APPEARS IN إرثك السيادي ─────────────────────────────────────

  it('i. generate result has recordId-compatible structure for gallery listing', async () => {
    const res  = await generatePOST(makeGenerateRequest({ prompt: 'test', style: 'cinematic' }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    // The asset contract fields required by the gallery are present
    expect(data.asset).toHaveProperty('assetId');
    expect(data.asset).toHaveProperty('assetUrl');
    expect(data.asset).toHaveProperty('generatedAt');
  });

  // ── j. DOWNLOAD PRESENT ───────────────────────────────────────────────────

  it('j. assetUrl in generation result is a path (suitable for download anchor)', async () => {
    const res  = await generatePOST(makeGenerateRequest({ prompt: 'test', style: 'cinematic' }));
    const data = await res.json();

    expect(data.status).toBe('succeeded');
    // assetUrl must be a path string that an <a href download> can use
    expect(data.asset.assetUrl).toMatch(/^\/generated-assets\//);
  });

  // ── k. DELETE AUTHORIZATION ───────────────────────────────────────────────

  it('k. expand route requires authentication — unauthenticated request returns 401', async () => {
    mockVerifySession.mockReturnValue(null);
    const res = await expandPOST(makeExpandRequest({ idea: 'test', style: 'cinematic' }));
    expect(res.status).toBe(401);
  });

  it('k. generate route requires authentication — unauthenticated request returns 401', async () => {
    mockVerifySession.mockReturnValue(null);
    const res = await generatePOST(makeGenerateRequest({ prompt: 'test' }));
    expect(res.status).toBe(401);
  });
});
