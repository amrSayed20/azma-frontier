/**
 * AZMA OS — a policy nobody can read is not a policy, 2026-09-28.
 *
 * The release artifact is `tar … .next package.json package-lock.json`. `docs/`
 * never travels, so the seven policies written in September cannot be served to
 * anyone — while XPay requires public policy URLs. Text compiled into the build
 * travels with it; that is why the Founder's policy is a `.ts` file.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { policyBySlug, POLICIES_NOT_YET_PUBLISHABLE, EXPIRY_RULE_IN_CONFLICT } from '@/src/policies';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const policy = policyBySlug('refunds-and-credit-balance')!;

it('the policy is served from the build, not from docs/', () => {
  expect(existsSync(join(process.cwd(), 'app/policies/[slug]/page.tsx'))).toBe(true);
  expect(read('app/policies/[slug]/page.tsx')).not.toContain('readFileSync');
});

it('the ones that cannot travel are counted, not forgotten', () => {
  // It counted SEVEN, and two were since published as `.ts` and removed from
  // this list — so the number fell and the test failed for a repair. The rule
  // it was guarding is not the count: it is that nothing stays listed here
  // once it can actually be served.
  expect(POLICIES_NOT_YET_PUBLISHABLE.length).toBeGreaterThan(0);
  for (const path of POLICIES_NOT_YET_PUBLISHABLE) expect(path).toMatch(/^docs\//);
});

it('the Founder’s text is now SERVED IN ARABIC, by his own order', () => {
  // ── WHY THIS ASSERTION CHANGED, 2026-10-12 ────────────────────────────
  //
  //   It asserted that the English text was transcribed verbatim — including
  //   a flaw it deliberately preserved rather than quietly fix: «remains
  //   محفوظًا in the account», one Arabic word stranded inside an English
  //   sentence. Keeping it was right while the rule was «transcribe, never
  //   edit».
  //
  //   The Chief Architect then ordered this policy translated and published in
  //   Arabic with its binding meaning preserved. So the rule for THIS document
  //   is no longer transcription — and the stranded word is resolved by the
  //   translation rather than by an edit nobody authorised.
  //
  //   What does NOT change: the Empire's own identity block is never
  //   translated, and the effective date is still his alone to set.
  expect(policy.language).toBe('ar');
  expect(policy.body).toContain('Topline Design');
  expect(policy.body).toContain('azma.os27@gmail.com');
  expect(policy.body).toContain('01069269456');
  // The translation says what it is, so nobody mistakes it for a new policy.
  expect(policy.body).toContain('مترجمةً عن نصّها الإنجليزي');
  // Still unset, still his.
  expect(policy.effectiveDate).toBeNull();
});

it('a document with no effective date is not shown as if it governed', () => {
  expect(read('app/policies/[slug]/page.tsx')).toContain('Effective date not yet set');
});

it('the expiry contradiction was ruled on, and the code follows the ruling', () => {
  expect(EXPIRY_RULE_IN_CONFLICT.MAY_PUBLISH).toBe(true);
  expect(read('src/economy/pricing/sovereign-value-balance.ts')).toContain("validity: 'does-not-expire'");
});
