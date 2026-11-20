/**
 * AZMA OS — EVERYTHING THE LANDING SAYS, AND WHERE EACH CLAIM COMES FROM
 *
 * ═══ THE FOUNDER'S REVISION ORDER, 2026-11-20 ═══════════════════════════════
 *
 *   «يُمنع ظهور تصنيفات حالة البناء والتطوير للمستخدم أو الزائر» — so no
 *   chamber here carries a state, a badge, a count of finished ministries or
 *   any other word that exposes how far along the building is. A visitor is
 *   told what a chamber DOES for them.
 *
 *   And the boundary he drew in the same breath: «لا تحوّل قدرة غير متاحة
 *   إلى ادعاء بأنها تعمل … إذا كانت قدرة ما لا يمكن تقديمها للمستخدم، فلا
 *   تضعها ضمن قائمة القدرات المتاحة ولا تعرض تقريراً عن مراحل تطويرها».
 *
 *   The two rules resolve to ONE method, and it is the method used below:
 *   SILENCE, NOT STAGING. What a Creator can do is described warmly and
 *   without qualification. What a Creator cannot do today is not mentioned at
 *   all — neither as a promise nor as a progress report.
 *
 * ═══ WHAT WAS REMOVED UNDER THAT RULE, AND WHY ══════════════════════════════
 *
 *   MEASURED 2026-11-20, in the serving release:
 *
 *   · VIDEO FROM A TEXT IDEA — `app/api/qiyamah/generate/route.ts:96` refuses
 *     it unless `hasActiveEntitlement`, which is `subscription.status ===
 *     'active'`. The `subscriptions` table holds ZERO rows, and
 *     `app/api/billing/checkout/route.ts` opens with «Replaces the old Stripe
 *     subscription checkout» and sells balance packs. So no Creator can buy
 *     the thing that opens it. It is not advertised here.
 *
 *   · AUTOMATIC SCENE COMMISSION in رأس الأمر —
 *     `src/ras-amr-production/qiyamah-commission.ts:435`, same gate, same
 *     unbuyable product. Not advertised here.
 *
 *   Both remain in the repository and both are reported to the Founder as a
 *   defect in the economy, NOT repaired here: the order keeps the landing out
 *   of the billing system.
 *
 *   · 78,130 «library works» — REMOVED FROM THE PAGE ENTIRELY. The figure is
 *     real, but reading the table showed what it is: Project Gutenberg.
 *     61,675 English, 4,181 French, 3,680 Finnish, and no Arabic in the top
 *     eight languages. Printed beside the Qur'an on an Arabic page it would
 *     read as an Arabic library, which it is not. A true number that creates
 *     a false impression is a false claim with a citation.
 *
 *   · 5,712 TESTS and «9 production acts» — REMOVED. The Founder: «لا تجعل
 *     عدد الاختبارات بديلاً عن عرض القيمة الإبداعية للمنصة». Both were
 *     engineering facts wearing a visitor's clothes.
 *
 * ═══ WHAT SURVIVED VERIFICATION ════════════════════════════════════════════
 *
 *   · 36,064 narrations across NINE named collections — counted in the
 *     production database on 2026-11-20, with the collections themselves
 *     read out rather than summed into an anonymous figure:
 *       صحيح البخاري 7,580 · صحيح مسلم 7,360 · سنن النسائي 5,679 ·
 *       سنن أبي داود 5,272 · سنن ابن ماجه 4,338 · جامع الترمذي 3,924 ·
 *       موطأ مالك 1,829 · الأربعون النووية 42 · الأربعون القدسية 40
 *     Each row carries `grades_json` — the grading travels with the text.
 *
 *   · The Qur'an — NOT in our database. It is served live by
 *     `sovereign-scripture-provider.ts` from api.alquran.cloud, which
 *     answered 200 from the production server on 2026-11-20 (control:
 *     google.com also 200, so the instrument was sound). So the page says
 *     the Qur'an is SEARCHED, never that it is stored here.
 *
 * ═══ AND WHAT IS STILL DELIBERATELY ABSENT ═════════════════════════════════
 *
 *   No testimonial type. No Creator counts, asset counts or generation
 *   counts — a Creator's activity and the Empire's commercial volume are not
 *   a stranger's business.
 */

