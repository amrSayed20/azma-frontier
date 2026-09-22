/**
 * AZMA OS — Constitutional permission is not a declared capability.
 *
 * ─── THE DISTINCTION THIS HOLDS SHUT ────────────────────────────────────────
 *
 *   Constitution §3.1 closes Qiyamah's enumerated abilities with «إنتاج
 *   الأصول السمعية أو المرئية التي يُصرح لها بها لاحقًا» — audiovisual
 *   production is PERMITTED THROUGH LATER AUTHORIZATION. «ليس بعدُ مأذوناً»
 *   is not «ممنوعاً أبداً»: the clause is a door, not a wall.
 *
 *   Until that later authorization is declared, three things must all stay
 *   true at once, and nothing in the repository may collapse them:
 *
 *     the Constitution PERMITS video (so `deferred` must not call it forbidden)
 *     Truth DOES NOT DECLARE it (so no capability, no Manifest entry, no
 *       kernel delivery, no id named generate-video)
 *     the machinery EXISTS and is silent (app/api/qiyamah/generate carries a
 *       video verb that no capability speaks for)
 *
 *   The Truth authority correction of 2026-09-22 recorded exactly that state.
 *   These tests fail the moment any of the three drifts.
 */

import { CHAMBER_TRUTH, getChamberTruth } from '../truth-registry';
import { getChamberManifest, listAllChamberManifests } from '@/src/sovereign-chamber-manifest';
import { CHAMBER_DIRECTORY } from '@/src/constitutional-navigation';

const QIYAMAH = getChamberTruth('qiyamah-chamber');
const VIDEO_DEFERRED = QIYAMAH.deferred.find((d) => /video generation/i.test(d.responsibility));
const ACTIVE_IDS = QIYAMAH.capabilities.map((c) => c.id);

describe('1 · the active capability claims only what it declares', () => {
  it('generate-image describes a visual original and claims no video', () => {
    const generateImage = QIYAMAH.capabilities.find((c) => c.id === 'generate-image')!;
    expect(generateImage.performs).toBe('Generates a new visual original from a described intent.');
    expect(generateImage.performs).not.toMatch(/video|motion|فيديو/i);
    // Not widened to "image or video" — that ambiguity is what this corrected.
    expect(generateImage.performs).not.toMatch(/\bor\b/i);
  });

  it('no active Qiyamah capability claims video generation', () => {
    for (const capability of QIYAMAH.capabilities) {
      // animate-asset legitimately produces a video FROM AN ASSET; it is not
      // generation from an intent alone, and it carries a parent.
      if (capability.id === 'animate-asset') continue;
      expect(capability.performs).not.toMatch(/video/i);
    }
  });
});

describe('2–4 · the deferred record says exactly what is true', () => {
  it('the Qiyamah deferred list carries the video responsibility', () => {
    expect(VIDEO_DEFERRED).toBeDefined();
    expect(QIYAMAH.deferred.filter((d) => /video generation/i.test(d.responsibility))).toHaveLength(1);
  });

  it('it cites Constitution §3.1 and the later-authorization clause verbatim', () => {
    expect(VIDEO_DEFERRED!.constitutionalSource).toContain('§3.1');
    expect(VIDEO_DEFERRED!.constitutionalSource).toContain('يُصرح لها بها لاحقًا');
  });

  it('it says PERMITTED-LATER, never prohibited', () => {
    const source = VIDEO_DEFERRED!.constitutionalSource;
    expect(source).toMatch(/PERMITTED THROUGH LATER AUTHORIZATION/);
    expect(source).toMatch(/not prohibited/i);
    expect(`${source} ${VIDEO_DEFERRED!.missing}`).not.toMatch(/\bforbidden\b/i);
  });

  it('it says what is missing — an ACTIVE capability — and that permission is not capability', () => {
    const missing = VIDEO_DEFERRED!.missing;
    expect(missing).toMatch(/An active Truth capability/);
    expect(missing).toMatch(/neither prohibited nor active/i);
    expect(missing).toMatch(/constitutional permission is not a declared capability/i);
    // And it names where the undeclared verb actually lives, measured.
    expect(missing).toContain('app/api/qiyamah/generate');
    expect(missing).toMatch(/mediaType/);
  });
});

