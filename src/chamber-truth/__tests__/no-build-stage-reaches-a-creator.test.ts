/**
 * NO BUILD STAGE REACHES A CREATOR.
 *
 * ═══ THE RULING ═════════════════════════════════════════════════════════════
 *
 *   FOUNDER, 2026-11-20: «يُمنع ظهور تصنيفات حالة البناء والتطوير للمستخدم أو
 *   الزائر … يُطبّق ذلك على صفحة الاستقبال وبطاقات الحجرات والخدمات والرسائل
 *   التسويقية والواجهات الموجهة للمستخدم في المنصة كلها».
 *
 *   Two surfaces were rendering one. Both are repaired, and this guard holds
 *   the repair:
 *
 *     · `ChamberDemonstration.tsx` drew a panel headed «ما لا تفعله هذه
 *       الحجرة بعد» from `truth.deferred`, in FIVE chambers.
 *     · `InvestigationFile.tsx` drew `soonAr` — «لم يُبنَ بعد» — on the
 *       Makman demand card.
 *
 * ═══ THE BOUNDARY THE SAME ORDER DREW ═══════════════════════════════════════
 *
 *   «لا تحذف حالات التشغيل الداخلية أو سجلات المراقبة أو أدوات التشخيص التي
 *   يحتاجها الفريق الهندسي.»
 *
 *   So this guard does NOT demand that `deferred` be deleted. The registry is
 *   asserted to still exist, and still to be populated, because an engineer
 *   losing their own record of what is unbuilt would be a worse outcome than
 *   the defect being repaired. What changed is who reads it.
 *
 * ═══ AND THE SECOND HALF OF THE RULING ══════════════════════════════════════
 *
 *   «لا تحوّل قدرة غير متاحة إلى ادعاء بأنها تعمل.»
 *
 *   Removing a qualification must never leave a promise standing where it
 *   stood. That is why section 3 reads what the repaired cards still say.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

/** What RUNS, never the comments that record why a sentence was removed. */
const code = (p: string) =>
  read(p).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '');

const DEMO = code('src/chamber-demonstration/ChamberDemonstration.tsx');
const FILE = code('app/hujjah-al-damighah/_components/InvestigationFile.tsx');

describe('1 · the chamber demonstration no longer reports its own progress', () => {
  it('the deferred panel is not rendered', () => {
    expect(DEMO).not.toContain('truth.deferred.map');
    expect(DEMO).not.toContain('ما لا تفعله هذه الحجرة بعد');
    expect(DEMO).not.toContain('ما لم يُبنَ بعد يُقال');
  });

  it('but it still shows what the chamber DOES, which is the point of it', () => {
    // Removing the negative list must not hollow out the panel. A
    // demonstration that shows nothing is a different defect.
    expect(DEMO).toContain('ما تستطيعه الآن');
    expect(DEMO).toContain('readyNow.map');
  });

  it('and it still says when something needs an asset first', () => {
    // NOT a build stage — a precondition the Creator can satisfy today. The
    // order bans development reports, not honest instructions.
    expect(DEMO).toContain('ما يحتاج أصلاً تملكه أوّلاً');
  });
});

describe('2 · the engineering record is untouched', () => {
  it('`deferred` still exists on the truth registry and still carries rows', async () => {
    // Imported through the index, as `src/chamber-truth/index.ts` instructs
    // in as many words: «Import from here — never from truth-registry.ts
    // directly.» A guard that reaches past a declared front door teaches
    // every future reader to do the same.
    const { CHAMBER_TRUTH } = await import('../index');
    const truths = Object.values(CHAMBER_TRUTH);
    const withDeferred = truths.filter((t) => (t.deferred?.length ?? 0) > 0);
    expect(withDeferred.length).toBeGreaterThan(0);
    for (const t of withDeferred) {
      for (const d of t.deferred) expect(d.responsibilityAr.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('3 · and nothing was promised in the removal’s place', () => {
  it('the Makman demand card no longer carries a build-stage line', () => {
    expect(FILE).not.toContain('soonAr');
    expect(FILE).not.toContain('لم يُبنَ بعد');
    expect(FILE).not.toContain('inv-demand-soon');
  });

  it('and what the card still says claims no social account', () => {
    // THE CHECK THAT MATTERS: deleting a denial is safe only when the
    // sentence left behind never promised the thing being denied.
    const card = FILE.slice(FILE.indexOf("destination: 'makman-al-ghayah'"));
    const forAr = card.slice(0, card.indexOf('},'));
    for (const claim of ['مواقع التواصل', 'حساباتك', 'يوتيوب', 'فيسبوك', 'إنستجرام', 'تيك توك']) {
      expect(forAr).not.toContain(claim);
    }
    expect(forAr).toContain('هدفٍ يُقاس');
  });
});