import type {
  LandingJourneyStep,
  LandingCapability,
  LandingProofPoint,
  LandingQuestion,
  LandingFooterColumn,
  LandingChamber,
  LandingShowcaseTile,
} from './types';

/* ══ THE CHAMBERS, IN THE VISITOR'S OWN TERMS ═════════════════════════════ */

/**
 * The landing keeps its OWN chamber copy rather than reading
 * `GATEWAY_CHAMBERS`, and that is a deliberate separation, not duplication.
 *
 * That table is built around `state` and `limitAr` — the very shape the
 * Founder's order removes from a visitor's view. Reading it here and then
 * hiding half its fields would leave the landing one careless `.map()` away
 * from printing «لم تُبنَ بعد» on a marketing page. The gateway keeps its
 * table and its forty-three guards untouched; this is the visitor's telling.
 *
 * Routes read from `app/imperial-foyer/page.tsx`'s own chamber table — what
 * the platform actually navigates with, not typed again from memory.
 */
export const LANDING_CHAMBERS: readonly LandingChamber[] = [
  {
    id: 'hujjah',
    href: '/hujjah-al-damighah',
    nameAr: 'الحُجّة الدامغة',
    nameEn: 'Hujjah al-Damigha',
    roleAr: 'حيثُ تَبدأ المعرفة',
    roleEn: 'Where knowledge begins',
    bodyAr: 'تَطرح سؤالك، فتَبحث لك في القرآن وفي تسعةٍ من أمّهاتِ كتبِ الحديث وفي مصادرَ حيّة، '
      + 'وتَعرض عليك ما وجدَته بنصِّه ودرجته ومَن رواه. تَختار منه ما يَنفعك، '
      + 'فتُهيّئ منه مطالبةً إبداعيّةً جاهزةً للتنفيذ.',
    bodyEn: 'Ask your question and it searches the Qur’an, nine of the major hadith '
      + 'collections and live sources, showing you what it found with its text, its grading '
      + 'and who narrated it. You choose what serves you, and a creative prompt is prepared '
      + 'from it.',
    valueAr: 'تَبدأ من معرفةٍ لها مصدرٌ تَعرفه، لا من صفحةٍ بيضاء.',
    valueEn: 'You begin from knowledge with a source you can name, not from a blank page.',
  },
  {
    id: 'qiyamah',
    href: '/qiyamah-chamber',
    nameAr: 'القيامة',
    nameEn: 'Qiyamah',
    roleAr: 'مصنعُ الخلق',
    roleEn: 'The creation factory',
    bodyAr: 'هنا تُصنَع المادّة: صورةٌ من وصفٍ تَكتبه، وتعديلٌ على أصلٍ تَملكه، '
      + 'وتحريكُ صورةٍ ساكنة، ورفعُ دقّة، وإزالةُ خلفيّة، وإنطاقُ صورةٍ ومزامنةُ شفاهها.',
    bodyEn: 'This is where material is made: an image from a description you write, an edit '
      + 'on an asset you own, a still brought to motion, an upscale, a background removed, a '
      + 'photo made to speak with its lips in time.',
    valueAr: 'وسعرُ كلِّ عملٍ مكتوبٌ قبل أن تَضغط — فلا تَكتشف الكُلفةَ بعد أن تَدفعها.',
    valueEn: 'Every act states its price before you press it, so you never discover a cost '
      + 'after paying it.',
  },
  {
    id: 'ras-amr',
    href: '/ras-amr',
    nameAr: 'رأس الأمر',
    nameEn: 'Ras Al Amr',
    roleAr: 'طريقانِ إبداعيّانِ مختلفان',
    roleEn: 'Two distinct creative paths',
    // The Founder, §4: «وفي رأس الأمر، اشرح المونتاج والاستوري بورد باعتبارهما
    // مسارين إبداعيين مختلفين» — so they are named apart, not as two stages.
    bodyAr: '**المونتاج:** تَجمع صورك ومقاطعك وصوتك وموسيقاك على خطِّ زمن، وتُرتّبها '
      + 'وتَضبط توقيتها وانتقالاتها، فيَخرج ملفٌّ نهائيٌّ واحد. '
      + '**وعالمُ الاستوري بورد:** تَبني قصّةً بصريّةً مشهداً مشهداً، لكلِّ مشهدٍ لوحتُه ووصفُه.',
    bodyEn: '**Montage:** gather your images, clips, audio and music on a timeline, arrange '
      + 'them and set their timing and transitions, and one finished file comes out. '
      + '**The storyboard world:** build a visual story scene by scene, each with its own '
      + 'board and description.',
    valueAr: 'ليسا مرحلتَين في مسارٍ واحد — بل طريقانِ تَختار بينهما حسبَ ما تَصنع.',
    valueEn: 'Not two stages of one path — two roads, and you choose by what you are making.',
  },
  {
    id: 'vault',
    href: '/sovereign-vault-palace',
    nameAr: 'الخزانة السيادية',
    nameEn: 'The Sovereign Vault',
    roleAr: 'مستودعُ ما تَملك',
    roleEn: 'The store of what you own',
    bodyAr: 'كلُّ أصلٍ صنعتَه أو رفعتَه يُحفَظ هنا بنَسَبه: ما أنتجه، ومتى، وممّ اشتُقّ. '
      + 'ومنها تَأخذ الحُجراتُ الأخرى ما تَحتاجه، فلا تَرفع الشيءَ نفسَه مرّتين.',
    bodyEn: 'Every asset you made or uploaded is kept here with its lineage: what produced '
      + 'it, when, and what it came from. The other chambers draw what they need from it, so '
      + 'you never upload the same thing twice.',
    valueAr: 'عملُك لا يَضيع في أداةٍ تَستبدلها، ولا يُعاد صنعُه لأنّك لا تَجده.',
    valueEn: 'Your work is not lost inside a tool you replace, and not remade because you '
      + 'cannot find it.',
  },
  {
    id: 'makman',
    href: '/makman-al-ghayah',
    nameAr: 'مكمن الغاية',
    nameEn: 'Makman Al-Ghayah',
    roleAr: 'حيثُ يَنتهي العمل',
    roleEn: 'Where the work lands',
    // The Founder, §4: «Google Drive مسار مثبت، ولا يجوز الخلط بينه وبين
    // النشر الاجتماعي». MEASURED: `/api/cloud/google/start` and `/callback`
    // exist, GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set on the server.
    // Social destinations are governed by separate declarations and are not
    // named on this page at all — neither promised nor reported on.
    bodyAr: 'تَربط حسابك على جوجل درايف، وتُرسل عملك النهائيَّ إليه بضغطةٍ واحدة — '
      + 'منظَّماً بغايته لا مبعثراً في مجلّدٍ. وتُحدّد غايةً لكلِّ عملٍ وتَتابع ما بلَغَته.',
    bodyEn: 'Connect your Google Drive and send your finished work to it in one press — '
      + 'organised by its purpose, not scattered in a folder. Set a goal for each work and '
      + 'follow what it reached.',
    valueAr: 'فيَنتهي العملُ في مكانٍ تَملكه أنت، لا في جهازٍ قد تُغيّره.',
    valueEn: 'So the work ends somewhere you own, not on a device you might replace.',
  },
];

