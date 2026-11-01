/**
 * AZMA OS — المتصفِّحُ لا يُحدِّد أساسَ المحاسبة.
 *
 * ─── THE DEFECT, AND WHY NOTHING SAW IT ─────────────────────────────────────
 *
 *   FOUND 2026-11-01 by a security review; pre-existing on `main`.
 *   `resolveSourceFps` opened with
 *
 *       if (request.sourceFps && request.sourceFps > 0) return request.sourceFps;
 *
 *   so a number in the request body replaced the server's own measurement.
 *   `LIP_SYNC` and `FACE_SWAP` are priced per FRAME — frames are
 *   `requestedSeconds × sourceFps` — so `sourceFps: 1` on a 30 fps clip was
 *   charged about 1/30 of the approved price, while the provider billed the
 *   Empire for all thirty frames a second.
 *
 *   It was the only client-controlled price input in the Empire, and no test
 *   asked whose number set the charge.
 *
 *   The owner's ruling of 2026-11-02: the measurement is the authority; a
 *   failed measurement must NOT fall back to the client's value; and the
 *   behaviour on failure must prevent both an undercharge and a
 *   client-controlled basis. Refusal does both.
 *
 *   Every test below drives the REAL `resolveSourceFps` and the REAL
 *   `priceSubmission`. Only `measureSourceFps` — the process boundary that
 *   spawns ffprobe — is doubled, because that is the only thing that cannot
 *   run here. What it returns is what a real clip would have measured.
 */

import { mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

process.env.AZMA_DB_PATH = join(mkdtempSync(join(tmpdir(), 'azma-fps-')), 'fps.db');

const mockMeasure = jest.fn<Promise<number | null>, [string]>();
jest.mock('../asset-frame-rate', () => ({
  measureSourceFps: (uri: string) => mockMeasure(uri),
}));

import { getDb, createCreator, insertVaultAsset } from '../../persistent-storage';
import { resolveSourceFps, priceSubmission, CAPABILITY_OF_OPERATION } from '../creative-job-service';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import { SourceChamber, DerivationKind, LifecycleState, AssetFamily } from '../sovereign-vault-types';

let seq = 0;

function creator(): string {
  const id = `fps_${++seq}`;
  createCreator(getDb(), { creatorId: id, email: `${id}@azma.test`, passwordHash: null, displayName: 'مبدع' });
  return id;
}

/** A video asset the given Creator owns. */
function videoAsset(ownerId: string): string {
  const assetId = `asset_${++seq}`;
  insertVaultAsset(getDb(), {
    assetId,
    subscriberTenantId: ownerId,
    capabilityTarget: CapabilityTarget.MOTION,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: `/uploads/${assetId}.mp4`,
    creationChamber: SourceChamber.QIYAMAH,
    derivation: DerivationKind.UPLOADED,
    lifecycleState: LifecycleState.FINAL,
    createdBy: ownerId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    originatingOperationId: assetId,
    metadata: {},
  });
  return assetId;
}

const submit = (creatorId: string, targetAssetId: string, extra: Record<string, unknown> = {}) => ({
  operation: 'lip-sync' as const,
  creatorId,
  targetAssetId,
  durationSeconds: 1,
  ...extra,
});

beforeEach(() => { mockMeasure.mockReset(); });

describe('١ · القياسُ هو الأساس، ورقمُ المتصفِّحِ لا يَحِلُّ محلَّه', () => {
  it('a 30 fps clip is priced at 30 frames even when the browser claims 1', async () => {
    const me = creator();
    const asset = videoAsset(me);
    mockMeasure.mockResolvedValue(30);

    // THE EXPLOIT, EXACTLY AS THE RULING NAMES IT.
    const claimed = await resolveSourceFps(getDb(), submit(me, asset, { sourceFps: 1 }));
    expect(claimed).toBe(30);

    // And the price follows the measurement, not the claim.
    const priced = priceSubmission({ ...submit(me, asset, { sourceFps: 1 }), sourceFps: claimed });
    const honest = priceSubmission({ ...submit(me, asset), sourceFps: 30 });
    if (!priced.ok || !honest.ok) throw new Error('expected both to price');
    expect(priced.chargedUnits).toBe(honest.chargedUnits);
    // 30 frames × 1 credit × 1.70 = 51 units. A claim of 1 fps would have
    // produced 2 — one thirtieth of the approved charge.
    expect(priced.chargedUnits).toBe(51);
    expect(priced.quantity).toBe(30);
  });

  it('a claim HIGHER than the truth does not raise the charge either', async () => {
    // The hole ran one way in practice, but the rule is that the browser
    // decides nothing — not a discount and not a surcharge.
    const me = creator();
    const asset = videoAsset(me);
    mockMeasure.mockResolvedValue(24);

    expect(await resolveSourceFps(getDb(), submit(me, asset, { sourceFps: 240 }))).toBe(24);
  });

  it.each([
    ['zero', 0],
    ['negative', -5],
    ['a fraction', 0.001],
    ['absurdly large', 1e9],
    ['not a number', Number.NaN],
    ['infinite', Number.POSITIVE_INFINITY],
  ])('an invalid claim of %s changes nothing — the measurement answers', async (_name, claim) => {
    const me = creator();
    const asset = videoAsset(me);
    mockMeasure.mockResolvedValue(25);

    expect(await resolveSourceFps(getDb(), submit(me, asset, { sourceFps: claim }))).toBe(25);
  });

  it('the request body is never read for the frame rate at all', () => {
    // Asserted on the source, because the only way to be sure a value does
    // not decide a charge is that nothing reads it.
    const { readFileSync } = require('fs') as typeof import('fs');
    const { join: j } = require('path') as typeof import('path');
    const source = readFileSync(j(process.cwd(), 'src/vault/creative-job-service.ts'), 'utf8');
    const fn = source.slice(
      source.indexOf('export async function resolveSourceFps'),
      source.indexOf('/**', source.indexOf('export async function resolveSourceFps')),
    );
    expect(fn).not.toContain('request.sourceFps');
  });
});

describe('٢ · وفشلُ القياسِ يَرفُض، ولا يَقبَل رقمَ العميل', () => {
  it('an unmeasurable clip is refused as unpriceable, with the claim present', async () => {
    const me = creator();
    const asset = videoAsset(me);
    // ffprobe absent, file unreadable, no frame rate in the stream.
    mockMeasure.mockResolvedValue(null);

    const resolved = await resolveSourceFps(getDb(), submit(me, asset, { sourceFps: 30 }));
    expect(resolved).toBeUndefined();

    const price = priceSubmission({ ...submit(me, asset, { sourceFps: 30 }), sourceFps: resolved });
    expect(price.ok).toBe(false);
    if (!price.ok) expect(price.missing).toMatch(/fps|frame/i);
  });

  it('a measurement that THROWS is refused too, not fallen back from', async () => {
    const me = creator();
    const asset = videoAsset(me);
    mockMeasure.mockRejectedValue(new Error('ffprobe exploded'));

    // It must not resolve to the claim. Whether it rejects or answers
    // undefined, what it may never do is hand back the client's number.
    await expect(
      resolveSourceFps(getDb(), submit(me, asset, { sourceFps: 1 })).catch(() => undefined),
    ).resolves.toBeUndefined();
  });
});

describe('٣ · والملكيّةُ تُفحَص قبل أن يُقاس شيء', () => {
  it('an asset the Creator does not own yields no measurement and no price', async () => {
    const mine = creator();
    const theirs = creator();
    const notMine = videoAsset(theirs);
    mockMeasure.mockResolvedValue(30);

    const resolved = await resolveSourceFps(getDb(), submit(mine, notMine, { sourceFps: 30 }));

    expect(resolved).toBeUndefined();
    // And the file was never even opened: ownership is decided before the
    // measurement, so one Creator cannot price an act off another's clip.
    expect(mockMeasure).not.toHaveBeenCalled();
  });

  it('an asset that does not exist is refused the same way', async () => {
    const me = creator();
    mockMeasure.mockResolvedValue(30);

    expect(await resolveSourceFps(getDb(), submit(me, 'asset-that-never-was'))).toBeUndefined();
    expect(mockMeasure).not.toHaveBeenCalled();
  });

  it('the measurement is taken from the asset’s OWN stored address', async () => {
    const me = creator();
    const asset = videoAsset(me);
    mockMeasure.mockResolvedValue(25);

    await resolveSourceFps(getDb(), submit(me, asset, { sourceFps: 1 }));

    // Not from anything the request carried.
    expect(mockMeasure).toHaveBeenCalledWith(`/uploads/${asset}.mp4`);
  });
});

describe('٤ · والأفعالُ التي لا تُسعَّر بالإطارِ لا تُسأل عن إطار', () => {
  it.each([
    ['background-removal', 'BACKGROUND_REMOVAL'],
    ['talking-photo', 'TALKING_PHOTO'],
  ])('%s needs no frame rate and measures nothing', async (operation, capability) => {
    const me = creator();
    const asset = videoAsset(me);
    mockMeasure.mockResolvedValue(30);

    expect(CAPABILITY_OF_OPERATION[operation as 'background-removal']).toBe(capability);
    const resolved = await resolveSourceFps(
      getDb(),
      { ...submit(me, asset), operation: operation as 'background-removal' },
    );

    expect(resolved).toBeUndefined();
    expect(mockMeasure).not.toHaveBeenCalled();
  });

  it('face-swap is frame-billed too, and is measured', async () => {
    const me = creator();
    const asset = videoAsset(me);
    mockMeasure.mockResolvedValue(30);

    const resolved = await resolveSourceFps(
      getDb(),
      { ...submit(me, asset), operation: 'face-swap' as const },
    );
    expect(resolved).toBe(30);
  });
});
