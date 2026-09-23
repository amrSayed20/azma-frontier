/**
 * AZMA OS — Material from the Chamber of Evidence must survive the crossing.
 *
 * ─── WHAT WAS MEASURED (2026-09-22) ─────────────────────────────────────────
 *
 *   Hujjah wrote the investigation's evidence into sessionStorage and
 *   navigated. Qiyamah's Experience wrapper read that key, deleted it, and
 *   set a companion message. The Client — the only thing that could use the
 *   material — never saw it; the idea input stayed empty. The material the
 *   Creator had produced evaporated at the door.
 *
 * ─── WHAT THIS HOLDS SHUT ───────────────────────────────────────────────────
 *
 *   Journey state, material identity and material content are three things.
 *   The envelope is consumed once; the identity is kept for the tab; the
 *   content is the Creator's Vault asset, resolved through the Vault's own
 *   ownership boundary. And the code that does it stays wired: the source
 *   assertions below fail the moment the wrapper consumes the envelope again
 *   or Hujjah starts carrying evidence instead of an identity.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  INVESTIGATION_ENVELOPE_KEY,
  MATERIAL_KEY,
  IDEA_BUDGET,
  takeMaterialIdentity,
  pickInvestigationAsset,
  composeIdeaFromInvestigation,
  resolveArrival,
  spokenArrival,
} from '../_lib/material-from-investigation';
import type { EnvelopeStorage } from '../_lib/material-from-investigation';

function memoryStorage(initial: Record<string, string> = {}): EnvelopeStorage & { dump(): Record<string, string> } {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => { map.set(k, v); },
    removeItem: (k) => { map.delete(k); },
    dump: () => Object.fromEntries(map),
  };
}

describe('the envelope is journey state — consumed once, identity kept', () => {
  it('takes the identity from a fresh envelope, removes the envelope, keeps the identity for the tab', () => {
    const s = memoryStorage({ [INVESTIGATION_ENVELOPE_KEY]: JSON.stringify({ assetId: 'asset-7', questionAr: 'س' }) });
    expect(takeMaterialIdentity(s)).toBe('asset-7');
    expect(s.dump()).toEqual({ [MATERIAL_KEY]: JSON.stringify({ assetId: 'asset-7' }) });
  });

  it('a refresh (no envelope) answers the identity kept for the tab', () => {
    const s = memoryStorage({ [MATERIAL_KEY]: JSON.stringify({ assetId: 'asset-7' }) });
    expect(takeMaterialIdentity(s)).toBe('asset-7');
    expect(takeMaterialIdentity(s)).toBe('asset-7');
  });

  it('an envelope of the old shape — evidence, no identity — names nothing and is still removed', () => {
    const s = memoryStorage({
      [INVESTIGATION_ENVELOPE_KEY]: JSON.stringify({ query: 'س', evidence: [{ id: 'e1' }], timestamp: 1 }),
    });
    expect(takeMaterialIdentity(s)).toBeNull();
    expect(s.dump()).toEqual({});
  });

  it('malformed or empty journey state fails safely', () => {
    expect(takeMaterialIdentity(memoryStorage({ [INVESTIGATION_ENVELOPE_KEY]: '{not json' }))).toBeNull();
    expect(takeMaterialIdentity(memoryStorage({ [MATERIAL_KEY]: '{"assetId": 42}' }))).toBeNull();
    expect(takeMaterialIdentity(memoryStorage())).toBeNull();
  });
});

describe('ownership: the Vault decides, Qiyamah only recognizes', () => {
  const mine = [
    { assetId: 'inv-1', metadata: { originChamber: 'hujjah-al-damighah', questionAr: 'ما الصبر؟', answerAr: 'الصبر…' } },
    { assetId: 'img-1', metadata: { originChamber: 'qiyamah-chamber' } },
  ];

  it('resolves an investigation asset this Creator owns', () => {
    expect(pickInvestigationAsset(mine, 'inv-1')?.assetId).toBe('inv-1');
  });

  it("an envelope naming another Creator's asset resolves to nothing — it is not in this Creator's list", () => {
    expect(pickInvestigationAsset(mine, 'someone-elses-inv')).toBeNull();
  });

  it('an envelope naming an asset that is not an investigation resolves to nothing', () => {
    expect(pickInvestigationAsset(mine, 'img-1')).toBeNull();
  });

  it('an empty Vault resolves to nothing', () => {
    expect(pickInvestigationAsset([], 'inv-1')).toBeNull();
  });
});

describe('the material becomes an idea within the budget Qiyamah can actually take', () => {
  it('question and answer, in that order', () => {
    expect(composeIdeaFromInvestigation({ questionAr: 'ما الصبر؟', answerAr: 'الصبر حبسُ النفس.' }))
      .toBe('ما الصبر؟\n\nالصبر حبسُ النفس.');
  });

  it('question alone when there is no answer (assets kept before answerAr existed)', () => {
    expect(composeIdeaFromInvestigation({ questionAr: 'ما الصبر؟' })).toBe('ما الصبر؟');
  });

  it('never exceeds the idea budget', () => {
    const long = composeIdeaFromInvestigation({ questionAr: 'س', answerAr: 'ج'.repeat(5000) });
    expect(long).not.toBeNull();
    expect(long!.length).toBe(IDEA_BUDGET);
  });

  it('nothing usable yields nothing — no empty idea is ever placed', () => {
    expect(composeIdeaFromInvestigation({})).toBeNull();
    expect(composeIdeaFromInvestigation(undefined)).toBeNull();
    expect(composeIdeaFromInvestigation({ questionAr: 42, answerAr: null })).toBeNull();
  });
});

describe('the wiring stays as measured', () => {
  const ROOT = process.cwd();
  const strip = (f: string) => readFileSync(join(ROOT, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  it("Hujjah crosses with the asset's identity, never with the evidence", () => {
    const code = strip('app/hujjah-al-damighah/page.tsx');
    // The old envelope serialized `evidence: result.evidence`; that shape is gone.
    expect(code).not.toMatch(/evidence:\s*result\.evidence/);
    // The envelope written now carries the Vault's identity.
    expect(code).toMatch(/assetId:\s*outcome\.assetId/);
    // And the crossing into Qiyamah keeps the material first, refusing to cross otherwise.
    expect(code).toMatch(/destination === '\/qiyamah-chamber' && result[\s\S]*?ensureKeptInVault\(\)[\s\S]*?if \(assetId === null\)[\s\S]*?return;/);
  });

  it('Hujjah records the synthesized answer on the kept asset, bounded', () => {
    const code = strip('app/hujjah-al-damighah/actions.ts');
    expect(code).toMatch(/answerAr:[\s\S]*?slice\(0,\s*700\)/);
  });

  it('the Qiyamah Experience wrapper no longer consumes the envelope', () => {
    const code = strip('src/imperial-experience-engine/experiences/qiyamah-chamber/QiyamahChamberExperience.tsx');
    expect(code).not.toContain(INVESTIGATION_ENVELOPE_KEY);
    expect(code).toMatch(/origin === 'hujjah-al-damighah'/);
  });

  it('the Qiyamah Client consumes it and resolves the material through the Vault list', () => {
    const code = strip('app/qiyamah-chamber/QiyamahChamberClient.tsx');
    expect(code).toMatch(/takeMaterialIdentity\(sessionStorage\)/);
    // Still: identity -> the Vault's own list -> the idea input. The ownership
    // check now lives inside resolveArrival, which pickInvestigationAsset backs.
    expect(code).toMatch(/resolveMaterialIntoIdea[\s\S]*?fetch\('\/api\/vault\/assets'\)[\s\S]*?resolveArrival\(assets, assetId\)[\s\S]*?setIdea\(arrival\.idea\)/);
  });

  it('the Vault ceremony reads the identity-carrying envelope', () => {
    const code = strip('app/sovereign-vault-palace/page.tsx');
    expect(code).toMatch(/d\.questionAr \?\? d\.query/);
    expect(code).toMatch(/id:\s*d\.assetId \?\?/);
  });
});


/**
 * ─── THE ARRIVAL MUST STATE ITS OWN CONDITION ────────────────────────────────
 *
 *   MEASURED on production 2026-09-23, before this existed: crossing into
 *   Qiyamah with an identity naming material this Creator does not own gave
 *   an empty idea field, the plain label «فكرتك», and silence. Task 5 of the
 *   carrier directive forbids exactly that — the chamber must state the
 *   actual condition instead of presenting an empty field as normal.
 */