export const routeForChamber = (id: string): string =>
  LANDING_CHAMBERS.find((c) => c.id === id)?.href ?? '/signup';

/* ══ THE SHOWCASE ═════════════════════════════════════════════════════════ */

/**
 * The Founder, §5: «إذا لم تتوفر أصول مصرح بعرضها، فلا تختلق أعمالاً ولا
 * تنسب رسومات إلى إنتاج حقيقي. استخدم عرضاً توضيحياً واضح الصفة».
 *
 * MEASURED 2026-11-20: this Empire holds NO production imagery it may show.
 * `public/generated-assets/` contains one deployment-verification screenshot.
 * Everything else is in Creators' Vaults — theirs, not ours, and publishing
 * one would cross a line the Founder has not opened.
 *
 * So the showcase stays illustrative and SAYS SO, and the craft went into
 * making the illustration beautiful rather than into making it look like a
 * photograph of work we do not have.
 */
export const LANDING_SHOWCASE: readonly LandingShowcaseTile[] = [
  {
    id: 'still', kind: 'image',
    labelAr: 'صورةٌ من وصفٍ تَكتبه', labelEn: 'An image from a description you write',
    chamberAr: 'القيامة', chamberEn: 'Qiyamah',
  },
  {
    id: 'animate', kind: 'motion',
    labelAr: 'صورةٌ ساكنةٌ تَدِبُّ فيها الحركة', labelEn: 'A still that comes to motion',
    chamberAr: 'القيامة', chamberEn: 'Qiyamah',
  },
  {
    id: 'speech', kind: 'voice',
    labelAr: 'نصٌّ يُنطَق بصوتٍ تَختاره', labelEn: 'Text spoken in a voice you choose',
    chamberAr: 'الخزانة', chamberEn: 'The Vault',
  },
  {
    id: 'assembly', kind: 'film',
    labelAr: 'مشاهدُ تُركَّب عملاً واحداً', labelEn: 'Scenes assembled into one work',
    chamberAr: 'رأس الأمر', chamberEn: 'Ras Al Amr',
  },
];

