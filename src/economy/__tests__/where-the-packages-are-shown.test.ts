/**
 * AZMA OS — where a Creator learns what the Empire's power costs.
 *
 * ─── WHAT WAS FOUND, 2026-09-27 ─────────────────────────────────────────────
 *
 *   The Founder's four approved packages existed in the repository and on NO
 *   surface in the Empire. The one purchase page that did exist — /subscribe —
 *   offered a single plan that is not among the four, through a payment
 *   provider he had already replaced, and it was reached only AFTER a Creator
 *   had registered and run out of Balance.
 *
 *   His instruction: «وتعرض الباقات فى نهايه رحله الزائر وليس بعد تسجيل الدخول
 *   وتخبر المستخدم ان هناك وحدات هديه ممكن ان تمنحها الامبراطوريه لمشتركين».
 *
 * ─── AND THE ONE THING THESE GUARDS WATCH HARDEST ───────────────────────────
 *
 *   The pricing module imports the cost-truth table: provider credit rates,
 *   the dollar acquisition cost, the FX rate. A `'use client'` component that
 *   imported it would publish all of it inside a JavaScript bundle any visitor
 *   can open — the Empire's provider costs, leaked through a price list. So no
 *   client component may import that module, and the projection that crosses
 *   to a browser is checked field by field.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  creatorFacingPackages, SOVEREIGN_PACKAGES, VALIDITY_AR,
  BALANCE_NOTICES_AR, GIFT_BALANCE,
} from '../pricing/sovereign-value-balance';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
/**
 * Comments are for engineers. A rule about what a Creator reads, or about what
 * a bundle carries, is checked on the code — otherwise the guard fires on the
 * sentence explaining the guard, which is how a true rule gets weakened to
 * make a test pass.
 */
const strip = (src: string) => src
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/\s\/\/.*$/gm, '');

const ARRIVAL = read('src/imperial-experience-engine/experiences/arrival/ArrivalExperience.tsx');
const GATE    = read('app/page.tsx');
const PAGE    = read('app/sovereign-balance/page.tsx');
const CLIENT  = read('app/sovereign-balance/SovereignBalanceClient.tsx');

describe('1 · the projection carries what a Creator sees and nothing beneath it', () => {
  it('is the four approved packages, in the approved order', () => {
    expect(creatorFacingPackages().map((p) => p.packageId))
      .toEqual(SOVEREIGN_PACKAGES.map((p) => p.packageId));
  });

  it('carries the approved price, Balance and validity of each', () => {
    for (const p of creatorFacingPackages()) {
      const approved = SOVEREIGN_PACKAGES.find((s) => s.packageId === p.packageId)!;
      expect(p.priceEgp).toBe(approved.priceEgp);
      expect(p.balanceUnits).toBe(approved.balanceUnits);
      expect(p.validityAr).toBe(VALIDITY_AR[approved.validity]);
    }
  });

  it('carries no cost, no basis, no provider and no margin', () => {
    for (const p of creatorFacingPackages()) {
      expect(Object.keys(p).sort())
        .toEqual(['balanceUnits', 'nameAr', 'packageId', 'priceEgp', 'validityAr']);
    }
  });

  it('every validity a package can declare has an Arabic reading', () => {
    // A package whose validity had no entry would render `undefined` beside a
    // real price.
    for (const p of SOVEREIGN_PACKAGES) expect(VALIDITY_AR[p.validity]).toBeTruthy();
  });
});

