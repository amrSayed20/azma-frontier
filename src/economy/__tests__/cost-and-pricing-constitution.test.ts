/**
 * AZMA OS — the Cost & Pricing Constitution, made enforceable.
 *
 * docs/SOVEREIGN_COST_AND_PRICING_CONSTITUTION.md states the law. This file is
 * what stops it being quietly broken.
 *
 * ─── THE EVIDENCE IT RESTS ON ───────────────────────────────────────────────
 *
 *   Two real productions, both seedance-2.0 through the magic-hour-video
 *   binding, 1280×720 at 24fps:
 *
 *     57b0af62…  requested 6s · produced 4.096s ·  672 magic-hour-credits
 *     fc04dca1…  requested 6s · produced 6.080s · 1008 magic-hour-credits
 *
 *   672/4 = 168 and 1008/6 = 168. That rate is DERIVED, holds only under those
 *   conditions, and is not a price. No cash figure exists for either.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { CURRENT_PROVIDER_COST_CATALOG as PROVIDER_COST_CATALOG } from '../cost-engine/provider-cost-catalog';
import { AzmaUnitCostEngine } from '../cost-engine/azma-cost-engine';
import { CostUnavailableError } from '../cost-engine/cost-engine-types';
import { CREDIT_PACKS } from '../payment/credit-packs';
import { VIDEO_MODEL_FLEET } from '@/src/sovereign-model-selection/video-model-fleet';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const CONSTITUTION = 'docs/SOVEREIGN_COST_AND_PRICING_CONSTITUTION.md';
const SERVICE = read('src/qiyamah-generation/generation-service.ts');
const LEDGER = read('src/orchestrator/fleet-materialization/ledger/operation-ledger-manager.ts');
const CREDIT_TYPES = read('src/economy/credit-ledger/credit-ledger-types.ts');
const COST_TYPES = read('src/economy/cost-engine/cost-engine-types.ts');
const GENERATE_ROUTE = read('app/api/qiyamah/generate/route.ts');

describe('0 · the Constitution exists and is the single economic authority', () => {
  it('the document is in the constitutional location', () => {
    expect(existsSync(join(ROOT, CONSTITUTION))).toBe(true);
  });

  it('there is exactly one cost-and-pricing constitution', () => {
    const doc = read(CONSTITUTION);
    expect(doc).toContain('دستور الكُلفة والتسعير');
    expect(doc).toContain('لا تُنشئ حجرةً سادسة');
  });
});

describe('1 · provider credits are never reported as cash', () => {
  it('every provider charge carries its provider unit', () => {
    expect(SERVICE).toContain("providerCreditUnit: 'magic-hour-credits'");
    // The number and the unit are written by the same expression, so one
    // cannot be persisted without the other.
    const pairs = SERVICE.match(/providerCreditsCharged: params\.providerCreditsCharged, providerCreditUnit: 'magic-hour-credits'/g) ?? [];
    expect(pairs.length).toBe(2);
  });

  it('no cash field ever holds a provider charge', () => {
    expect(SERVICE).not.toMatch(/(costUsd|priceUsd|amountUsd|cashCost)[^\n]*(providerCredits|magicHourCredits)/i);
    expect(SERVICE).not.toMatch(/(providerCredits|magicHourCredits)[^\n]*(Usd|EGP|cash)/);
  });

  it('the cost engine declares provider units as audit-only', () => {
    expect(COST_TYPES).toContain('providerCreditUnit');
    expect(COST_TYPES).toContain('never exposed to Creator');
  });
});

describe('2 · UNKNOWN is never converted to zero', () => {
  it('an unpriced capability throws rather than quoting a number', () => {
    const engine = new AzmaUnitCostEngine();
    const pending = PROVIDER_COST_CATALOG.entries.find((e) => e.availability !== 'available');
    expect(pending).toBeDefined();
    expect(() => engine.estimate(pending!.capabilityTarget, pending!.gatewayId))
      .toThrow(CostUnavailableError);
  });

  it('the balance-aware estimate never says canProceed on an unpriced capability', () => {
    const engine = new AzmaUnitCostEngine();
    const pending = PROVIDER_COST_CATALOG.entries.find((e) => e.availability !== 'available')!;
    const out = engine.estimateWithBalance(pending.capabilityTarget, pending.gatewayId, {
      creatorId: 'c', availableUnits: 1_000_000, reservedUnits: 0, lifetimeGranted: 0, lifetimeSpent: 0,
    } as never);
    expect(out.canProceed).toBe(false);
    // The zero it returns is accompanied by the state that explains it.
    expect(out.availability).not.toBe('available');
  });

  it('the Chamber never prints a confident zero for an unknown price', () => {
    const estimate = read('app/api/sovereign/economy/estimate/route.ts');
    expect(estimate).toContain("const priced = estimate.availability === 'available';");
    expect(estimate).toContain('estimatedAzmaUnits: priced ? estimate.estimatedAzmaUnits : null,');
  });

  it('a cost the catalog has not established is recorded as pending, not as 0 cost', () => {
    for (const e of PROVIDER_COST_CATALOG.entries) {
      if (e.azmaUnitsPerUnit === 0) expect(e.availability).not.toBe('available');
    }
  });
});

describe('3–4 · provider cost and customer price never cross', () => {
  it('the generation route refuses rather than inventing a price', () => {
    expect(GENERATE_ROUTE).toContain('Never invent a price');
    expect(GENERATE_ROUTE).toContain("reason: 'cost-unavailable'");
  });

  it('the credit ledger stores no provider cost and no cash', () => {
    expect(CREDIT_TYPES).toContain('Provider costs, USD amounts, and API pricing are NEVER stored here');
    expect(CREDIT_TYPES).not.toMatch(/providerCredit|magicHour|costUsd/);
  });

  it('customer prices live only in the credit packs, in the customer’s currency', () => {
    for (const p of CREDIT_PACKS) {
      expect(typeof p.priceEgp).toBe('number');
      expect(typeof p.azmaUnits).toBe('number');
      // A pack prices AZMA Units. It knows nothing of any provider.
      expect(JSON.stringify(p)).not.toMatch(/magic|provider|credit-unit/i);
    }
  });

  it('no customer price is written into a cost field', () => {
    expect(SERVICE).not.toMatch(/priceEgp|CREDIT_PACKS|azmaUnitsPerUnit/);
  });
});

describe('5 · a provider model is not a sovereign capability', () => {
  it('the wire binding and the sovereign identity stay distinct', () => {
    const seedance = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'seedance-2-0')!;
    expect(seedance.providerModelId).toBe('seedance-2.0');
    expect(seedance.modelId).not.toBe(seedance.providerModelId);
    expect(seedance.sovereignNameAr).toBeTruthy();
  });

  it('the allocation is the two decided families, unchanged', () => {
    const live = VIDEO_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active);
    expect(live.map((m) => m.modelId).sort()).toEqual(['minimax-h3', 'veo-3-1']);
  });
});

describe('6–7 · lineage is reconstructable from AZMA’s own records', () => {
  it('the asset names the operation that made it', () => {
    expect((SERVICE.match(/operationId: params\.operationId,/g) ?? []).length).toBe(2);
    expect(SERVICE).not.toContain('operationId: params.assetId,');
  });

  it('the provider job reaches the ledger and the asset', () => {
    const lifecycle = read('src/qiyamah-generation/video-operation-lifecycle.ts');
    expect(lifecycle).toContain('externalJobId: result.production.externalJobId');
    expect(SERVICE).toContain('providerJobId: params.providerJobId');
  });

  it('the provider binding reaches the ledger', () => {
    const lifecycle = read('src/qiyamah-generation/video-operation-lifecycle.ts');
    expect(lifecycle).toContain('allocatedProviderId: result.production.allocatedProviderId');
  });
});

describe('8–9 · a charge keeps its unit, its conditions, and is never an estimate', () => {
  it('the ledger writes the ACTUAL charge, not the estimate', () => {
    const lifecycle = read('src/qiyamah-generation/video-operation-lifecycle.ts');
    expect(lifecycle).toContain('actualResourceCost: result.production.providerCharge');
    expect(lifecycle).not.toMatch(/actualResourceCost:[^\n]*estimated/i);
  });

  it('the two ledger costs are declared incomparable', () => {
    expect(LEDGER).toContain('The two are NOT comparable');
  });

  it('a quantity is recorded with the conditions it was incurred under', () => {
    for (const k of ['outputWidth', 'outputHeight', 'outputFps', 'producedSeconds']) {
      expect(SERVICE).toContain(k);
    }
  });
});

describe('10 · no historical economic fact is fabricated', () => {
  it('nothing backfills a cost, a job id, a digest or a produced duration', () => {
    const db = read('src/persistent-storage/db.ts');
    for (const forbidden of ['actual_resource_cost =', 'external_job_id =', 'content_digest =', 'producedSeconds']) {
      // db.ts performs migrations; none of them may write an economic fact.
      expect(db.includes(`UPDATE operation_ledger\n       SET ${forbidden}`)).toBe(false);
    }
    expect(db).not.toMatch(/SET\s+actual_resource_cost/);
    expect(db).not.toMatch(/SET\s+content_digest/);
  });

  it('an absent fact is omitted from metadata, never defaulted', () => {
    expect(SERVICE).toContain('params.producedSeconds !== null ?');
    expect(SERVICE).toContain('params.providerCreditsCharged !== null');
    expect(SERVICE).toContain('params.outputFps !== null ?');
  });
});

describe('11 · no duplicate economic authority', () => {
  it('there is one operation ledger', () => {
    const schema = read('src/persistent-storage/schema.ts');
    expect((schema.match(/CREATE TABLE IF NOT EXISTS operation_ledger/g) ?? []).length).toBe(1);
  });

  it('there is one credit ledger and one cost catalog', () => {
    const schema = read('src/persistent-storage/schema.ts');
    expect((schema.match(/CREATE TABLE IF NOT EXISTS credit_ledger/g) ?? []).length).toBe(1);
    expect(PROVIDER_COST_CATALOG.catalogVersion).toBeTruthy();
  });

  it('no second cost table was introduced by this Constitution', () => {
    const schema = read('src/persistent-storage/schema.ts');
    for (const forbidden of ['cost_records', 'cost_ledger', 'provider_costs', 'pricing_records']) {
      expect(schema).not.toContain(forbidden);
    }
  });
});

describe('12 · different provider units are never merged', () => {
  it('each catalog entry names its own provider unit', () => {
    for (const e of PROVIDER_COST_CATALOG.entries) {
      if (e.providerCreditCost !== null && e.providerCreditCost !== undefined) {
        expect(typeof e.providerCreditUnit).toBe('string');
        expect(e.providerCreditUnit!.length).toBeGreaterThan(0);
      }
    }
  });

  it('no code sums or compares two provider units', () => {
    expect(SERVICE).not.toMatch(/magicHourCreditsCharged\s*[+\-*/]\s*\w*[Cc]redits/);
  });
});

