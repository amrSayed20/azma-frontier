import { describe, expect, test } from '@jest/globals';
import { ConstitutionRuntime } from './constitution-runtime';

function createRuntime(): ConstitutionRuntime {
  const runtime = new ConstitutionRuntime();
  runtime.loadConstitution();
  return runtime;
}

describe('WP-001 constitutional authority map', () => {
  test('authority query returns deterministic owner and trace ids', () => {
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

    expect(first.effectiveOwner).toBe('sovereign-high-council');
    expect(first.effectiveTier).toBe('sovereign-high-council');
    expect(first.ruleId).toBe(second.ruleId);
    expect(first.traceId).toBe(second.traceId);
  });

  test('validation denies unauthorized actor', () => {
    const runtime = createRuntime();

    expect(() => {
      runtime.validateAuthority({
        actor: 'shared-constitutional',
        domain: 'governance',
        actionType: 'governance',
        contextClass: 'unauthorized-check',
      });
    }).toThrow();
  });

  test('high-impact validation requires escalation for non-sovereign owner', () => {
    const runtime = createRuntime();

    const result = runtime.validateAuthority({
      actor: 'constitution-runtime',
      domain: 'policy',
      actionType: 'governance',
      contextClass: 'high-impact-policy',
      highImpact: true,
    });

    expect(result.decision).toBe('escalate-required');
  });

  test('authority trace resolves constitutional anchors', () => {
    const runtime = createRuntime();

    const trace = runtime.traceAuthorityRule('authority-rule-governance');

    expect(trace.domain).toBe('governance');
    expect(trace.constitutionalAnchors.length).toBeGreaterThan(0);
  });

  test('model validation passes completeness and traceability checks', () => {
    const runtime = createRuntime();
    const snapshot = runtime.getAuthorityMapSnapshot();

    expect(snapshot.domainMatrix.length).toBeGreaterThanOrEqual(14);
    expect(snapshot.traceabilityMatrix.length).toBeGreaterThanOrEqual(14);

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

    expect(firstQuery.effectiveOwner).toBe(secondQuery.effectiveOwner);
    expect(firstQuery.ruleId).toBe(secondQuery.ruleId);
  });
});