describe('2 · the cost truth never reaches a browser', () => {
  it('no client component imports the pricing module', () => {
    for (const [name, src] of [['arrival', ARRIVAL], ['balance client', CLIENT]] as const) {
      expect(src).toContain("'use client'");
      expect(src).not.toContain('sovereign-value-balance');
      expect(src).not.toContain('qiyamah-cost-truth');
      // Nor may it reach the same table by another road.
      expect(src).not.toContain('OPERATION_CONSUMPTION');
      expect(name).toBeTruthy();
    }
  });

  it('a server component reads it and passes the projection down', () => {
    // The GATE no longer does — it carries no price at all since the Founder's
    // ruling of 2026-09-28. The two that do are the Balance surface and the
    // Chamber, and both are Server Components.
    expect(PAGE).toContain('creatorFacingPackages()');
    expect(read('app/qiyamah-chamber/page.tsx')).toContain('creatorFacingPackages()');
    expect(strip(GATE)).not.toContain('creatorFacingPackages()');
    // The gate's page is a Server Component: it must not declare itself a
    // client one, or the import above ships the cost table after all.
    expect(strip(GATE)).not.toContain("'use client'");
    expect(strip(PAGE)).not.toContain("'use client'");
  });

  it('neither surface holds a price of its own', () => {
    // A price written twice is a price that will disagree with itself, and a
    // Creator would be held to whichever screen they happened to read.
    // On the stripped view: the digit convention is explained in a comment
    // that quotes a policy price as its example, and a comment is not a second
    // price record. What must hold no price is the code that renders one.
    for (const src of [ARRIVAL, CLIENT].map(strip)) {
      for (const n of ['99', '249', '499', '1200', '1,200', '1375', '3450', '6900', '16670', '16,670']) {
        expect(src).not.toContain(n);
      }
    }
  });
});

describe('3 · the packages are where the money is spent, not at the door', () => {
  const CHAMBER = read('app/qiyamah-chamber/QiyamahChamberClient.tsx');
  const CHAMBER_PAGE = read('app/qiyamah-chamber/page.tsx');

  it('the gate carries no price at all', () => {
    // FOUNDER'S RULING 2026-09-28: «لا اريد ان تكون صفحه الاشتراكات والباقات
    // (الميزان) فى بدايه دخول الزائر للمنصه». His earlier «نهاية رحلة الزائر»
    // was read as the end of the arrival ceremony; the ceremony is the
    // BEGINNING of the entry, and a stranger at a door is not met with a
    // price list.
    expect(ARRIVAL).not.toContain('className="arrival-value"');
    expect(ARRIVAL).not.toContain('arrival-value-price');
    expect(strip(GATE)).not.toContain('creatorFacingPackages()');
    // Removed and not hidden: no flag, no condition, no dormant markup.
    expect(strip(ARRIVAL)).not.toContain('packages');
    // The tombstone records why, so the absence is history and not an omission.
    expect(ARRIVAL).toContain('TOMBSTONE: THE CLOSING BEAT');
  });

  it('they appear at the request to produce, beside what that act costs', () => {
    expect(CHAMBER).toContain('className="chamber-packages"');
    // Beside the cost line, so the Creator reads the charge and the remedy in
    // one place rather than hunting for one of them.
    expect(CHAMBER.indexOf('<StepCostLine quote={cost} showBalance />'))
      .toBeLessThan(CHAMBER.indexOf('className="chamber-packages"'));
  });

  it('and they say plainly when the Balance will not cover the act', () => {
    expect(CHAMBER).toContain('رصيدك لا يكفي لهذا العمل');
  });

  it('the end of the platform is still reachable from there', () => {
    expect(CHAMBER).toContain('href="/sovereign-balance"');
  });

  it('the Chamber holds no price of its own — the server projects them', () => {
    expect(CHAMBER_PAGE).toContain('creatorFacingPackages()');
    expect(CHAMBER).not.toContain('sovereign-value-balance');
    expect(CHAMBER).not.toContain('qiyamah-cost-truth');
    for (const n of ['99', '249', '499', '1,375', '3,450', '6,900', '16,670']) {
      expect(strip(CHAMBER)).not.toContain(n);
    }
  });

  it('the gift is told where the packages now are, not at the door', () => {
    expect(GIFT_BALANCE.noticeAr).toContain('قد تمنح');
    expect(GIFT_BALANCE.isEntitlement).toBe(false);
    expect(GIFT_BALANCE.noticeAr).not.toMatch(/[0-9]/);
    expect(CLIENT).toContain('giftNoticeAr');
  });

  it('no surface calls الريادة’s composition a bonus, a gift or a discount', () => {
    for (const src of [ARRIVAL, CLIENT, GATE, CHAMBER].map(strip)) {
      for (const claim of ['مكافأة', 'هدية مع', 'bonus', 'وفّر', 'خصم خاص', 'بخصم', 'خصماً', 'مجاناً']) {
        expect(src).not.toContain(claim);
      }
    }
  });
});

