/**
 * AZMA OS — THE FIVE CHAMBERS, AS A STRANGER IS TOLD ABOUT THEM
 *
 * ─── THE ORDER ──────────────────────────────────────────────────────────────
 *
 *   Knowledge → creation → production → keeping → distribution. Ruled by the
 *   Chief Architect as the order a VISITOR is walked through, and it changes
 *   nothing about where the chambers live or how the platform navigates.
 *
 * ─── WHY EVERY CARD CARRIES ITS OWN LIMIT ───────────────────────────────────
 *
 *   The Empire's standing law is that a capability which is not ready says so
 *   rather than letting someone believe it works. An introduction is the first
 *   place that law is tested, because it is the first thing anybody reads.
 *
 *   So a chamber's limit sits inside its own card, beside its promise — not in
 *   a footnote under five cards, where the promise is what gets read and the
 *   qualification is what gets skipped.
 *
 *   Each state below was MEASURED on 2026-10-14, not assumed:
 *
 *     الحُجّة    — 36,064 narrations and 78,130 library works in the production
 *                  database, beside the Qur'an.
 *     القيامة    — ten acts; the live estimator answered all eleven priced
 *                  steps with a figure or a stated basis on the deployed release.
 *     الخزانة    — real assets with lineage, dimensions and dates.
 *     رأس الأمر  — both paths produce; of its eight ministries, three are
 *                  complete and the rest are not built.
 *     مكمن الغاية — the pipeline is whole and proven, but a destination's
 *                  eligibility is DECLARED in the environment and defaults to
 *                  closed, and none is declared open on the server today.
 *
 *   What is NOT claimed anywhere below: any encryption, any password
 *   recovery promise, any access-control guarantee for the Vault. None of
 *   those has been verified, and an unverified security promise is worse than
 *   silence.
 */

import type { GatewayChamber } from './types';