describe('an arrival that brings no material says which thing happened', () => {
  const MINE = { assetId: 'asset-mine', metadata: { originChamber: 'hujjah-al-damighah', questionAr: 'سؤالي', answerAr: 'جوابي' } };

  it('material present: the idea is the material, and nothing is said', () => {
    const arrival = resolveArrival([MINE], 'asset-mine');
    expect(arrival.kind).toBe('arrived');
    expect(arrival.kind === 'arrived' && arrival.idea).toContain('سؤالي');
    expect(spokenArrival(arrival)).toBeNull();
  });

  it('a Vault that could not be asked is never reported as material that is gone', () => {
    const unreachable = resolveArrival(null, 'asset-mine');
    const absent = resolveArrival([], 'asset-mine');
    expect(unreachable.kind).toBe('vault-unreachable');
    expect(absent.kind).toBe('not-in-vault');
    // The two truths must not collapse into one sentence.
    expect(spokenArrival(unreachable)).not.toBe(spokenArrival(absent));
  });

  it("another Creator's asset is 'not in your Vault' — never resolved, never explained away", () => {
    const theirs = { assetId: 'asset-theirs', metadata: { originChamber: 'hujjah-al-damighah', questionAr: 'سؤالهم' } };
    // The Vault answered with only what THIS Creator owns; theirs is not in it.
    const arrival = resolveArrival([MINE], 'asset-theirs');
    expect(arrival.kind).toBe('not-in-vault');
    expect(spokenArrival(arrival)).not.toContain(theirs.metadata.questionAr);
  });

  it('an asset that is not an investigation is not taken up as one', () => {
    expect(resolveArrival([{ assetId: 'asset-mine', metadata: { originChamber: 'qiyamah-chamber' } }], 'asset-mine').kind)
      .toBe('not-in-vault');
  });

  it('an investigation carrying no usable text says so, rather than placing an empty idea', () => {
    const arrival = resolveArrival([{ assetId: 'asset-mine', metadata: { originChamber: 'hujjah-al-damighah' } }], 'asset-mine');
    expect(arrival.kind).toBe('no-usable-text');
    expect(spokenArrival(arrival)).toBeTruthy();
  });

  it('every non-arrival is spoken, in Arabic, and none is silent', () => {
    for (const kind of ['vault-unreachable', 'not-in-vault', 'no-usable-text'] as const) {
      const said = spokenArrival({ kind });
      expect(said).toBeTruthy();
      expect(said).toMatch(/[؀-ۿ]/);
      expect(said).not.toMatch(/[A-Za-z]{3}/);
    }
  });
});