/* ══ THE JOURNEY ══════════════════════════════════════════════════════════ */

export const LANDING_JOURNEY: readonly LandingJourneyStep[] = [
  {
    id: 'ground', ordinal: 1,
    titleAr: 'ابدأ من أرضٍ صُلبة',
    titleEn: 'Begin on solid ground',
    bodyAr: 'اطرح سؤالك، فيُبحَث لك في القرآن وكتبِ الحديثِ ومصادرَ حيّة، ويُعرَض عليك '
      + 'ما وُجِد بدليله. أو ابدأ بفكرتك وحدَها — فالاختيارُ اختيارُك.',
    bodyEn: 'Ask your question and the Qur’an, the hadith collections and live sources '
      + 'are searched for you, and what was found is shown with its evidence. Or begin with '
      + 'your idea alone — the choice is yours.',
    chamberAr: 'الحُجّة الدامغة', chamberEn: 'Hujjah al-Damigha',
  },
  {
    id: 'make', ordinal: 2,
    titleAr: 'اصنع المادّة',
    titleEn: 'Make the material',
    bodyAr: 'صورةٌ من وصف، وتعديلٌ على أصلٍ تَملكه، وتحريكُ صورةٍ ساكنة، ورفعُ دقّة، '
      + 'وإزالةُ خلفيّة، وصوتٌ يَنطق بنصّك. وسعرُ كلِّ عملٍ مكتوبٌ قبل أن تَضغط.',
    bodyEn: 'An image from a description, an edit on an asset you own, a still brought to '
      + 'motion, an upscale, a background removed, a voice that speaks your text. Every act '
      + 'states its price before you press.',
    chamberAr: 'القيامة', chamberEn: 'Qiyamah',
  },
  {
    id: 'finish', ordinal: 3,
    titleAr: 'ركّب وسلّم',
    titleEn: 'Assemble and deliver',
    bodyAr: 'تَجمع ما صنعتَه من خزانتك على خطِّ زمن، وتَضبط توقيتَه، فيَخرج عملٌ نهائيّ. '
      + 'ثمّ تُرسله إلى جوجل درايف بضغطةٍ واحدة، منظَّماً بغايته.',
    bodyEn: 'Gather what you made from your Vault onto a timeline, set its timing, and a '
      + 'finished work comes out. Then send it to your Google Drive in one press, organised '
      + 'by its purpose.',
    chamberAr: 'رأس الأمر · الخزانة · مكمن الغاية',
    chamberEn: 'Ras Al Amr · The Vault · Makman Al-Ghayah',
  },
];

/* ══ THE CAPABILITIES ═════════════════════════════════════════════════════ */

/**
 * Each `door` is a route that exists in the serving release AND that a
 * Creator can pass today. A capability behind a product nobody can buy is
 * absent from this list entirely — see the header of this file.
 */
