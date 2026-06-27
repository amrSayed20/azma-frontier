import assert from 'node:assert/strict';
import test from 'node:test';
import { ConstitutionRuntime } from './constitution-runtime';

function createRuntime(): ConstitutionRuntime {
  const runtime = new ConstitutionRuntime();
  runtime.loadConstitution();
  return runtime;
}

test('WP-002 plans escalation route with constitutional traceability', () => {
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

  assert.equal(route.escalationId, 'esc-001');
  assert.ok(route.route.length >= 2);
  assert.ok(route.constitutionalAnchors.length > 0);
});

test('WP-002 resolves escalation by authorized actor', () => {
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

  assert.equal(result.closed, true);
  assert.equal(result.decision, 'resolved');

  const trace = runtime.traceEscalation('esc-002');
  assert.ok(trace.route.length > 0);
  assert.ok(trace.constitutionalAnchors.length > 0);
});

test('WP-002 blocks unauthorized escalation resolution', () => {
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

  assert.throws(() => {
    runtime.resolveEscalation({
      escalationId: 'esc-003',
      resolvedBy: 'shared-constitutional',
      outcome: 'approved',
      notes: 'Invalid resolution attempt.',
    });
  });
});

test('WP-002 boundary condition keeps route deterministic', () => {
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

  assert.equal(first.route.length, second.route.length);
  assert.equal(first.route[0]?.owner, second.route[0]?.owner);
});
