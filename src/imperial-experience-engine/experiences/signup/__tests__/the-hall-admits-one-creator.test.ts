/**
 * «الإيوان» — THE HALL ADMITS ONE CREATOR, AND TOUCHES NOTHING ELSE.
 *
 * ═══ THE MISTAKE THIS FILE EXISTS TO PREVENT ════════════════════════════════
 *
 *   The Founder, 2026-11-23: «ابدأ بصفحة التسجيل، ولا تكرر خطأً سابقاً».
 *
 *   The previous mistake, exactly: `app/creator-access.css` is ONE stylesheet
 *   shared by SIX surfaces — /signup, /login, /subscribe, /subscribe/success,
 *   /founder and the not-found page. Redressing the signup page by editing
 *   that file would have redressed five others in the same commit, unseen and
 *   unmeasured, which is the same class of leak `body{overflow:hidden}` in
 *   the Vault's stylesheet once caused in the Qiyamah chamber.
 *
 *   So the hall carries its OWN stylesheet under its OWN exclusive prefix,
 *   and the shared one is left byte-identical for the five pages that still
 *   use it. Sections 1 and 2 assert both halves of that.
 *
 * ═══ AND THE DEFECTS NO AUTOMATED CHECK COULD EVER SEE ══════════════════════
 *
 *   Three of the repairs in this package were found by LOOKING at the page,
 *   not by running anything: two `<span>`s styled as though they were blocks,
 *   so a room's name and its role printed as one run-on word; and an
 *   `overflow: hidden` that silently clipped away the arch light written
 *   directly above it. Section 6 pins both so they cannot return.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

/** What RUNS, never the comments that explain it. */
const code = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const CSS = read('src/imperial-experience-engine/experiences/signup/signup-experience.css');
const CSS_CODE = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
const EXPERIENCE = read('src/imperial-experience-engine/experiences/signup/SignupExperience.tsx');
const EXPERIENCE_CODE = code(EXPERIENCE);
const FORM = read('app/signup/SignupForm.tsx');
const FORM_CODE = code(FORM);
const PAGE = read('app/signup/page.tsx');
const CLIENT = read('app/signup/SignupPageClient.tsx');
const SHARED = read('app/creator-access.css');
const AR = read('src/creator-language/dictionary/ar.ts');
const EN = read('src/creator-language/dictionary/en.ts');

import { LANDING_CHAMBERS, LANDING_PROOF_TOTAL } from '../../landing/landing-content';

/** Every stylesheet in the platform except this one. */
function allStylesheetsButMine(): string[] {
  const found: string[] = [];
  const mine = join('src', 'imperial-experience-engine', 'experiences', 'signup');
  const walk = (dir: string) => {
    for (const entry of readdirSync(join(ROOT, dir))) {
      if (entry === 'node_modules' || entry === '.next' || entry === '.git') continue;
      const rel = join(dir, entry);
      if (statSync(join(ROOT, rel)).isDirectory()) walk(rel);
      else if (entry.endsWith('.css') && !rel.startsWith(mine)) found.push(rel);
    }
  };
  walk('app');
  walk('src');
  return found;
}

/* ═══ 1 · NOTHING HERE CAN REACH ANOTHER ROOM ═══════════════════════════ */

