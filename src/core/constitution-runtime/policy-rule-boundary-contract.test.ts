import assert from 'node:assert/strict';
import test from 'node:test';
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

test('WP-003 evaluates policy boundary and produces traceable result', () => {
  const runtime = createRuntime();
  const result = runtime.evaluatePolicyBoundary({
    boundaryId: 'pb-001',
    actor: 'sovereign-high-council',
    action: createAction(),
    highImpact: true,
  });

  assert.ok(['allow', 'deny', 'defer', 'escalate'].includes(result.decision));
  assert.ok(result.traceId.startsWith('trace-policy-boundary-'));

  const trace = runtime.tracePolicyBoundary('pb-001');
  assert.ok(trace.constitutionalAnchors.length > 0);
});

test('WP-003 failure injection blocks unauthorized actor boundary evaluation', () => {
  const runtime = createRuntime();

  assert.throws(() => {
    runtime.evaluatePolicyBoundary({
      boundaryId: 'pb-unauthorized',
      actor: 'shared-constitutional',
      action: createAction(),
      highImpact: false,
    });
  });
});

test('WP-003 boundary condition escalates when no scope coverage exists', () => {
  const runtime = createRuntime();
  const result = runtime.evaluatePolicyBoundary({
    boundaryId: 'pb-coverage',
    actor: 'constitution-runtime',
    action: createAction({ scope: 'provider-management', actionType: 'provider-management' }),
    highImpact: false,
  });

  assert.equal(result.decision, 'escalate');
  assert.ok(result.escalationId);
});

test('WP-003 remains compatible with WP-002 by producing escalation route when required', () => {
  const runtime = createRuntime();
  const result = runtime.evaluatePolicyBoundary({
    boundaryId: 'pb-interop',
    actor: 'sovereign-high-council',
    action: createAction({ actionType: 'governance', scope: 'governance' }),
    highImpact: true,
  });

  assert.ok(result.escalationId);
  const escalationTrace = runtime.traceEscalation(result.escalationId as string);
  assert.ok(escalationTrace.route.length > 0);
});
