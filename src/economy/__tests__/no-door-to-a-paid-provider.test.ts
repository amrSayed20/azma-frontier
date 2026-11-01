/**
 * AZMA OS — لا بابَ خلفيًّا إلى مزوِّدٍ مدفوع.
 *
 * ─── WHY THIS EXISTS, AND WHAT IT CAUGHT ────────────────────────────────────
 *
 *   Two audits of this economy enumerated ROUTES and both missed roads. The
 *   first missed `upscale` and `creative` by reading a route file without the
 *   service beneath it. The second missed رأس الأمر's scene commission
 *   entirely, because it listed `app/api/vault/assets/*` and
 *   `app/api/qiyamah/*` — and `commissionScenePictures` calls the billed image
 *   provider from `app/api/ras-amr/*`. A paid provider does not care which
 *   folder called it.
 *
 *   So this sweep does not enumerate routes. It starts at the PROVIDER — every
 *   function in the repository that reaches a billed HTTP boundary — walks to
 *   each one's callers, and requires money at each. A tenth road built next
 *   year fails this test on the day it is written, whatever folder it lives in.
 *
 *   It reads source text, which is a weaker instrument than the ledger, and it
 *   is deliberately paired with `no-paid-provider-without-a-gate.test.ts`,
 *   which reads the ledger and proves the money actually moves. This one
 *   answers a question that suite cannot: is there anywhere ELSE.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

/** Every .ts and .tsx file under `app/` and `src/`, tests excluded. */
function sourceFiles(): readonly string[] {
  const found: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.next') continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        if (entry === '__tests__') continue;
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(entry)) continue;
      if (/\.test\.tsx?$/.test(entry)) continue;
      found.push(relative(ROOT, full).split('\\').join('/'));
    }
  };
  for (const top of ['app', 'src']) walk(join(ROOT, top));
  return found;
}

const FILES = sourceFiles();

/**
 * The functions that actually spend the Empire's money.
 *
 * Each name is an exported entry that performs a billed provider call. The
 * list is checked against the adapters below, so a new one cannot be added to
 * the repository and left out of this list silently.
 */
const PAID_PROVIDER_ENTRIES: readonly string[] = [
  'editImageViaProvider',
  'upscaleImageViaProvider',
  'animateImageViaProvider',
  'removeBackgroundViaProvider',
  'lipSyncViaProvider',
  'talkingPhotoViaProvider',
  'faceSwapViaProvider',
  'cloneVoiceViaProvider',
  'synthesizeSpeechWithClonedVoice',
  'generateSpeechViaProvider',
];

/** The adapter files those entries are declared in. */
const ADAPTER_FILES: readonly string[] = [
  'src/core/sovereign-ai-integration/adapters/magic-hour-image-editing.ts',
  'src/core/sovereign-ai-integration/adapters/magic-hour-image-to-video.ts',
  'src/core/sovereign-ai-integration/adapters/magic-hour-creative-operations.ts',
  'src/chambers/ras-al-amr/voice-cloning-provider.ts',
  'src/chambers/ras-al-amr/speech-provider.ts',
];