export const LANDING_CAPABILITIES: readonly LandingCapability[] = [
  {
    id: 'visual',
    titleAr: 'استوديو الصورة',
    titleEn: 'The image studio',
    bodyAr: 'أنشئ صورةً من وصفٍ تَكتبه، وعدّل أصلاً تَملكه، وارفع دقّته، وأزل خلفيّته، '
      + 'أو أنطِقه وزامِن شفاهه.',
    bodyEn: 'Create an image from a description, edit an asset you own, raise its '
      + 'resolution, remove its background, or make it speak with its lips in time.',
    groundAr: 'أربعُ عمليّاتٍ موصولةٌ بمزوّدها: إزالةُ الخلفيّة، ومزامنةُ الشفاه، '
      + 'وتبديلُ الوجه، وإنطاقُ الصورة.',
    groundEn: 'Four operations wired to their provider: background removal, lip sync, face '
      + 'swap and talking photo.',
    door: 'app/api/qiyamah/generate/route.ts',
  },
  {
    id: 'knowledge',
    titleAr: 'بحثٌ مُسنَد',
    titleEn: 'Sourced research',
    bodyAr: 'ابحث في القرآن وفي تسعةٍ من أمّهاتِ كتبِ الحديثِ وفي مصادرَ حيّة، '
      + 'واقرأ ما وُجِد بنصّه ودرجته ومَن رواه.',
    bodyEn: 'Search the Qur’an, nine of the major hadith collections and live sources, '
      + 'and read what was found with its text, its grading and who narrated it.',
    groundAr: 'والدرجةُ تُسافر مع النصّ — فلا تَبني على روايةٍ وأنت لا تَعرف مرتبتَها.',
    groundEn: 'The grading travels with the text, so you never build on a narration without '
      + 'knowing its standing.',
    door: 'app/api/sovereign/entry/creator-goal/[goalId]/knowledge-investigation/route.ts',
  },
  {
    id: 'voice',
    titleAr: 'صوتٌ يَنطق بعملك',
    titleEn: 'A voice for your work',
    bodyAr: 'حوّل نصّك إلى نطقٍ مسموع، أو استعمل هويّةً صوتيّةً استنسختَها من صوتٍ '
      + 'تَملك إذنه.',
    bodyEn: 'Turn your text into audible speech, or use a voice identity cloned from a '
      + 'voice you have permission to use.',
    groundAr: 'ولا يُستنسَخ صوتُ أحدٍ بغير إذنه — وهذا شرطٌ، لا تنبيه.',
    groundEn: 'No one’s voice is cloned without their permission — a condition, not a '
      + 'notice.',
    door: 'app/api/vault/assets/generate-speech/route.ts',
  },
  {
    id: 'production',
    titleAr: 'مونتاجٌ وتسليم',
    titleEn: 'Montage and delivery',
    bodyAr: 'رتّب صورك ومقاطعك وصوتك على خطِّ زمن، واضبط توقيتها وانتقالاتها، '
      + 'فيَخرج ملفٌّ نهائيٌّ تُرسله إلى جوجل درايف.',
    bodyEn: 'Arrange your images, clips and audio on a timeline, set their timing and '
      + 'transitions, and a finished file comes out — ready to send to your Google Drive.',
    groundAr: 'ولك طريقٌ ثانٍ إن شئت: عالَمُ الاستوري بورد، تَبني فيه قصّتك مشهداً مشهداً.',
    groundEn: 'And a second road if you want it: the storyboard world, where you build your '
      + 'story scene by scene.',
    door: 'app/api/ras-amr/render/route.ts',
  },
];

/* ══ THE KNOWLEDGE FOUNDATION ═════════════════════════════════════════════ */

/**
 * Counted in the production database on 2026-11-20 with
 * `SELECT collection_ar, COUNT(*) … GROUP BY collection_ar`. Named rather
 * than summed: «تسعةُ كتبٍ» said out loud persuades an Arabic reader that a
 * bare 36,064 cannot, and it is checkable in a way a total is not.
 */
