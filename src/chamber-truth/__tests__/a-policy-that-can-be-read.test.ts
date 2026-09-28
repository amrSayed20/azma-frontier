/**
 * AZMA OS — a policy nobody can read is not a policy.
 *
 * ─── WHAT WAS MEASURED, 2026-09-28 ──────────────────────────────────────────
 *
 *   The release artifact is exactly:
 *
 *       tar … .next package.json package-lock.json
 *
 *   `docs/` never travels to the server. So the seven policy documents written
 *   in September — Terms, Acceptable Use, Refund & Replacement, Privacy, AI
 *   Content, the Sovereign Value Balance, Account & Suspension — exist in git
 *   and on a laptop, and NOT ONE of them can be served to a Creator. XPay asks
 *   for public policy URLs before it will take a pound, and the Empire had
 *   none while believing it had seven.
 *
 *   Text compiled into the build travels with it. That is why the Founder's
 *   Refunds & Credit Balance policy is a `.ts` file and not another `.md`.
 *
 * ─── AND THE ONE THING THESE GUARDS WATCH HARDEST ───────────────────────────
 *
 *   His policy and his own earlier amendment say opposite things about the
 *   same money. Both are his. Publishing both would have the Empire promising
 *   a Creator two contradictory things about their own balance, which is the
 *   one thing pricing honesty cannot survive — so the contradiction is held
 *   visible and unpublished until he rules, and these tests hold it there.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import {
  PUBLISHED_POLICIES, policyBySlug,
  POLICIES_NOT_YET_PUBLISHABLE, EXPIRY_RULE_IN_CONFLICT,
} from '@/src/policies';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

describe('1 · what is published can actually be served', () => {
  it('every published policy has a page at its own address', () => {
    expect(existsSync(join(ROOT, 'app/policies/[slug]/page.tsx'))).toBe(true);
    expect(existsSync(join(ROOT, 'app/policies/page.tsx'))).toBe(true);
    for (const p of PUBLISHED_POLICIES) {
      expect(policyBySlug(p.slug)).toBe(p);
    }
  });

  it('and its text is compiled into the build, not read from docs/', () => {
    // The decisive fact: the deploy artifact carries .next and the two
    // manifests. A page that read `docs/` at runtime would 404 in production
    // while passing every test on a laptop.
    const deploy = read('scripts/deploy.sh');
    expect(deploy).toContain('.next package.json package-lock.json');
    const page = read('app/policies/[slug]/page.tsx');
    expect(page).not.toContain('readFileSync');
    expect(page).not.toContain('docs/policies');
  });

  it('the seven that cannot be served are counted, not forgotten', () => {
    expect(POLICIES_NOT_YET_PUBLISHABLE).toHaveLength(7);
    for (const f of POLICIES_NOT_YET_PUBLISHABLE) {
      // They exist — that is exactly the point. They exist and cannot travel.
      expect(existsSync(join(ROOT, f))).toBe(true);
      expect(PUBLISHED_POLICIES.some((p) => f.includes(p.slug))).toBe(false);
    }
  });
});

describe('2 · the Founder’s text is transcribed, never edited', () => {
  const policy = policyBySlug('refunds-and-credit-balance')!;

  it('it is there, with his company identity intact', () => {
    expect(policy).toBeDefined();
    for (const line of ['Topline Design', 'Nasr City, Cairo', '01069269456', 'azma.os27@gmail.com']) {
      expect(policy.body).toContain(line);
    }
  });

  it('all thirteen of his sections are present, in order', () => {
    const headings = [
      '1. PURPOSE', '2. CREDIT BALANCE', '3. NO CASH REFUNDS',
      '4. CREDIT BALANCE DOES NOT EXPIRE', '5. SUBSCRIPTION AND CREDIT BALANCE ARE SEPARATE',
      '6. FAILED PRODUCTION', '7. SUCCESSFUL PRODUCTION', '8. ACCOUNT CLOSURE',
      '9. ACCOUNT SECURITY AND OWNERSHIP', '10. TRANSPARENCY', '11. POLICY CHANGES',
      '12. CONTACT', '13. IMPORTANT DISTINCTION',
    ];
    let cursor = -1;
    for (const h of headings) {
      const at = policy.body.indexOf(h);
      expect(at).toBeGreaterThan(cursor);
      cursor = at;
    }
    expect(policy.body.trimEnd().endsWith('END OF POLICY')).toBe(true);
  });

  it('the two faults in it are LEFT for him and not corrected on his behalf', () => {
    // «remains محفوظًا in the account» — one Arabic word inside an English
    // sentence. Editing a ratified legal instrument on his behalf is a larger
    // fault than transcribing his own words as he wrote them.
    expect(policy.body).toContain('remains محفوظًا in the account');
    // And the effective date is still «[To be added]».
    expect(policy.body).toContain('Effective Date: [To be added]');
  });

  it('a document with no effective date is never shown as if it governed', () => {
    expect(policy.effectiveDate).toBeNull();
    const page = read('app/policies/[slug]/page.tsx');
    expect(page).toContain('Effective date not yet set');
    expect(page).toContain('لم يُحدَّد تاريخ سريانها بعد');
  });
});

describe('3 · two instruments that cannot both be true are not both published', () => {
  it('the contradiction is stated in full, in both directions', () => {
    expect(EXPIRY_RULE_IN_CONFLICT.policySays).toContain('do not expire');
    expect(EXPIRY_RULE_IN_CONFLICT.codeAndArabicPolicySay).toContain('٢٨ يوماً');
    expect(EXPIRY_RULE_IN_CONFLICT.codeAndArabicPolicySay).toContain('ثلث المتبقّي');
  });

  it('nobody has resolved it, and the flag says so rather than guessing', () => {
    expect(EXPIRY_RULE_IN_CONFLICT.resolvedBy).toBeNull();
    expect(EXPIRY_RULE_IN_CONFLICT.MAY_PUBLISH).toBe(false);
  });

  it('and the pricing layer is UNCHANGED — his amendment still governs the code', () => {
    // Nothing was silently switched to match the newer document. The 28-day
    // rule stands exactly as he ruled it until he says which instrument wins.
    const pricing = read('src/economy/pricing/sovereign-value-balance.ts');
    expect(pricing).toContain("validity: 'twenty-eight-days'");
    expect(pricing).toContain('STANDARD_CYCLE_MS');
    const arabicPolicy = read('docs/policies/SOVEREIGN_VALUE_BALANCE_POLICY.md');
    expect(arabicPolicy).toContain('ثمانية وعشرون يوماً');
  });

  it('no creator-facing surface links to the policy while they disagree', () => {
    // A Creator must never be able to reach two Empire promises about their
    // own balance that contradict each other.
    const balance = read('app/sovereign-balance/SovereignBalanceClient.tsx');
    expect(balance).not.toContain('/policies/refunds-and-credit-balance');
  });
});
