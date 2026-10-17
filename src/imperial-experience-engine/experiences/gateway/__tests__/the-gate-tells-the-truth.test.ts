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

describe('7 · the photograph is inside the artifact, not beside it', () => {
  /**
   * MEASURED on the first production deploy: the gate's own door answered 404.
   *
   * The release artifact is `tar … .next package.json package-lock.json`.
   * `public/` is not in it — Next serves that directory from the filesystem at
   * runtime, so a file placed there exists on a laptop and nowhere else.
   * `src/policies/index.ts` records the Empire paying for exactly this once
   * already, with `docs/`.
   */
  it('the gate does not fetch its door from a directory that never ships', () => {
    expect(CLIENT).not.toContain('/gateway/sovereign-gate.jpg');
    expect(CLIENT).not.toMatch(/src="\/[^"]+\.(jpg|jpeg|png|webp|avif)"/);
  });

  it('it is imported, so the build carries it', () => {
    expect(CLIENT).toContain("from './sovereign-gate.jpg'");
    expect(CLIENT).toContain('src={gatePhotograph.src}');
  });

  it('and the file is where the import says it is', () => {
    const img = join(process.cwd(), 'src/imperial-experience-engine/experiences/gateway/sovereign-gate.jpg');
    expect(readFileSync(img).byteLength).toBeGreaterThan(50_000);
  });
});

describe('8 · the gate opens, at any size and any zoom', () => {
  /**
   * MEASURED on the live release: «دخول» could not be pressed at 1280×800 or
   * 1600×1000, and the control cluster sat below the fold at every zoom level
   * from 100% to 200%. Two separate causes, both of which made the whole
   * introduction unreachable — because the introduction lives BELOW the scene,
   * and a visitor who cannot cross never gets to any of it.
   */

  it('the controls are never made inert or invisible by a phase', () => {
    // They were gated until the approach finished. The phase is React's, so
    // before hydration there was no way to end it and no way through the gate.
    const block = CSS.split('.gate-controls {')[1]!.split('}')[0]!;
    expect(block).toContain('pointer-events: auto');
    expect(block).not.toMatch(/opacity:\s*0\s*;/);
    expect(block).not.toContain('translateY');
    expect(CSS).not.toMatch(/\[data-phase="arrived"\]\s*\.gate-controls/);
  });

  it('the photograph cannot take a press meant for a control', () => {
    const frame = CSS.split('.gate-frame {')[1]!.split('}')[0]!;
    expect(frame).toContain('pointer-events: none');
  });

  it('and the page does not inherit the browser margin that hid the handle', () => {
    // 8px of default body margin pushed the scene to y=8..1088 in a 1080px
    // viewport, putting the bottom of «دخول» below the fold at every zoom.
    expect(CSS).toContain('body:has(.gateway)');
    expect(CSS).toMatch(/body:has\(\.gateway\)\s*\{\s*margin:\s*0/);
  });

  it('the scene is sized to the viewport, not to a fixed number of pixels', () => {
    const scene = CSS.split('.gate-scene {')[1]!.split('}')[0]!;
    expect(scene).toContain('100svh');
    // And nothing clips the page itself — the introduction is below the scene.
    expect(scene).not.toMatch(/position:\s*fixed/);
  });
});

describe('9 · the chosen tongue reaches everything the journey shows', () => {
  /**
   * MEASURED on the live release: choosing English turned the gateway, the
   * login, the signup and the subscribe surfaces into English — and left the
   * policy index in Arabic, because its labels were written into the page
   * instead of read from the dictionary.
   *
   * The policy BODIES are a different matter entirely, and not a bug: all
   * three ratified instruments are Arabic-only. There is no English legal
   * text in this Empire, and one must never be invented to fill a layout.
   */
  const POLICY_INDEX = read('app/policies/page.tsx');

  it('the policy index reads its labels rather than carrying them', () => {
    expect(POLICY_INDEX).toContain('resolveRequestLocale');
    expect(POLICY_INDEX).toContain("t(dict, 'policies.indexTitle')");
    expect(POLICY_INDEX).toContain("t(dict, 'policies.backToGate')");
    // Not one Arabic string left standing in the page's own furniture.
    const jsx = POLICY_INDEX.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(jsx).not.toMatch(/>[^<>{]*[؀-ۿ][^<>{]*</);
  });

  it('a reader is told when the text they opened is not in their tongue', () => {
    expect(CLIENT).toContain('locale !== openPolicy.language');
    expect(CLIENT).toContain("t(dict, 'policies.arabicIsGoverning')");
    expect(POLICY_INDEX).toContain("p.language === 'ar'");
  });

  it('and the notice exists in both tongues, saying no translation is ratified', () => {
    const say = (src: string) =>
      (src.match(/'policies\.arabicIsGoverning': '([^']*)'/) ?? [])[1] ?? '';
    expect(say(AR)).toContain('الحاكم');
    expect(say(EN).toLowerCase()).toContain('governs');
    // It must NOT promise a translation is coming — nobody has ratified one.
    expect(say(EN).toLowerCase()).toContain('no ratified english version');
  });

  it('every policy label exists in both dictionaries', () => {
    const keys = (src: string) =>
      [...src.matchAll(/'(policies\.[a-zA-Z]+)':/g)].map((m) => m[1]!).sort();
    expect(keys(AR)).toEqual(keys(EN));
    expect(keys(AR).length).toBeGreaterThanOrEqual(6);
  });

  it('the document page follows the DOCUMENT’s tongue, which is correct', () => {
    // Not a bug: Arabic chrome around an Arabic instrument is honest. English
    // chrome around it would imply an English version exists.
    const doc = read('app/policies/[slug]/page.tsx');
    expect(doc).toContain("policy.language === 'ar'");
    expect(doc).toContain('lang={policy.language}');
  });
});
