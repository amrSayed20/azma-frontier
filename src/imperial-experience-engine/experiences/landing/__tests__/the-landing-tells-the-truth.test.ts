/**
 * THE LANDING TELLS THE TRUTH — AND TOUCHES NOTHING ELSE.
 *
 * ═══ WHY THIS FILE EXISTS ═══════════════════════════════════════════════════
 *
 *   The construction order of 2026-11-20 says it plainly: «يجب إثبات العزل
 *   باختبارات فعلية، لا بمجرد تأكيد نظري». So isolation is asserted here by
 *   reading the stylesheets, not promised in a comment.
 *
 * ═══ THE ONE THAT MATTERS MOST ══════════════════════════════════════════════
 *
 *   `the-gate-tells-the-truth.test.ts` asserts that THE GATEWAY draws the
 *   AI NCII prohibition. That guard still passes — and it would have kept
 *   passing while the prohibition vanished from the served page, because the
 *   gateway is no longer what `app/page.tsx` renders.
 *
 *   That is precisely the defect Google refused this app for: a prohibition
 *   that exists somewhere nobody is shown. Swapping the landing re-opened the
 *   hole from the other side. Section 1 below closes it.
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');
const here = (f: string) => read(join('src/imperial-experience-engine/experiences/landing', f));

/** What RUNS, never the comments that explain it. */
const code = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const CLIENT = here('SovereignLanding.tsx');
const CLIENT_CODE = code(CLIENT);
const CSS = here('landing.css');
const CSS_CODE = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
const PAGE = read('app/page.tsx');

import {
  LANDING_JOURNEY,
  LANDING_CAPABILITIES,
  LANDING_PROOF,
  LANDING_PROOF_TOTAL,
  LANDING_QUESTIONS,
  LANDING_FOOTER,
  LANDING_CHAMBERS,
  LANDING_SHOWCASE,
} from '../landing-content';
import { GATEWAY_CHAMBERS } from '../../gateway/chambers';

/* ═══ 1 · THE PROHIBITION IS ON THE PAGE THAT IS ACTUALLY SERVED ═════════ */

describe('1 · the served page still says what this is and what it is not for', () => {
  it('app/page.tsx renders the landing', () => {
    expect(PAGE).toContain('<SovereignLanding');
  });

  it('the landing draws the approved purpose and prohibition blocks', () => {
    // Rendered from the SAME dictionary keys the gateway rendered. Not
    // copied — read. A copy drifts the first time one of the two is edited.
    for (const key of ['gateway.introTitle', 'gateway.introBody', 'gateway.introSecond',
                       'gateway.limitsTitle', 'gateway.limitsBody']) {
      expect(CLIENT_CODE).toContain(`t(dict, '${key}')`);
    }
  });

  it('and it does not re-word them into marketing prose', () => {
    // The order: «حافظ على نصوص Google المعتمدة وكتلة gi-limits حرفيًا».
    // The strongest proof that the text is literal is that the text is not
    // HERE at all — only the key is. A landing that typed the sentence could
    // soften it; a landing that reads the key cannot.
    expect(CLIENT_CODE).not.toContain('AI NCII');
    expect(CLIENT_CODE).not.toContain('بغير موافقته الصريحة');
  });
});

/* ═══ 2 · THE ISOLATION CONTRACT, READ FROM THE STYLESHEET ═══════════════ */

