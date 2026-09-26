/**
 * AZMA OS — Cost Truth across every paid capability, not the video path alone.
 *
 * ─── WHAT WAS MEASURED, AND WHAT IT COST TO MEASURE ─────────────────────────
 *
 *   Five image-to-video jobs and one image-edit job already carried their
 *   provider job ids in asset metadata, so their charges were recovered from
 *   the provider's own records WITHOUT spending a credit:
 *
 *     IMAGE_TO_VIDEO  seedance-2.0  5s  840 credits   (×4)
 *     IMAGE_TO_VIDEO  veo3.1        4s  384 credits
 *     AI_IMAGE_EDITOR nano-banana-2      100 credits
 *
 *   Seedance charges 168 credits/second. Veo charges 96. The rate is a
 *   property of the MODEL, not of the capability — which is exactly why the
 *   Constitution forbids generalising the 168 observation.
 *
 * ─── THE FAULT THIS CLOSES ──────────────────────────────────────────────────
 *
 *   All three mutation adapters (edit, animate, upscale) returned
 *   `creditsCharged` from the provider's completed job, and all three routes
 *   referenced it ZERO times. The charge was in hand at the moment of
 *   derivation and was discarded — the identical fault the video path had.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { VIDEO_MODEL_FLEET } from '@/src/sovereign-model-selection/video-model-fleet';
import { IMAGE_MODEL_FLEET } from '@/src/sovereign-model-selection/image-model-fleet';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const MUTATION = read('src/vault/sovereign-asset-mutation.ts');
const EDIT = read('app/api/vault/assets/[assetId]/edit/route.ts');
const ANIMATE = read('app/api/vault/assets/[assetId]/animate/route.ts');
const UPSCALE = read('app/api/vault/assets/[assetId]/upscale/route.ts');
const EDITING_ADAPTER = read('src/core/sovereign-ai-integration/adapters/magic-hour-image-editing.ts');
const I2V_ADAPTER = read('src/core/sovereign-ai-integration/adapters/magic-hour-image-to-video.ts');
const ROUTES = { edit: EDIT, animate: ANIMATE, upscale: UPSCALE };

describe('1 · every mutation records what the provider actually charged', () => {
  it('the provenance can carry a charge and its unit', () => {
    expect(MUTATION).toContain('readonly creditsCharged?: number | null;');
    expect(MUTATION).toContain('readonly creditUnit?: string;');
  });

  it('all three routes hand it over — none of them read it before', () => {
    for (const [name, src] of Object.entries(ROUTES)) {
      expect({ name, has: src.includes('creditsCharged: produced.creditsCharged') }).toEqual({ name, has: true });
      expect({ name, has: src.includes("creditUnit: 'magic-hour-credits'") }).toEqual({ name, has: true });
    }
  });

  it('the adapters really do return it, so the routes are not passing undefined', () => {
    expect(EDITING_ADAPTER).toContain("creditsCharged: typeof finished.credits_charged === 'number' ? finished.credits_charged : null,");
    expect(I2V_ADAPTER).toContain("creditsCharged: typeof finished.credits_charged === 'number' ? finished.credits_charged : null,");
  });
});

describe('2 · quantity and unit are written together, or neither', () => {
  it('the metadata pair cannot be split', () => {
    expect(MUTATION).toContain('mutationProviderCreditsCharged: request.providerProvenance.creditsCharged,');
    expect(MUTATION).toContain("mutationProviderCreditUnit: request.providerProvenance.creditUnit ?? 'magic-hour-credits',");
    // Both sit inside ONE conditional spread, so one cannot exist without the other.
    const start = MUTATION.indexOf("typeof request.providerProvenance.creditsCharged === 'number'");
    const block = MUTATION.slice(start, start + 420);
    expect(block).toContain('mutationProviderCreditsCharged');
    expect(block).toContain('mutationProviderCreditUnit');
  });

  it('an absent charge is absent, never zero', () => {
    expect(MUTATION).toContain("typeof request.providerProvenance.creditsCharged === 'number'");
    expect(MUTATION).not.toMatch(/mutationProviderCreditsCharged:[^\n]*\?\?\s*0/);
  });
});

describe('3 · a cost never detaches from its operation or its lineage', () => {
  it('the charge is written in the same derivation that names the parent', () => {
    for (const [name, src] of Object.entries(ROUTES)) {
      const start = src.indexOf('deriveAsset({');
      expect({ name, found: start > -1 }).toEqual({ name, found: true });
      const block = src.slice(start, start + 2200);
      expect({ name, parent: block.includes('parentAssetId: parent.assetId') }).toEqual({ name, parent: true });
      expect({ name, charge: block.includes('creditsCharged: produced.creditsCharged') }).toEqual({ name, charge: true });
      expect({ name, job: block.includes('providerJobId: produced.providerJobId') }).toEqual({ name, job: true });
    }
  });

  it('the derived asset keeps parent, root and version — cost cannot hide in the parent', () => {
    expect(MUTATION).toContain('parentContentDigest');
    expect(MUTATION).toContain('contentDigest: outputDigest');
  });
});

describe('4 · the rate belongs to the model, not to the capability', () => {
  /**
   * Recovered from the provider, zero spend:
   *   seedance-2.0  840/5s = 168 credits/second
   *   veo3.1        384/4s =  96 credits/second
   * A single «video rate» would be false for one of them.
   */
  it('both authorised video models exist and are distinct bindings', () => {
    const live = VIDEO_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active);
    expect(live.map((m) => m.modelId).sort()).toEqual(['seedance-2-0', 'veo-3-1']);
    const byId = Object.fromEntries(live.map((m) => [m.modelId, m]));
    expect(byId['seedance-2-0'].providerModelId).not.toBe(byId['veo-3-1'].providerModelId);
  });

  it('no single video rate is hard-coded anywhere', () => {
    for (const src of [EDITING_ADAPTER, I2V_ADAPTER, MUTATION, ...Object.values(ROUTES)]) {
      expect(src).not.toMatch(/168\s*\*|creditsPerSecond|CREDITS_PER_SECOND/);
    }
  });

  it('the image allocation is unchanged and is the one the edit runs on', () => {
    const live = IMAGE_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active);
    expect(live.map((m) => m.modelId).sort()).toEqual(['nano-banana-2', 'nano-banana-pro']);
    expect(EDITING_ADAPTER).toContain("export const IMAGE_EDIT_MODEL_ID = 'nano-banana-2' as const;");
  });
});