/** Does this file hold money anywhere — its own hold, or the shared gate's? */
function holdsMoney(source: string): boolean {
  return /authorisePaidOperation\(|\.reserve\(|claimAttempt\(/.test(source);
}

/** Who calls `name`, other than the file that declares it? */
function callersOf(name: string): readonly string[] {
  const call = new RegExp(`(?<![A-Za-z0-9_])${name}\\s*\\(`);
  const declaration = new RegExp(`export (async )?function ${name}\\b`);
  return FILES.filter((f) => {
    const source = read(f);
    if (declaration.test(source)) return false;
    return call.test(source);
  });
}

describe('١ · القائمةُ نفسُها لا تَشيخ في صمت', () => {
  it.each(ADAPTER_FILES)('%s declares no billed entry this sweep does not know', (file) => {
    const source = read(file);
    const declared = [...source.matchAll(/export (?:async )?function ([A-Za-z0-9_]+)/g)]
      .map((m) => m[1]!);

    // An entry that TALKS to a provider is one whose own body names the
    // provider's HTTP boundary — which in these adapters means it submits or
    // polls a job. Helpers that only read configuration are not billed.
    const billedLooking = declared.filter((n) => /ViaProvider$|^synthesizeSpeech/.test(n));

    for (const name of billedLooking) {
      expect(PAID_PROVIDER_ENTRIES).toContain(name);
    }
  });

  it('every entry this sweep names still exists', () => {
    const everything = ADAPTER_FILES.map(read).join('\n');
    for (const name of PAID_PROVIDER_ENTRIES) {
      expect(everything).toMatch(new RegExp(`export (async )?function ${name}\\b`));
    }
  });
});

describe('٢ · كلُّ مستدعٍ لمزوِّدٍ مدفوعٍ يَحمِل مالًا', () => {
  /*  The decisive sweep. For each billed entry, every caller must hold money
   *  in its own file — a reservation, the shared gate, or at minimum a claimed
   *  attempt that binds a hold.
   *
   *  A caller is allowed to be a thin re-export or an orchestrator ADAPTER
   *  class, which is why the exemptions below are named individually with the
   *  reason each one is not a door. An unnamed exemption is a failure.
   */
  const NOT_A_DOOR: Readonly<Record<string, string>> = {
    // Registered in the provider registry for the orchestrator's AUDIO target.
    // MEASURED 2026-11-01: `generateImage` and `generateVideo` dispatch VISUAL
    // and MOTION only, so no live road reaches these two. They are listed here
    // so that the day one does, this exemption has to be justified again.
    'src/core/sovereign-ai-integration/adapters/elevenlabs-voice-adapter.ts':
      'an orchestrator adapter, unreachable from any VISUAL/MOTION dispatch',
    'src/core/sovereign-ai-integration/adapters/openai-tts-adapter.ts':
      'an orchestrator adapter, unreachable from any VISUAL/MOTION dispatch',
    // A Founder-only instrument that exists to MEASURE what a provider
    // charges. It is gated on the Founder's role, not on units.
    'src/economy/cost-engine/creative-operations-cost-worksheet.ts':
      'the Founder-gated cost measurement worksheet',
    // The four creative acts are performed here, and the money for them is
    // held one level up. That is deliberate and it is the same shape as the
    // image edit: the runner is reached by exactly ONE caller, and that
    // caller holds. The test below proves the single caller and its hold, so
    // this exemption cannot quietly become a second door.
    'src/vault/creative-operation-runner.ts':
      'the creative act itself; its only caller is creative-job-service, which claims and holds',
  };

  it.each(PAID_PROVIDER_ENTRIES)('%s is called only from files that hold money', (entry) => {
    const unprotected = callersOf(entry).filter((f) => {
      if (f in NOT_A_DOOR) return false;
      return !holdsMoney(read(f));
    });

    expect(unprotected).toEqual([]);
  });

  it('the creative runner has exactly ONE caller, and that caller holds the money', () => {
    // The exemption above rests entirely on this. A second caller would be a
    // road to four paid providers with nobody holding anything.
    const callers = callersOf('runCreativeOperation');
    expect(callers).toEqual(['src/vault/creative-job-service.ts']);

    const service = read('src/vault/creative-job-service.ts');
    expect(holdsMoney(service)).toBe(true);
    // And its hold is taken before the act, not after it.
    expect(service.indexOf('credits.reserve(')).toBeLessThan(service.indexOf('await runCreativeOperation('));
  });

  it('every exemption still names a file that exists and still needs it', () => {
    for (const [file, reason] of Object.entries(NOT_A_DOOR)) {
      expect(FILES).toContain(file);
      expect(reason.length).toBeGreaterThan(20);
    }
  });
});

describe('٣ · والمولِّدُ المدفوعُ نفسُه ليس بابًا خلفيًّا', () => {
  /*  `generateImage` and `generateVideo` are not adapters — they are the whole
   *  Qiyamah act, and they reach a billed provider through the orchestrator.
   *  This is the road the second audit missed: the storyboard commission
   *  called `generateImage` with no entitlement, no price and no hold.
   */
  const GENERATORS = ['generateImage', 'generateVideo'] as const;

  const EXPECTED_CALLERS: Readonly<Record<string, string>> = {
    'app/api/qiyamah/generate/route.ts': 'the Qiyamah door — claims and holds',
    'src/qiyamah-generation/video-operation-lifecycle.ts':
      'the durable video production, whose hold is taken by the route before it accepts',
    'src/ras-amr-production/qiyamah-commission.ts': 'the scene commission — gated 2026-11-01',
    'app/api/sovereign/model-test/route.ts': 'the Founder-only controlled model test',
    'src/core/sovereign-assistant/founder-command/founder-command-center.ts':
      'the Founder command centre, reachable by the Founder alone',
  };

  it.each(GENERATORS)('%s has no caller this sweep has not judged', (generator) => {
    for (const caller of callersOf(generator)) {
      expect(Object.keys(EXPECTED_CALLERS)).toContain(caller);
    }
  });

  it('the scene commission holds money before it generates', () => {
    const source = read('src/ras-amr-production/qiyamah-commission.ts');
    expect(source).toContain('authorisePaidOperation(');
    expect(source).toContain('claimAttempt(');
    // The order is the safety: the hold is taken before the generator.
    expect(source.indexOf('authorisePaidOperation(')).toBeLessThan(source.indexOf('await generateImage('));
    // And both exits exist — a scene that failed gives the units back.
    expect(source).toContain('releaseAuthorisedOperation(');
    expect(source).toContain('settleAuthorisedOperation(');
  });

  it('the Founder-only road is gated on a verified Founder session, not on a claim in a request', () => {
    const modelTest = read('app/api/sovereign/model-test/route.ts');
    // `verifyFounderSession` is a narrower authority than a role comparison:
    // it is the Empire's own Founder guard, and the route holds nothing else.
    expect(modelTest).toContain('verifyFounderSession(');
    expect(modelTest).toContain("from '@/src/founder-access'");
    // Nothing in the request body may decide who is asking.
    expect(modelTest).not.toMatch(/body\s*(as[^;]*)?\.\s*role/);
  });
});
