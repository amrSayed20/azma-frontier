import assert from 'node:assert/strict';
import test from 'node:test';
import { ConstitutionRuntime } from './constitution-runtime';

function createRuntime(): ConstitutionRuntime {
  const runtime = new ConstitutionRuntime();
  runtime.loadConstitution();
  return runtime;
}

test('WP-001 authority query returns deterministic owner and trace ids', () => {
  const runtime = createRuntime();

  const first = runtime.queryAuthority({
    domain: 'governance',
    actionType: 'governance',
    contextClass: 'test-governance',
  });

  const second = runtime.queryAuthority({
    domain: 'governance',
    actionType: 'governance',
    contextClass: 'test-governance',
  });

  assert.equal(first.effectiveOwner, 'sovereign-high-council');
  assert.equal(first.effectiveTier, 'sovereign-high-council');
  assert.equal(first.ruleId, second.ruleId);
  assert.equal(first.traceId, second.traceId);
});

test('WP-001 validation denies unauthorized actor', () => {
  const runtime = createRuntime();

  assert.throws(() => {
    runtime.validateAuthority({
      actor: 'shared-constitutional',
      domain: 'governance',
      actionType: 'governance',
      contextClass: 'unauthorized-check',
    });
  });
});

test('WP-001 high-impact validation requires escalation for non-sovereign owner', () => {
  const runtime = createRuntime();

  const result = runtime.validateAuthority({
    actor: 'constitution-runtime',
    domain: 'policy',
    actionType: 'governance',
    contextClass: 'high-impact-policy',
    highImpact: true,
  });

  assert.equal(result.decision, 'escalate-required');
});

test('WP-001 authority trace resolves constitutional anchors', () => {
  const runtime = createRuntime();

  const trace = runtime.traceAuthorityRule('authority-rule-governance');

  assert.equal(trace.domain, 'governance');
  assert.ok(trace.constitutionalAnchors.length > 0);
});

test('WP-001 model validation passes completeness and traceability checks', () => {
  const runtime = createRuntime();
  const snapshot = runtime.getAuthorityMapSnapshot();

  assert.ok(snapshot.domainMatrix.length >= 14);
  assert.ok(snapshot.traceabilityMatrix.length >= 14);

  const firstQuery = runtime.queryAuthority({
    domain: 'security',
    actionType: 'security',
    contextClass: 'determinism-a',
  });
  const secondQuery = runtime.queryAuthority({
    domain: 'security',
    actionType: 'security',
    contextClass: 'determinism-b',
  });

  assert.equal(firstQuery.effectiveOwner, secondQuery.effectiveOwner);
  assert.equal(firstQuery.ruleId, secondQuery.ruleId);
});
