import { describe, expect, test } from '@jest/globals';
import { ConstitutionRuntime } from './constitution-runtime';

function createRuntime(): ConstitutionRuntime {
  const runtime = new ConstitutionRuntime();
  runtime.loadConstitution();
  return runtime;
}

describe('WP-002 escalation hierarchy contract', () => {
  test('plans escalation route with constitutional traceability', () => {
    const runtime = createRuntime();

    const route = runtime.planEscalation({
      escalationId: 'esc-001',
      actor: 'constitution-runtime',
      domain: 'policy',
      actionType: 'governance',
      contextClass: 'policy-conflict',
      trigger: 'policy-conflict',
      highImpact: true,
    });

    expect(route.escalationId).toBe('esc-001');
    expect(route.route.length).toBeGreaterThanOrEqual(2);
    expect(route.constitutionalAnchors.length).toBeGreaterThan(0);
  });

  test('resolves escalation by authorized actor', () => {
    const runtime = createRuntime();

    runtime.planEscalation({
      escalationId: 'esc-002',
      actor: 'al-wateen',
      domain: 'simulation',
      actionType: 'simulation',
      contextClass: 'simulation-risk',
      trigger: 'high-impact',
      highImpact: true,
    });

    const result = runtime.resolveEscalation({
      escalationId: 'esc-002',
      resolvedBy: 'sovereign-high-council',
      outcome: 'approved',
      notes: 'Approved under sovereign council review.',
    });

    expect(result.closed).toBe(true);
    expect(result.decision).toBe('resolved');

    const trace = runtime.traceEscalation('esc-002');
    expect(trace.route.length).toBeGreaterThan(0);
    expect(trace.constitutionalAnchors.length).toBeGreaterThan(0);
  });

  test('blocks unauthorized escalation resolution', () => {
    const runtime = createRuntime();

    runtime.planEscalation({
      escalationId: 'esc-003',
      actor: 'constitution-runtime',
      domain: 'security',
      actionType: 'security',
      contextClass: 'security-risk',
      trigger: 'constitutional-risk',
      highImpact: true,
    });

    expect(() => {
      runtime.resolveEscalation({
        escalationId: 'esc-003',
        resolvedBy: 'shared-constitutional',
        outcome: 'approved',
        notes: 'Invalid resolution attempt.',
      });
    }).toThrow();
  });

  test('boundary condition keeps route deterministic', () => {
    const runtime = createRuntime();

    const first = runtime.planEscalation({
      escalationId: 'esc-004-a',
      actor: 'constitution-runtime',
      domain: 'memory',
      actionType: 'memory',
      contextClass: 'boundary-determinism',
      trigger: 'manual-escalation',
    });
    const second = runtime.planEscalation({
      escalationId: 'esc-004-b',
      actor: 'constitution-runtime',
      domain: 'memory',
      actionType: 'memory',
      contextClass: 'boundary-determinism',
      trigger: 'manual-escalation',
    });

    expect(first.route.length).toBe(second.route.length);
    expect(first.route[0]?.owner).toBe(second.route[0]?.owner);
  });
});
