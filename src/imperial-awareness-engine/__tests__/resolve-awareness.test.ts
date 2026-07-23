import { resolveAwareness } from '../resolve-awareness';

describe('The Imperial Awareness Engine — resolveAwareness', () => {
  it('offers the member and explorer doors at the Gate when no session exists', () => {
    const plan = resolveAwareness({ creator: { authenticated: false, role: null }, workflowStage: 'gate' });
    expect(plan.availableCapabilities.map((c) => c.id)).toEqual(['enter-as-member', 'enter-as-explorer']);
  });

  it('offers only entry into the Chamber at the Gate once authenticated', () => {
    const plan = resolveAwareness({ creator: { authenticated: true, role: 'creator' }, workflowStage: 'gate' });
    expect(plan.availableCapabilities.map((c) => c.id)).toEqual(['enter-chamber']);
  });

  it('asks a signed-out visitor to sign in before subscribing', () => {
    const plan = resolveAwareness({ creator: { authenticated: false, role: null }, workflowStage: 'subscribe' });
    expect(plan.availableCapabilities.map((c) => c.id)).toEqual(['sign-in-to-subscribe']);
  });

  it('tells a Founder no subscription is needed', () => {
    const plan = resolveAwareness({ creator: { authenticated: true, role: 'founder' }, workflowStage: 'subscribe' });
    expect(plan.availableCapabilities.map((c) => c.id)).toEqual(['founder-no-subscription-needed']);
  });

  it('offers the real Subscribe capability to an authenticated Creator', () => {
    const plan = resolveAwareness({ creator: { authenticated: true, role: 'creator' }, workflowStage: 'subscribe' });
    expect(plan.availableCapabilities.map((c) => c.id)).toEqual(['subscribe']);
  });

  it('resolves each Chamber generation state to its own single capability', () => {
    expect(resolveAwareness({ creator: { authenticated: false, role: null }, workflowStage: 'chamber', chamberState: 'unauthorized' }).availableCapabilities.map((c) => c.id)).toEqual(['sign-in-to-generate']);
    expect(resolveAwareness({ creator: { authenticated: true, role: 'creator' }, workflowStage: 'chamber', chamberState: 'payment-required' }).availableCapabilities.map((c) => c.id)).toEqual(['subscribe-to-generate']);
    expect(resolveAwareness({ creator: { authenticated: true, role: 'creator' }, workflowStage: 'chamber', chamberState: 'error' }).availableCapabilities.map((c) => c.id)).toEqual(['retry-generation']);
    expect(resolveAwareness({ creator: { authenticated: true, role: 'creator' }, workflowStage: 'chamber', chamberState: 'complete' }).availableCapabilities.map((c) => c.id)).toEqual(['generate-another']);
  });

  it('offers nothing mid-flight, before any generation has been attempted', () => {
    const plan = resolveAwareness({ creator: { authenticated: true, role: 'creator' }, workflowStage: 'chamber', chamberState: 'idle' });
    expect(plan.availableCapabilities).toEqual([]);
  });

  it('offers nothing when the chamber threshold carries no chamberState at all', () => {
    const plan = resolveAwareness({ creator: { authenticated: true, role: 'creator' }, workflowStage: 'chamber' });
    expect(plan.availableCapabilities).toEqual([]);
  });

  it('produces a Manifestation Plan shape, not a rendered shape — ids only, never a label or style', () => {
    const plan = resolveAwareness({ creator: { authenticated: false, role: null }, workflowStage: 'gate' });
    for (const capability of plan.availableCapabilities) {
      expect(Object.keys(capability)).toEqual(['id']);
    }
  });
});
