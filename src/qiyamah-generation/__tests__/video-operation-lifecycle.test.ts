/**
 * AZMA OS — «انقطع الاتصال» ≠ «فشل الإنتاج».
 *
 * ─── THE INCIDENT THIS ENCODES ──────────────────────────────────────────────
 *
 *   Operation ce90a828 (2026-09-22, kling-3.0): the edge closed the browser's
 *   connection at ~125 s; the production ran on for 362 s and ended in a
 *   6,167,822-byte video deposited as asset_1790105473047_58if934. The chamber
 *   said «البوابة لا تستجيب. أعِد المحاولة.» — and a retry would have paid for
 *   a second copy of a video the Creator already owned.
 *
 *   These tests hold the repaired boundary: the operation outlives the
 *   request, its state is the ledger's, a lost response is recoverable rather
 *   than repeatable, and only a real server-side ending is shown as failure.
 */

import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const previousPath = process.env.AZMA_DB_PATH;
let lifecycle: typeof import('../video-operation-lifecycle');
let OperationState: typeof import('../../orchestrator/fleet-materialization/ledger/operation-ledger-types').OperationState;
let generateVideoMock: jest.Mock;

const CREATOR = 'creator-owner';
const OTHER = 'creator-other';

/** Resolve only when the operation leaves its non-terminal states. */
async function settled(operationId: string, creatorId = CREATOR) {
  for (let i = 0; i < 200; i += 1) {
    const observed = await lifecycle.observeOperation(operationId, creatorId);
    if (observed?.isTerminal) return observed;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error('operation never settled');
}

beforeAll(() => {
  process.env.AZMA_DB_PATH = join(mkdtempSync(join(tmpdir(), 'azma-operation-')), 'operations.db');
  jest.isolateModules(() => {
    jest.doMock('../generation-service', () => ({ generateVideo: jest.fn() }));
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    generateVideoMock = require('../generation-service').generateVideo as jest.Mock;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    lifecycle = require('../video-operation-lifecycle');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    OperationState = require('../../orchestrator/fleet-materialization/ledger/operation-ledger-types').OperationState;
  });
});

afterAll(() => {
  if (previousPath === undefined) delete process.env.AZMA_DB_PATH;
  else process.env.AZMA_DB_PATH = previousPath;
});

const request = (n: string) => ({ prompt: `a scene — ${n}`, durationSeconds: 6, creatorId: CREATOR, originalIdea: null });

describe('1–4 · the operation exists before the work, and outlives the request', () => {
  it('acceptance returns an operation id without waiting for the provider', async () => {
    let release: (v: unknown) => void = () => {};
    generateVideoMock.mockReturnValueOnce(new Promise((r) => { release = r; }));

    const started = Date.now();
    const accepted = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-slow', request: request('slow') });
    const elapsed = Date.now() - started;

    expect(typeof accepted.operationId).toBe('string');
    expect(accepted.reused).toBe(false);
    // The provider is still holding; acceptance did not wait for it.
    expect(elapsed).toBeLessThan(1000);

    const midFlight = await lifecycle.observeOperation(accepted.operationId, CREATOR);
    expect(midFlight?.isTerminal).toBe(false);
    expect([OperationState.DISPATCHED, OperationState.MATERIALIZING]).toContain(midFlight?.state);

    // The "connection" is irrelevant: the production finishes on its own.
    release({ status: 'succeeded', asset: { assetId: 'asset-slow', assetUrl: '/generated-assets/slow.mp4' } });
    const done = await settled(accepted.operationId);
    expect(done.state).toBe(OperationState.DEPOSITED);
  });
});

describe('5–6 · provider completion and persistence reach the authoritative state', () => {
  it('a succeeded production becomes DEPOSITED and carries its asset', async () => {
    generateVideoMock.mockResolvedValueOnce({ status: 'succeeded', asset: { assetId: 'asset-ok', assetUrl: '/generated-assets/ok.mp4' } });
    const accepted = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-ok', request: request('ok') });
    const done = await settled(accepted.operationId);
    expect(done.state).toBe(OperationState.DEPOSITED);
    expect(done.assetId).toBe('asset-ok');
    expect(done.assetUrl).toBe('/generated-assets/ok.mp4');
    expect(done.failureReason).toBeUndefined();
    expect(done.resolvedAt).toBeDefined();
  });
});

describe('7 · a lost connection never marks the operation failed', () => {
  it('nothing in the lifecycle can be reached from the HTTP layer to fail it', async () => {
    let release: (v: unknown) => void = () => {};
    generateVideoMock.mockReturnValueOnce(new Promise((r) => { release = r; }));
    const accepted = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-cut', request: request('cut') });

    // The request is gone — the module exports no way to say so, by design.
    expect(Object.keys(lifecycle).sort()).toEqual(
      ['acceptVideoProduction', 'classifyFailure', 'findOperationByIntentKey', 'isTerminal', 'observeOperation'].sort(),
    );

    // Time passes with no connection at all; the operation is still producing.
    await new Promise((r) => setTimeout(r, 50));
    const during = await lifecycle.observeOperation(accepted.operationId, CREATOR);
    expect(during?.isTerminal).toBe(false);
    expect(during?.failureReason).toBeUndefined();

    release({ status: 'succeeded', asset: { assetId: 'asset-cut', assetUrl: '/generated-assets/cut.mp4' } });
    expect((await settled(accepted.operationId)).state).toBe(OperationState.DEPOSITED);
  });
});

describe('11 · a real failure is still a failure, and says why', () => {
  it('a refused production becomes FAILED with an attributable reason that names no engine', async () => {
    // Contract §5 with §10: true about WHAT failed, silent about WHO.
    generateVideoMock.mockResolvedValueOnce({ status: 'failed', reason: 'provider-error', message: 'kling-3.0 returned HTTP 422' });
    const accepted = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-fail', request: request('fail') });
    const done = await settled(accepted.operationId);
    expect(done.state).toBe(OperationState.FAILED);
    expect(done.failureReason).toBe('REFUSED_BY_ENGINE');
    expect(done.failureReason).not.toMatch(/kling|422|http/i);
    expect(done.assetId).toBeUndefined();
  });

  it('a thrown production becomes FAILED rather than hanging forever', async () => {
    generateVideoMock.mockRejectedValueOnce(new Error('socket hang up'));
    const accepted = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-throw', request: request('throw') });
    const done = await settled(accepted.operationId);
    expect(done.state).toBe(OperationState.FAILED);
    expect(done.failureReason).toBe('INTERNAL');
  });
});

describe('12 · a lost response cannot become a duplicate paid production', () => {
  it('the same intent key is answered with the operation that exists — the provider is called once', async () => {
    generateVideoMock.mockResolvedValueOnce({ status: 'succeeded', asset: { assetId: 'asset-once', assetUrl: '/generated-assets/once.mp4' } });
    const callsBefore = generateVideoMock.mock.calls.length;

    const first = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-same', request: request('same') });
    const second = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-same', request: request('same') });
    const third = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-same', request: request('same') });

    expect(second.operationId).toBe(first.operationId);
    expect(third.operationId).toBe(first.operationId);
    expect(second.reused).toBe(true);
    expect(third.reused).toBe(true);
    await settled(first.operationId);
    // One production, whatever the browser did.
    expect(generateVideoMock.mock.calls.length - callsBefore).toBe(1);
  });

  it('a different intent is a different production', async () => {
    generateVideoMock.mockResolvedValue({ status: 'succeeded', asset: { assetId: 'asset-other', assetUrl: '/generated-assets/other.mp4' } });
    const a = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-a', request: request('a') });
    const b = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-b', request: request('b') });
    expect(b.operationId).not.toBe(a.operationId);
    await settled(a.operationId);
    await settled(b.operationId);
  });
});

describe('13–14 · ownership', () => {
  it('another Creator can neither observe the operation nor find it by its key', async () => {
    generateVideoMock.mockResolvedValueOnce({ status: 'succeeded', asset: { assetId: 'asset-mine', assetUrl: '/generated-assets/mine.mp4' } });
    const accepted = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-private', request: request('private') });
    await settled(accepted.operationId);

    expect(await lifecycle.observeOperation(accepted.operationId, OTHER)).toBeNull();
    expect(lifecycle.findOperationByIntentKey(OTHER, 'key-private')).toBeNull();
    // …and the owner still sees it.
    expect((await lifecycle.observeOperation(accepted.operationId, CREATOR))?.state).toBe(OperationState.DEPOSITED);
  });

  it('an unknown operation id is indistinguishable from someone else’s', async () => {
    expect(await lifecycle.observeOperation('no-such-operation', CREATOR)).toBeNull();
  });

  it('the same key used by two Creators yields two separate productions', async () => {
    generateVideoMock.mockResolvedValue({ status: 'succeeded', asset: { assetId: 'asset-shared-key', assetUrl: '/generated-assets/shared.mp4' } });
    const mine = await lifecycle.acceptVideoProduction({ creatorId: CREATOR, intentKey: 'key-collide', request: request('collide') });
    const theirs = await lifecycle.acceptVideoProduction({ creatorId: OTHER, intentKey: 'key-collide', request: { ...request('collide'), creatorId: OTHER } });
    expect(theirs.operationId).not.toBe(mine.operationId);
    expect(theirs.reused).toBe(false);
  });
});
