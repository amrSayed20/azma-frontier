import { resolveAvailableActions } from '../resolve-available-actions';

describe('The Button Engine — resolveAvailableActions', () => {
  it('offers the member and explorer doors at the Gate when no session exists', () => {
    const actions = resolveAvailableActions({ threshold: 'gate', authenticated: false, role: null });
    expect(actions.map((a) => a.id)).toEqual(['enter-as-member', 'enter-as-explorer']);
  });

  it('offers only entry into the Chamber at the Gate once authenticated', () => {
    const actions = resolveAvailableActions({ threshold: 'gate', authenticated: true, role: 'creator' });
    expect(actions.map((a) => a.id)).toEqual(['enter-chamber']);
  });

  it('asks a signed-out visitor to sign in before subscribing', () => {
    const actions = resolveAvailableActions({ threshold: 'subscribe', authenticated: false, role: null });
    expect(actions.map((a) => a.id)).toEqual(['sign-in-to-subscribe']);
  });

  it('tells a Founder no subscription is needed', () => {
    const actions = resolveAvailableActions({ threshold: 'subscribe', authenticated: true, role: 'founder' });
    expect(actions[0]).toMatchObject({ id: 'founder-no-subscription-needed', kind: 'informational' });
  });

  it('offers the real Subscribe action to an authenticated Creator', () => {
    const actions = resolveAvailableActions({ threshold: 'subscribe', authenticated: true, role: 'creator' });
    expect(actions.map((a) => a.id)).toEqual(['subscribe']);
  });

  it('resolves each Chamber generation state to its own single action', () => {
    expect(resolveAvailableActions({ threshold: 'chamber', authenticated: false, role: null, chamberState: 'unauthorized' }).map((a) => a.id)).toEqual(['sign-in-to-generate']);
    expect(resolveAvailableActions({ threshold: 'chamber', authenticated: true, role: 'creator', chamberState: 'payment-required' }).map((a) => a.id)).toEqual(['subscribe-to-generate']);
    expect(resolveAvailableActions({ threshold: 'chamber', authenticated: true, role: 'creator', chamberState: 'error' }).map((a) => a.id)).toEqual(['retry-generation']);
    expect(resolveAvailableActions({ threshold: 'chamber', authenticated: true, role: 'creator', chamberState: 'complete' }).map((a) => a.id)).toEqual(['generate-another']);
  });

  it('offers nothing mid-flight, before any generation has been attempted', () => {
    const actions = resolveAvailableActions({ threshold: 'chamber', authenticated: true, role: 'creator', chamberState: 'idle' });
    expect(actions).toEqual([]);
  });

  it('every registered action carries a real dictionary key and a well-formed kind', () => {
    const allIds: Array<Parameters<typeof resolveAvailableActions>[0]> = [
      { threshold: 'gate', authenticated: false, role: null },
      { threshold: 'gate', authenticated: true, role: 'creator' },
      { threshold: 'subscribe', authenticated: false, role: null },
      { threshold: 'subscribe', authenticated: true, role: 'founder' },
      { threshold: 'subscribe', authenticated: true, role: 'creator' },
      { threshold: 'chamber', authenticated: true, role: 'creator', chamberState: 'unauthorized' },
      { threshold: 'chamber', authenticated: true, role: 'creator', chamberState: 'payment-required' },
      { threshold: 'chamber', authenticated: true, role: 'creator', chamberState: 'error' },
      { threshold: 'chamber', authenticated: true, role: 'creator', chamberState: 'complete' },
    ];
    for (const context of allIds) {
      for (const action of resolveAvailableActions(context)) {
        expect(typeof action.labelKey).toBe('string');
        expect(['navigate', 'submit', 'informational']).toContain(action.kind);
      }
    }
  });
});
