/**
 * AZMA OS — THE OPERATION CATALOG, 2026-10-11.
 *
 * D-3: availability was one unrelated key — `!!MAGIC_HOUR_API_KEY` — standing
 * in for six different questions, and right only by coincidence.
 * D-7: three fleet entries carry `active: true` with `productionAuthorized:
 * false`, and an unauthorized model must never reach a Creator's chooser.
 */

import {
  stateOfOperation, qiyamahOperations, operationDescriptor,
  selectableModelIds, contradictoryAuthorizationFlags,
  OPERATION_GROUPS,
} from '../operation-catalog';
import { QIYAMAH_OPERATION_IDS, designatedBindingFor } from '../prompt-contract';
import { IMAGE_MODEL_FLEET } from '../../sovereign-model-selection/image-model-fleet';
import { VIDEO_MODEL_FLEET } from '../../sovereign-model-selection/video-model-fleet';

const KEYS = ['MAGIC_HOUR_API_KEY', 'OPENAI_API_KEY', 'ELEVENLABS_API_KEY'];
const saved: Record<string, string | undefined> = {};
beforeAll(() => { for (const k of KEYS) saved[k] = process.env[k]; });
afterEach(() => {
  for (const k of KEYS) {
    if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k];
  }
});

describe('D-3 · availability is the operation’s own pathway, not one key', () => {
  it('an operation whose gateway is unreachable is NOT available, and says why', () => {
    const s = stateOfOperation('image', [] /* no gateway configured */, null);
    expect(s.runnable).toBe(false);
    expect(s.availability).toBe('NO_CREDENTIAL');
    expect(s.reasonAr.length).toBeGreaterThan(0);
  });

  it('the same operation IS available once its own gateway is reachable', () => {
    const gateway = designatedBindingFor('image').gatewayId!;
    expect(stateOfOperation('image', [gateway], null).runnable).toBe(true);
  });

  it('a gateway that is not this operation’s does not make it available', () => {
    // The old signal would have answered «available» for any operation the
    // moment one unrelated credential existed.
    const s = stateOfOperation('video', ['some-other-gateway'], null);
    expect(s.runnable).toBe(false);
  });

  it('every operation answers separately — one boolean no longer speaks for six', () => {
    const states = qiyamahOperations(null);
    expect(states).toHaveLength(QIYAMAH_OPERATION_IDS.length);
    expect(new Set(states.map((s) => s.id)).size).toBe(QIYAMAH_OPERATION_IDS.length);
  });

  it('a runnable operation carries no reason, and an unrunnable one always carries one', () => {
    for (const gateways of [[], ['magic-hour']]) {
      for (const s of QIYAMAH_OPERATION_IDS.map((id) => stateOfOperation(id, gateways, null))) {
        expect(s.reasonAr.length > 0).toBe(!s.runnable);
      }
    }
  });

  it('the detail kept for the acceptance report names no credential', () => {
    for (const s of qiyamahOperations(null)) {
      expect(s.detailEn).not.toMatch(/sk-|Bearer|API_KEY=|[0-9a-f]{32}/);
    }
  });
});

describe('D-7 · an unauthorized model cannot reach a chooser', () => {
  it('the selectable pool requires BOTH flags', () => {
    for (const fleet of [IMAGE_MODEL_FLEET, VIDEO_MODEL_FLEET]) {
      const selectable = selectableModelIds(fleet);
      for (const id of selectable) {
        const m = fleet.find((x) => x.modelId === id)!;
        expect(m.productionAuthorized && m.active).toBe(true);
      }
    }
  });

  it('no model with contradictory flags appears in the selectable pool', () => {
    for (const fleet of [IMAGE_MODEL_FLEET, VIDEO_MODEL_FLEET]) {
      const selectable = new Set(selectableModelIds(fleet));
      for (const id of contradictoryAuthorizationFlags(fleet)) {
        expect(selectable.has(id)).toBe(false);
      }
    }
  });

  it('the contradiction is reported rather than silently resolved', () => {
    // It is the Chief Architect's to rule, so the count is NOT asserted to be
    // zero. What is asserted is that the register answers at all, so the
    // acceptance report can name every entry awaiting that ruling.
    const all = [
      ...contradictoryAuthorizationFlags(IMAGE_MODEL_FLEET),
      ...contradictoryAuthorizationFlags(VIDEO_MODEL_FLEET),
    ];
    expect(Array.isArray(all)).toBe(true);
    for (const id of all) expect(typeof id).toBe('string');
  });
});

describe('the six acts are one authority, discovered once', () => {
  it('each operation belongs to exactly one declared group', () => {
    const groups = new Set(OPERATION_GROUPS.map((g) => g.id));
    for (const id of QIYAMAH_OPERATION_IDS) {
      expect(groups.has(operationDescriptor(id).group)).toBe(true);
    }
  });

  it('every operation names a cost step and never a price', () => {
    for (const s of qiyamahOperations(null)) {
      expect(s.costStep).toMatch(/^[A-Z0-9_]+$/);
      expect(Object.keys(s)).not.toContain('price');
      expect(Object.keys(s)).not.toContain('balanceConsumed');
    }
  });

  it('historical proof is a separate field from present availability', () => {
    const s = stateOfOperation('image', [], null);
    expect(s.historicallyProven).toBe(true);
    expect(s.runnable).toBe(false);
  });

  it('the operation that takes no brief is the only one with no brief', () => {
    const noBrief = qiyamahOperations(null).filter((s) => !s.takesBrief).map((s) => s.id);
    expect(noBrief).toEqual(['upscale']);
  });

  it('no Creator-facing field carries a provider or model name', () => {
    const forbidden = /magic.?hour|openai|nano.?banana|seedance|veo|minimax|kling|ltx|flux|dall|gpt/i;
    for (const s of qiyamahOperations(null)) {
      expect(s.nameAr).not.toMatch(forbidden);
      expect(s.outcomeAr).not.toMatch(forbidden);
      expect(s.reasonAr).not.toMatch(forbidden);
      expect(s.brief.capNoticeAr).not.toMatch(forbidden);
    }
  });
});
