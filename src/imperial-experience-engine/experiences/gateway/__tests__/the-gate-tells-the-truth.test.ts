/**
 * AZMA OS — WHAT THE GATEWAY MAY AND MAY NOT SAY · 2026-10-14
 *
 * The gateway is the first thing a stranger reads, which makes it the first
 * place the Empire's own truthfulness law is tested. These bind the rules that
 * a redesign could quietly undo — not the look of the page, which is the
 * Architect's to judge, but the claims it is allowed to make.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { GATEWAY_CHAMBERS } from '../chambers';
import { SOVEREIGN_PACKAGES } from '@/src/economy/pricing/sovereign-value-balance';
import { PUBLISHED_POLICIES } from '@/src/policies';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const PAGE = read('app/page.tsx');
const CLIENT = read('src/imperial-experience-engine/experiences/gateway/SovereignGateway.tsx');
const CSS = read('src/imperial-experience-engine/experiences/gateway/gateway.css');
const AR = read('src/creator-language/dictionary/ar.ts');
const EN = read('src/creator-language/dictionary/en.ts');

describe('1 · the five chambers, in the ruled order, each carrying its own state', () => {
  it('all five are present, in the visitor order the Architect ruled', () => {
    expect(GATEWAY_CHAMBERS.map((c) => c.id))
      .toEqual(['hujjah', 'qiyamah', 'ras-amr', 'vault', 'makman']);
  });

  it('a chamber that is not fully ready carries its limit ON ITS OWN CARD', () => {
    // A qualification under five cards is a qualification nobody reads.
    for (const c of GATEWAY_CHAMBERS) {
      if (c.state !== 'ready') {
        expect(typeof c.limitAr).toBe('string');
        expect((c.limitAr ?? '').length).toBeGreaterThan(20);
        expect((c.limitEn ?? '').length).toBeGreaterThan(20);
      }
    }
  });

  it('the chamber whose destinations are shut is not described as open', () => {
    const makman = GATEWAY_CHAMBERS.find((c) => c.id === 'makman')!;
    expect(makman.state).toBe('closed');
    expect(makman.limitAr).toContain('ولا وجهةَ مفتوحةٌ اليوم');
  });

  it('and no card promises the Vault any security it has not been shown to have', () => {
    // No encryption claim, no «cannot recover your password», no access
    // guarantee — none of those has been verified, and an unverified security
    // promise is worse than saying nothing.
    const everything = GATEWAY_CHAMBERS.map((c) =>
      [c.bodyAr, c.bodyEn, c.limitAr, c.limitEn, c.roleAr, c.roleEn].join(' ')).join(' ');
    for (const forbidden of ['مشفّر', 'تشفير', 'encrypt', 'لا يُمكن استرداد', 'cannot recover']) {
      expect(everything).not.toContain(forbidden);
    }
  });
});

describe('2 · prices and policies come from their authorities, never restated', () => {
  it('the page reads the approved package table rather than typing figures', () => {
    expect(PAGE).toContain('SOVEREIGN_PACKAGES');
    for (const p of SOVEREIGN_PACKAGES) {
      // The figure must not appear as a literal anywhere in the gateway.
      expect(CLIENT).not.toContain(String(p.priceEgp));
      expect(CLIENT).not.toContain(String(p.balanceUnits));
    }
  });

  it('only policies that are genuinely published can be offered', () => {
    expect(PAGE).toContain('PUBLISHED_POLICIES');
    // Three today. The other five live in docs/ and are listed as not
    // publishable — a card for one of them would open onto a wall.
    expect(PUBLISHED_POLICIES.length).toBe(3);
  });

  it('and a policy is shown whole, not summarised on its way to the reader', () => {
    expect(CLIENT).toContain('{openPolicy.body}');
  });
});

describe('3 · the balance is told as what it is — a purchase, not a subscription', () => {
  it('nothing in either tongue calls it a subscription or a renewal', () => {
    const say = (src: string, key: string) =>
      (src.match(new RegExp(`'${key}': '([^']*)'`)) ?? [])[1] ?? '';
    for (const key of ['gateway.balanceLede', 'gateway.balanceOneTime', 'gateway.balanceNoExpiry']) {
      expect(say(AR, key).length).toBeGreaterThan(0);
      expect(say(EN, key).length).toBeGreaterThan(0);
    }
    expect(say(AR, 'gateway.balanceOneTime')).toContain('بلا تجديد');
    expect(say(EN, 'gateway.balanceOneTime').toLowerCase()).toContain('no automatic renewal');
    expect(say(AR, 'gateway.balanceLede')).not.toContain('اشتراك');
    expect(say(EN, 'gateway.balanceLede').toLowerCase()).not.toContain('subscri');
  });

  it('and the name shown is the one the code already uses', () => {
    const name = (AR.match(/'gateway\.balanceTitle': '([^']*)'/) ?? [])[1];
    expect(name).toBe('ميزان القيمة السيادي');
  });
});

describe('4 · both tongues carry every label', () => {
  it('no gateway label exists in one language and not the other', () => {
    const keys = (src: string) =>
      [...src.matchAll(/'(gateway\.[a-zA-Z]+)':/g)].map((m) => m[1]!).sort();
    expect(keys(AR)).toEqual(keys(EN));
    expect(keys(AR).length).toBeGreaterThan(15);
  });

  it('and the entry label is not an Arabic string hard-coded into the scene', () => {
    expect(CLIENT).toContain("t(dict, 'gateway.enter')");
    expect(CLIENT).not.toContain('>دخول<');
  });
});

describe('5 · nobody is held inside a moving picture', () => {
  it('the approach can be ended by a press, a wheel or a key', () => {
    expect(CLIENT).toContain("addEventListener('pointerdown'");
    expect(CLIENT).toContain("addEventListener('wheel'");
    expect(CLIENT).toContain("addEventListener('keydown'");
  });

  it('a visitor who asked for stillness is given it', () => {
    expect(CSS).toContain('@media (prefers-reduced-motion: reduce)');
    const block = CSS.split('@media (prefers-reduced-motion: reduce)')[1]!.slice(0, 600);
    expect(block).toContain('animation: none');
  });

  it('the approach is capped, because the photograph has only so many pixels', () => {
    // 1021×1080 is the whole budget. Past the cap the carving turns to mush.
    expect(CSS).toContain('--gate-zoom-max');
    const cap = Number((CSS.match(/--gate-zoom-max:\s*([\d.]+)/) ?? [])[1]);
    expect(cap).toBeGreaterThan(1);
    expect(cap).toBeLessThanOrEqual(2);
  });
});

describe('6 · the gateway hands over to the authentication that already exists', () => {
  it('it links to the existing routes and hosts no form of its own', () => {
    expect(CLIENT).toContain('href="/login"');
    expect(CLIENT).toContain('href="/signup"');
    expect(CLIENT).not.toContain('type="password"');
    expect(CLIENT).not.toContain('/api/auth/');
  });

  it('and the Director is not asked to do anything it does not already do', () => {
    // The scene owns its motion; DirectorStage stays the observer it is. What
    // must be absent is a CALL into it or an import of it — not the word,
    // which the file header uses to record why the camera lives here instead.
    const code = CLIENT.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toContain('DirectorStage');
    expect(code).not.toContain('sovereign-identity');
    expect(code).not.toMatch(/beginTransition|transitionArrive|beginJourney/);
    // The motion it owns instead: one transform, around a measured origin.
    expect(CSS).toContain('transform-origin');
  });
});