describe('13–14 · a cost never detaches from its operation or its asset', () => {
  it('the charge is written in the same call that names the operation', () => {
    const start = SERVICE.indexOf('const deposited = await vaultManager.depositAsset({');
    const block = SERVICE.slice(start, start + 2600);
    expect(block).toContain('operationId: params.operationId');
    expect(block).toContain('providerCreditsCharged');
  });

  it('the asset keeps its own digest, so the thing charged for is identifiable', () => {
    // TIGHTENED 2026-09-27: the video digest was taken from the provider's
    // bytes. Post-Production Silence Enforcement may remove an audio stream
    // before the master is written, so the identifiable thing is the file that
    // exists — `persisted.bytes` — not what the provider sent. The charge and
    // the operation it belongs to are untouched by this.
    expect(SERVICE).toContain('contentDigest: digestOf(persisted.bytes),');
    expect(SERVICE).toContain('contentDigest: digestOf(rawBytes),');
  });
});

describe('15 · requested and produced are never confused', () => {
  it('both are carried, and the adapter reports the provider’s own statement', () => {
    const adapter = read('src/core/sovereign-ai-integration/adapters/magic-hour-adapter.ts');
    expect(adapter).toContain('magicHourRequestedSeconds: endSeconds,');
    expect(adapter).toContain('magicHourProducedSeconds:');
    expect(SERVICE).toContain('durationSeconds: params.durationSeconds,');
    expect(SERVICE).toContain('producedSeconds: params.producedSeconds');
  });

  it('a duration that cannot be established is refused, never defaulted', () => {
    const adapter = read('src/core/sovereign-ai-integration/adapters/magic-hour-adapter.ts');
    expect(adapter).toContain('refusing rather than substituting one');
    expect(adapter).not.toMatch(/endSeconds[^\n]*\?\?\s*4/);
  });
});
