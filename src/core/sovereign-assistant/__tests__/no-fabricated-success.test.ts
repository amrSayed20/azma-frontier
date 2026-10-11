/**
 * AZMA OS — NO COMMAND REPORTS SUCCESS FOR NOTHING, 2026-10-11.
 *
 * ─── WHAT THESE GUARD ──────────────────────────────────────────────────────
 *
 *   `ContentCreationCommand.generateImage` and `.generateVideo` returned a
 *   fabricated success: an invented identifier and a `https://cdn.azma.ai/…`
 *   URL, with no provider called, no job submitted and no asset deposited.
 *   Those two lines were the only occurrences of that host in the repository,
 *   and it resolves to nothing.
 *
 *   An identifier is not a production and a URL is not an asset. A caller
 *   could have persisted either, rendered it as a completed result, or handed
 *   it to another operation.
 *
 *   The class is kept — it is unreachable from every production path, so its
 *   existence is a connection debt for the Chief Architect to rule on, not
 *   something an engineer deletes. What is removed is the lie.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { ContentCreationCommand } from '../founder-command/founder-command-center';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const SOURCE = read('src/core/sovereign-assistant/founder-command/founder-command-center.ts');
/** Comments record the defect by name; only CODE is judged for containing it. */
const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('1 · neither root can return a fabricated production success', () => {
  const command = new ContentCreationCommand();

  it('image generation answers «unavailable», never a result', async () => {
    const r = await command.generateImage('content_1', {
      style: 'cinematic', dimensions: '1024x1024', prompt: 'مشهد',
    });
    expect(r.status).toBe('unavailable');
    expect(Object.keys(r)).toEqual(['status', 'reason']);
  });

  it('video generation answers «unavailable», never a result', async () => {
    const r = await command.generateVideo('content_1', { duration: 8, style: 'cinematic' });
    expect(r.status).toBe('unavailable');
    expect(Object.keys(r)).toEqual(['status', 'reason']);
  });

  it('no identifier and no URL cross the boundary at all', async () => {
    const both = [
      await command.generateImage('c', { style: 's', dimensions: '1x1', prompt: 'p' }),
      await command.generateVideo('c', { duration: 1, style: 's' }),
    ];
    for (const r of both) {
      const json = JSON.stringify(r);
      expect(json).not.toMatch(/https?:\/\//);
      expect(json).not.toMatch(/image_\d|video_\d|asset_/);
    }
  });

  it('the answer is never the same shape twice by accident — it is a constant', async () => {
    const a = await command.generateImage('c', { style: 's', dimensions: '1x1', prompt: 'p' });
    const b = await command.generateImage('c', { style: 's', dimensions: '1x1', prompt: 'p' });
    // A fabricated id used `Date.now()` and `Math.random()`, so two calls
    // differed. A refusal is identical every time — that is the tell.
    expect(a).toEqual(b);
  });
});

describe('2 · the unavailable status is truthful and actionable', () => {
  it('it names what is missing and where real generation lives', async () => {
    const r = await new ContentCreationCommand()
      .generateVideo('c', { duration: 8, style: 'cinematic' });
    expect(r.reason).toContain('not-implemented');
    expect(r.reason).toMatch(/Qiyamah generation service/i);
  });

  it('it does not claim a provider answered or an asset exists', async () => {
    const r = await new ContentCreationCommand()
      .generateImage('c', { style: 's', dimensions: '1x1', prompt: 'p' });
    expect(r.reason).not.toMatch(/success|completed|generated|deposited/i);
  });
});

describe('3 · the synthetic host and the invented ids are gone from the code', () => {
  it('cdn.azma.ai appears in no executable line', () => {
    expect(CODE).not.toContain('cdn.azma.ai');
  });

  it('no identifier is minted from a clock or a random number in these roots', () => {
    const i = CODE.indexOf('generateVideo(');
    const j = CODE.indexOf('generateImage(');
    expect(i).toBeGreaterThan(-1);
    expect(j).toBeGreaterThan(-1);
    const span = CODE.slice(Math.min(i, j), Math.max(i, j) + 900);
    expect(span).not.toMatch(/Date\.now\(\)/);
    expect(span).not.toMatch(/Math\.random\(\)/);
  });

  it('the defect is still recorded in prose, so nobody reintroduces it', () => {
    // Removing the lie without recording it invites the next engineer to
    // write it again.
    expect(SOURCE).toContain('cdn.azma.ai');
    expect(SOURCE).toMatch(/FABRICATED|fabricated/);
  });
});

describe('4 · the surface is preserved — nothing was deleted', () => {
  it('both methods still exist and still take their original arguments', () => {
    const c = new ContentCreationCommand();
    expect(typeof c.generateImage).toBe('function');
    expect(typeof c.generateVideo).toBe('function');
    expect(c.generateImage.length).toBe(2);
    expect(c.generateVideo.length).toBe(2);
  });

  it('the class’s other commands are untouched', async () => {
    const c = new ContentCreationCommand();
    const id = await c.createContent('عنوان', 'وصف', {});
    expect(typeof id).toBe('string');
    expect(id).toMatch(/^content_/);
  });
});

describe('5 · and the roots are reachable from no production path', () => {
  it('nothing outside its own folder imports the sovereign assistant', () => {
    const { execSync } = require('child_process');
    const out = execSync(
      'git grep -l "core/sovereign-assistant" -- "app/**/*.ts" "app/**/*.tsx" '
      + '"src/**/*.ts" "src/**/*.tsx" || true',
      { encoding: 'utf8', cwd: process.cwd() },
    ) as string;
    const foreign = out.split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('src/core/sovereign-assistant/'));
    // If this ever fails, the module became reachable — and then its
    // unimplemented commands need a ruling before anything calls them.
    expect(foreign).toEqual([]);
  });
});