describe('١ · لا سطرَ في هذا التنسيقِ يَصِل غرفةً أخرى', () => {
  it('every top-level selector is prefixed iwan-', () => {
    const selectors = CSS_CODE.match(/^\.[a-zA-Z][\w-]*/gm) ?? [];
    expect(selectors.length).toBeGreaterThan(35);
    for (const s of selectors) expect(s.startsWith('.iwan-')).toBe(true);
  });

  it('there is no element, universal or document selector at all', () => {
    for (const forbidden of [/^\s*\*\s*[,{]/m, /^\s*html\b/m, /^\s*body\b/m]) {
      expect(CSS_CODE).not.toMatch(forbidden);
    }
  });

  it('no custom property is declared on :root', () => {
    // app/layout.tsx loads 198 shared tokens onto every page in the platform.
    // Redefining one here would recolour every chamber.
    expect(CSS_CODE).not.toContain(':root');
    expect(CSS_CODE).toContain('.iwan-stage {');
  });

  it('the prefixes that belong to other surfaces appear nowhere', () => {
    // `gate-` is the Vault's, `gi-` the gateway's, `lp-` the landing's,
    // `creator-access-` the five shared access surfaces'.
    for (const taken of [/\.gate-/, /\.gi-/, /\.lp-/, /\.creator-access-/]) {
      expect(CSS_CODE).not.toMatch(taken);
    }
    expect(FORM_CODE).not.toMatch(/className="[^"]*\b(gate|gi|lp|creator-access)-/);
    expect(EXPERIENCE_CODE).not.toMatch(/className=["'`][^"'`]*\b(gate|gi|lp|creator-access)-/);
  });

  it('LivingCompanion’s own classes are written as descendants, never globally', () => {
    // This page HOSTS that component; it does not own it. Every other room
    // carries its own copy of these class names, and a bare `.companion-text`
    // rule here would be free to reach them.
    for (const owned of ['companion-text', 'companion-mode-btn', 'companion-voice-zone',
                         'companion-message-zone', 'companion-sigil', 'voice-listen-btn',
                         'voice-pulse', 'voice-listening-indicator', 'voice-permission-denied',
                         'companion-mode-cluster']) {
      const bare = new RegExp(`^\\s*\\.${owned}\\b`, 'm');
      expect(CSS_CODE).not.toMatch(bare);
      expect(CSS_CODE).toContain(`.iwan-voice .${owned}`);
    }
  });

  it('and not one of its class names is defined anywhere else in the platform', () => {
    // THE MEASUREMENT, not the assurance. Re-run on every commit.
    const mine = new Set((CSS_CODE.match(/^\.[a-zA-Z][\w-]*/gm) ?? []).map((s) => s.slice(1)));
    const others = new Set<string>();
    for (const file of allStylesheetsButMine()) {
      for (const s of read(file).match(/^\.[a-zA-Z][\w-]*/gm) ?? []) others.add(s.slice(1));
    }
    expect(others.size).toBeGreaterThan(1500); // the instrument saw the platform
    expect([...mine].filter((c) => others.has(c))).toEqual([]);
  });
});

/* ═══ 2 · THE FIVE SURFACES THAT KEPT THE SHARED STYLESHEET ═════════════ */

describe('٢ · الورقةُ المشتركةُ لم تُمَسّ، وخمسُ صفحاتٍ ما زالت عليها', () => {
  it('this route no longer imports it', () => {
    // On the CODE, not the file: the comment above the form explains at
    // length why the import was removed, and names the file to do so. An
    // instrument that reads a comment is an instrument that lies.
    for (const src of [FORM_CODE, code(PAGE), code(CLIENT)]) {
      expect(src).not.toMatch(/import\s+['"][^'"]*creator-access\.css['"]/);
    }
  });

  it('and the ones that do are still served by it, unchanged', () => {
    // Was five. /login took its own stylesheet («الدِّهليز», 2026-11-23), and
    // /subscribe + /subscribe/success were RETIRED by the Founder's Option A
    // ruling the same day — redirected to /sovereign-balance, the sole
    // purchase surface. Two surfaces still hold the shared sheet.
    const keeps = [
      'app/founder/page.tsx',
      'app/not-found.tsx',
    ];
    for (const f of keeps) expect(read(f)).toContain('creator-access.css');
    // The classes they render must still be DEFINED there — an edit that
    // emptied the file would pass the import check above and break all five.
    for (const cls of ['.creator-access-viewport', '.creator-access-card',
                       '.creator-access-submit', '.creator-access-error',
                       '.creator-access-footer', '.creator-access-field']) {
      expect(SHARED).toContain(cls);
    }
  });
});

/* ═══ 3 · ARABIC AND RTL ARE THE ORIGIN, NOT AN ADDITION ════════════════ */

describe('٣ · العربيّةُ وRTL هما الأصل', () => {
  it('direction is never hard-coded', () => {
    // The build this replaced pinned the voice with `left: 30px` and its
    // divider with `border-left` — both landed on the wrong side in Arabic.
    expect(CSS_CODE).not.toMatch(/^\s*(left|right)\s*:/m);
    expect(CSS_CODE).not.toMatch(/\b(margin|padding|border)-(left|right)\b/);
    expect(CSS_CODE).not.toMatch(/text-align:\s*(left|right)/);
  });

  it('and no [dir=rtl] block corrects a layout after the fact', () => {
    // One rule serves both tongues, or the rule is wrong.
    expect(CSS_CODE).not.toContain('[dir=');
  });

  it('no foreign text reaches the Creator from the markup', () => {
    // Everything a visitor reads comes from the dictionary. The only Latin
    // left standing is the house's own name and a trademark we may not
    // translate — both asserted by name so neither can quietly become a
    // whole English sentence.
    // Only fragments that contain an actual LETTER count — `=>` followed by
    // `(` in a .map() is not text a visitor reads.
    const rendered = [...FORM_CODE.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]!.trim())
      .filter((s) => /[A-Za-z؀-ۿ]/.test(s));
    expect(rendered.sort()).toEqual(['AZMA']);
  });

  it('every signup key exists in BOTH dictionaries', () => {
    const keys = (src: string) =>
      [...src.matchAll(/'(signup\.[a-zA-Z]+)':/g)].map((m) => m[1]!).sort();
    expect(keys(AR)).toEqual(keys(EN));
    expect(keys(AR).length).toBeGreaterThanOrEqual(24);
  });

  it('and every key the page reads is actually in them', () => {
    const used = [...FORM_CODE.matchAll(/t\(dict,\s*'(signup\.[a-zA-Z]+)'\)/g)].map((m) => m[1]!);
    const assured = [...FORM_CODE.matchAll(/'(signup\.assure[a-zA-Z]+)'/g)].map((m) => m[1]!);
    const voiced = [...EXPERIENCE_CODE.matchAll(/'(signup\.[a-zA-Z]+)'/g)].map((m) => m[1]!);
    const all = [...new Set([...used, ...assured, ...voiced])];
    expect(all.length).toBeGreaterThanOrEqual(12);
    for (const k of all) {
      expect(AR).toContain(`'${k}':`);
      expect(EN).toContain(`'${k}':`);
    }
  });
});

/* ═══ 4 · THE DOOR ITSELF IS UNCHANGED ══════════════════════════════════ */

describe('٤ · البابُ نفسُه لم يَتغيَّر — حزمةٌ بصريّةٌ لا تَمَسُّ هويّة', () => {
  it('it is still one anchor to the verification road, not a fetch', () => {
    expect(FORM_CODE).toContain('href="/api/auth/google/start"');
    expect(FORM_CODE).not.toMatch(/fetch\(\s*['"]\/api\/auth\/google\/start/);
    const at = FORM_CODE.indexOf('href="/api/auth/google/start"');
    expect(FORM_CODE.slice(Math.max(0, at - 220), at)).toContain('<a');
  });

  it('no field that could teach the wrong belief was put back', () => {
    // Typing an address is not what makes it yours. That is the whole reason
    // this page has no fields.
    expect(FORM_CODE).not.toMatch(/<input\b/);
    expect(FORM_CODE).not.toMatch(/<form\b/);
    expect(FORM_CODE).not.toContain('/api/auth/signup');
  });

  it('all six refusal codes are still answered in the Creator’s own tongue', () => {
    for (const reason of ['unavailable', 'cancelled', 'verification-failed',
                          'invalid-callback', 'email-not-verified',
                          'email-belongs-to-existing-account']) {
      expect(FORM_CODE).toContain(`'${reason}'`.replace(/^'(\w+)'$/, "$1"));
    }
    expect(FORM_CODE).toContain("params?.get('identity')");
    // And the provider's own words — an issuer, an audience, a token — never
    // cross to the browser. Only a code does.
    expect(FORM_CODE).not.toMatch(/\b(id_token|aud|iss|client_secret)\b/);
  });

  it('the deployment gate can still find the thing it presses', () => {
    /**
     * GUARDS DO NOT TRAVEL — and this one failed to, twice.
     *
     *   `scripts/verify-deployment.mjs` proves React hydrated by finding a
     *   live onClick on an element an anonymous visitor can press, and it
     *   falls back to `document.body` when it cannot find one. document.body
     *   always has a fiber and never has a handler, so the fallback does not
     *   report "I could not find the door" — it reports "the page is inert",
     *   and the deploy script rolls a correct release back.
     *
     *   It happened to `.ras-intent-card` when chambers started sending
     *   strangers to the door, and again to `.creator-access-google` when
     *   this package renamed the door. MEASURED on the rejected build: the
     *   door carried fiber=true, onClick=true, and pressing it really changed
     *   the label.
     *
     *   The probe now asks for the MECHANISM, not the class name — and this
     *   asserts the two still agree, so a future redress cannot blind it.
     */
    const VERIFIER = read('scripts/verify-deployment.mjs');
    const probe = code(VERIFIER);
    const selector = 'a[href="/api/auth/google/start"]';
    expect(probe).toContain(`document.querySelector('${selector}')`);
    // And the page really renders that anchor, so the probe has a subject.
    expect(FORM_CODE).toContain('href="/api/auth/google/start"');
    // The old class name must not be what the gate looks for any more.
    expect(probe).not.toContain('creator-access-google');
  });

  it('the engines this page hosts are still wired, none retired', () => {
    for (const engine of ['useExperienceLifecycle', 'useVisitorPresence',
                          'applyVariation', 'LivingCompanion', 'beginHandoff']) {
      expect(EXPERIENCE_CODE).toContain(engine);
    }
    expect(EXPERIENCE_CODE).toContain("beginHandoff('/imperial-foyer')");
  });
});

/* ═══ 5 · WHAT THE PAGE SAYS IS TRUE, AND READ NOT TYPED ════════════════ */

describe('٥ · ما تَقوله الصفحةُ مقروءٌ من سُلطتِه، لا مكتوبٌ بيد', () => {
  it('the rooms are read from the one table that names them', () => {
    expect(FORM_CODE).toContain('LANDING_CHAMBERS');
    expect(LANDING_CHAMBERS.length).toBe(5);
    // Not one of those names is typed into this page.
    for (const room of LANDING_CHAMBERS) {
      expect(FORM_CODE).not.toContain(room.nameAr);
      expect(FORM_CODE).not.toContain(room.nameEn);
    }
  });

  it('and the library figure is read from the same authority the landing reads', () => {
    expect(FORM_CODE).toContain('LANDING_PROOF_TOTAL');
    expect(FORM_CODE).not.toContain(LANDING_PROOF_TOTAL.figureAr);
    expect(FORM_CODE).not.toContain(LANDING_PROOF_TOTAL.figureEn);
  });

  it('nothing on this surface touches scripture or narration', () => {
    // The Founder's standing ruling. Only well-known sources are named, and
    // this page names no source at all beyond the library count.
    const surface = FORM + CSS + EXPERIENCE + '\n'
      + AR.slice(AR.indexOf("'signup."), AR.indexOf("'login.kicker'"))
      + EN.slice(EN.indexOf("'signup."), EN.indexOf("'login.kicker'"));
    for (const forbidden of ['القرآن', 'قرآن', 'حديث', 'أحاديث', 'السنة', 'البخاري',
                             'مسلم', 'الترمذي', 'النسائي', 'ابن ماجه', 'أبي داود',
                             'موطأ', 'النووية', 'القدسية', 'آية', 'سورة',
                             'Qur', 'hadith', 'narration', 'scripture']) {
      expect(surface).not.toContain(forbidden);
    }
  });

  it('and no word about how far along the building is', () => {
    const surface = FORM + EXPERIENCE + '\n'
      + AR.slice(AR.indexOf("'signup."), AR.indexOf("'login.kicker'"))
      + EN.slice(EN.indexOf("'signup."), EN.indexOf("'login.kicker'"));
    for (const staged of ['قريبا', 'قريباً', 'لم تُبنَ', 'لم يُبنَ', 'قيد التطوير',
                          'جزئيا', 'جزئياً', 'coming soon', 'not yet built',
                          'in progress', 'beta']) {
      expect(surface).not.toContain(staged);
    }
  });

  it('no price is typed on a page that sells nothing', () => {
    // SOVEREIGN_PACKAGES is the only authority for a figure, and this page
    // does not read it, so it must not print one either.
    expect(FORM_CODE).not.toMatch(/\d+\s*(جنيه|EGP)/);
    expect(FORM_CODE).not.toContain('SOVEREIGN_PACKAGES');
  });
});

/* ═══ 6 · THE THREE DEFECTS ONLY AN EYE FOUND ═══════════════════════════ */

describe('٦ · ثلاثةُ عيوبٍ لم يَرَها إلّا النظر', () => {
  it('a name and its role are two blocks, not one run-on word', () => {
    // MEASURED by looking: «البحث والمصادرحيثُ تَبدأ المعرفة». Both are
    // <span>, and a <span> ignores the margin that was meant to separate them.
    for (const cls of ['.iwan-room-name', '.iwan-room-role',
                       '.iwan-assure-title', '.iwan-assure-body']) {
      const at = CSS_CODE.indexOf(cls + ' {');
      expect(at).toBeGreaterThan(-1);
      expect(CSS_CODE.slice(at, CSS_CODE.indexOf('}', at))).toContain('display: block');
    }
  });

  it('nothing clips the arch light written directly above it', () => {
    // `overflow: hidden` on the panel silently erased its own `::after`.
    for (const cls of ['.iwan-door {', '.iwan-beyond {']) {
      const at = CSS_CODE.indexOf(cls);
      expect(at).toBeGreaterThan(-1);
      expect(CSS_CODE.slice(at, CSS_CODE.indexOf('}', at))).not.toContain('overflow: hidden');
    }
    // And with the clip gone the gloss must inherit the radius, or the glass
    // grows square corners outside the arch.
    expect(CSS_CODE).toMatch(/\.iwan-door::before\s*\{[^}]*border-radius:\s*inherit/);
    expect(CSS_CODE).toMatch(/\.iwan-beyond::before\s*\{[^}]*border-radius:\s*inherit/);
  });

  it('every control on this page paints its own surface', () => {
    // A control with geometry and no background renders BROWSER GREY, and
    // neither tsc nor a test nor a token sweep can see it. Three were caught
    // that way on 2026-11-21.
    for (const control of ['.iwan-go {', '.iwan-voice .companion-mode-btn {',
                           '.iwan-voice .voice-listen-btn {']) {
      const at = CSS_CODE.indexOf(control);
      expect(at).toBeGreaterThan(-1);
      const block = CSS_CODE.slice(at, CSS_CODE.indexOf('}', at));
      expect(block).toMatch(/background/);
      expect(block).toMatch(/color:/);
      expect(block).toContain('font-family: inherit');
    }
  });
});

/* ═══ 7 · DEPTH AND GLOSS, AS THE FOUNDER ORDERED THEM ══════════════════ */

describe('٧ · العمقُ واللمعان — أمرُ المؤسِّس 2026-11-23', () => {
  it('metal is seven stops, because one hex reads as yellow', () => {
    const metal = (CSS_CODE.match(/--iwan-metal:[\s\S]*?;/) ?? [''])[0];
    expect((metal.match(/#[0-9a-f]{6}|var\(/gi) ?? []).length).toBeGreaterThanOrEqual(7);
  });

  it('and it is filled twice on this screen, not more', () => {
    // Abundance cheapens metal. The house's mark, and the one act.
    expect((CSS_CODE.match(/background:\s*var\(--iwan-metal\)/g) ?? []).length).toBe(2);
  });

  it('every raised surface carries an ambient shadow, a rim of light and a bounce', () => {
    const lift = (CSS_CODE.match(/--iwan-lift:[\s\S]*?;/) ?? [''])[0];
    expect((lift.match(/rgba?\(/g) ?? []).length).toBeGreaterThanOrEqual(4);
    expect(lift).toContain('inset 0 1px 0');          // the rim where light lands
    expect(lift).toMatch(/inset 0 -\d+px/);           // light returning off the floor
  });

  it('the gloss is a band crossing a saturated surface, not a white wash', () => {
    expect(CSS_CODE).toMatch(/--iwan-gloss:[\s\S]*?linear-gradient\(116deg/);
    // saturate() behind the glass is what makes the colour BEHIND it bloom.
    expect(CSS_CODE).toMatch(/backdrop-filter:\s*blur\([^)]*\)\s*saturate\(/);
  });

  it('the value range is wide — depth is the distance between dark and light', () => {
    expect(CSS_CODE).toContain('--iwan-floor: #02030a');
    expect(CSS_CODE).toContain('--iwan-light:    #fff6de');
  });
});

/* ═══ 8 · A PHONE, AND A VISITOR WHO ASKED FOR STILLNESS ════════════════ */

describe('٨ · هاتفٌ، وزائرٌ طَلَب السكون', () => {
  it('nothing is allowed to push the page sideways', () => {
    expect(CSS_CODE).toContain('overflow-x: hidden');
    expect((CSS_CODE.match(/minmax\(0,\s*1fr\)/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });

  it('the hall leaves room beneath it for the voice that floats there', () => {
    // A rule outlives its layout: the fixed voice bar once covered the
    // «تسجيل الدخول» link on a phone. The hall now carries clearance.
    const phone = CSS_CODE.slice(CSS_CODE.indexOf('@media (max-width: 560px)'));
    expect(phone).toMatch(/padding-block-end:\s*1[0-9]{2}px/);
    expect(phone).toContain('inset-inline: 14px');
  });

  it('and the long Arabic message wraps instead of running out of its bar', () => {
    expect(CSS_CODE).not.toContain('white-space: nowrap');
    expect(CSS_CODE).toMatch(/\.iwan-voice \.companion-text\s*\{[^}]*white-space:\s*normal/);
  });

  it('a visitor who asked for stillness is given it', () => {
    expect((CSS_CODE.match(/prefers-reduced-motion/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(CSS_CODE).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]{0,200}opacity:\s*1/);
  });
});

/* ═══ 9 · THE FACE THIS ROUTE SETS, AND ONLY THIS ROUTE ═════════════════ */

describe('٩ · خطٌّ لهذا الطريقِ وحدَه', () => {
  it('the face is declared on the route, never in the shared layout', () => {
    expect(PAGE).toContain('next/font/google');
    expect(PAGE).toContain("variable: '--iwan-font'");
    expect(PAGE).toContain('subsets');
    expect(read('app/layout.tsx')).not.toContain('--iwan-font');
  });

  it('and it is handed down, not assumed', () => {
    expect(PAGE).toContain('fontClass={hallFont.variable}');
    expect(CLIENT).toContain('fontClass={fontClass}');
    expect(EXPERIENCE_CODE).toContain('`iwan-stage ${fontClass}`');
  });

  it('the stage falls back to the platform’s own face, never the browser’s', () => {
    // A surface with geometry and no declared font rendered Times New Roman
    // on ten surfaces of this platform. Measured, 2026-11-22.
    const at = CSS_CODE.indexOf('font-family: var(--iwan-font)');
    expect(at).toBeGreaterThan(-1);
    const line = CSS_CODE.slice(at, CSS_CODE.indexOf(';', at));
    expect(line).toContain('--font-arabic');
    expect(line).toContain('--font-latin');
  });
});
