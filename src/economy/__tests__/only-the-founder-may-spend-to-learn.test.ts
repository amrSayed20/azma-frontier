/**
 * AZMA OS — THE COST-MEASUREMENT CROSSING, 2026-10-12.
 *
 * A gate that can be crossed is a gate that will be crossed by the wrong hand
 * eventually. These hold the four conditions that make this one safe:
 *
 *   1. only the Founder, and the role is read from the database;
 *   2. only an unmeasured COST — never a policy block, a missing credential,
 *      or an undesignated model;
 *   3. only under a ceiling counted from what the provider actually charged;
 *   4. and the likeness declaration is not waived by any of it.
 */

import {
  authorizeCostMeasurement, campaignSpentCredits, campaignUnreportedJobs,
  COST_MEASUREMENT_CEILING_CREDITS, QIYAMAH_ACCEPTANCE_CAMPAIGN,
  CAMPAIGN_METADATA_KEY,
} from '../cost-engine/cost-measurement-authority';
import { readFileSync } from 'fs';
import { join } from 'path';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

/**
 * A database double that answers exactly what the authority asks it: the role
 * of a creator, and the metadata of the campaign's assets.
 */
function dbWith(options: {
  readonly role?: string | null;
  readonly charges?: readonly (number | null)[];
}) {
  const rows = (options.charges ?? []).map((c) => ({
    metadata: JSON.stringify({
      [CAMPAIGN_METADATA_KEY]: QIYAMAH_ACCEPTANCE_CAMPAIGN,
      ...(c === null ? {} : { mutationProviderCreditsCharged: c }),
    }),
  }));
  return {
    prepare(sql: string) {
      if (sql.includes('FROM creators')) {
        return {
          get: () => (options.role === null || options.role === undefined
            ? undefined
            : {
                creator_id: 'c1', email: 'x@y.z', password_hash: 'h',
                role: options.role, display_name: 'X', preferred_locale: 'ar',
                created_at: 1,
              }),
          all: () => [],
          run: () => undefined,
        };
      }
      return { all: () => rows, get: () => undefined, run: () => undefined };
    },
  } as never;
}

describe('1 · only the Founder, and the role is not taken from the caller', () => {
  it('a creator is refused', () => {
    const v = authorizeCostMeasurement(dbWith({ role: 'creator' }), {
      creatorId: 'c1', expectedCredits: 5,
    });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.refusal).toBe('not-the-founder');
  });

  it('an unknown id is refused', () => {
    const v = authorizeCostMeasurement(dbWith({ role: null }), {
      creatorId: 'ghost', expectedCredits: 5,
    });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.refusal).toBe('unknown-creator');
  });

  it('the Founder is authorized', () => {
    expect(authorizeCostMeasurement(dbWith({ role: 'founder' }), {
      creatorId: 'c1', expectedCredits: 5,
    }).ok).toBe(true);
  });

  it('the authority reads the role itself — no argument can assert it', () => {
    const src = read('src/economy/cost-engine/cost-measurement-authority.ts');
    expect(src).toContain('getCreator(db, input.creatorId)');
    // No boolean a caller could hand in.
    expect(src).not.toMatch(/founderVerified|isFounder\s*[:?]/);
  });
});

describe('2 · the ceiling is counted from what was actually charged', () => {
  it('spend is summed from the campaign’s own deposited assets', () => {
    expect(campaignSpentCredits(dbWith({ charges: [5, 5, 24] }))).toBe(34);
  });

  it('a job the provider never priced adds nothing, and is counted separately', () => {
    const db = dbWith({ charges: [5, null, 10] });
    expect(campaignSpentCredits(db)).toBe(15);
    expect(campaignUnreportedJobs(db)).toBe(1);
  });

  it('a job that would cross the ceiling is refused before it runs', () => {
    const v = authorizeCostMeasurement(dbWith({ role: 'founder', charges: [600] }), {
      creatorId: 'c1', expectedCredits: 24,
    });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.refusal).toBe('ceiling-would-be-exceeded');
  });

  it('a job that exactly reaches the ceiling is allowed', () => {
    const v = authorizeCostMeasurement(dbWith({ role: 'founder', charges: [594] }), {
      creatorId: 'c1', expectedCredits: 24,
    });
    expect(v.ok).toBe(true);
  });

  it('the ceiling is the one the Architect approved', () => {
    expect(COST_MEASUREMENT_CEILING_CREDITS).toBe(618);
  });

  it('a job with no estimate is refused — an unbounded job cannot be capped', () => {
    const v = authorizeCostMeasurement(dbWith({ role: 'founder' }), {
      creatorId: 'c1', expectedCredits: null,
    });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.refusal).toBe('expected-credits-unknown');
  });
});

