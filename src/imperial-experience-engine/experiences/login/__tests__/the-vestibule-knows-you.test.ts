/**
 * «الدِّهليز» — THE VESTIBULE KNOWS YOU, AND TOUCHES NOTHING ELSE.
 *
 * ═══ WHAT THIS FILE GUARDS ══════════════════════════════════════════════════
 *
 *   The Founder's directive for the remaining five surfaces, §4: «Do not
 *   change authentication architecture or authorization rules.» A visual
 *   package on a SIGN-IN page is the one place where that is easiest to
 *   break by accident, so section 4 below asserts every moving part of the
 *   authentication path BY NAME, and section 1 asserts that nothing in this
 *   stylesheet can reach another surface.
 *
 *   `app/creator-access.css` is still shared by /subscribe,
 *   /subscribe/success, /founder and the not-found page. It is left
 *   byte-identical; this route simply stopped importing it.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

/** What RUNS, never the comments that explain it. */
const code = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const CSS = read('src/imperial-experience-engine/experiences/login/login-experience.css');
const CSS_CODE = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
const EXPERIENCE = read('src/imperial-experience-engine/experiences/login/LoginExperience.tsx');
const EXPERIENCE_CODE = code(EXPERIENCE);
const FORM = read('app/login/LoginForm.tsx');
const FORM_CODE = code(FORM);
const PAGE = read('app/login/page.tsx');
const CLIENT = read('app/login/LoginPageClient.tsx');
const SHARED = read('app/creator-access.css');
const AR = read('src/creator-language/dictionary/ar.ts');
const EN = read('src/creator-language/dictionary/en.ts');