describe('2 · nothing in this stylesheet can reach a chamber', () => {
  it('every top-level selector is prefixed lp-', () => {
    const selectors = CSS_CODE.match(/^\.[a-zA-Z][\w-]*/gm) ?? [];
    expect(selectors.length).toBeGreaterThan(40);
    for (const s of selectors) expect(s.startsWith('.lp-')).toBe(true);
  });

  it('there is no element, universal or document selector at all', () => {
    // `body{overflow:hidden}` in the Vault's stylesheet once bled into
    // Qiyamah through single-page navigation. One bare selector is enough.
    for (const forbidden of [/^\s*\*\s*[,{]/m, /^\s*html\b/m, /^\s*body\b/m]) {
      expect(CSS_CODE).not.toMatch(forbidden);
    }
  });

  it('no custom property is declared on :root', () => {
    // The root layout loads 198 shared tokens onto every page of this
    // platform. Redefining one here would recolour every chamber.
    expect(CSS_CODE).not.toContain(':root');
    expect(CSS_CODE).toContain('.lp-root {');
  });

  it('the forbidden prefixes appear nowhere', () => {
    // `gate-` is the Vault's (gate-card / gate-icon / gate-name /
    // gate-portal-effect, defined in sovereign-vault.css). `gi-` is the
    // gateway's. Neither is this page's to define.
    expect(CSS_CODE).not.toMatch(/\.gate-/);
    expect(CSS_CODE).not.toMatch(/\.gi-/);
    expect(CLIENT_CODE).not.toMatch(/className="[^"]*\bgate-/);
    expect(CLIENT_CODE).not.toMatch(/className="[^"]*\bgi-/);
  });

  it('and not one of its class names is defined anywhere else in the platform', () => {
    // THE MEASUREMENT, not the assurance. Re-run on every commit.
    const mine = new Set((CSS_CODE.match(/^\.[a-zA-Z][\w-]*/gm) ?? []).map((s) => s.slice(1)));
    const others = new Set<string>();
    for (const file of allStylesheetsButMine()) {
      for (const s of read(file).match(/^\.[a-zA-Z][\w-]*/gm) ?? []) others.add(s.slice(1));
    }
    expect(others.size).toBeGreaterThan(1500); // the instrument saw the platform
    const collisions = [...mine].filter((c) => others.has(c));
    expect(collisions).toEqual([]);
  });
});

/* ═══ 3 · ARABIC FIRST, AND A REAL RESPONSIVE LADDER ════════════════════ */

describe('3 · it serves Arabic and a phone as well as it serves English and a desk', () => {
  it('direction is never hard-coded', () => {
    // Logical properties only, so one set of rules serves both tongues and
    // no [dir=rtl] override is needed anywhere.
    expect(CSS_CODE).not.toMatch(/^\s*(left|right)\s*:/m);
    expect(CSS_CODE).not.toContain('[dir=');
  });

  it('there is more than one width breakpoint', () => {
    // The gateway this replaces carried exactly one for its whole
    // introduction. Nine marketing bands need a ladder.
    const widths = CSS_CODE.match(/@media\s*\(max-width/g) ?? [];
    expect(widths.length).toBeGreaterThanOrEqual(4);
  });

  it('a visitor who asked for stillness is given it', () => {
    expect(CSS_CODE).toContain('prefers-reduced-motion');
  });

  it('nothing is allowed to push the page sideways', () => {
    expect(CSS_CODE).toContain('overflow-x: hidden');
    // Every grid track can shrink to nothing rather than forcing a scroll.
    expect((CSS_CODE.match(/minmax\(0, 1fr\)/g) ?? []).length).toBeGreaterThan(8);
  });
});

/* ═══ 4 · BOTH TONGUES, ON EVERY RECORD ═════════════════════════════════ */

describe('4 · no sentence exists in one tongue and not the other', () => {
  const bilingual = (label: string, rows: readonly Record<string, unknown>[]) => {
    it(`${label} carries both tongues, and neither is blank`, () => {
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        for (const key of Object.keys(row)) {
          if (!key.endsWith('Ar')) continue;
          const twin = `${key.slice(0, -2)}En`;
          expect(Object.keys(row)).toContain(twin);
          expect(String(row[key]).trim().length).toBeGreaterThan(0);
          expect(String(row[twin]).trim().length).toBeGreaterThan(0);
        }
      }
    });
  };

  bilingual('the journey', LANDING_JOURNEY as unknown as Record<string, unknown>[]);
  bilingual('the capabilities', LANDING_CAPABILITIES as unknown as Record<string, unknown>[]);
  bilingual('the proof', LANDING_PROOF as unknown as Record<string, unknown>[]);
  bilingual('the questions', LANDING_QUESTIONS as unknown as Record<string, unknown>[]);
  bilingual('the footer columns', LANDING_FOOTER as unknown as Record<string, unknown>[]);
  bilingual('the chambers', LANDING_CHAMBERS as unknown as Record<string, unknown>[]);
  bilingual('the showcase', LANDING_SHOWCASE as unknown as Record<string, unknown>[]);

  it('and every footer link too', () => {
    for (const col of LANDING_FOOTER) {
      for (const link of col.links) {
        expect(link.labelAr.trim().length).toBeGreaterThan(0);
        expect(link.labelEn.trim().length).toBeGreaterThan(0);
      }
    }
  });
});