describe('3 · the crossing reaches ONE kind of refusal and no other', () => {
  const RUNNER = read('src/vault/creative-operation-runner.ts');

  it('it is conditioned on COST_NOT_VERIFIED, by name', () => {
    expect(RUNNER).toContain("state.availability === 'COST_NOT_VERIFIED'");
  });

  it('a policy block, a missing credential and a missing model are not reachable by it', () => {
    // There is exactly one availability value in the crossing's condition.
    const crossing = RUNNER.slice(
      RUNNER.indexOf('THE ONE CROSSING'),
      RUNNER.indexOf('const shape = CREATIVE_INPUT_SHAPE'),
    );
    for (const other of ['POLICY_BLOCKED', 'NO_CREDENTIAL', 'NO_DESIGNATED_MODEL', 'NOT_AUTHORIZED']) {
      expect(crossing).not.toContain(other);
    }
  });

  it('the runner asks the authority itself, rather than trusting the route', () => {
    expect(RUNNER).toContain('authorizeCostMeasurement(db, {');
  });

  it('and the declaration gate still stands above the provider call', () => {
    // The measurement crosses a COST gate. It is not a key to anything else.
    expect(RUNNER).toContain('requiresLikenessAcknowledgment(operation)');
    expect(RUNNER.indexOf('requiresLikenessAcknowledgment(operation)'))
      .toBeLessThan(RUNNER.indexOf('await faceSwapViaProvider'));
  });
});

describe('4 · the door is the Founder’s, and holds nothing of its own', () => {
  const ROUTE = read('app/api/founder/cost-measurement/[operation]/route.ts');

  it('it refuses anyone whose role is not founder', () => {
    expect(ROUTE).toContain("creator?.role !== 'founder'");
  });

  it('it estimates from the job that will actually be submitted', () => {
    expect(ROUTE).toContain('estimateSubmittedJob({');
    expect(ROUTE).toContain('fps: typeof b.sourceFps');
  });

  it('it refuses to begin when the job cannot be estimated', () => {
    expect(ROUTE).toContain("reason: 'estimate-impossible'");
  });

  it('it performs no ownership check and no provider call of its own', () => {
    const code = ROUTE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/getVaultAsset|ViaProvider|deriveAsset|fetch\(/);
    expect(code).toContain('runCreativeOperation(db, {');
  });

  it('it never waives the likeness declaration', () => {
    expect(ROUTE).toContain('likenessAcknowledgment: b.likenessAcknowledgment');
    const code = ROUTE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toContain('acknowledged: true');
  });

  it('it reports the charge as the provider gave it, and never as zero', () => {
    expect(ROUTE).toContain('chargedCredits: outcome.providerCreditsCharged');
    expect(ROUTE).not.toMatch(/providerCreditsCharged\s*\?\?\s*0/);
  });
});

describe('5 · a measured asset carries what paid for it, and does not pass it on', () => {
  it('the campaign id is written onto the asset', () => {
    expect(read('src/vault/creative-operation-runner.ts'))
      .toContain('[CAMPAIGN_METADATA_KEY]: measuringCampaignId');
  });

  it('and a child derived from it inherits no campaign', () => {
    const MUTATION = read('src/vault/sovereign-asset-mutation.ts');
    const list = MUTATION.slice(
      MUTATION.indexOf('const CREATION_EVENT_KEYS = ['),
      MUTATION.indexOf('] as const;', MUTATION.indexOf('const CREATION_EVENT_KEYS = [')),
    );
    expect(list).toContain("'costMeasurementCampaign',");
  });
});