export const LANDING_PROOF: readonly LandingProofPoint[] = [
  { id: 'bukhari', figure: '٧٬٥٨٠', labelAr: 'صحيح البخاري',    labelEn: 'Sahih al-Bukhari' },
  { id: 'muslim',  figure: '٧٬٣٦٠', labelAr: 'صحيح مسلم',       labelEn: 'Sahih Muslim' },
  { id: 'nasai',   figure: '٥٬٦٧٩', labelAr: 'سنن النسائي',     labelEn: 'Sunan an-Nasa’i' },
  { id: 'dawud',   figure: '٥٬٢٧٢', labelAr: 'سنن أبي داود',    labelEn: 'Sunan Abi Dawud' },
  { id: 'majah',   figure: '٤٬٣٣٨', labelAr: 'سنن ابن ماجه',    labelEn: 'Sunan Ibn Majah' },
  { id: 'tirmidh', figure: '٣٬٩٢٤', labelAr: 'جامع الترمذي',    labelEn: 'Jami’ at-Tirmidhi' },
  { id: 'malik',   figure: '١٬٨٢٩', labelAr: 'موطأ الإمام مالك', labelEn: 'Muwatta Malik' },
  { id: 'nawawi',  figure: '٨٢',    labelAr: 'الأربعون النووية والقدسية', labelEn: 'The two Forty collections' },
];

/** The one total, stated once, with what it is made of standing beside it. */
export const LANDING_PROOF_TOTAL = {
  figureAr: '٣٦٬٠٦٤',
  figureEn: '36,064',
  labelAr: 'روايةً، كلٌّ منها بدرجتها',
  labelEn: 'narrations, each with its grading',
} as const;

/* ══ THE QUESTIONS ════════════════════════════════════════════════════════ */

export const LANDING_QUESTIONS: readonly LandingQuestion[] = [
  {
    id: 'what',
    questionAr: 'ما هذه المنصّة بالضبط؟',
    questionEn: 'What is this platform, exactly?',
    answerAr: 'نظامُ تشغيلٍ إبداعيٌّ لصنّاع المحتوى: تَبحث فيه عن مادّتك، وتَصنع منها صوراً '
      + 'وأصواتاً، وتُركّبها عملاً نهائيّاً، وتَحفظها في خزانتك، ثمّ تُسلّمها. '
      + 'خمسُ حُجراتٍ لخمسِ مراحل، لا أداةٌ واحدةٌ تَفعل كلَّ شيء.',
    answerEn: 'A creative operating system for content makers: you research your material, '
      + 'make images and audio from it, assemble a finished work, keep it in your Vault, '
      + 'then deliver it. Five chambers for five stages, not one tool that does everything.',
  },
  {
    id: 'balance',
    questionAr: 'هل الرصيدُ اشتراكٌ شهريّ؟',
    questionEn: 'Is the balance a monthly subscription?',
    // VERIFIED against the approved source before this answer was written:
    // SOVEREIGN_PACKAGES declares `validity: 'does-not-expire'` and
    // `recurrence: 'one-time'`, and /api/billing/checkout states in its own
    // header that it REPLACES the old subscription checkout and sells packs.
    answerAr: 'لا. تَشتري رصيداً مرّةً واحدة، ويَبقى لك بلا موعدِ انتهاء. '
      + 'لا تجديدَ تلقائيٌّ ولا شهرٌ يَنقضي فيَذهب ما لم تَستعمله.',
    answerEn: 'No. You buy balance once and it stays yours with no expiry date. There is no '
      + 'automatic renewal and no month that ends and takes what you did not use.',
  },
  {
    id: 'cost',
    questionAr: 'كيف أعرفُ كم سيُخصَم منّي؟',
    questionEn: 'How do I know what will be deducted?',
    answerAr: 'سعرُ كلِّ عملٍ مكتوبٌ قبل أن تَضغط. وما يُحتسَب بمدّتك أو بطولِ مقطعك '
      + 'يَقول ذلك صراحةً بدل أن يَعرض رقماً ثابتاً يُخالف ما سيُخصَم.',
    answerEn: 'Every act states its price before you press. An act billed by your own '
      + 'duration or clip length says so plainly, instead of showing a flat figure that '
      + 'differs from what is actually deducted.',
  },
  {
    id: 'delivery',
    questionAr: 'أينَ يَذهب عملي حين أنتهي منه؟',
    questionEn: 'Where does my work go when I finish it?',
    answerAr: 'يَبقى في خزانتك بنَسَبه الكامل، وتُرسله إلى حسابك على جوجل درايف بضغطةٍ '
      + 'واحدة، منظَّماً بغايته لا مبعثراً في مجلّد. وهو ملفُّك تُنزّله متى شئت.',
    answerEn: 'It stays in your Vault with its full lineage, and you send it to your Google '
      + 'Drive in one press — organised by its purpose, not scattered in a folder. It is '
      + 'your file, to download whenever you want.',
  },
  {
    id: 'ownership',
    questionAr: 'لمن يَعود ما أُنتجه؟',
    questionEn: 'Who owns what I produce?',
    answerAr: 'لك. وكلُّ أصلٍ يُحفَظ في خزانتك بنَسَبه: ما أنتجه، ومتى، وممّ اشتُقّ — '
      + 'فلا يَضيع عملُك في أداةٍ تَستبدلها، ولا يُعاد صنعُه لأنّك لا تَجده.',
    answerEn: 'You do. Every asset is kept in your Vault with its lineage: what produced it, '
      + 'when, and what it came from — so your work is not lost inside a tool you replace, '
      + 'and not remade because you cannot find it.',
  },
  {
    id: 'forbidden',
    questionAr: 'ما الذي لا يُسمَح به هنا؟',
    questionEn: 'What is not allowed here?',
    answerAr: 'لا إنتاجَ لمادّةٍ جنسيّةٍ أو حميميّةٍ لأشخاصٍ حقيقيّين، ولا إنتاجَ شبيهِ شخصٍ '
      + 'بغير إذنه، ولا استنساخَ صوتٍ بغير إذن صاحبه. وهذا شرطُ استعمالٍ يُنفَّذ، لا بندٌ يُقرأ.',
    answerEn: 'No sexual or intimate material of real people, no likeness of a person '
      + 'without their permission, and no voice cloned without its owner’s consent. '
      + 'This is an enforced condition of use, not a clause to be read.',
  },
];