/** Every stylesheet in the platform except this one. */
function allStylesheetsButMine(): string[] {
  const found: string[] = [];
  const mine = join('src', 'imperial-experience-engine', 'experiences', 'login');
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

/* ═══ 1 · NOTHING HERE CAN REACH ANOTHER SURFACE ════════════════════════ */

describe('١ · لا سطرَ في هذا التنسيقِ يَصِل سطحًا آخر', () => {
  it('every top-level selector is prefixed dihliz-', () => {
    const selectors = CSS_CODE.match(/^\.[a-zA-Z][\w-]*/gm) ?? [];
    expect(selectors.length).toBeGreaterThan(30);
    for (const s of selectors) expect(s.startsWith('.dihliz-')).toBe(true);
  });

  it('there is no element, universal or document selector at all', () => {
    for (const forbidden of [/^\s*\*\s*[,{]/m, /^\s*html\b/m, /^\s*body\b/m]) {
      expect(CSS_CODE).not.toMatch(forbidden);
    }
  });

  it('no custom property is declared on :root', () => {
    expect(CSS_CODE).not.toContain(':root');
    expect(CSS_CODE).toContain('.dihliz-stage {');
  });

  it('the prefixes that belong to other surfaces appear nowhere', () => {
    for (const taken of [/\.gate-/, /\.gi-/, /\.lp-/, /\.iwan-/, /\.creator-access-/]) {
      expect(CSS_CODE).not.toMatch(taken);
    }
    expect(FORM_CODE).not.toMatch(/className="[^"]*\b(gate|gi|lp|iwan|creator-access)-/);
    expect(EXPERIENCE_CODE).not.toMatch(/className=["'`][^"'`]*\b(gate|gi|lp|iwan|creator-access)-/);
  });

  it('LivingCompanion’s own classes are written as descendants, never globally', () => {
    for (const owned of ['companion-text', 'companion-mode-btn', 'companion-voice-zone',
                         'companion-message-zone', 'companion-sigil', 'voice-listen-btn',
                         'voice-pulse', 'voice-listening-indicator', 'voice-permission-denied',
                         'companion-mode-cluster']) {
      expect(CSS_CODE).not.toMatch(new RegExp(`^\\s*\\.${owned}\\b`, 'm'));
      expect(CSS_CODE).toContain(`.dihliz-voice .${owned}`);
    }
  });

  it('and not one of its class names is defined anywhere else in the platform', () => {
    const mine = new Set((CSS_CODE.match(/^\.[a-zA-Z][\w-]*/gm) ?? []).map((s) => s.slice(1)));
    const others = new Set<string>();
    for (const file of allStylesheetsButMine()) {
      for (const s of read(file).match(/^\.[a-zA-Z][\w-]*/gm) ?? []) others.add(s.slice(1));
    }
    expect(others.size).toBeGreaterThan(1500); // the instrument saw the platform
    expect([...mine].filter((c) => others.has(c))).toEqual([]);
  });
});

/* ═══ 2 · THE SURFACES THAT KEPT THE SHARED STYLESHEET ══════════════════ */

describe('٢ · الورقةُ المشتركةُ لم تُمَسّ، وأربعُ صفحاتٍ ما زالت عليها', () => {
  it('this route no longer imports it', () => {
    for (const src of [FORM_CODE, code(PAGE), code(CLIENT)]) {
      expect(src).not.toMatch(/import\s+['"][^'"]*creator-access\.css['"]/);
    }
  });

  it('and the ones that do are still served by it, unchanged', () => {
    // Was four. /subscribe and /subscribe/success were RETIRED on 2026-11-23
    // by the Founder's Option A ruling — redirected to /sovereign-balance,
    // the sole purchase surface. Two remain on the shared sheet.
    for (const f of ['app/founder/page.tsx', 'app/not-found.tsx']) {
      expect(read(f)).toContain('creator-access.css');
    }
    for (const cls of ['.creator-access-viewport', '.creator-access-card',
                       '.creator-access-submit', '.creator-access-error',
                       '.creator-access-footer', '.creator-access-field']) {
      expect(SHARED).toContain(cls);
    }
  });

  it('and «الإيوان», already live, is not touched by this package', () => {
    // §5 of the directive: the previously deployed surface must remain
    // unchanged. Its stylesheet and its form carry no dihliz- rule.
    const IWAN = read('src/imperial-experience-engine/experiences/signup/signup-experience.css');
    expect(IWAN).not.toContain('dihliz-');
    expect(read('app/signup/SignupForm.tsx')).not.toContain('dihliz-');
  });
});

/* ═══ 3 · ARABIC AND RTL ARE THE ORIGIN, NOT AN ADDITION ════════════════ */

describe('٣ · العربيّةُ وRTL هما الأصل', () => {
  it('direction is never hard-coded', () => {
    expect(CSS_CODE).not.toMatch(/^\s*(left|right)\s*:/m);
    expect(CSS_CODE).not.toMatch(/\b(margin|padding|border)-(left|right)\b/);
    expect(CSS_CODE).not.toMatch(/text-align:\s*(left|right)/);
  });

  it('and no [dir=rtl] block corrects a layout after the fact', () => {
    expect(CSS_CODE).not.toContain('[dir=');
  });

  it('no foreign text reaches the Creator from the markup', () => {
    // Everything read on this page comes from the dictionary. The only Latin
    // left standing is the house's own name.
    const rendered = [...FORM_CODE.matchAll(/>([^<>{}]+)</g)].map((m) => m[1]!.trim())
      .filter((s) => /[A-Za-z؀-ۿ]/.test(s));
    expect(rendered.sort()).toEqual(['AZMA']);
  });

  it('every login key exists in BOTH dictionaries', () => {
    const keys = (src: string) =>
      [...src.matchAll(/'(login\.[a-zA-Z]+)':/g)].map((m) => m[1]!).sort();
    expect(keys(AR)).toEqual(keys(EN));
    expect(keys(AR).length).toBeGreaterThanOrEqual(17);
  });

  it('and every key the page reads is actually in them', () => {
    const used = [...FORM_CODE.matchAll(/t\(dict,\s*'(login\.[a-zA-Z]+)'\)/g)].map((m) => m[1]!);
    const voiced = [...EXPERIENCE_CODE.matchAll(/'(login\.[a-zA-Z]+)'/g)].map((m) => m[1]!);
    const all = [...new Set([...used, ...voiced])];
    expect(all.length).toBeGreaterThanOrEqual(12);
    for (const k of all) {
      expect(AR).toContain(`'${k}':`);
      expect(EN).toContain(`'${k}':`);
    }
  });

  it('the page no longer calls the platform by a name that is not its own', () => {
    // «أهلاً بعودتك إلى عظمة» named something this platform is not called.
    const ar = (AR.match(/'login\.subtitle':\s*'([^']*)'/) ?? [])[1] ?? '';
    expect(ar).not.toContain('عظمة');
    expect(ar.length).toBeGreaterThan(10);
  });
});

/* ═══ 4 · AUTHENTICATION IS UNTOUCHED — ASSERTED PART BY PART ═══════════ */

describe('٤ · المصادقةُ لم تُمَسّ — كلُّ جزءٍ منها باسمِه', () => {
  it('the same request, to the same route, with the same payload', () => {
    expect(FORM_CODE).toContain("fetch('/api/auth/login'");
    expect(FORM_CODE).toContain("method: 'POST'");
    expect(FORM_CODE).toContain("'Content-Type': 'application/json'");
    expect(FORM_CODE).toContain('JSON.stringify({ email, password })');
  });

  it('the same success test, and no new one', () => {
    expect(FORM_CODE).toContain("result.status !== 'succeeded'");
    // No client-side decision about WHO may enter was invented here.
    expect(FORM_CODE).not.toMatch(/localStorage|sessionStorage|document\.cookie/);
  });

  it('the role→destination decision is unchanged, and still the server’s role', () => {
    expect(FORM_CODE).toContain("result.role === 'founder' ? '/sovereign-high-council' : '/imperial-foyer'");
  });

  it('the refusal still names both roads without naming which one is yours', () => {
    expect(FORM_CODE).toContain("result.reason === 'invalid-credentials'");
    expect(FORM_CODE).toContain("t(dict, 'login.errorCredentials')");
    // And the sentence itself must not disclose that an address HAS an
    // account, which is what makes it safe to show to anyone who asks.
    const say = (src: string) => (src.match(/'login\.errorCredentials':\s*\n?\s*'([^']*)'/) ?? [])[1] ?? '';
    expect(say(AR)).toContain('Google');
    expect(say(EN)).toContain('Google');
    for (const disclosing of ['هذا الحساب يدخل', 'this account uses', 'no account', 'لا يوجد حساب']) {
      expect(say(AR) + say(EN)).not.toContain(disclosing);
    }
  });

  it('the Google road is still one anchor, never a fetch', () => {
    expect(FORM_CODE).toContain('href="/api/auth/google/start"');
    expect(FORM_CODE).not.toMatch(/fetch\(\s*['"]\/api\/auth\/google\/start/);
    const at = FORM_CODE.indexOf('href="/api/auth/google/start"');
    expect(FORM_CODE.slice(Math.max(0, at - 220), at)).toContain('<a');
  });

  it('and the deployment gate can still find the thing it presses', () => {
    // GUARDS DO NOT TRAVEL: the gate probes the MECHANISM, not a class name,
    // after it rolled back a correct release for a renamed class on /signup.
    const probe = code(read('scripts/verify-deployment.mjs'));
    expect(probe).toContain(`document.querySelector('a[href="/api/auth/google/start"]')`);
  });

  it('a password manager can fill this form', () => {
    // A sign-in form with no `current-password` cannot be filled, which left
    // the Google road the only practical way in even for accounts that do
    // have a password. Named here so the addition is on the record.
    expect(FORM_CODE).toContain('autoComplete="email"');
    expect(FORM_CODE).toContain('autoComplete="current-password"');
  });

  it('the engines this page hosts are still wired, none retired', () => {
    for (const engine of ['useExperienceLifecycle', 'useVisitorPresence',
                          'applyVariation', 'LivingCompanion', 'beginHandoff']) {
      expect(EXPERIENCE_CODE).toContain(engine);
    }
    expect(EXPERIENCE_CODE).toContain('beginHandoff(destination)');
  });
});

/* ═══ 5 · EVERY CONTROL PAINTS ITS OWN SURFACE ══════════════════════════ */

describe('٥ · كلُّ عنصرٍ يَرسُم سطحَه بنفسِه', () => {
  it('the fields, the submit and the Google door each declare bg, colour and font', () => {
    // Geometry with no background renders BROWSER GREY, and neither tsc nor
    // a test nor a token sweep can see it. Three were caught that way on
    // 2026-11-21. A form control never inherits font-family by itself.
    for (const control of ['.dihliz-field input {', '.dihliz-submit {', '.dihliz-google {']) {
      const at = CSS_CODE.indexOf(control);
      expect(at).toBeGreaterThan(-1);
      const block = CSS_CODE.slice(at, CSS_CODE.indexOf('}', at));
      expect(block).toMatch(/background/);
      expect(block).toMatch(/color:/);
      expect(block).toContain('font-family: inherit');
    }
  });

  it('and a keyboard can see where it is', () => {
    expect((CSS_CODE.match(/:focus-visible/g) ?? []).length).toBeGreaterThanOrEqual(4);
    expect(CSS_CODE).toMatch(/\.dihliz-field input:focus\s*\{[^}]*box-shadow/);
  });

  it('nothing clips the arch light written directly above it', () => {
    // The lesson the hall paid for: `overflow: hidden` erased its own ::after.
    const at = CSS_CODE.indexOf('.dihliz-door {');
    expect(CSS_CODE.slice(at, CSS_CODE.indexOf('}', at))).not.toContain('overflow: hidden');
    expect(CSS_CODE).toMatch(/\.dihliz-door::before\s*\{[^}]*border-radius:\s*inherit/);
  });
});

/* ═══ 6 · DEPTH AND GLOSS, THE SAME FIVE EFFECTS AS THE HALL ════════════ */

describe('٦ · العمقُ واللمعان — نفسُ الآثارِ الخمسةِ التي في الإيوان', () => {
  it('metal is seven stops, filled twice, not more', () => {
    const metal = (CSS_CODE.match(/--dihliz-metal:[\s\S]*?;/) ?? [''])[0];
    expect((metal.match(/#[0-9a-f]{6}|var\(/gi) ?? []).length).toBeGreaterThanOrEqual(7);
    expect((CSS_CODE.match(/background:\s*var\(--dihliz-metal\)/g) ?? []).length).toBe(2);
  });

  it('every raised surface carries an ambient shadow, a rim of light and a bounce', () => {
    const lift = (CSS_CODE.match(/--dihliz-lift:[\s\S]*?;/) ?? [''])[0];
    expect((lift.match(/rgba?\(/g) ?? []).length).toBeGreaterThanOrEqual(4);
    expect(lift).toContain('inset 0 1px 0');
    expect(lift).toMatch(/inset 0 -\d+px/);
  });

  it('the gloss is a band crossing a saturated surface, not a white wash', () => {
    expect(CSS_CODE).toMatch(/--dihliz-gloss:[\s\S]*?linear-gradient\(116deg/);
    expect(CSS_CODE).toMatch(/backdrop-filter:\s*blur\([^)]*\)\s*saturate\(/);
  });

  it('the value range is wide — depth is the distance between dark and light', () => {
    expect(CSS_CODE).toContain('--dihliz-floor: #02030a');
    expect(CSS_CODE).toContain('--dihliz-light:   #fff6de');
  });

  it('and it is ONE panel, not the hall’s two — a returning Creator is not a visitor', () => {
    // The 2026-07-23 directive: «Do not replicate the Signup experience for
    // Login.» The hall explains what an account opens because its visitor
    // does not know. This page explains nothing.
    expect(CSS_CODE).not.toContain('grid-template-columns: minmax(0, 1fr) minmax');
    expect(FORM_CODE).not.toContain('LANDING_CHAMBERS');
    expect(FORM_CODE).not.toContain('LANDING_PROOF_TOTAL');
  });
});

/* ═══ 7 · A PHONE, AND A VISITOR WHO ASKED FOR STILLNESS ════════════════ */

describe('٧ · هاتفٌ، وزائرٌ طَلَب السكون', () => {
  it('nothing is allowed to push the page sideways', () => {
    expect(CSS_CODE).toContain('overflow-x: hidden');
    expect(CSS_CODE).toMatch(/\.dihliz-field input\s*\{[^}]*box-sizing:\s*border-box/);
  });

  it('the passage leaves room beneath it for the voice that floats there', () => {
    const phone = CSS_CODE.slice(CSS_CODE.indexOf('@media (max-width: 560px)'));
    expect(phone).toMatch(/padding-block-end:\s*1[0-9]{2}px/);
    expect(phone).toContain('inset-inline: 14px');
  });

  it('and the long Arabic message wraps instead of running out of its bar', () => {
    expect(CSS_CODE).not.toContain('white-space: nowrap');
    expect(CSS_CODE).toMatch(/\.dihliz-voice \.companion-text\s*\{[^}]*white-space:\s*normal/);
  });

  it('a visitor who asked for stillness is given it', () => {
    expect((CSS_CODE.match(/prefers-reduced-motion/g) ?? []).length).toBeGreaterThanOrEqual(3);
    expect(CSS_CODE).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]{0,200}opacity:\s*1/);
  });
});

/* ═══ 8 · THE FACE THIS ROUTE SETS, AND ONLY THIS ROUTE ═════════════════ */

describe('٨ · خطٌّ لهذا الطريقِ وحدَه', () => {
  it('the face is declared on the route, never in the shared layout', () => {
    expect(PAGE).toContain('next/font/google');
    expect(PAGE).toContain("variable: '--dihliz-font'");
    expect(read('app/layout.tsx')).not.toContain('--dihliz-font');
  });

  it('and it is handed down, not assumed', () => {
    expect(PAGE).toContain('fontClass={vestibuleFont.variable}');
    expect(CLIENT).toContain('fontClass={fontClass}');
    expect(EXPERIENCE_CODE).toContain('`dihliz-stage ${fontClass}`');
  });

  it('the stage falls back to the platform’s own face, never the browser’s', () => {
    const at = CSS_CODE.indexOf('font-family: var(--dihliz-font)');
    expect(at).toBeGreaterThan(-1);
    const line = CSS_CODE.slice(at, CSS_CODE.indexOf(';', at));
    expect(line).toContain('--font-arabic');
    expect(line).toContain('--font-latin');
  });
});