export const GATEWAY_CHAMBERS: readonly GatewayChamber[] = [
  {
    id: 'hujjah',
    nameAr: 'الحُجّة الدامغة',
    nameEn: 'HUJJAH AL-DAMIGHA',
    roleAr: 'البحثُ وتهيئةُ المادّة',
    roleEn: 'Research and preparation',
    bodyAr: 'تَبحث في مصادرَ موثوقةٍ ومكتبةٍ واسعة، وتَعرض عليك ما وجدته بأدلّته. '
      + 'تَختار منه ما يَنفعك، فتُهيّئ منه مطالبةً إبداعيّةً جاهزةً للتنفيذ. '
      + 'فتَبدأ من معرفةٍ لها مصدرٌ تَعرفه، لا من صفحةٍ بيضاء.',
    bodyEn: 'It searches trusted sources and a large library, and shows you what it '
      + 'found with its evidence. You choose what serves you, and it prepares a '
      + 'creative prompt from that. You begin from knowledge with a source you '
      + 'can name, not from a blank page.',
    relationAr: 'هي تَبحث وتُهيّئ. والمطالبةُ تُوجَّه بعدها إلى القيامةِ للتوليد، '
      + 'أو إلى رأسِ الأمر لبناءِ قصّةٍ مصوّرة. ولا تُولّد هي شيئاً بنفسها.',
    relationEn: 'It researches and prepares. The prompt then goes to QIYAMAH to be '
      + 'generated, or to RAS AL AMR to become a visual story. It generates nothing itself.',
    state: 'ready',
    limitAr: null,
    limitEn: null,
  },
  {
    id: 'qiyamah',
    nameAr: 'القيامة',
    nameEn: 'QIYAMAH',
    roleAr: 'مصنعُ الخلق',
    roleEn: 'The creation factory',
    bodyAr: 'هنا تُصنَع المادّة: صورةٌ من فكرة، ومقطعٌ من فكرة، وتعديلٌ على أصلٍ تَملكه، '
      + 'وتحريكُ صورةٍ ساكنة، ورفعُ دقّة، وإزالةُ خلفيّة، وإنطاقُ صورة، ومزامنةُ شفاه، '
      + 'وتبديلُ وجه. وسعرُ كلِّ عملٍ مكتوبٌ قبل أن تَضغط.',
    bodyEn: 'This is where material is made: an image from an idea, a clip from an idea, '
      + 'an edit on an asset you own, a still brought to motion, an upscale, a background '
      + 'removed, a photo made to speak, lips synchronised, a face replaced. '
      + 'Every act states its price before you press.',
    relationAr: 'تَستقبل مطالبةً من الحُجّة، وتُودِع ناتجَها في الخزانةِ بعد قبولك له.',
    relationEn: 'It receives a prompt from Hujjah and deposits its output in the Vault '
      + 'once you have accepted it.',
    state: 'ready',
    limitAr: 'وما يَتبع مدّتَك أو مقطعَك يَقول ذلك بدل أن يَعرض رقماً ثابتاً.',
    limitEn: 'An act billed by your own duration or clip says so, instead of showing a flat figure.',
  },
  {
    id: 'ras-amr',
    nameAr: 'رأس الأمر',
    nameEn: 'RAS AL AMR',
    roleAr: 'حجرةُ الإخراجِ والإنتاج',
    roleEn: 'Direction and production',
    bodyAr: 'فيها طريقان مختلفان، لا مرحلتانِ في مسارٍ واحد. المونتاج: تَجمع صوراً ومقاطعَ '
      + 'وصوتاً وموسيقى، وتُرتّبها وتَضبط توقيتَها، فيَخرج عملٌ نهائيّ. وعالمُ الاستوري بورد: '
      + 'تَبني قصّةً بصريّةً مشهداً مشهداً بأصولٍ متماسكة.',
    bodyEn: 'It holds two distinct paths, not two stages of one. Montage: you gather images, '
      + 'clips, audio and music, arrange them and set their timing, and a finished work comes out. '
      + 'And the storyboard world: you build a visual story scene by scene with coherent assets.',
    relationAr: 'تَأخذ أصولَها من الخزانة، وتُسلّم عملَها النهائيَّ إلى مكمنِ الغاية للنشر. '
      + 'والقصّةُ المصوَّرةُ قد تَبدأ من الحُجّة.',
    relationEn: 'It takes its assets from the Vault and hands its finished work to Makman '
      + 'Al-Ghayah for distribution. A storyboard may begin in Hujjah.',
    state: 'partial',
    limitAr: 'الطريقانِ يَعملانِ ويُنتجان. ومن وزاراتِها الثماني ثلاثٌ مكتملة، والبقيّةُ لم تُبنَ بعد.',
    limitEn: 'Both paths work and produce. Of its eight ministries, three are complete and the rest are not yet built.',
  },
  {
    id: 'vault',
    nameAr: 'الخزانة السيادية',
    nameEn: 'THE SOVEREIGN VAULT',
    roleAr: 'مستودعُ ما تَملك',
    roleEn: 'The store of what you own',
    bodyAr: 'كلُّ أصلٍ صنعتَه أو رفعتَه يُحفَظ هنا بنَسَبه: ما أنتجه، ومتى، وممّ اشتُقّ. '
      + 'ومنها تَأخذ الحُجراتُ الأخرى ما تَحتاجه. فعملُك لا يَضيع في أداةٍ تَستبدلها، '
      + 'ولا يُعاد صنعُه لأنّك لا تَجده.',
    bodyEn: 'Every asset you made or uploaded is kept here with its lineage: what produced it, '
      + 'when, and what it came from. The other chambers draw what they need from it. Your work '
      + 'is not lost inside a tool you replace, and not remade because you cannot find it.',
    relationAr: 'هي المرجعُ الوحيدُ للأصول: القيامةُ تُودِع فيها، ورأسُ الأمر ومكمنُ الغاية يَقرآن منها.',
    relationEn: 'It is the one reference for assets: Qiyamah deposits into it, and Ras Al Amr '
      + 'and Makman Al-Ghayah read from it.',
    state: 'ready',
    limitAr: null,
    limitEn: null,
  },
  {
    id: 'makman',
    nameAr: 'مكمن الغاية',
    nameEn: 'MAKMAN AL-GHAYAH',
    roleAr: 'مقرُّ الإدارةِ والتوزيع',
    roleEn: 'Administration and distribution',
    bodyAr: 'تَربط حساباتِك، وتَختار أينَ يُنشَر عملُك، وتُقرّر متى يُنشَر — الآن أو في موعدٍ '
      + 'تُحدّده. فيَنتهي العملُ عند جمهوره لا عند مجلّدٍ في جهازك.',
    bodyEn: 'It connects your accounts, chooses where your work is sent, and decides when it is '
      + 'published — now, or at a time you set. So the work ends with its audience, not in a '
      + 'folder on your device.',
    relationAr: 'تَأخذ العملَ الجاهزَ من رأسِ الأمر أو من الخزانة. ولا تُعدّل ولا تُركّب — '
      + 'التركيبُ عملُ رأسِ الأمر، والنشرُ عملُها هي.',
    relationEn: 'It takes finished work from Ras Al Amr or from the Vault. It does not edit or '
      + 'assemble — assembly is Ras Al Amr’s work, and publishing is hers.',
    state: 'closed',
    limitAr: 'المسارُ مبنيٌّ ومُثبَت. وكلُّ وجهةِ نشرٍ تُفتَح بإعلانٍ صريحٍ من الإمبراطوريّة، '
      + 'ولا وجهةَ مفتوحةٌ اليوم — فلن يُعرَض عليك بابٌ يُردّ.',
    limitEn: 'The pipeline is built and proven. Every destination is opened by an explicit '
      + 'declaration, and none is open today — so you will not be offered a door that refuses you.',
  },
];