/* ══ THE FOOTER ═══════════════════════════════════════════════════════════ */

export const LANDING_FOOTER: readonly LandingFooterColumn[] = [
  {
    id: 'platform',
    titleAr: 'المنصّة',
    titleEn: 'The platform',
    links: [
      { labelAr: 'رحلة المبدع', labelEn: 'The journey',  href: '#lp-journey' },
      { labelAr: 'الحُجرات',    labelEn: 'The chambers', href: '#lp-chambers' },
      { labelAr: 'الأدوات',     labelEn: 'Capabilities', href: '#lp-capabilities' },
      { labelAr: 'الباقات',     labelEn: 'Packages',     href: '#lp-packages' },
    ],
  },
  {
    id: 'chambers',
    titleAr: 'الحُجرات',
    titleEn: 'The chambers',
    links: [
      { labelAr: 'الحُجّة الدامغة',  labelEn: 'Hujjah al-Damigha',   href: '/hujjah-al-damighah' },
      { labelAr: 'القيامة',          labelEn: 'Qiyamah',             href: '/qiyamah-chamber' },
      { labelAr: 'رأس الأمر',        labelEn: 'Ras Al Amr',          href: '/ras-amr' },
      { labelAr: 'الخزانة السيادية', labelEn: 'The Sovereign Vault', href: '/sovereign-vault-palace' },
      { labelAr: 'مكمن الغاية',      labelEn: 'Makman Al-Ghayah',    href: '/makman-al-ghayah' },
    ],
  },
  {
    id: 'account',
    titleAr: 'حسابك',
    titleEn: 'Your account',
    links: [
      { labelAr: 'إنشاء حساب',      labelEn: 'Create an account', href: '/signup' },
      { labelAr: 'تسجيل الدخول',    labelEn: 'Sign in',           href: '/login' },
      { labelAr: 'رصيدك',           labelEn: 'Your balance',      href: '/sovereign-balance' },
      { labelAr: 'الأسئلة الشائعة', labelEn: 'Questions',         href: '#lp-questions' },
    ],
  },
];
