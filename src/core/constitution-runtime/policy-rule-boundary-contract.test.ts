import { describe, expect, test } from '@jest/globals';
import { ConstitutionRuntime } from './constitution-runtime';

function createAction(overrides: Partial<Parameters<ConstitutionRuntime['evaluatePolicyBoundary']>[0]['action']> = {}) {
  return {
    actionId: 'act-001',
    actionType: 'governance' as const,
    title: 'Policy Boundary Action',
    description: 'Governance boundary check',
    targetModule: 'constitution-runtime' as const,
    requestedBy: 'system',
    requestedAt: new Date(),
    scope: 'governance' as const,
    priority: 'high' as const,
    payload: { governance: true },
    metadata: { constitutional: true },
    ...overrides,
  };
}

function createRuntime(): ConstitutionRuntime {
  const runtime = new ConstitutionRuntime();
  runtime.loadConstitution();
  return runtime;
}

describe('WP-003 policy rule boundary contract', () => {
  test('evaluates policy boundary and produces traceable result', () => {
    const runtime = createRuntime();
    const result = runtime.evaluatePolicyBoundary({
      boundaryId: 'pb-001',
      actor: 'sovereign-high-council',
      action: createAction(),
      highImpact: true,
    });

    expect(['allow', 'deny', 'defer', 'escalate']).toContain(result.decision);
    expect(result.traceId.startsWith('trace-policy-boundary-')).toBe(true);

    const trace = runtime.tracePolicyBoundary('pb-001');
    expect(trace.constitutionalAnchors.length).toBeGreaterThan(0);
  });

  test('failure injection blocks unauthorized actor boundary evaluation', () => {
    const runtime = createRuntime();

    expect(() => {
      runtime.evaluatePolicyBoundary({
        boundaryId: 'pb-unauthorized',
        actor: 'shared-constitutional',
        action: createAction(),
        highImpact: false,
      });
    }).toThrow();
  });

  test('boundary condition escalates when no scope coverage exists', () => {
    const runtime = createRuntime();
    const result = runtime.evaluatePolicyBoundary({
      boundaryId: 'pb-coverage',
      actor: 'constitution-runtime',
      action: createAction({ scope: 'provider-management', actionType: 'provider-management' }),
      highImpact: false,
    });

    expect(result.decision).toBe('escalate');
    expect(result.escalationId).toBeTruthy();
  });

  test('remains compatible with WP-002 by producing escalation route when required', () => {
    const runtime = createRuntime();
    const result = runtime.evaluatePolicyBoundary({
      boundaryId: 'pb-interop',
      actor: 'sovereign-high-council',
      action: createAction({ actionType: 'governance', scope: 'governance' }),
      highImpact: true,
    });

    expect(result.escalationId).toBeTruthy();
    const escalationTrace = runtime.traceEscalation(result.escalationId as string);
    expect(escalationTrace.route.length).toBeGreaterThan(0);
  });
});
