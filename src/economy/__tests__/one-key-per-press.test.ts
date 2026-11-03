/**
 * AZMA OS — مفتاحٌ واحدٌ للضغطةِ الواحدة، من الواجهةِ إلى الدفتر.
 *
 * ─── WHAT THIS DECIDES, AND WHY THE SERVER CANNOT ───────────────────────────
 *
 *   Two requests with the same Creator, the same picture and the same words
 *   are either one press the network sent twice, or two presses by someone
 *   who wants two pictures. The server cannot tell, and the two wrong guesses
 *   are not equally wrong: guessing «retry» runs a paid provider behind a
 *   closed hold, and guessing «new press» charges a retry twice.
 *
 *   So the browser answers. These tests hold the browser's half of the
 *   contract — when a key is minted, when it is reused, and when a new
 *   operation is allowed — because that half is the part a screen can quietly
 *   get wrong without any server test noticing.
 *
 *   The server's half is held by `no-paid-provider-without-a-gate.test.ts`,
 *   which reads the ledger.
 */

import {
  OPERATION_KEY_HEADER,
  operationKeyForPress,
  operationAnswered,
  operationConcluded,
  paidOperationHeaders,
} from '../client-operation-key';
import type { PaidRoad } from '../client-operation-key';
import { readFileSync } from 'fs';
import { join } from 'path';

/** A `sessionStorage` that behaves, for the tests that need one that works. */
function installWorkingStorage(): Map<string, string> {
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    },
  });
  return store;
}

/** The private window, where every access throws. */
function installThrowingStorage(): void {
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    get() { throw new Error('site data blocked'); },
  });
}

describe('١ · متى يُنشأ المفتاح، ومتى يُعاد', () => {
  beforeEach(() => { installWorkingStorage(); });

  it('a press with nothing remembered mints a key', () => {
    const key = operationKeyForPress('qiyamah:edit');
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(8);
  });

  it('a press while the previous one is UNANSWERED reuses its key — that is the retry', () => {
    const first = operationKeyForPress('qiyamah:edit');
    // No verdict recorded: the socket died, the edge answered HTML, the fetch
    // threw. Nothing concluded the operation.
    const retry = operationKeyForPress('qiyamah:edit');
    expect(retry).toBe(first);
  });

  it('a press after a VERDICT mints a new key — that is a new operation', () => {
    const first = operationKeyForPress('qiyamah:edit');
    operationAnswered('qiyamah:edit');
    const second = operationKeyForPress('qiyamah:edit');
    expect(second).not.toBe(first);
  });

  it('two identical presses, each answered, are two operations', () => {
    // THE RULE THE FOUNDER NAMED: identical content never implies one
    // operation. This module reads no content at all — it cannot.
    const a = operationKeyForPress('qiyamah:edit');
    operationConcluded('qiyamah:edit', { reason: undefined });
    const b = operationKeyForPress('qiyamah:edit');
    operationConcluded('qiyamah:edit', { reason: undefined });
    const c = operationKeyForPress('qiyamah:edit');
    expect(new Set([a, b, c]).size).toBe(3);
  });

  it('a refusal IS a verdict, so the next press is a new operation', () => {
    for (const reason of ['payment-required', 'cost-unavailable', 'already-performed', 'not-found']) {
      const first = operationKeyForPress('qiyamah:animate');
      operationConcluded('qiyamah:animate', { reason });
      const next = operationKeyForPress('qiyamah:animate');
      expect(next).not.toBe(first);
      operationAnswered('qiyamah:animate');
    }
  });

  it('«it is still running» is NOT a verdict, and the key survives it', () => {
    // The decisive case. Forgetting the key here would make the Creator's
    // next press a SECOND paid operation standing beside one that may yet
    // succeed — the exact failure the whole mechanism exists to prevent.
    const first = operationKeyForPress('qiyamah:animate');
    operationConcluded('qiyamah:animate', { reason: 'operation-in-flight' });
    expect(operationKeyForPress('qiyamah:animate')).toBe(first);
  });
});

describe('٢ · طريقٌ لا يَستعمِل مفتاحَ طريقٍ آخر', () => {
  beforeEach(() => { installWorkingStorage(); });

  const ROADS: readonly PaidRoad[] = [
    'qiyamah:image', 'qiyamah:animate', 'qiyamah:upscale', 'qiyamah:edit',
    'ras-amr:speech', 'ras-amr:voice-clone', 'ras-amr:cloned-speech',
  ];

  it('each road remembers its own key, so one unanswered act cannot be taken for another', () => {
    const keys = ROADS.map((road) => operationKeyForPress(road));
    expect(new Set(keys).size).toBe(ROADS.length);
    // And each road still answers with ITS OWN key on a retry.
    ROADS.forEach((road, i) => {
      expect(operationKeyForPress(road)).toBe(keys[i]);
    });
  });

  it('concluding one road does not spend another road key', () => {
    const edit = operationKeyForPress('qiyamah:edit');
    const animate = operationKeyForPress('qiyamah:animate');
    operationAnswered('qiyamah:edit');
    expect(operationKeyForPress('qiyamah:animate')).toBe(animate);
    expect(operationKeyForPress('qiyamah:edit')).not.toBe(edit);
  });
});

