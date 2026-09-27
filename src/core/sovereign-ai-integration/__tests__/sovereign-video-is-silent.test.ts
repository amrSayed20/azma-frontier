/**
 * AZMA OS — a sovereign video master carries no audio.
 *
 * ─── WHAT WAS MEASURED, AND WHY A DEFAULT WAS NOT ENOUGH ────────────────────
 *
 *   ffprobe, 2026-09-27, on every sovereign video this Empire had produced:
 *
 *     asset_1790457261765_y3hpgxr   video streams 1   AUDIO STREAMS 1
 *     asset_1790451587089_jykjefh   video streams 1   AUDIO STREAMS 1
 *     asset_1790416931347_zpuvpob   video streams 1   AUDIO STREAMS 1
 *
 *   Neither dispatch sent an `audio` field, so what arrived was the PROVIDER'S
 *   default. The provider documents that default as false; the files say
 *   otherwise. That is the whole lesson: a default belongs to the provider, it
 *   may differ per model, and it can change without telling anyone. A boundary
 *   that depends on it is not a boundary.
 *
 *   These guards hold the rule at the only place it can be true — the moment
 *   of dispatch — and they hold it on BOTH video routes from ONE constant, so
 *   it cannot lapse on one while holding on the other.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { SOVEREIGN_VIDEO_AUDIO } from '../adapters/magic-hour-adapter';
import { IMAGE_MODEL_FLEET } from '@/src/sovereign-model-selection/image-model-fleet';
import { VIDEO_MODEL_FLEET } from '@/src/sovereign-model-selection/video-model-fleet';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const T2V = read('src/core/sovereign-ai-integration/adapters/magic-hour-adapter.ts');
const I2V = read('src/core/sovereign-ai-integration/adapters/magic-hour-image-to-video.ts');
const SERVICE = read('src/qiyamah-generation/generation-service.ts');
const GENERATE_ROUTE = read('app/api/qiyamah/generate/route.ts');
const TEST_ROUTE = read('app/api/sovereign/model-test/route.ts');
const CLIENT = read('app/qiyamah-chamber/QiyamahChamberClient.tsx');

describe('A–B · the request that leaves AZMA carries audio: false', () => {
  it('the rule is one named constant, and it is false', () => {
    expect(SOVEREIGN_VIDEO_AUDIO).toBe(false);
  });

  it('text-to-video sends it explicitly', () => {
    const start = T2V.indexOf("'/v1/text-to-video'");
    const body = T2V.slice(start, start + 600);
    expect(body).toContain('audio: SOVEREIGN_VIDEO_AUDIO,');
  });

  it('image-to-video sends it explicitly, from the same constant', () => {
    // The FETCH, not the documented contract higher up the file.
    const start = I2V.indexOf('await fetch(`${engineBase()}/v1/image-to-video`');
    expect(start).toBeGreaterThan(-1);
    const body = I2V.slice(start, start + 700);
    expect(body).toContain('audio: SOVEREIGN_VIDEO_AUDIO,');
    expect(I2V).toContain("import { SOVEREIGN_VIDEO_AUDIO } from './magic-hour-adapter';");
  });

  it('neither route can be silent by omission any more', () => {
    // The field is present on both bodies; absence was the previous state.
    expect((T2V.match(/audio: SOVEREIGN_VIDEO_AUDIO,/g) ?? []).length).toBe(1);
    expect((I2V.match(/audio: SOVEREIGN_VIDEO_AUDIO,/g) ?? []).length).toBe(1);
  });
});

describe('C · silence does not depend on a client, a prompt or a provider', () => {
  it('no request field turns it on — there is none to send', () => {
    for (const src of [GENERATE_ROUTE, TEST_ROUTE, SERVICE, CLIENT]) {
      expect(src).not.toMatch(/\baudio\s*[:=]\s*true/);
      expect(src).not.toMatch(/withAudio|enableAudio|generateAudio|allowAudio/);
    }
  });

  it('the constant has no other setting and nothing overrides it', () => {
    expect(T2V).toContain('export const SOVEREIGN_VIDEO_AUDIO = false as const;');
    // No expression computes it, and no caller passes an alternative.
    expect(T2V).not.toMatch(/audio:\s*(true|options\.|input\.|request\.|b\.)/);
    expect(I2V).not.toMatch(/audio:\s*(true|options\.|input\.|request\.|b\.)/);
  });

  it('no prompt carries an audio instruction — the control is a parameter', () => {
    // Comments explain the rule; only CODE may not carry it into a prompt.
    const strip = (x: string) => x.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const src of [T2V, I2V, SERVICE]) {
      const code = strip(src);
      const AUDIO_WORDS = 'no audio|silent video|without sound';
      expect(code).not.toMatch(new RegExp('prompt[^\n]*(' + AUDIO_WORDS + ')', 'i'));
      expect(code).not.toMatch(new RegExp('(' + AUDIO_WORDS + ')[^\n]*prompt', 'i'));
    }
    // And the rule is stated as a parameter, in both dispatches.
    expect(strip(T2V)).toContain('audio: SOVEREIGN_VIDEO_AUDIO,');
    expect(strip(I2V)).toContain('audio: SOVEREIGN_VIDEO_AUDIO,');
  });
});

describe('E · the model-test path obeys the same boundary', () => {
  it('it dispatches through the same adapters, so it cannot bypass the rule', () => {
    // The test route calls generateVideo, which calls the same adapter that
    // now always sends audio: false. It has no audio surface of its own.
    expect(TEST_ROUTE).toContain('generateVideo({');
    expect(TEST_ROUTE).not.toMatch(/\baudio\b/);
  });

  it('naming a test-only model changes nothing about silence', () => {
    expect(SERVICE).toContain('testOnlyModelId');
    // Silence lives in the adapter, below every model choice.
    expect(SERVICE).not.toMatch(/\baudio\s*[:=]/);
  });
});

describe('F–H · the allocation is untouched by this closure', () => {
  it('Seedance remains authorized and active', () => {
    const s = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'seedance-2-0')!;
    expect([s.productionAuthorized, s.active]).toEqual([true, true]);
  });

  it('Veo remains authorized and active', () => {
    const v = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'veo-3-1')!;
    expect([v.productionAuthorized, v.active]).toEqual([true, true]);
  });

  it('MiniMax H3 remains dormant, test-only', () => {
    const h = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'minimax-h3')!;
    expect([h.productionAuthorized, h.active]).toEqual([false, false]);
  });

  it('the image allocation is unchanged', () => {
    expect(IMAGE_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId).sort())
      .toEqual(['nano-banana-2', 'nano-banana-pro']);
  });

  it('and the video allocation is unchanged', () => {
    expect(VIDEO_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId).sort())
      .toEqual(['seedance-2-0', 'veo-3-1']);
  });
});

describe('I–J · nothing else moved', () => {
  it('no prompt construction changed on any video path', () => {
    expect(T2V).toContain('style: { prompt: input.request.prompt },');
    expect(I2V).toContain('style: { prompt: instruction },');
  });

  it('no cost, credit, price or subscription field was touched', () => {
    for (const src of [T2V, I2V]) {
      expect(src).not.toMatch(/priceEgp|azmaUnits|subscription|billing/i);
    }
    // The charge the adapters report is unchanged and still in provider units.
    expect(T2V).toContain('magicHourCreditsCharged: job.credits_charged,');
    expect(I2V).toContain("creditsCharged: typeof finished.credits_charged === 'number' ? finished.credits_charged : null,");
  });
});
