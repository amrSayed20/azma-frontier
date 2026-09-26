import type { ChamberId } from '@/src/chamber-identity';
import type { ChamberTruth } from './types';

/**
 * AZMA OS — CHAMBER TRUTH REGISTRY
 *
 * Every entry below was measured against the repository by reading the
 * handler and the verbs it exports — not by reading a page. First survey
 * 2026-09-21; a second survey the same day, ordered by the Sovereign Journey
 * ruling, walked 14 chamber-domain boundaries the first had not and
 * declared the thirteen that are Creator capabilities.
 *
 * A `Record<ChamberId, …>` on purpose: the compiler refuses the file if a
 * Chamber is missing, so a sixth Chamber cannot appear and a fifth cannot
 * quietly vanish.
 */
export const CHAMBER_TRUTH = {
  // ── الحُجّة الدامغة ───────────────────────────────────────────────────────
  //
  // No API routes at all. Its entire surface is three Server Actions, which a
  // route-only survey would have reported as an empty Chamber.
  'hujjah-al-damighah': {
    chamberId: 'hujjah-al-damighah',
    primaryCapabilityId: 'run-investigation',
    capabilities: [
      {
        id: 'run-investigation',
        performs: 'Runs a sovereign knowledge investigation and returns evidence with its verdict.',
        performsAr:
          'تُجري تحقيقاً سياديّاً في سؤالك، وتردّ الأدلّة مرتّبةً بحُجّيتها مع حكمها.',
        boundary: { kind: 'action', at: 'app/hujjah-al-damighah/actions.ts#runInvestigation' },
        requiresExistingAsset: false,
      },
      {
        id: 'keep-evidence',
        performs: 'Deposits a single piece of evidence into the Vault as a sovereign asset.',
        performsAr:
          'تحفظ دليلاً واحداً في خزانتك أصلاً سياديّاً يبقى لك.',
        boundary: { kind: 'action', at: 'app/hujjah-al-damighah/actions.ts#depositEvidenceToVault' },
        requiresExistingAsset: false,
      },
      {
        id: 'keep-investigation',
        performs: 'Deposits a whole investigation into the Vault as a sovereign asset.',
        performsAr:
          'تحفظ التحقيق كلّه — السؤال وأدلّته — في خزانتك.',
        boundary: { kind: 'action', at: 'app/hujjah-al-damighah/actions.ts#depositInvestigationToVault' },
        requiresExistingAsset: false,
      },
      {
        id: 'compose-scene-structure',
        performs:
          'Breaks a finished investigation into an ordered sequence of scenes, persists them as a '
          + 'storyboard the Creator owns, and keeps the demand as a sovereign asset.',
        performsAr:
          'تُفكّك تحقيقك إلى مشاهد مرتّبة — ما يُرى وما يُقال في كلّ مشهد — وتحفظها مطالبةً في خزانتك.',
        boundary: { kind: 'action', at: 'app/hujjah-al-damighah/actions.ts#composeStoryboardDemand' },
        requiresExistingAsset: false,
      },
      {
        id: 'compose-creation-demand',
        performs:
          'Composes a Creation Demand addressed to one Chamber from what the investigation established, '
          + 'and keeps it in the Vault as a sovereign asset carrying its investigation\'s identity.',
        performsAr:
          'تصوغ مطالبةً إنشائيّةً موجَّهةً إلى حجرةٍ بعينها، مبنيّةً على ما أثبته تحقيقك وحده.',
        boundary: { kind: 'action', at: 'app/hujjah-al-damighah/actions.ts#composeCreationDemandToVault' },
        requiresExistingAsset: false,
      },
    ],
    // «Ideas, briefs, prompts and story structures» stood here as deferred
    // because nothing in the repository created a brief. compose-creation-demand
    // now does, through a fourth Server Action — the Chamber's own shape, not a
    // new route and not a new chamber. What remains deferred is narrower and
    // still true: the Chamber states what should be made; it does not structure
    // a story into scenes, and nothing here does that yet.
    // «Story structures — breaking a subject into ordered scenes» stood here
    // as deferred, because nothing in the repository decomposed a subject.
    // compose-scene-structure now does, by the Founder's ruling of 2026-09-25:
    // the Chamber of Evidence writes the ordered scenes and stops there, and
    // رأس الأمر produces and assembles them. The gap is removed rather than
    // annotated — a closed gap that stays written is a gap the guide will keep
    // showing a Creator.
    deferred: [],
  },

  // ── القيامة ──────────────────────────────────────────────────────────────
  'qiyamah-chamber': {
    chamberId: 'qiyamah-chamber',
    primaryCapabilityId: 'generate-image',
    capabilities: [
      {
        id: 'generate-image',
        // Still image-only, deliberately. The boundary is shared with
        // generate-video (one route, two capabilities, decided 2026-09-22):
        // mediaType === 'image' is THIS capability, mediaType === 'video' is
        // that one. A shared route does not merge two sovereign capabilities.
        performs: 'Generates a new visual original from a described intent.',
        performsAr:
          'تُنشئ صورةً أصليّة من فكرةٍ تصفها بكلماتك.',
        boundary: { kind: 'route', at: 'app/api/qiyamah/generate', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'generate-video',
        // AUTHORIZED 2026-09-22 by the Founder under Constitution §3.1's own
        // mechanism: «إنتاج الأصول السمعية أو المرئية التي يُصرح لها بها
        // لاحقًا، دون امتلاك الإخراج النهائي». The later authorization has now
        // been granted, so what was recorded in `deferred` becomes a declared
        // capability — and `deferred` no longer carries it.
        //
        // INTENT → NEW VIDEO ORIGINAL. It is not animate-asset (an EXISTING
        // asset brought into motion, which has a parent), and it is not any
        // part of assembly: no timeline, no scene order, no transitions, no
        // composed audio, no final production — those are Ras Al Amr's
        // (§3.5, §4.3). Qiyamah generates the asset; it does not own the
        // direction of the work (§3.1's own proviso).
        performs:
          'Generates a new time-based visual original from a described intent alone — no parent asset — '
          + 'deposited as a sovereign MOTION asset with the executed model recorded.',
        performsAr:
          'تُنشئ فيديو أصليّاً من فكرةٍ تصفها، دون الحاجة إلى صورةٍ تبدأ منها.',
        boundary: { kind: 'route', at: 'app/api/qiyamah/generate', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'expand-intent',
        performs: 'Expands a Creator\'s brief description into a fuller generation intent.',
        performsAr:
          'توسّع فكرتك القصيرة إلى مشهدٍ مكتمل الوصف قبل التجسيد.',
        boundary: { kind: 'route', at: 'app/api/qiyamah/expand', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'edit-inside-asset',
        performs:
          'Edits inside an existing visual asset and deposits the result as a derived sovereign asset '
          + 'with its lineage recorded.',
        performsAr:
          'تُعدّل داخل صورةٍ تملكها، وتحفظ الناتج أصلاً جديداً يحمل نسبه إلى أصله.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/[assetId]/edit', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'animate-asset',
        // NOT edit-inside-asset. An edit changes what an image shows and yields
        // an image; an animation brings an image into time and yields a VIDEO —
        // DerivationKind.ANIMATED, CapabilityTarget.MOTION, its own boundary,
        // its own truthful name (animate-asset Truth Boundary order, 2026-09-22).
        // Inside the asset, so Qiyamah's (Art. 4.5); the video it yields is
        // what Ras Al Amr may later assemble with others.
        performs:
          'Transforms an existing sovereign visual asset into a time-based video through an '
          + 'authorized motion-generation provider binding, deposited as a derived sovereign asset '
          + '(parent = the source asset, root = its root, derivation ANIMATED) with the executed model recorded.',
        performsAr:
          'تُحرّك صورةً تملكها فتصير فيديو، ويُحفظ أصلاً جديداً.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/[assetId]/animate', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        // APPROVED by the Founder 2026-09-26. Four of its five parts were
        // already built and unreachable: the provider route PROBED LIVE,
        // the cost catalog pricing it, a full benchmark with golden assets,
        // and the editor's own client to extend.
        //
        // NOT an edit: an edit changes what the picture shows, this raises
        // its resolution and is run in a mode that invents nothing — which is
        // what the Empire's own benchmark for it demands.
        id: 'upscale-asset',
        performs:
          "Raises an existing image's resolution without inventing detail, depositing the "
          + 'result as a new asset whose lineage names its parent.',
        performsAr:
          'ترفع دقّة صورةٍ تملكها دون أن تخترع فيها شيئاً — ويُحفظ الناتج أصلاً جديداً ينسب إلى أصله.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/[assetId]/upscale', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'accept-generated-asset',
        performs:
          "Records the Creator's word that a generated asset is right, raising it from "
          + 'INTERMEDIATE to FINAL. Creates nothing and changes no bytes.',
        performsAr:
          'تُثبّت اعتمادك لما أُنشئ لك — فيصير أصلاً معتمداً بكلمتك لا بمجرّد إنتاجه.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/[assetId]/accept', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'review-generations',
        performs: 'Lists this Creator\'s own generations.',
        performsAr:
          'تعرض كلّ ما ولّدتَه أنت، ولا يراه سواك.',
        boundary: { kind: 'route', at: 'app/api/qiyamah/generations', methods: ['GET'] },
        requiresExistingAsset: false,
      },
      {
        // FOUND 2026-09-26: the engine behind this was complete — verified
        // session, cost engine, credit ledger, trial service, and its own
        // comment reading «Creator must know cost BEFORE creation starts» —
        // and NOTHING in the Empire called it. Not a missing capability: an
        // unreachable one, and so absent from this registry too.
        id: 'know-cost-before-creating',
        performs:
          'States what a chosen act will cost in AZMA Units, and what the Creator holds, '
          + 'before anything is made. Creates nothing and spends nothing.',
        performsAr:
          'تقول لك ما يكلّفه العمل الذي اخترته وما لديك — قبل أن يُصنع شيء.',
        boundary: { kind: 'route', at: 'app/api/sovereign/economy/estimate', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'discard-generation',
        performs: 'Removes a generation, leaving a tombstone rather than a silent gap.',
        performsAr:
          'تحذف توليداً، وتترك شاهدةً تُسجّل أنّه كان — لا فراغاً صامتاً.',
        boundary: { kind: 'route', at: 'app/api/qiyamah/generations/[recordId]', methods: ['DELETE'] },
        requiresExistingAsset: true,
      },
    ],
    deferred: [],
  },

  // ── الخزائن ──────────────────────────────────────────────────────────────
  'sovereign-vault-palace': {
    chamberId: 'sovereign-vault-palace',
    primaryCapabilityId: 'review-assets',
    capabilities: [
      {
        id: 'review-assets',
        performs: 'Lists every sovereign asset this Creator owns, and nobody else\'s.',
        performsAr:
          'تعرض كلّ أصلٍ سياديٍّ تملكه، ولا يبلغه أحدٌ غيرك.',
        boundary: { kind: 'route', at: 'app/api/vault/assets', methods: ['GET'] },
        requiresExistingAsset: false,
      },
      {
        id: 'receive-asset',
        performs: 'Takes a file into the Vault as a sovereign asset with recorded provenance.',
        performsAr:
          'تُدخل ملفّاً إلى خزانتك أصلاً سياديّاً مسجَّل النسب.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/upload', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'adopt-legacy-asset',
        performs:
          'Lifts the hold on an asset whose provenance predates the sovereign model, so it may be '
          + 'built upon. Invents no history: its recorded lineage begins at adoption.',
        performsAr:
          'ترفع الحجز عن أصلٍ يسبق نظام النسب السياديّ، فيصير قابلاً للاستعمال.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/[assetId]/adopt', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'publish-work',
        performs: 'Mints a revocable public link for a finished work, and withdraws it.',
        performsAr:
          'تمنح عملاً مكتملاً رابطاً عامّاً يمكنك سحبه متى شئت.',
        boundary: { kind: 'route', at: 'app/api/renders/[operationId]/publish', methods: ['POST', 'DELETE'] },
        requiresExistingAsset: true,
      },
      {
        id: 'discard-asset',
        performs:
          'Removes a sovereign asset the Creator owns, recording a tombstone that carries its lineage '
          + 'before the row and the file are destroyed (Constitution Article 6.3).',
        performsAr:
          'تحذف أصلاً تملكه، وتُسجّل شاهدةً تحمل سبب الحذف.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/[assetId]', methods: ['DELETE'] },
        requiresExistingAsset: true,
      },
      // ── Custody of identity — how the Vault opens ────────────────────────
      //
      // These are Creator actions in the Vault, not machinery: a Creator sets
      // the PIN, opens the Vault with it, enrols a device to open it with a
      // fingerprint or face, and withdraws a lost device. Identity and
      // permissions are the Vault's constitutional responsibility (Sovereign
      // Journey Mandate §VIII), so they are declared here and nowhere else.
      {
        id: 'set-pin',
        performs: 'Sets the PIN that opens this Creator\'s Vault.',
        performsAr:
          'تضع الرقم السرّي الذي يفتح خزانتك.',
        boundary: { kind: 'route', at: 'app/api/vault/pin/setup', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'open-with-pin',
        performs: 'Opens the Vault by verifying the Creator\'s PIN.',
        performsAr:
          'تفتح الخزانة بالتحقّق من رقمك السرّي.',
        boundary: { kind: 'route', at: 'app/api/vault/pin/verify', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'enrol-device',
        performs:
          'Enrols the Creator\'s own device to open the Vault with its fingerprint or face: GET issues '
          + 'the registration challenge, POST verifies what the device signed and keeps only its public key.',
        performsAr:
          'تُسجّل جهازك ليفتح الخزانة ببصمتك دون رقم.',
        boundary: { kind: 'route', at: 'app/api/vault/biometric/enrol', methods: ['GET', 'POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'open-with-device',
        performs:
          'Opens the Vault with an enrolled device: GET issues the authentication challenge, POST '
          + 'verifies the signed assertion.',
        performsAr:
          'تفتح الخزانة بجهازٍ مُسجَّل: تحدٍّ يُصدَر ثمّ يُتحقَّق منه.',
        boundary: { kind: 'route', at: 'app/api/vault/biometric/verify', methods: ['GET', 'POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'review-devices',
        performs: 'Lists the devices enrolled to open this Vault, and withdraws one that is lost or no longer trusted.',
        performsAr:
          'تعرض الأجهزة المأذون لها بفتح خزانتك، وتسحب ما ضاع منها.',
        boundary: { kind: 'route', at: 'app/api/vault/biometric/devices', methods: ['GET', 'DELETE'] },
        requiresExistingAsset: false,
      },
    ],
    deferred: [],
  },

  // ── رأس الأمر ────────────────────────────────────────────────────────────
  'ras-amr': {
    chamberId: 'ras-amr',
    primaryCapabilityId: 'keep-canvas',
    capabilities: [
      {
        id: 'produce-scene-film',
        performs:
          "Assembles the Creator's own placed assets into a finished film and deposits it "
          + 'in their Vault. Generates nothing and commissions nothing.',
        performsAr:
          'تُجمّع أصولك الموضوعة في المشهد فيلماً مكتملاً يُودَع في خزانتك.',
        boundary: { kind: 'route', at: 'app/api/ras-amr/scene/produce', methods: ['GET', 'POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'compose-storyboard-from-brief',
        performs:
          "Turns the Creator's written idea and specifications into an ordered storyboard "
          + 'they own, ready for this Chamber to produce.',
        performsAr:
          'تُفكّك فكرتك ومواصفاتك المكتوبة إلى مشاهد مرتّبة جاهزة للإنتاج.',
        boundary: { kind: 'action', at: 'app/ras-amr/actions.ts#composeStoryboardFromBrief' },
        requiresExistingAsset: false,
      },
      {
        id: 'keep-canvas',
        performs: 'Saves and reloads the Creator\'s composition canvas.',
        // GET and POST. The first draft declared POST alone — an UNDER-claim,
        // which the boundary test of that day could not see because it only
        // asked whether declared verbs exist. Production answered GET with 401
        // during live verification; the test now demands equality, so a verb
        // the handler exports and this file omits is refused as loudly as the
        // reverse.
        performsAr:
          'تحفظ لوح عملك وتستعيده كما تركته.',
        boundary: { kind: 'route', at: 'app/api/ras-amr/canvas', methods: ['GET', 'POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'direct-automatically',
        performs: 'Produces a direction decision for the assembled material.',
        performsAr:
          'تُصدر قرار إخراجٍ للمادّة التي جمعتها.',
        boundary: { kind: 'route', at: 'app/api/ras-amr/director', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'compile-production',
        performs: 'Compiles the canvas into a production and begins encoding it.',
        performsAr:
          'تُجمّع اللوح إنتاجاً وتبدأ ترميزه.',
        boundary: { kind: 'route', at: 'app/api/sovereign/entry/ras-al-amr/compile', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'follow-production',
        performs: 'Reports whether an encoding operation has finished, failed, or is still running.',
        performsAr:
          'تُخبرك هل انتهى الترميز أم أخفق أم ما زال جارياً.',
        boundary: { kind: 'route', at: 'app/api/ras-amr/resolution/[operationId]', methods: ['GET'] },
        requiresExistingAsset: true,
      },
      {
        id: 'give-voice',
        performs: 'Generates real speech as a sovereign audio asset.',
        performsAr:
          'تُنشئ نطقاً حقيقيّاً أصلاً صوتيّاً سياديّاً.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/generate-speech', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'clone-voice',
        performs: 'Creates a cloned voice identity from a Creator\'s own reference voice asset.',
        performsAr:
          'تصنع هويّةً صوتيّة مستنسخة من تسجيلك.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/clone-voice', methods: ['POST'] },
        requiresExistingAsset: true,
      },
      {
        id: 'import-subtitles',
        performs: 'Takes a subtitle file into the production as a sovereign asset.',
        performsAr:
          'تُدخل ملفّ ترجمةٍ إلى الإنتاج أصلاً سياديّاً.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/import-subtitles', methods: ['POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'restore-canvas',
        performs: 'Restores one specific saved canvas by its id, for this Creator only.',
        performsAr:
          'تستعيد لوحاً محفوظاً بعينه، لك وحدك.',
        boundary: { kind: 'route', at: 'app/api/ras-amr/canvas/[canvasId]', methods: ['GET'] },
        requiresExistingAsset: false,
      },
      {
        id: 'give-cloned-voice',
        performs:
          'Generates real speech in a voice the Creator has already cloned, as a new sovereign audio '
          + 'asset with its own lineage.',
        performsAr:
          'تُنشئ نطقاً بصوتٍ سبق أن استنسخته، أصلاً صوتيّاً جديداً.',
        boundary: { kind: 'route', at: 'app/api/vault/assets/generate-cloned-speech', methods: ['POST'] },
        requiresExistingAsset: true,
      },
    ],
    deferred: [
      {
        responsibility: 'Interactive timeline editing, scene transitions, and in-chamber preview.',
        responsibilityAr: 'تحرير الخطّ الزمنيّ تفاعليّاً، والانتقالات بين المشاهد، والمعاينة داخل الحجرة.',
        constitutionalSource: 'Executive Construction Mandate §I.3 and §IV Decision 03.',
        missing:
          'No service boundary. Encoding exists (compile + resolution), but nothing in the repository '
          + 'edits temporal order, applies a transition, or renders a preview.',
      },
      {
        responsibility: 'A real completion state for the Chamber.',
        responsibilityAr: 'حالةُ اكتمالٍ حقيقيّة لهذه الحجرة.',
        constitutionalSource:
          'chamber-identity/entry-exit-conditions.ts — the exit condition itself records the gap: '
          + '"Today: there is no real completion state."',
        missing:
          'No sovereign state marks a production finished — there is no real completion state. '
          + 'A Creator leaves by navigating away. '
          + 'This is why the exit condition must NOT be enforced — enforcing it would seal a Chamber '
          + 'that has no exit.',
      },
    ],
  },

  // ── مكمن الغاية ──────────────────────────────────────────────────────────
  //
  // Its capabilities are real and all concern the GOAL. The publishing the
  // constitution assigns it is reachable only from the Vault's own boundary,
  // which its own exit condition already admits.
  'makman-al-ghayah': {
    chamberId: 'makman-al-ghayah',
    primaryCapabilityId: 'declare-purpose',
    capabilities: [
      {
        id: 'declare-purpose',
        performs: 'Records and reads the Creator\'s sovereign purpose.',
        performsAr:
          'تُعلن غايتك السياديّة وتقرؤها.',
        boundary: { kind: 'route', at: 'app/api/sovereign/entry/purpose', methods: ['GET', 'PUT'] },
        requiresExistingAsset: false,
      },
      {
        id: 'set-goal',
        performs: 'Creates and lists milestone goals under guardianship.',
        performsAr:
          'تُنشئ أهدافك المرحليّة وتعرضها تحت رعايةٍ واحدة.',
        boundary: { kind: 'route', at: 'app/api/sovereign/entry/creator-goal', methods: ['GET', 'POST'] },
        requiresExistingAsset: false,
      },
      {
        id: 'define-success',
        performs: 'Declares what must become true for a goal to count as met.',
        // PUT only. The first draft of this registry claimed GET and POST from
        // the shape the others had, and the boundary test refused it — which
        // is the whole reason that test asserts on exported verbs rather than
        // on the file merely existing.
        performsAr:
          'تُعلن ما الذي يجب أن يقع حتى يُعدّ الهدف متحقّقاً.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/success-criteria',
          methods: ['PUT'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'observe-reality',
        // READ only, and the wording follows the measurement: the boundary
        // exports GET alone, so a Creator READS observations here. The first
        // draft claimed GET and POST from the shape its siblings had, and the
        // boundary test refused it — which is exactly why that test asserts on
        // exported verbs and not on the file merely existing.
        performs: 'Reads the real observations recorded about a goal’s publications.',
        performsAr:
          'تقرأ ما رُصد فعلاً عمّا نشرتَه من أعمال الهدف.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/observations',
          methods: ['GET'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'assess-fulfilment',
        performs: 'Compares declared success against observed reality.',
        performsAr:
          'تقارن ما أعلنتَه نجاحاً بما رصده الواقع.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/fulfillment-assessment',
          methods: ['GET', 'POST'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'find-the-gap',
        // READ only. The claim that a Creator can "send it for investigation"
        // from here was mine, not the repository's — that is a separate
        // boundary (gap-investigation) and is not declared until measured.
        performs: 'Reads the distance between what a goal declared and what reality recorded.',
        performsAr:
          'تقرأ المسافة بين ما أعلنه الهدف وما سجّله الواقع.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/fulfillment-gap',
          methods: ['GET'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'read-goal',
        performs: 'Reads one goal the Creator created.',
        performsAr:
          'تقرأ هدفاً واحداً أنشأتَه.',
        boundary: { kind: 'route', at: 'app/api/sovereign/entry/creator-goal/[goalId]', methods: ['GET'] },
        requiresExistingAsset: false,
      },
      {
        id: 'mark-milestone',
        performs:
          'Designates a goal as a milestone serving the Creator\'s sovereign purpose, snapshotting the '
          + 'purpose wording so the relationship survives later edits.',
        performsAr:
          'تُعيّن هدفاً مرحلةً تخدم غايتك السياديّة.',
        boundary: { kind: 'route', at: 'app/api/sovereign/entry/creator-goal/[goalId]/milestone', methods: ['PUT'] },
        requiresExistingAsset: false,
      },
      {
        id: 'name-knowledge-requirements',
        performs:
          'Derives, from the latest fulfilment assessment, what the Empire must learn to understand '
          + 'each open gap.',
        performsAr:
          'تشتقّ من آخر تقييمٍ ما يجب أن تتعلّمه الإمبراطوريّة لفهم الفجوة.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/gap-investigation',
          methods: ['GET'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'investigate-for-goal',
        // Makman's boundary, consulting the Chamber of Evidence's engine: the
        // constitutional bridge between the two. Declared here because the
        // Creator exercises it from a goal, not from an investigation.
        performs: 'Conducts the full sovereign knowledge investigation for a milestone goal\'s open gaps.',
        performsAr:
          'تُجري تحقيق المعرفة السياديّ كاملاً لأجل هدفٍ مرحليّ.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/knowledge-investigation',
          methods: ['GET'],
        },
        requiresExistingAsset: false,
      },
      {
        id: 'issue-knowledge-requests',
        performs: 'Issues the formal batch of typed knowledge requests for a goal\'s active requirements.',
        performsAr:
          'تُصدر طلبات المعرفة الرسميّة عن فجوات الهدف — وتبقى دون جواب حتى تُحقَّق.',
        boundary: {
          kind: 'route',
          at: 'app/api/sovereign/entry/creator-goal/[goalId]/knowledge-requests',
          methods: ['GET'],
        },
        requiresExistingAsset: false,
      },
      // NOT declared: app/api/sovereign/entry/consumption (GET). Real and
      // executable, but its actor is the AUDIENCE consuming a published work
      // through Makman's public boundary — not a Creator standing in the
      // Chamber. This model records what a Creator can do; an audience
      // capability belongs to a different question.
    ],
    deferred: [
      {
        responsibility: 'Publishing and distribution from within the Chamber.',
        responsibilityAr: 'النشر والتوزيع من داخل الحجرة.',
        constitutionalSource: 'Executive Construction Mandate §I.5.',
        missing:
          'The capability exists — app/api/renders/[operationId]/publish mints and revokes a real '
          + 'public link — but it is the Vault\'s boundary, not this Chamber\'s. The Chamber\'s own exit '
          + 'condition already records this: "not yet reachable from the chamber itself — the real '
          + 'distribution capabilities exist only behind a disconnected API."',
      },
    ],
  },
} as const satisfies Record<ChamberId, ChamberTruth>;

/**
 * The closed set of capability ids, one literal per declared capability.
 *
 * `as const satisfies` keeps every id a literal type while still checking
 * the whole registry against ChamberTruth. The consequence is the one that
 * matters for the Sovereign Journey ruling: any structure that must cover
 * every capability — the Manifest's delivery table, a guide — can be typed
 * `Record<TruthCapabilityId, …>`, and the compiler refuses it the moment a
 * capability is added here without it, or it names one that is not here.
 * ONE source of capability truth, ONE derivation path, enforced by the
 * type-checker rather than by discipline.
 */
export type TruthCapabilityId = (typeof CHAMBER_TRUTH)[ChamberId]['capabilities'][number]['id'];

/** The capability ids one Chamber declares. */
export type CapabilityIdOf<C extends ChamberId> = (typeof CHAMBER_TRUTH)[C]['capabilities'][number]['id'];

/** What this Chamber can genuinely do right now. */
export function getChamberTruth(chamberId: ChamberId): ChamberTruth {
  return CHAMBER_TRUTH[chamberId];
}

/**
 * The capabilities a Creator can exercise given whether they own anything yet.
 *
 * The one distinction a guide cannot get wrong: a Creator with an empty Vault
 * can generate and cannot edit. Offering them an edit is the first lie an
 * interface tells, and it is told by every interface that lists capabilities
 * without asking this question.
 */
export function getExercisableCapabilities(
  chamberId: ChamberId,
  creatorOwnsAssets: boolean,
): readonly ChamberTruth['capabilities'][number][] {
  return CHAMBER_TRUTH[chamberId].capabilities.filter(
    (capability) => creatorOwnsAssets || !capability.requiresExistingAsset,
  );
}