describe('٣ · الترويسةُ التي يَقرؤها الخادم', () => {
  beforeEach(() => { installWorkingStorage(); });

  it('carries the content type and this press key under the one header name', () => {
    const headers = paidOperationHeaders('qiyamah:upscale');
    expect(headers['Content-Type']).toBe('application/json');
    expect(typeof headers[OPERATION_KEY_HEADER]).toBe('string');
  });

  it('the header name is the SAME one the server reads', async () => {
    // One name, two files, and a test that fails if they ever drift. The
    // server's own constant is imported here rather than retyped.
    const server = await import('../paid-operation-attempts');
    expect(OPERATION_KEY_HEADER).toBe(server.OPERATION_KEY_HEADER);
  });

  it('two calls within one unanswered press send the SAME key', () => {
    const a = paidOperationHeaders('qiyamah:upscale')[OPERATION_KEY_HEADER];
    const b = paidOperationHeaders('qiyamah:upscale')[OPERATION_KEY_HEADER];
    expect(b).toBe(a);
  });
});

describe('٤ · ومتصفِّحٌ لا يُخزِّن شيئًا لا يَكسِر شيئًا', () => {
  it('a storage that throws still yields a key, and never reuses one', () => {
    installThrowingStorage();
    const a = operationKeyForPress('qiyamah:edit');
    const b = operationKeyForPress('qiyamah:edit');
    // It degrades to the SAFE side: each press is its own operation, which is
    // exactly the behaviour every road had before this module existed. It
    // never degrades to a silent reuse.
    expect(typeof a).toBe('string');
    expect(b).not.toBe(a);
    expect(() => operationAnswered('qiyamah:edit')).not.toThrow();
    expect(() => operationConcluded('qiyamah:edit', {})).not.toThrow();
  });
});

describe('٥ · والشاشاتُ تَستعمِلها فعلًا', () => {
  /*  A policy no screen calls is a policy that protects nothing. These read
   *  the two chambers' own source: each paid fetch must carry the header, and
   *  each must conclude its key where the verdict arrives.
   */
  const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

  const SCREENS: readonly { file: string; roads: readonly PaidRoad[] }[] = [
    {
      file: 'app/qiyamah-chamber/QiyamahChamberClient.tsx',
      roads: ['qiyamah:image', 'qiyamah:animate', 'qiyamah:upscale', 'qiyamah:edit'],
    },
    {
      file: 'app/ras-amr/page.tsx',
      roads: ['ras-amr:speech', 'ras-amr:voice-clone', 'ras-amr:cloned-speech'],
    },
  ];

  it.each(SCREENS)('$file mints and concludes a key for every paid road it calls', ({ file, roads }) => {
    const source = read(file);
    for (const road of roads) {
      expect(source).toContain(`paidOperationHeaders('${road}')`);
      expect(source).toContain(`operationConcluded('${road}'`);
    }
  });

  it('no paid fetch in either chamber still sends a bare content-type header', () => {
    // MEASURED: this is how all seven roads looked before this package. A
    // paid POST with no key is one the server must treat as its own
    // operation — correct, and never deduplicated.
    // The seven paid doors by their own URLs, each looked up by hand rather
    // than by a pattern — a pattern that silently matches six of seven is
    // worse than a list, because it reports success for the one it missed.
    const DOORS: readonly { file: string; urlFragment: string }[] = [
      { file: 'app/qiyamah-chamber/QiyamahChamberClient.tsx', urlFragment: "'/api/qiyamah/generate'" },
      { file: 'app/qiyamah-chamber/QiyamahChamberClient.tsx', urlFragment: '/animate`, {' },
      { file: 'app/qiyamah-chamber/QiyamahChamberClient.tsx', urlFragment: '/upscale`, {' },
      { file: 'app/qiyamah-chamber/QiyamahChamberClient.tsx', urlFragment: '/edit`, {' },
      { file: 'app/ras-amr/page.tsx', urlFragment: "'/api/vault/assets/generate-speech'" },
      { file: 'app/ras-amr/page.tsx', urlFragment: "'/api/vault/assets/clone-voice'" },
      { file: 'app/ras-amr/page.tsx', urlFragment: "'/api/vault/assets/generate-cloned-speech'" },
    ];

    let examined = 0;
    for (const { file, urlFragment } of DOORS) {
      const source = read(file);
      // A template URL is found by its own tail: there the call opens with a
      // backtick rather than with the path, so the path is not where the
      // literal begins.
      const at = urlFragment.startsWith(String.fromCharCode(39))
        ? source.indexOf(`fetch(${urlFragment}`)
        : source.indexOf(urlFragment);
      expect({ urlFragment, found: at !== -1 }).toEqual({ urlFragment, found: true });
      // The options object follows the url; 400 characters covers it with room.
      const options = source.slice(at, at + 400);
      examined += 1;
      expect({
        urlFragment,
        posts: /method:\s*'POST'/.test(options),
        hasKey: /paidOperationHeaders\(/.test(options),
      }).toEqual({ urlFragment, posts: true, hasKey: true });
    }
    // AN INSTRUMENT THAT FOUND NOTHING IS NOT REPORTING A ZERO. Seven paid
    // roads are called from these two screens; a regex that quietly matched
    // none of them would pass the loop above while proving nothing at all.
    expect(examined).toBe(7);
  });
});
