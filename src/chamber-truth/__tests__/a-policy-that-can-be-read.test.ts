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

it('the seven that cannot travel are counted, not forgotten', () => {
  expect(POLICIES_NOT_YET_PUBLISHABLE).toHaveLength(7);
});

it('the Founder’s text is transcribed, not edited', () => {
  expect(policy.body).toContain('Topline Design');
  // Two faults are HIS to fix: an Arabic word inside an English sentence, and
  // an effective date that is still a placeholder.
  expect(policy.body).toContain('remains محفوظًا in the account');
  expect(policy.effectiveDate).toBeNull();
});

it('a document with no effective date is not shown as if it governed', () => {
  expect(read('app/policies/[slug]/page.tsx')).toContain('Effective date not yet set');
});

it('the expiry contradiction was ruled on, and the code follows the ruling', () => {
  expect(EXPIRY_RULE_IN_CONFLICT.MAY_PUBLISH).toBe(true);
  expect(read('src/economy/pricing/sovereign-value-balance.ts')).toContain("validity: 'does-not-expire'");
});
