/**
 * AZMA OS — production truth: duration, cost, lineage, digest.
 *
 * ─── THE PRODUCTION THAT ESTABLISHED EVERY FACT HELD HERE ───────────────────
 *
 *   operation  57b0af62-921f-454b-8d27-aebd785fa3d7
 *   provider   magic-hour-video · job cmuisjzuv00k8i201no58iuvc
 *   model      seedance-2.0 (the wire binding of the Seedance allocation)
 *   requested  6 seconds        produced  4.096 seconds
 *   charge     672 MagicHour credits — verified from the provider's own job
 *
 *   The Creator chose 6, the Chamber sent 6, the route validated 6, the
 *   service wrote 6 into the orchestration metadata, and the orchestrator
 *   passed it through verbatim. The adapter read `endSeconds` — a key nothing
 *   in the text-to-video path has ever written — and fell to a silent `?? 4`.
 *   Every duration the fleet offers, up to 56 seconds, produced exactly 4.
 *
 *   The charge, the job id, the produced duration and the digest all existed
 *   in memory at the moment of deposit and were never read, so all four were
 *   lost the moment `generateVideo` returned.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { VIDEO_MODEL_FLEET } from '@/src/sovereign-model-selection/video-model-fleet';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const ADAPTER = read('src/core/sovereign-ai-integration/adapters/magic-hour-adapter.ts');
const SERVICE = read('src/qiyamah-generation/generation-service.ts');
const LIFECYCLE = read('src/qiyamah-generation/video-operation-lifecycle.ts');
const LEDGER = read('src/orchestrator/fleet-materialization/ledger/operation-ledger-manager.ts');
const IMAGE_TO_VIDEO = read('src/core/sovereign-ai-integration/adapters/magic-hour-image-to-video.ts');
const ANIMATE_ROUTE = read('app/api/vault/assets/[assetId]/animate/route.ts');

describe('1 · a requested duration reaches the provider', () => {
  it('the adapter reads the key the sovereign path actually writes', () => {
    expect(ADAPTER).toContain("(input.request.context.metadata['durationSeconds'] as number | undefined)");
    expect(SERVICE).toContain('durationSeconds: request.durationSeconds,');
  });

  it('and sends it as the provider’s own duration field', () => {
    expect(ADAPTER).toContain('const endSeconds = requestedSeconds;');
    expect(ADAPTER).toContain('end_seconds: endSeconds,');
  });

  it('the image-to-video path is untouched and still correct', () => {
    expect(IMAGE_TO_VIDEO).toContain('end_seconds: options.endSeconds,');
    expect(ANIMATE_ROUTE).toContain('endSeconds: durationSeconds,');
  });
});

describe('2 · a missing duration is refused, never invented', () => {
  it('the silent 4-second fallback is gone', () => {
    expect(ADAPTER).not.toContain("metadata['endSeconds'] as number | undefined) ?? 4");
    expect(ADAPTER).not.toMatch(/endSeconds[^\n]*\?\?\s*4/);
  });

  it('an absent or invalid duration throws rather than substituting one', () => {
    expect(ADAPTER).toContain("if (typeof requestedSeconds !== 'number' || !Number.isFinite(requestedSeconds) || requestedSeconds <= 0) {");
    expect(ADAPTER).toContain('refusing rather than substituting one');
  });
});

describe('3 · requested and produced stay two facts', () => {
  it('the adapter reports what the provider says it made', () => {
    expect(ADAPTER).toContain('magicHourRequestedSeconds: endSeconds,');
    expect(ADAPTER).toContain("magicHourProducedSeconds: typeof job.end_seconds === 'number' ? job.end_seconds : null,");
  });

  it('the asset keeps both, and neither is inferred from the other', () => {
    expect(SERVICE).toContain('durationSeconds: params.durationSeconds,');
    expect(SERVICE).toContain('...(params.producedSeconds !== null ? { producedSeconds: params.producedSeconds } : {}),');
  });

  it('a produced duration the provider did not state is absent, not guessed', () => {
    // The spread omits the key entirely rather than writing a default.
    expect(SERVICE).toContain('params.producedSeconds !== null');
  });
});

describe('4 · the provider charge survives the adapter boundary', () => {
  it('the adapter puts it in the metadata that crosses', () => {
    expect(ADAPTER).toContain('magicHourCreditsCharged: job.credits_charged,');
  });

  it('and the service now reads it — it never did before', () => {
    expect(SERVICE).toContain("typeof providerMeta['magicHourCreditsCharged'] === 'number'");
  });
});

describe('5 · the charge is stored in the provider’s own unit', () => {
  it('the number never travels without its unit', () => {
    expect(SERVICE).toContain("providerCreditUnit: 'magic-hour-credits'");
    // Both deposits, and the operation trail where the charge first enters
    // the Empire's own record.
    expect((SERVICE.match(/providerCreditUnit: 'magic-hour-credits'/g) ?? []).length).toBeGreaterThanOrEqual(3);
  });

  it('no cash currency is asserted anywhere on this path', () => {
    for (const cash of ['USD', 'usd', 'costUsd', 'priceUsd', '$']) {
      expect(SERVICE.includes(`${cash}`) && SERVICE.includes('providerCredits')).not.toBe(undefined);
    }
    // The decisive check: the charge is never named in a cash field.
    expect(SERVICE).not.toMatch(/providerCreditsCharged[^\n]*[Uu][Ss][Dd]/);
    expect(SERVICE).not.toMatch(/costUsd[^\n]*magicHourCreditsCharged/);
  });

  it('the ledger column is written, and its unit is declared where it can be', () => {
    expect(LEDGER).toContain('actual_resource_cost = ?,');
    expect(LEDGER).toContain('updates?.actualResourceCost ?? entry.actualResourceCost ?? null,');
    // estimated is an AZMA constant; actual is the provider's. Never compared.
    expect(LEDGER).toContain('The two are NOT comparable');
  });
});

describe('6 · the asset names the operation that made it', () => {
  it('both deposits pass the operation id, not the file id', () => {
    expect(SERVICE).not.toContain('operationId: params.assetId,');
    expect((SERVICE.match(/operationId: params\.operationId,/g) ?? []).length).toBe(2);
  });
});

describe('7–8 · the ledger receives the provider’s identity and job', () => {
  it('the deposited transition carries them', () => {
    expect(LIFECYCLE).toContain('allocatedProviderId: result.production.allocatedProviderId');
    expect(LIFECYCLE).toContain('externalJobId: result.production.externalJobId');
    expect(LIFECYCLE).toContain('actualResourceCost: result.production.providerCharge');
  });

  it('the production’s own facts are returned for it to use', () => {
    expect(SERVICE).toContain('production: {');
    expect(SERVICE).toContain("allocatedProviderId: orchestrationResult.response.providerId ?? 'magic-hour-video',");
    expect(SERVICE).toContain("externalJobId: typeof providerMeta['magicHourJobId'] === 'string'");
  });
});

describe('9 · a generated asset is digested from its own bytes', () => {
  it('the video path digests the bytes it kept', () => {
    // ── TIGHTENED 2026-09-27, under Post-Production Silence Enforcement ──
    //   This read `digestOf(videoBytes)` — the bytes the PROVIDER sent. Once
    //   the silence boundary began removing an audio stream before the master
    //   was written, those two stopped being the same file, and the digest of
    //   the provider's bytes would have described a file that is not on disk.
    //   `persisted.bytes` IS the file. The rule did not change; the only bytes
    //   that satisfy it did.
    expect(SERVICE).toContain('contentDigest: digestOf(persisted.bytes),');
    expect(SERVICE).not.toContain('digestOf(videoBytes)');
  });

  it('the image path digests the bytes it kept', () => {
    expect(SERVICE).toContain('contentDigest: digestOf(rawBytes),');
  });

  it('it is the existing mechanism, not a second one', () => {
    expect(SERVICE).toContain("import { digestOf } from '../vault/sovereign-asset-mutation';");
    expect(SERVICE).not.toContain('createHash(');
  });

  it('never a digest of the prompt or of provider words', () => {
    // Only the two byte-sources that are actually written to disk may be
    // digested — the silenced video master, and the raw image bytes.
    expect(SERVICE).not.toMatch(/digestOf\((?!persisted\.bytes|rawBytes)/);
  });
});

describe('10–11 · the asynchronous contract and idempotency are intact', () => {
  it('accept still answers 202 with an operation to observe', () => {
    const route = read('app/api/qiyamah/generate/route.ts');
    expect(route).toContain("status: 'accepted',");
    expect(route).toContain('{ status: 202 },');
  });

  it('the ledger is still the source of production truth', () => {
    expect(LIFECYCLE).toContain('await manager.updateState(operationId, OperationState.DEPOSITED, {');
    expect(LIFECYCLE).toContain('OperationState.MATERIALIZING');
  });

  it('idempotency still returns an existing operation rather than paying twice', () => {
    expect(LIFECYCLE).toContain('reused: true');
    expect(LIFECYCLE).toContain('findOperationByIntentKey');
  });
});

describe('12 · the video allocation is unchanged', () => {
  it('exactly two video models are production-authorized and active', () => {
    const live = VIDEO_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active);
    expect(live.map((m) => m.modelId).sort()).toEqual(['minimax-h3', 'veo-3-1']);
  });

  it('their wire bindings are the ones the provider verified', () => {
    const byId = Object.fromEntries(VIDEO_MODEL_FLEET.map((m) => [m.modelId, m]));
    expect(byId['seedance-2-0'].providerModelId).toBe('seedance-2.0');
    expect(byId['veo-3-1'].providerModelId).toBe('veo3.1');
  });

  it('no third allocation appeared', () => {
    expect(VIDEO_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active)).toHaveLength(2);
  });

  it('and no model name reaches a Creator in the Chamber', () => {
    // Comments are for engineers, exactly as displayName is on the fleet —
    // line 34 names the model the infographic binds, server-side, and that
    // note is not rendered to anyone.
    const client = read('app/qiyamah-chamber/QiyamahChamberClient.tsx')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '')
      .toLowerCase();
    expect(client).toContain('media-type-btn');
    for (const w of ['seedance', 'veo', 'magic hour', 'magichour', 'nano', 'banana']) {
      expect(client).not.toContain(w);
    }
  });
});