describe('the chamber is wired to the arrival, and cannot go silent again', () => {
  const CLIENT = readFileSync(join(process.cwd(), 'app/qiyamah-chamber/QiyamahChamberClient.tsx'), 'utf8');

  it('the Client decides the arrival through the carrier and renders the condition', () => {
    expect(CLIENT).toMatch(/resolveArrival\(assets, assetId\)/);
    expect(CLIENT).toMatch(/setMaterialNotice\(spokenArrival\(arrival\)\)/);
    expect(CLIENT).toMatch(/\{materialNotice && <p className="material-notice">\{materialNotice\}<\/p>\}/);
  });

  it('a Vault that did not answer becomes null — not an empty list of assets', () => {
    // `.catch(() => null)` is what keeps 'could not ask' from becoming 'gone'.
    expect(CLIENT).toMatch(/\.catch\(\(\) => null\)/);
  });

  it('the Creator typing clears the condition — it describes their arrival, not their work', () => {
    expect(CLIENT).toMatch(/setIdea\(e\.target\.value\); setMaterialNotice\(null\);/);
  });

  it('arrival still never produces anything: no generation call sits in the material path', () => {
    const path = CLIENT.slice(CLIENT.indexOf('const resolveMaterialIntoIdea'), CLIENT.indexOf('useEffect(() => {', CLIENT.indexOf('const resolveMaterialIntoIdea')));
    for (const forbidden of ['/api/qiyamah/generate', 'handleEmbodyScene', 'acceptVideo', 'providerModelId']) {
      expect(path).not.toContain(forbidden);
    }
  });
});