describe('5 · no capability invents a cost it did not incur', () => {
  it('no route substitutes a default charge', () => {
    for (const [name, src] of Object.entries(ROUTES)) {
      expect({ name, bad: /creditsCharged:\s*\d/.test(src) }).toEqual({ name, bad: false });
      expect({ name, bad: src.includes('creditsCharged: 0') }).toEqual({ name, bad: false });
    }
  });

  it('no cash value is asserted on any mutation path', () => {
    for (const [name, src] of Object.entries(ROUTES)) {
      expect({ name, bad: /(costUsd|priceUsd|amountUsd|priceEgp)/.test(src) }).toEqual({ name, bad: false });
    }
    expect(MUTATION).not.toMatch(/(costUsd|priceUsd|cashCost)/);
  });

  it('provider credits are never called AZMA Units', () => {
    for (const src of [MUTATION, ...Object.values(ROUTES)]) {
      expect(src).not.toMatch(/azmaUnits[^\n]*credits|credits[^\n]*azmaUnits/i);
    }
  });
});

describe('6 · no historical fabrication and no second authority', () => {
  it('no migration writes a charge onto an existing asset', () => {
    const db = read('src/persistent-storage/db.ts');
    expect(db).not.toMatch(/mutationProviderCreditsCharged/);
    expect(db).not.toMatch(/SET\s+actual_resource_cost/);
  });

  it('the charge lives in the asset metadata that already existed — no new table', () => {
    const schema = read('src/persistent-storage/schema.ts');
    for (const forbidden of ['cost_records', 'cost_ledger', 'provider_costs', 'capability_costs']) {
      expect(schema).not.toContain(forbidden);
    }
  });
});
