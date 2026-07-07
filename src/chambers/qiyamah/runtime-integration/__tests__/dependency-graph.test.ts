import { CROSS_RUNTIME_MODULE_GRAPH, RUNTIME_CONTRACT_DEPENDENCY_GRAPH } from '../dependency-graph';

describe('Cross-Runtime Module Graph', () => {
  it('defines exactly the six Living Runtime modules plus this integration module', () => {
    const keys = Object.keys(CROSS_RUNTIME_MODULE_GRAPH).filter((k) => k !== 'acyclicity_note' && k !== 'traceability');
    expect(keys.sort()).toEqual([
      'runtime-behavior/', 'runtime-event/', 'runtime-integration/', 'runtime-interfaces/',
      'runtime-state/', 'runtime-validation/', 'runtime/',
    ].sort());
  });

  it('never lets a module depend on one that depends on it (strict chain, no cycle)', () => {
    const entries = Object.entries(CROSS_RUNTIME_MODULE_GRAPH).filter(
      ([key]) => key !== 'acyclicity_note' && key !== 'traceability',
    ) as [string, { dependsOn: readonly string[]; dependedOnBy: readonly string[] }][];

    for (const [name, { dependsOn }] of entries) {
      for (const dep of dependsOn) {
        const depEntry = CROSS_RUNTIME_MODULE_GRAPH[dep as keyof typeof CROSS_RUNTIME_MODULE_GRAPH];
        if (typeof depEntry === 'string' || !depEntry) continue;
        expect((depEntry as { dependsOn: readonly string[] }).dependsOn).not.toContain(name);
      }
    }
  });
});

describe('Runtime Contract Dependency Graph', () => {
  it('defines exactly the seven Runtime Interface entries', () => {
    const keys = Object.keys(RUNTIME_CONTRACT_DEPENDENCY_GRAPH).filter(
      (k) => k !== 'acyclicity_note' && k !== 'traceability',
    );
    expect(keys.sort()).toEqual([
      'CitizenContract', 'CompanionContract', 'GhostGuideContract', 'InvisibleDirectorContract',
      'CreativeRuntimeContract', 'FutureAIEngineContract', 'LifecycleAndSignalQuerySurface',
    ].sort());
  });

  it('gives LifecycleAndSignalQuerySurface no dependencies and every actor contract as a dependent', () => {
    expect(RUNTIME_CONTRACT_DEPENDENCY_GRAPH.LifecycleAndSignalQuerySurface.dependsOn).toEqual([]);
    expect(RUNTIME_CONTRACT_DEPENDENCY_GRAPH.LifecycleAndSignalQuerySurface.dependedOnBy).toHaveLength(6);
  });

  it('gives CitizenContract no dependencies (it is the act\'s entry point)', () => {
    expect(RUNTIME_CONTRACT_DEPENDENCY_GRAPH.CitizenContract.dependsOn).toEqual([]);
  });
});