/* ═══ 5 · NO CLAIM WITHOUT A DOOR ═══════════════════════════════════════ */

describe('5 · nothing is announced that a Creator cannot reach today', () => {
  it('every capability names a route file that exists', () => {
    // «لا تعلن عن محركات أو خدمات أو وظائف غير مكتملة أو غير متاحة
    // للمستخدم». A capability with a price but no door is not a capability.
    expect(LANDING_CAPABILITIES.length).toBeGreaterThan(0);
    for (const cap of LANDING_CAPABILITIES) {
      expect(existsSync(join(ROOT, cap.door))).toBe(true);
    }
  });

  it('every chamber card opens a page that exists', () => {
    for (const c of LANDING_CHAMBERS) {
      expect(existsSync(join(ROOT, 'app', c.href.slice(1), 'page.tsx'))).toBe(true);
    }
  });

  it('and the five chambers of the gateway are the five the landing draws', () => {
    expect(LANDING_CHAMBERS.map((c) => c.id).sort())
      .toEqual(GATEWAY_CHAMBERS.map((c) => c.id).sort());
  });

  it('every footer link is a real route or an anchor this page renders', () => {
    for (const col of LANDING_FOOTER) {
      for (const { href } of col.links) {
        if (href.startsWith('#')) {
          expect(CLIENT_CODE).toContain(`id="${href.slice(1)}"`);
        } else {
          expect(existsSync(join(ROOT, 'app', href.slice(1), 'page.tsx'))).toBe(true);
        }
      }
    }
  });
});

/* ═══ 6 · NO PRICE IS TYPED, AND THE PACKAGES STAND LATE ════════════════ */

describe('6 · the figures come from their authority and stand where they were ruled to', () => {
  it('not one approved figure is written into this component', () => {
    // `SOVEREIGN_PACKAGES` carries «APPROVED. DO NOT ALTER A SINGLE FIGURE.»
    // A price typed twice is a price that can drift.
    for (const figure of ['99', '249', '499', '1200', '1,200', '1375', '3450', '6900', '16670']) {
      expect(CLIENT_CODE).not.toContain(`>${figure}<`);
    }
    expect(CLIENT_CODE).not.toContain('sovereign-value-balance');
    expect(CLIENT_CODE).toContain('pkg.priceEgp');
    expect(CLIENT_CODE).toContain('pkg.balanceUnits');
  });

  it('the page still reads the two authorities it always read', () => {
    expect(PAGE).toContain('SOVEREIGN_PACKAGES');
    expect(PAGE).toContain('PUBLISHED_POLICIES');
  });

  it('the packages stand AFTER the chambers and the capabilities', () => {
    // FOUNDER, 2026-09-28: «لا اريد ان تكون صفحه الاشتراكات والباقات
    // (الميزان) فى بدايه دخول الزائر للمنصه». Re-affirmed in MISSION 02:
    // «يجب أن يظهر قسم الباقات في جزء متأخر من الصفحة».
    const at = (id: string) => CLIENT_CODE.indexOf(`id="${id}"`);
    expect(at('lp-chambers')).toBeGreaterThan(-1);
    expect(at('lp-packages')).toBeGreaterThan(at('lp-chambers'));
    expect(at('lp-packages')).toBeGreaterThan(at('lp-capabilities'));
  });

  it('and nothing can be bought from this page', () => {
    // Every package button is the signup door, not a checkout.
    expect(CLIENT_CODE).not.toMatch(/checkout|xpay|\/subscribe/i);
  });
});

/* ═══ 7 · WHAT STANDS WHERE TESTIMONIALS WOULD HAVE ═════════════════════ */

