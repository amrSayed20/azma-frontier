/**
 * AZMA OS — generate-video: the later authorization, exercised.
 *
 * ─── WHAT CHANGED, AND WHAT MUST NOT ────────────────────────────────────────
 *
 *   Constitution §3.1 reserved audiovisual production for Qiyamah «التي
 *   يُصرح لها بها لاحقًا». On 2026-09-22 the Founder granted that later
 *   authorization. The responsibility therefore leaves `deferred` and becomes
 *   a declared capability — and exactly one thing may change: a capability
 *   appears. These tests hold everything else still.
 *
 *   The three meanings that must never collapse into each other:
 *
 *     generate-video   intent alone → a NEW time-based original (no parent)
 *     animate-asset    an EXISTING sovereign asset → a derived video (parent)
 *     Ras Al Amr       between assets: timeline, order, transitions, audio,
 *                      final production
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { CHAMBER_TRUTH, getChamberTruth } from '../truth-registry';
import { getChamberManifest, listAllChamberManifests } from '@/src/sovereign-chamber-manifest';

const ROOT = process.cwd();
const strip = (f: string) => readFileSync(join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const QIYAMAH = getChamberTruth('qiyamah-chamber');
const VIDEO = QIYAMAH.capabilities.find((c) => c.id === 'generate-video');

describe('AUTHORITY 1–4 · the capability is declared, once, and means what it says', () => {
  it('generate-video exists in Truth, in Qiyamah, exactly once', () => {
    expect(VIDEO).toBeDefined();
    expect(QIYAMAH.capabilities.filter((c) => c.id === 'generate-video')).toHaveLength(1);
    const everywhere = Object.values(CHAMBER_TRUTH).flatMap((t) => t.capabilities.filter((c) => c.id === 'generate-video'));
    expect(everywhere).toHaveLength(1);
  });

  it('it means INTENT → NEW ORIGINAL: no parent asset, and it says so', () => {
    expect(VIDEO!.requiresExistingAsset).toBe(false);
    expect(VIDEO!.performs).toMatch(/from a described intent alone/);
    expect(VIDEO!.performs).toMatch(/no parent asset/);
    expect(VIDEO!.performs).toMatch(/MOTION/);
    // Not assembly, in any of its forms.
    expect(VIDEO!.performs).not.toMatch(/timeline|scene order|transition|assembl|compose|final production/i);
  });

  it('nothing is deferred for Qiyamah any more — the responsibility left deferred when it became a capability', () => {
    expect(QIYAMAH.deferred).toEqual([]);
    const stillDeferred = QIYAMAH.deferred.filter((d) => /video/i.test(d.responsibility));
    expect(stillDeferred).toEqual([]);
  });

  it('generate-image remains image-only; animate-asset remains the from-an-asset capability', () => {
    const image = QIYAMAH.capabilities.find((c) => c.id === 'generate-image')!;
    expect(image.performs).toBe('Generates a new visual original from a described intent.');
    expect(image.performs).not.toMatch(/video|motion/i);

    const animate = QIYAMAH.capabilities.find((c) => c.id === 'animate-asset')!;
    expect(animate.requiresExistingAsset).toBe(true);
    expect(animate.boundary.at).toBe('app/api/vault/assets/[assetId]/animate');
    expect(animate.performs).toMatch(/existing sovereign visual asset/);
    // The two video-producing capabilities are not the same capability.
    expect(animate.id).not.toBe(VIDEO!.id);
    expect(animate.boundary.at).not.toBe(VIDEO!.boundary.at);
    expect(animate.requiresExistingAsset).not.toBe(VIDEO!.requiresExistingAsset);
  });
});

describe('AUTHORITY 5–7 · it reaches Manifest and kernel delivery through the one derivation', () => {
  it('the Qiyamah Manifest carries generate-video with Truth’s own purpose', () => {
    const manifest = getChamberManifest('qiyamah-chamber')!;
    const derived = manifest.capabilities.filter((c) => c.capabilityId === 'generate-video');
    expect(derived).toHaveLength(1);
    expect(derived[0].purpose).toBe(VIDEO!.performs);
    expect(derived[0].preconditions).toEqual([]); // no parent asset required
  });

  it('kernel delivery declares it — and manifests.ts still hand-writes no capability', () => {
    const derive = strip('src/sovereign-chamber-manifest/derive.ts');
    expect(derive).toContain("'generate-video'");
    expect(strip('src/sovereign-chamber-manifest/manifests.ts')).not.toContain('generate-video');
  });

  it('no duplicate: exactly one generate-video across every Chamber’s manifest', () => {
    const all = listAllChamberManifests().flatMap((m) => m.capabilities.map((c) => c.capabilityId));
    expect(all.filter((id) => id === 'generate-video')).toHaveLength(1);
  });
});

describe('RUNTIME 8–9 · mediaType decides which capability is exercised', () => {
  const route = strip('app/api/qiyamah/generate/route.ts');

  it('the video branch is entered only for mediaType video, and names the capability', () => {
    expect(route).toMatch(/if \(mediaType === 'video'\) \{/);
    expect(route).toContain("capability: 'generate-video'");
  });

  it('the image path is untouched by the video branch — the branch returns before it', () => {
    const videoBranch = route.slice(route.indexOf("if (mediaType === 'video')"));
    expect(videoBranch).toMatch(/await generateVideo\(/);
    // generateImage is reached only after the video branch has returned.
    expect(route.indexOf('await generateImage(')).toBeGreaterThan(route.indexOf("if (mediaType === 'video')"));
  });
});

describe('ENTITLEMENT 16–20 · the decision is made before the provider', () => {
  const route = strip('app/api/qiyamah/generate/route.ts');

  it('the existing billing authority decides, and nothing else is invented', () => {
    expect(route).toContain('hasActiveEntitlement(session.creatorId, session.role)');
    const entitlement = strip('src/billing/entitlement-service.ts');
    expect(entitlement).toMatch(/role === 'founder'/);            // Founder before subscription
    expect(entitlement).toMatch(/status === 'active'/);           // paid subscriber
    // No second entitlement mechanism was created for video.
    expect(route).not.toMatch(/function .*[Ee]ntitle/);
  });

  it('a denial is a denial: 403 not-entitled, distinct from any generation failure', () => {
    const gate = route.slice(route.indexOf('!hasActiveEntitlement'), route.indexOf('!hasActiveEntitlement') + 600);
    expect(gate).toContain("reason: 'not-entitled'");
    expect(gate).toContain("stage: 'entitlement'");
    expect(gate).toContain('status: 403');
    expect(gate).not.toMatch(/provider|network|server error/i);
  });

  it('the denial precedes every provider touch — cost, reservation and generateVideo all come after it', () => {
    const video = route.slice(route.indexOf("if (mediaType === 'video')"));
    const gateAt = video.indexOf('!hasActiveEntitlement');
    expect(gateAt).toBeGreaterThanOrEqual(0);
    for (const later of ['costEngine.estimate', 'creditRepo.reserve', 'await generateVideo(']) {
      expect(video.indexOf(later)).toBeGreaterThan(gateAt);
    }
  });
});

describe('BOUNDARIES 21–25 · nothing else moved', () => {
  it('Qiyamah declares exactly these seven capabilities, in order', () => {
    expect(QIYAMAH.capabilities.map((c) => c.id)).toEqual([
      'generate-image',
      'generate-video',
      'expand-intent',
      'edit-inside-asset',
      'animate-asset',
      'review-generations',
      'discard-generation',
    ]);
  });

  it('no video-editing capability appeared anywhere', () => {
    const every = Object.values(CHAMBER_TRUTH).flatMap((t) => t.capabilities.map((c) => c.id));
    for (const forbidden of ['edit-video', 'video-edit', 'internal-video-editing', 'trim-video']) {
      expect(every).not.toContain(forbidden);
    }
    // The only editing capability remains the image one.
    expect(every.filter((id) => /edit/i.test(id))).toEqual(['edit-inside-asset']);
  });

  it('Ras Al Amr keeps every between-assets capability, unchanged', () => {
    expect(getChamberTruth('ras-amr').capabilities.map((c) => c.id)).toEqual([
      'keep-canvas', 'direct-automatically', 'compile-production', 'follow-production',
      'give-voice', 'clone-voice', 'import-subtitles', 'restore-canvas', 'give-cloned-voice',
    ]);
  });

  it('the five Chambers are still five, and Truth still names no provider', () => {
    expect(Object.keys(CHAMBER_TRUTH)).toHaveLength(5);
    const whole = JSON.stringify(CHAMBER_TRUTH).toLowerCase();
    for (const provider of ['magic-hour', 'seedance', 'veo3', 'nano-banana', 'openai', 'grok']) {
      expect(whole).not.toContain(provider);
    }
  });
});
