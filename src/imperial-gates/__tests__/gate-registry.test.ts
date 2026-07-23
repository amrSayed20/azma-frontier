import { IMPERIAL_GATE_SCORES } from '../gate-registry';
import { EMOTIONAL_ARCS, DEFAULT_COMPANION_DIRECTION } from '../../design-system';

describe('The Imperial Gates — Gate Registry', () => {
  it('has real, authored entries for landing, login, signup, and subscription', () => {
    expect(IMPERIAL_GATE_SCORES.landing).toBeDefined();
    expect(IMPERIAL_GATE_SCORES.login).toBeDefined();
    expect(IMPERIAL_GATE_SCORES.signup).toBeDefined();
    expect(IMPERIAL_GATE_SCORES.subscription).toBeDefined();
  });

  it('has no entry for imperial-gate — no live route exists for it yet, disclosed not invented', () => {
    expect(IMPERIAL_GATE_SCORES['imperial-gate']).toBeUndefined();
  });

  it('reuses already-certified EMOTIONAL_ARCS and DEFAULT_COMPANION_DIRECTION verbatim — no new vocabulary invented', () => {
    expect(IMPERIAL_GATE_SCORES.landing?.arc).toBe(EMOTIONAL_ARCS.ceremonial);
    expect(IMPERIAL_GATE_SCORES.login?.arc).toBe(EMOTIONAL_ARCS.standard);
    expect(IMPERIAL_GATE_SCORES.landing?.companionDirection).toBe(DEFAULT_COMPANION_DIRECTION);
  });

  it('every entry\'s gateId matches its own registry key', () => {
    for (const [key, score] of Object.entries(IMPERIAL_GATE_SCORES)) {
      expect(score?.gateId).toBe(key);
    }
  });
});