describe('5–8 · deferred does not become capability anywhere in the chain', () => {
  it('no Truth capability id named generate-video exists, in any Chamber', () => {
    const everyId = Object.values(CHAMBER_TRUTH).flatMap((t) => t.capabilities.map((c) => c.id));
    expect(everyId).not.toContain('generate-video');
    expect(everyId.filter((id) => /video/i.test(id))).toEqual([]);
  });

  it('the deferred responsibility resolves to no capability', () => {
    expect(ACTIVE_IDS.some((id) => id === VIDEO_DEFERRED!.responsibility)).toBe(false);
    for (const capability of QIYAMAH.capabilities) {
      expect(capability.performs).not.toBe(VIDEO_DEFERRED!.responsibility);
    }
  });

  it('it does not appear in the derived Manifest — structurally, the Manifest projects capabilities only', () => {
    const manifest = getChamberManifest('qiyamah-chamber')!;
    expect(manifest.capabilities.map((c) => c.capabilityId)).toEqual(ACTIVE_IDS);
    for (const capability of manifest.capabilities) {
      expect(capability.purpose).not.toBe(VIDEO_DEFERRED!.responsibility);
    }
    // Nowhere in any Chamber's manifest, either.
    const everyManifestId = listAllChamberManifests().flatMap((m) => m.capabilities.map((c) => c.capabilityId));
    expect(everyManifestId).not.toContain('generate-video');
  });

  it('it cannot enter kernel delivery: the delivery table is keyed by the closed set of Truth ids', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { readFileSync } = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { join } = require('path') as typeof import('path');
    const derive = readFileSync(join(process.cwd(), 'src/sovereign-chamber-manifest/derive.ts'), 'utf8');
    expect(derive).toContain('Record<TruthCapabilityId, KernelDelivery>');
    expect(derive).not.toContain('generate-video');
    // A delivery entry exists for every ACTIVE id and for nothing else.
    for (const id of ACTIVE_IDS) expect(derive).toContain(`'${id}'`);
  });
});

describe('9–12 · nothing else moved', () => {
  it('the active Qiyamah capabilities are exactly the six that were already declared', () => {
    expect(ACTIVE_IDS).toEqual([
      'generate-image',
      'expand-intent',
      'edit-inside-asset',
      'animate-asset',
      'review-generations',
      'discard-generation',
    ]);
  });

  it('animate-asset is untouched — boundary, derivation semantics and precondition', () => {
    const animate = QIYAMAH.capabilities.find((c) => c.id === 'animate-asset')!;
    expect(animate.boundary).toEqual({ kind: 'route', at: 'app/api/vault/assets/[assetId]/animate', methods: ['POST'] });
    expect(animate.requiresExistingAsset).toBe(true);
    expect(animate.performs).toMatch(/ANIMATED/);
    // The Seedance and Veo proofs stand under THIS capability, not under a video one.
    expect(animate.performs).toMatch(/existing sovereign visual asset/);
  });

  it('the five Chambers are still five, and no provider authority entered Truth', () => {
    expect(Object.keys(CHAMBER_TRUTH).sort()).toEqual(CHAMBER_DIRECTORY.map((e) => e.chamber).sort());
    expect(Object.keys(CHAMBER_TRUTH)).toHaveLength(5);
    const whole = JSON.stringify(CHAMBER_TRUTH);
    for (const provider of ['magic-hour', 'seedance', 'veo3', 'nano-banana', 'openai', 'kling', 'ltx']) {
      expect(whole.toLowerCase()).not.toContain(provider);
    }
  });
});