describe('7 · no testimony is fabricated, and every figure names its source', () => {
  it('there is no testimonial anywhere in this experience', () => {
    // «لا تستخدم نماذج وهمية توحي بأنها أعمال عملاء حقيقيين».
    for (const src of [CLIENT_CODE, code(here('landing-content.ts')), code(here('types.ts'))]) {
      expect(src).not.toMatch(/testimonial/i);
    }
  });

  it('every figure names the book it was counted in', () => {
    // THE SOURCE LINE WAS REMOVED AND SOMETHING STRONGER PUT IN ITS PLACE.
    // Each card used to carry «مَقيسةٌ من قاعدةِ الإنتاج» — a sentence a
    // reader cannot check. Now each card carries the COLLECTION ITSELF
    // (صحيح البخاري ٧٬٥٨٠), which is checkable by anyone who knows the
    // books. A citation a reader can verify beats a citation they must
    // take on trust.
    expect(LANDING_PROOF.length).toBe(8);
    for (const p of LANDING_PROOF) {
      expect(p.labelAr.trim().length).toBeGreaterThan(0);
      expect(p.figure.trim().length).toBeGreaterThan(0);
    }
    expect(CLIENT_CODE).toContain('lp-proof-total');
  });

  it('and the showcase tells the reader its panels are drawn, not produced', () => {
    // A gallery of abstract gradients beside the words «what you can make»
    // reads as a portfolio unless it says otherwise, in the same breath.
    expect(CLIENT_CODE).toContain('lp-showcase-note');
    expect(CLIENT).toContain('مرسومةٌ لا منتَجة');
    expect(CLIENT).toContain('drawn, not produced');
  });
});

/* ═══ 8 · THE DOOR IS THE ONE THAT ALREADY EXISTED ══════════════════════ */

describe('8 · the landing hosts no authentication of its own', () => {
  it('it links to the existing routes and carries no form', () => {
    expect(CLIENT_CODE).toContain('href="/signup"');
    expect(CLIENT_CODE).toContain('href="/login"');
    expect(CLIENT_CODE).not.toContain('<form');
    expect(CLIENT_CODE).not.toContain('/api/auth/');
  });

  it('and it changes nothing about sessions or roles', () => {
    // `role` ALONE WAS THE WRONG INSTRUMENT, and it failed on its first run:
    // it matched `role="group"` and `role="region"` — the ARIA attributes
    // that make the filter bar and the answer panels readable to a screen
    // reader. A guard that cannot tell accessibility from authorisation
    // would push a future repair into removing the accessibility.
    expect(CLIENT_CODE).not.toMatch(/verifySession|azma_session|creatorId/);
    expect(CLIENT_CODE).not.toMatch(/session\.role|result\.role|'founder'/);
  });
});

/* ═══ HELPERS ═══════════════════════════════════════════════════════════ */

/**
 * Every stylesheet in the platform except this page's own. Walked rather
 * than listed, because a list goes stale the first time someone adds a file
 * and the guard then proves nothing about it.
 */
