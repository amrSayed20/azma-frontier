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
    expect(GATE).toContain('creatorFacingPackages()');
    expect(PAGE).toContain('creatorFacingPackages()');
    // The gate's page is a Server Component: it must not declare itself a
    // client one, or the import above ships the cost table after all.
    expect(strip(GATE)).not.toContain("'use client'");
    expect(strip(PAGE)).not.toContain("'use client'");
  });

  it('neither surface holds a price of its own', () => {
    // A price written twice is a price that will disagree with itself, and a
    // Creator would be held to whichever screen they happened to read.
    for (const src of [ARRIVAL, CLIENT]) {
      for (const n of ['99', '249', '499', '1200', '1,200', '1375', '3450', '6900', '16670', '16,670']) {
        expect(src).not.toContain(n);
      }
    }
  });
});

describe('3 · the packages are shown at the end of the visit, not after logging in', () => {
  it('the arrival receives them and renders them as its closing beat', () => {
    expect(ARRIVAL).toContain('readonly packages?: readonly ArrivalPackage[]');
    expect(ARRIVAL).toContain('className="arrival-value"');
    // Only once the ceremony has finished speaking.
    expect(ARRIVAL).toContain("phase !== 'entering'");
    // Below the threshold — the scene's one path forward stays first.
    expect(ARRIVAL.indexOf('className="arrival-threshold"'))
      .toBeLessThan(ARRIVAL.indexOf('className="arrival-value"'));
  });

  it('and it offers a visitor no purchase control, because a visitor has no account', () => {
    const at = ARRIVAL.indexOf('className="arrival-value"');
    const beat = ARRIVAL.slice(at, ARRIVAL.indexOf('className="arrival-language"'));
    expect(beat).not.toContain('<button');
    expect(beat).not.toContain('checkout');
  });

  it('the closing beat is styled, so it is not four unpainted rows', () => {
    const css = read('src/imperial-experience-engine/experiences/arrival/arrival.css');
    for (const cls of [
      '.arrival-value', '.arrival-value-packages', '.arrival-value-package',
      '.arrival-value-price', '.arrival-value-units', '.arrival-value-gift',
    ]) {
      expect(css).toContain(cls);
    }
  });

  it('the gift is told, as a discretion and never as an entitlement', () => {
    expect(GATE).toContain('GIFT_BALANCE');
    expect(ARRIVAL).toContain('giftNoticeAr');
    expect(CLIENT).toContain('giftNoticeAr');
    expect(GIFT_BALANCE.noticeAr).toContain('قد تمنح');
    expect(GIFT_BALANCE.noticeAr).toContain('تفضّلٌ لا استحقاق');
    expect(GIFT_BALANCE.isEntitlement).toBe(false);
    expect(GIFT_BALANCE.isPromised).toBe(false);
    // Never an amount, never a condition that reads like a rule.
    expect(GIFT_BALANCE.noticeAr).not.toMatch(/[0-9]/);
  });

  it('no surface calls الريادة’s composition a bonus, a gift or a discount', () => {
    // RIYADA_COMPOSITION.MAY_CLAIM_BONUS is false: 1,200 EGP buys exactly
    // 16,670 units at the ordinary reference rate, so the 2,778 the amendment
    // calls a «bonus» were bought, not given. The number stands; the word is
    // forbidden on any surface a Creator reads.
    //
    // «خصم» alone is NOT in this list, deliberately: «لم يُخصم شيء» — nothing
    // was deducted — shares its root and is the opposite of a claim. What is
    // forbidden is the CLAIM forms, so the guard names those instead of
    // banning a root and then being loosened later to let a true sentence
    // through.
    for (const src of [ARRIVAL, CLIENT, GATE].map(strip)) {
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

  it('it states the 28-day rule in BOTH halves, and الريادة’s exception', () => {
    expect(BALANCE_NOTICES_AR.standardValidity).toContain('ثمانية وعشرون يوماً');
    expect(BALANCE_NOTICES_AR.carryForward).toContain('لا يُردّ المتبقّي نقداً');
    expect(BALANCE_NOTICES_AR.carryForward).toContain('وإن لم تشترِ');
    expect(BALANCE_NOTICES_AR.notASubscription).toContain('وليس هذا اشتراكاً');
    expect(BALANCE_NOTICES_AR.riyadaValidity).toContain('ستّة أشهر');
    expect(BALANCE_NOTICES_AR.riyadaValidity).toContain('ثلث');
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