describe('4 · the Balance surface tells the truth about what it can do', () => {
  it('a visitor may read it without a session', () => {
    // The Founder ruled the prices are not to appear only after logging in.
    expect(PAGE).toContain('authenticated={!!session}');
    expect(PAGE).not.toContain('redirect(');
  });

  it('it offers no button that cannot work', () => {
    expect(PAGE).toContain('getXPayGateway() !== null');
    expect(PAGE).toContain('BALANCE_PRICING_APPROVED && getXPayGateway() !== null');
    expect(CLIENT).toContain('purchaseAvailable && authenticated && identityVerified');
  });

  it('and when it cannot, it says which of the three reasons it is', () => {
    expect(CLIENT).toContain('ادخل بحسابك');
    expect(CLIENT).toContain('وثّق حسابك');
    expect(CLIENT).toContain('الشراء غير مُهيّأ على هذا الخادم بعد');
  });

  it('a refusal is reported in the server’s own words, not re-invented here', () => {
    expect(CLIENT).toContain('data.messageAr');
    expect(CLIENT).toContain('لم يُخصم شيء');
  });

  it('it states that the Balance does not expire, and what that does NOT mean', () => {
    // FOUNDER'S RULING 2026-09-28: «ألغِ الـ28 يوم». The notices used to
    // promise an ending in both halves; they promise no ending now — and the
    // half that did not change is held here so removing the expiry cannot
    // quietly soften it.
    expect(BALANCE_NOTICES_AR.standardValidity).toContain('رصيدك لا ينتهي');
    expect(BALANCE_NOTICES_AR.carryForward).toContain('لا يُردّ الرصيد نقداً');
    expect(BALANCE_NOTICES_AR.notASubscription).toContain('وليس هذا اشتراكاً');
    expect(BALANCE_NOTICES_AR.riyadaValidity).toContain('لا مدّة تنتهي');
    for (const notice of Object.values(BALANCE_NOTICES_AR)) {
      expect(notice).not.toContain('ثمانية وعشرون يوماً');
      expect(notice).not.toContain('ستّة أشهر');
    }
    // Every notice is RENDERED from the constant, never retyped on the page.
    for (const key of Object.keys(BALANCE_NOTICES_AR)) {
      expect(CLIENT).toContain(`notices.${key}`);
    }
  });

  it('the word «اشتراك» never reaches the Creator, in any of its forms', () => {
    // The Empire's own /subscribe vocabulary calls the Balance an اشتراك. It is
    // not one, and the policy says so. The word survives only in the comment
    // that explains why it is refused — hence the stripped view.
    const code = strip(CLIENT);
    expect(code).not.toContain('اشتراك');
    expect(code).not.toContain('اشترك');
    // …and the code really is still here, so this is not passing on nothing.
    expect(code).toContain('balance-packages');
  });

  it('the paywall a Creator meets after logging in now lands here', () => {
    const REGISTRY = read('src/button-engine/action-registry.ts');
    expect(REGISTRY).toContain("'subscribe-to-generate': { labelKey: 'action.subscribeToGenerate', href: '/sovereign-balance'");
    const AR = read('src/creator-language/dictionary/ar.ts');
    expect(AR).not.toContain("'action.subscribeToGenerate': 'اشترك للتوليد'");
    expect(AR).toContain("'action.subscribeToGenerate': 'زِد ميزانك للتوليد'");
  });
});
