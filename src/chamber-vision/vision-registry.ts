/**
 * AZMA OS — CHAMBER VISION
 * The Imperial Vision Document Registry
 *
 * IMPERIAL VISION DOCUMENTS (2026-07-23): every field is grounded in
 * already-established, real constitutional fact — src/chamber-identity/'s
 * V1/V2 profiles, the Package I-III reconstruction work, and (for
 * Ras Al Amr's Production Modes specifically) the real 'smart'/'manual'
 * directingMode state and mode-switcher UI already in app/ras-amr/page.tsx.
 * Nothing here contradicts those records; this registry reframes the same
 * grounded facts through a philosophical register instead of a factual
 * one — "how I think," not "what I am."
 */

import type { ChamberId } from '@/src/chamber-identity';
import type { ImperialVisionDocument } from './types';

export const IMPERIAL_VISION_DOCUMENTS: Record<ChamberId, ImperialVisionDocument> = {
  'sovereign-vault-palace': {
    chamberId: 'sovereign-vault-palace',
    philosophy: 'Nothing valuable should ever depend on being remembered correctly the first time. The Palace exists to make forgetting safe.',
    constitutionalResponsibility: 'To guard is not to control. The Palace holds what a Creator has made without claiming any right to change, judge, or repurpose it — safekeeping is a duty of custody, never of ownership.',
    personality: 'Unhurried and exact. The Palace does not rush a Creator through a decision about their own work, and it does not soften an uncomfortable truth about what is or isn\'t actually saved.',
    creatorExperience: 'A Creator should feel the specific calm of a locked door, not the vague comfort of assuming something is fine. Today that calm is honest only within a single browser session — the Palace does not pretend otherwise.',
    productionModes: null,
    entryExitTransformation: 'A Creator enters uncertain whether something is safe, and leaves either reassured with evidence, or told plainly that it is not yet durable — never leaves merely assuming.',
    uniqueValue: 'No other Chamber keeps anything. Creation, direction, investigation, and distribution all eventually need somewhere that simply holds — the Palace is the only Chamber whose entire purpose is custody, not action.',
    philosophyAr: 'لا شيء ذو قيمة يجب أن يعتمد على التذكر الصحيح أول مرة — القصر السيادي يجعل النسيان آمناً.',
  },

  'hujjah-al-damighah': {
    chamberId: 'hujjah-al-damighah',
    philosophy: 'A conclusion reached too quickly is not a conclusion — it\'s a guess wearing the clothes of one. Hujjah exists to slow that moment down until it\'s earned.',
    constitutionalResponsibility: 'To reason is to be answerable to evidence before being answerable to the Creator\'s preference. Hujjah\'s responsibility is to the argument\'s integrity, not to whichever verdict is more convenient.',
    personality: 'Patient and unflinching. Hujjah will not tell a Creator what they want to hear if the evidence says otherwise, and it will not manufacture certainty where the evidence runs out.',
    creatorExperience: 'A Creator arrives with a claim and leaves with a tested one — the experience is deliberately less comfortable than confirmation, and more valuable than it.',
    productionModes: null,
    entryExitTransformation: 'The Creator enters holding a claim; they leave holding either a verdict they can defend, or the honest knowledge that the evidence isn\'t there yet — the Chamber never lets them leave still merely assuming.',
    uniqueValue: 'Every other Chamber acts on the Creator\'s intent. Hujjah is the only one whose job is to question it first — the Empire\'s one Chamber built for doubt, not production.',
    philosophyAr: 'الاستنتاج الذي جاء بسرعة ليس استنتاجاً — إنه تخمين يرتدي ثياب اليقين. حجة الدامغة وُجدت لتُبطئ تلك اللحظة حتى تُكسَب.',
  },

  'qiyamah-chamber': {
    chamberId: 'qiyamah-chamber',
    philosophy: 'Every real thing began as something imagined. Qiyamah does not judge an idea before it exists — it exists to give the idea a chance to become visible.',
    constitutionalResponsibility: 'To create is to serve someone else\'s intention, not to originate one. Qiyamah\'s responsibility ends at giving honest form to what the Creator described — it does not decide what deserved to be imagined.',
    personality: 'Quick and participatory. Qiyamah does not make a Creator wait through ceremony before it acts, and it does not treat a first attempt as final.',
    creatorExperience: 'The Creator should feel like an author working with a fast, willing instrument — describe, see, adjust, see again — not like someone submitting a request and waiting on a verdict.',
    productionModes: null,
    entryExitTransformation: 'A Creator enters with only a description in their head and leaves with a real, saved image outside it — the one Chamber whose entire purpose is that specific crossing, from imagined to visible.',
    uniqueValue: 'No other Chamber originates anything new. Palace keeps, Hujjah tests, Ras Al Amr directs, Makman distributes — Qiyamah is the only Chamber that makes something exist that didn\'t before.',
    philosophyAr: 'كل شيء حقيقي بدأ بخيال. القيامة لا تحكم على الفكرة قبل أن توجد — إنها وُجدت لتمنح الفكرة فرصة أن تصبح مرئية.',
  },

  'ras-amr': {
    chamberId: 'ras-amr',
    philosophy: 'A collection of good material is not yet a production — someone has to decide what it becomes. Ras Al Amr exists to give that decision a place to happen with authority, not by accident.',
    constitutionalResponsibility: 'To direct is to take responsibility for the whole, not just the parts — Ras Al Amr answers for how the pieces fit together, never for where any individual piece came from.',
    personality: 'Deliberate and unambiguous. A Chamber built for consequential, infrequent decisions rather than fast iteration — closer to the Palace\'s weight than to Qiyamah\'s speed.',
    creatorExperience: 'Today: the feeling of sitting at a real director\'s console — arranging, previewing, choosing tools — without yet the feeling of finishing. The console is real; the delivery is not, yet.',
    // RETUNED, RAS AL AMR CHAMBER RECONSTRUCTION (2026-07-25): reflects the
    // Council's final constitutional formulation, ratified after this text
    // was first authored — Automatic Director is delegated directing
    // AUTHORITY, never automation/a workflow engine/a scripted pipeline;
    // it may decide HOW to direct, never redefine WHAT the Creator intends;
    // the Creator delegates, never transfers ownership, and may revoke at
    // any time. See project memory's project_imperial_chamber_unification_program
    // for the full ruling this description now embodies.
    productionModes: [
      {
        name: 'Automatic Director (الإخراج الذكي الآلي)',
        description: 'A delegated directing authority, not an automation shortcut. When the Creator explicitly enables it, the Empire temporarily assumes the constitutional role of Director and makes genuine editorial decisions — which tools apply, how a scene is graded, how footage is synced — always within the Creator\'s declared vision, goals, and constraints. It may decide how to direct; it may never redefine what the Creator intends to create. The work, the vision, and the authorship remain the Creator\'s; the delegation may be limited or revoked at any time.',
      },
      {
        name: 'Manual Director (الإخراج اليدوي المحكم)',
        description: 'The Creator operates precision tools directly — pixel grading, chroma forging, the final cinematic render — the Chamber provides the instrument, the Creator provides every judgment, delegating nothing.',
      },
    ],
    entryExitTransformation: 'Today: a Creator enters with gathered material and leaves having rehearsed a direction for it — not yet having delivered one. The transformation this Chamber is meant to complete (material in, locked production out) is real in its constitution but not yet in its runtime.',
    uniqueValue: 'No other Chamber assembles. Qiyamah makes single pieces, the Palace keeps them, Makman distributes a finished whole — Ras Al Amr is the only Chamber whose job is to turn many pieces into one authored production.',
    philosophyAr: 'مجموعة من المواد الجيدة ليست إنتاجاً بعد — شخص يجب أن يقرر ما ستصبح. رأس الأمر وُجد ليمنح ذلك القرار مكاناً يحدث فيه بسلطة، لا بالصدفة.',
  },

  'makman-al-ghayah': {
    chamberId: 'makman-al-ghayah',
    philosophy: 'A finished work that no one encounters has not yet finished its purpose. Makman exists because making something is not the same as it mattering to anyone.',
    constitutionalResponsibility: 'To strategize is to serve the work\'s reach, not to alter the work itself — Makman\'s responsibility is distribution and access, never editorial judgment over what was made.',
    personality: 'Exploratory and pattern-minded. The one Chamber whose posture is open possibility rather than a single committed action.',
    creatorExperience: 'Today: not yet a real experience — the Chamber\'s real distribution capabilities exist behind an API the live page cannot reach, so a Creator who enters finds a Chamber that cannot yet do what it constitutionally exists to do.',
    productionModes: null,
    entryExitTransformation: 'Constitutionally: a Creator enters with a finished production and leaves knowing it has reached, or begun reaching, an audience. Today: neither half of that crossing is real yet from inside the Chamber itself.',
    uniqueValue: 'No other Chamber looks outward. Every other Chamber\'s work ends at the Creator; Makman is the only Chamber whose entire purpose begins where the Creator\'s own use of the work ends.',
    philosophyAr: 'عمل اكتمل لكن لم يلتقِه أحد لم تنتهِ غايته بعد. مكمن الغاية وُجد لأن الإنتاج وحده لا يكفي — الوصول هو الجزء الذي يُنسى.',
  },
};
