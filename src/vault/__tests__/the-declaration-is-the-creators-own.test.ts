/**
 * AZMA OS — THE LIKENESS DECLARATION IS THE CREATOR'S OWN, 2026-10-11.
 *
 * §2 of the directive: an explicit affirmative acknowledgment, never
 * pre-checked, recorded against the specific request, enforced server-side so
 * that a direct API call cannot bypass it — and never described as AZMA having
 * verified anybody's consent.
 *
 * These hold the four things that could each silently stop being true: the
 * default is absent, a loose value is not an affirmation, the wording is
 * versioned, and the declaration does not travel to the next asset.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  verifyLikenessAcknowledgment, requiresLikenessAcknowledgment,
  LIKENESS_POLICY_VERSION, LIKENESS_ACKNOWLEDGMENT_AR, LIKENESS_STATEMENTS_AR,
} from '../likeness-acknowledgment';
import { inheritableMetadata } from '../sovereign-asset-mutation';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const VALID = { acknowledged: true, acknowledgedVersion: LIKENESS_POLICY_VERSION };

describe('1 · nothing is an affirmation but an affirmation', () => {
  it('an absent declaration is absent, not a default', () => {
    const v = verifyLikenessAcknowledgment(undefined);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.rejection).toBe('absent');
  });

  it('a truthy string is a loose client, not a Creator affirming', () => {
    const v = verifyLikenessAcknowledgment({ acknowledged: 'true', acknowledgedVersion: LIKENESS_POLICY_VERSION });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.rejection).toBe('not-affirmative');
  });

  it('an explicit refusal is refused', () => {
    const v = verifyLikenessAcknowledgment({ acknowledged: false, acknowledgedVersion: LIKENESS_POLICY_VERSION });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.rejection).toBe('not-affirmative');
  });

  it('a declaration against older wording is not a declaration against these words', () => {
    const v = verifyLikenessAcknowledgment({ acknowledged: true, acknowledgedVersion: 'likeness-v0' });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.rejection).toBe('version-mismatch');
  });

  it('a real declaration is accepted', () => {
    expect(verifyLikenessAcknowledgment(VALID).ok).toBe(true);
  });
});

describe('2 · what is kept is the version and the moment', () => {
  it('both are recorded', () => {
    const v = verifyLikenessAcknowledgment(VALID, 1_760_000_000_000);
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.record.policyVersion).toBe(LIKENESS_POLICY_VERSION);
      expect(v.record.acknowledgedAtMs).toBe(1_760_000_000_000);
    }
  });

  it('and nothing else is — no face, no media, no identity', () => {
    const v = verifyLikenessAcknowledgment(VALID);
    expect(v.ok).toBe(true);
    if (v.ok) expect(Object.keys(v.record).sort()).toEqual(['acknowledgedAtMs', 'policyVersion']);
  });

  it('the verifier is handed no asset, so possession can never become consent', () => {
    const src = read('src/vault/likeness-acknowledgment.ts');
    const fn = src.slice(src.indexOf('export function verifyLikenessAcknowledgment'));
    expect(fn).not.toMatch(/getVaultAsset|subscriberTenantId|secureStorageUri|ownerId/);
  });
});

describe('3 · the words the Creator reads say the four things, and claim nothing', () => {
  it('there are four statements, each one of them said', () => {
    expect(LIKENESS_STATEMENTS_AR).toHaveLength(4);
    expect(new Set(LIKENESS_STATEMENTS_AR).size).toBe(4);
  });

  it('it says the Creator holds the rights', () => {
    expect(LIKENESS_ACKNOWLEDGMENT_AR.rights).toMatch(/أملك الحقوق/);
  });

  it('it says the responsibility is theirs', () => {
    expect(LIKENESS_ACKNOWLEDGMENT_AR.responsibility).toMatch(/أتحمّل/);
  });

  it('it says possession is not consent', () => {
    expect(LIKENESS_ACKNOWLEDGMENT_AR.possessionIsNotConsent).toMatch(/ليس في ذاته موافقةً/);
  });

  it('it says AZMA does not verify on their behalf', () => {
    expect(LIKENESS_ACKNOWLEDGMENT_AR.azmaDoesNotVerify).toMatch(/لا تَتحقّق نيابةً عنّي/);
    expect(LIKENESS_ACKNOWLEDGMENT_AR.azmaDoesNotVerify).toMatch(/لا يُعدّ قبولُها هنا دليلاً/);
  });

  it('and not one word of it is foreign to the Creator', () => {
    for (const line of LIKENESS_STATEMENTS_AR) expect(line).not.toMatch(/[A-Za-z]{3,}/);
  });
});

describe('4 · the declaration is never made on a Creator’s behalf', () => {
  it('no shipped file affirms it — only a test may construct one', () => {
    const hits = (execSync('git grep -n "acknowledged: true" -- app src || true',
      { encoding: 'utf8', cwd: process.cwd() }) as string)
      .split('\n')
      // A TYPE saying the field may only ever be `true` is the opposite of an
      // affirmation made on a Creator's behalf; it is what forbids a loose
      // one. Only executable affirmations are the defect being hunted.
      .filter((l) => l.trim().length > 0 && !/__tests__/.test(l)
        && !/readonly acknowledged: true;/.test(l));
    expect(hits).toEqual([]);
  });

  it('and no surface pre-selects the control', () => {
    const hits = (execSync('git grep -n "defaultChecked\|checked={true}" -- app || true',
      { encoding: 'utf8', cwd: process.cwd() }) as string)
      .split('\n').filter((l) => l.trim().length > 0);
    expect(hits).toEqual([]);
  });

  it('the type itself admits only the affirmative literal', () => {
    expect(read('src/vault/likeness-acknowledgment.ts')).toMatch(/readonly acknowledged: true;/);
  });
});

describe('5 · a declaration belongs to one act, and does not travel', () => {
  it('a child derived from a declared asset inherits neither field', () => {
    const kept = inheritableMetadata({
      likenessPolicyVersion: LIKENESS_POLICY_VERSION,
      likenessAcknowledgedAt: 1_760_000_000_000,
      somethingOrdinary: 'kept',
    });
    expect(kept).toEqual({ somethingOrdinary: 'kept' });
  });

  it('and the two keys are NOT namespaced `mutation`, which is what makes that true', () => {
    // `mutation*` is the prefix that marks a key as surviving into the next
    // asset. A declaration must not survive, so it must not wear it.
    const src = read('src/vault/sovereign-asset-mutation.ts');
    const start = src.indexOf('const CREATION_EVENT_KEYS = [');
    const list = src.slice(start, src.indexOf('] as const;', start));
    expect(list).toContain("'likenessPolicyVersion',");
    expect(list).not.toMatch(/'mutationLikeness/);
  });

  it('only face swap demands one, and the list is the authority', () => {
    expect(requiresLikenessAcknowledgment('face-swap')).toBe(true);
    for (const op of ['background-removal', 'lip-sync', 'talking-photo', 'upscale', 'edit']) {
      expect(requiresLikenessAcknowledgment(op)).toBe(false);
    }
  });
});

describe('6 · the gate is below the door, so no door can skip it', () => {
  it('the route hands the value on untouched, never normalising it', () => {
    const route = read('app/api/vault/assets/[assetId]/creative/[operation]/route.ts');
    expect(route).toContain('likenessAcknowledgment: b.likenessAcknowledgment');
  });

  it('the route decides nothing about it', () => {
    const route = read('app/api/vault/assets/[assetId]/creative/[operation]/route.ts');
    const code = route.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/verifyLikenessAcknowledgment|LIKENESS_POLICY_VERSION/);
  });

  it('and the provider path verifies it a second time, where no caller is trusted', () => {
    const adapter = read('src/core/sovereign-ai-integration/adapters/magic-hour-creative-operations.ts');
    const fn = adapter.slice(adapter.indexOf('export async function faceSwapViaProvider'));
    expect(fn).toMatch(/faceSwapIsPermitted\(acknowledgment\)/);
  });
});