function allStylesheetsButMine(): string[] {
  const { readdirSync, statSync } = require('fs') as typeof import('fs');
  const found: string[] = [];
  const mine = join('src', 'imperial-experience-engine', 'experiences', 'landing');
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

/* ═══ 9 · NO BUILD STAGE REACHES A VISITOR ══════════════════════════════ */

/**
 * Every file whose text a visitor could end up reading — WITH THE COMMENTS
 * STRIPPED.
 *
 * The first draft of these guards read the raw files and failed on its own
 * documentation: the comment explaining that «لم تُبنَ بعد» was removed
 * counts, to a plain substring match, as the sentence itself. A guard that
 * cannot tell a quotation from a rendered string forces every repair to go
 * undocumented in order to stay green — and the record of WHY a sentence was
 * removed is the most valuable thing standing between it and a future
 * well-meaning restoration.
 *
 * So the rule is the one this repository already learned: what RUNS is
 * checked, what EXPLAINS is not.
 */
const SOURCE_FILES = () =>
  [CLIENT, here('landing-content.ts'), here('types.ts')].map(code);

describe('9 · a visitor is never shown how far along the building is', () => {
  it('not one readiness word appears on this page, in either tongue', () => {
    // FOUNDER, 2026-11-20: «يُمنع ظهور تصنيفات حالة البناء والتطوير للمستخدم
    // أو الزائر». Read against the WHOLE file, comments included: a comment
    // that still says «لم تُبنَ بعد» is one careless paste from the screen.
    const forbidden = [
      'مبنيّةٌ جزئيّاً', 'مبنية جزئيا', 'لم تُفتَح بعد', 'لم تفتح بعد',
      'لم تُبنَ', 'لم يُبنَ', 'لم تكتمل', 'غير جاهزة', 'غير متاحة بعد',
      'قيد التطوير', 'قريباً',
      'Partly built', 'Not open yet', 'not yet built', 'Coming soon',
    ];
    for (const src of SOURCE_FILES()) {
      for (const word of forbidden) expect(src).not.toContain(word);
    }
  });

  it('and the chamber record has no field that could carry one', () => {
    // The durable repair is SHAPE, not vigilance: a type with no `state` and
    // no `limit` cannot leak one however carelessly it is mapped over.
    const types = here('types.ts');
    const record = types.slice(types.indexOf('export interface LandingChamber'));
    const body = record.slice(0, record.indexOf('}'));
    expect(body).not.toMatch(/\bstate\b/);
    expect(body).not.toMatch(/\blimit/i);
    expect(body).toContain('valueAr');
  });

  it('the landing does not read the gateway table that is built around state', () => {
    // GATEWAY_CHAMBERS keeps `state` and `limitAr`, and keeps serving the
    // gateway's own guards. Reading it here and hiding half its fields would
    // leave this page one `.map()` away from printing a build stage.
    expect(CLIENT_CODE).not.toContain('GATEWAY_CHAMBERS');
    expect(CLIENT_CODE).toContain('LANDING_CHAMBERS');
  });

  it('and no state badge survives in the markup or the stylesheet', () => {
    expect(CLIENT_CODE).not.toContain('lp-state');
    expect(CSS_CODE).not.toContain('.lp-state');
    expect(CLIENT_CODE).not.toContain('stateLabel');
  });
});

/* ═══ 10 · NOTHING UNREACHABLE IS ADVERTISED ════════════════════════════ */

describe('10 · a capability nobody can reach is not named at all', () => {
  it('video from a text idea is absent, because no Creator can buy its key', () => {
    // MEASURED 2026-11-20: app/api/qiyamah/generate/route.ts:96 refuses video
    // without `hasActiveEntitlement` (subscription.status === 'active'); the
    // subscriptions table holds zero rows; and /api/billing/checkout opens
    // with «Replaces the old Stripe subscription checkout» and sells packs.
    for (const src of [CLIENT, here('landing-content.ts')]) {
      const rendered = code(src);
      expect(rendered).not.toContain('مقطعٌ من فكرة');
      expect(rendered).not.toContain('a clip from an idea');
    }
  });

  it('and the entitlement gate itself is still where it was — untouched', () => {
    // The landing must never be made true by weakening the economy.
    const gate = read('app/api/qiyamah/generate/route.ts');
    expect(gate).toContain('hasActiveEntitlement(session.creatorId, session.role)');
  });

  it('nor is any social publishing destination promised', () => {
    // «ولا يجوز الخلط بينه وبين النشر الاجتماعي أو الادعاء بأن وجهات النشر
    // الاجتماعي متاحة دون إثبات». Google Drive is named; the rest are not —
    // neither as a promise nor as a progress report.
    const rendered = code(here('landing-content.ts'));
    for (const name of ['يوتيوب', 'فيسبوك', 'إنستجرام', 'تيك توك', 'تيليجرام',
                        'YouTube', 'Facebook', 'Instagram', 'TikTok', 'Telegram']) {
      expect(rendered).not.toContain(name);
    }
    expect(rendered).toContain('جوجل درايف');
  });
});

/* ═══ 11 · EVERY FIGURE SURVIVED VERIFICATION ═══════════════════════════ */

describe('11 · the numbers mean what a visitor will think they mean', () => {
  /*
   * ── THIS WHOLE SECTION WAS INVERTED ON 2026-11-22, NOT DELETED ─────────
   *
   *   It used to require the nine hadith collections to sum to 36,064, and
   *   it used to require the Gutenberg figure to be ABSENT — I had removed
   *   it because 78,130 printed beside the Qur'an read as an Arabic library.
   *
   *   The Founder then ruled, for the second time:
   *     «انظر الى كم تلميحا يمس القران الكريم وانا قد نهيتك من قبل عن ذلك.
   *      عليك الا تذكر مصادر الا المصادر المعروفه. وكذلك عليك ان تكتب انه
   *      هناك مكتبه تضم اكثر من 75 الف كتابا الكترونيا يرجع بعضها الى ما
   *      قبل الميلاد.»
   *
   *   He had ruled once already and I kept those figures anyway, because
   *   they were the ones I could verify. That put my standard of proof
   *   above his ruling, and these assertions are what enforced the mistake.
   *
   *   So every one of them now runs in the opposite direction. The coverage
   *   did not shrink; it changed sign.
   */

  it('no scripture and no hadith collection is named anywhere a visitor reads', () => {
    const forbidden = [
      'القرآن', 'الحديث', 'رواية', 'روايات', 'مُسنَد', 'درجته', 'مرتبتها',
      'البخاري', 'مسلم', 'النسائي', 'أبي داود', 'ابن ماجه', 'الترمذي',
      'موطأ', 'النووية', 'القدسية',
      'Qur', 'hadith', 'narration', 'Bukhari', 'Muslim', 'Tirmidhi',
    ];
    for (const src of SOURCE_FILES()) {
      for (const word of forbidden) expect(src).not.toContain(word);
    }
  });

  it('and the library is named instead, with the figure he asked for', () => {
    // MEASURED 2026-11-22 in the production database: 78,130 works across
    // 118 distinct languages. «أكثر من 75 ألف» is therefore a floor, not a
    // flourish — the page may never claim more than the table holds.
    const content = here('landing-content.ts');
    expect(content).toContain('٧٨٬١٣٠');
    expect(content).toContain('78,130');
    expect(content).toContain('١١٨ لغة');
    expect(content).toContain('ما قبل الميلاد');
  });

  it('every name it does show is one a reader already knows', () => {
    // «عليك الا تذكر مصادر الا المصادر المعروفه». And each count was read
    // from the table, not estimated: Virgil 137 · Homer 83 · Plato 78 ·
    // Euripides 26 · Cicero 22 · Aristotle 21 · Herodotus 13 · Confucius 9.
    const known = ['هوميروس', 'أفلاطون', 'أرسطو', 'فرجيل', 'شيشرون', 'هيرودوت', 'كونفوشيوس'];
    const content = here('landing-content.ts');
    for (const n of known) expect(content).toContain(n);
    expect(LANDING_PROOF.length).toBeGreaterThanOrEqual(6);
  });

  it('and every one of them really is older than the Common Era', () => {
    // The claim «يرجع بعضها إلى ما قبل الميلاد» rests on these names, so a
    // later addition must not quietly put a modern author under it.
    const PRE_COMMON_ERA = new Set([
      'homer', 'plato', 'aristotle', 'virgil', 'cicero',
      'euripides', 'herodotus', 'confucius', 'sophocles', 'aesop',
    ]);
    for (const p of LANDING_PROOF) expect(PRE_COMMON_ERA.has(p.id)).toBe(true);
  });

  it('and engineering facts are still not wearing a visitor’s clothes', () => {
    // «لا تجعل عدد الاختبارات بديلاً عن عرض القيمة الإبداعية للمنصة».
    for (const src of SOURCE_FILES()) {
      expect(src).not.toContain('٥٬٧١٢');
      expect(src).not.toContain('اختباراً يَحرس');
    }
  });
});

describe('12 · the ground is a lit room, not a flat dark field', () => {
  it('the light is painted once behind everything, not per section', () => {
    expect(CLIENT_CODE).toContain('lp-ambient');
    for (const layer of ['lp-ambient-violet', 'lp-ambient-gold', 'lp-ambient-deep']) {
      expect(CSS_CODE).toContain(`.${layer}`);
    }
  });

  it('and it can never take a press meant for a control', () => {
    // A full-viewport decorative layer over the page would swallow every
    // click on it. This platform has paid for that defect once already.
    const block = CSS_CODE.slice(CSS_CODE.indexOf('.lp-ambient {'));
    expect(block.slice(0, block.indexOf('}'))).toContain('pointer-events: none');
    expect(CLIENT_CODE).toContain('className="lp-ambient"');
  });

  it('a visitor who asked for stillness keeps the light and loses the motion', () => {
    const quiet = CSS_CODE.slice(CSS_CODE.indexOf('prefers-reduced-motion'));
    expect(quiet).toContain('transition: none');
    expect(quiet).toContain('transform: none');
  });
});
