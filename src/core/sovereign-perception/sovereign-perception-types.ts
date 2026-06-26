import { ConstitutionStateSnapshot } from '../constitution-runtime';
import { ExecutiveRuntimeStateSnapshot } from '../executive-intelligence';
import { StrategicRuntimeStateSnapshot } from '../strategic-intelligence';
import { SimulationRuntimeStateSnapshot } from '../future-simulation';
import { BusDiagnostics, BusRuntimeSnapshot } from '../sovereign-intelligence-bus';

export type PerceptionCategory =
  | 'runtime'
  | 'infrastructure'
  | 'resource'
  | 'chamber'
  | 'ai-provider'
  | 'security'
  | 'founder-activity';

export interface PerceptionObservation {
  readonly observationId: string;
  readonly category: PerceptionCategory;
  readonly source: string;
  readonly observedAt: Date;
  readonly immutable: true;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface RuntimeObservationInput {
  readonly constitutionState?: ConstitutionStateSnapshot;
  readonly executiveState: ExecutiveRuntimeStateSnapshot;
  readonly strategicState: StrategicRuntimeStateSnapshot;
  readonly futureSimulationState: SimulationRuntimeStateSnapshot;
  readonly busState: BusRuntimeSnapshot;
  readonly busDiagnostics: BusDiagnostics;
}

export interface PerceptionReadinessSignal {
  readonly signalId: string;
  readonly domain: 'gpu-workers' | 'queues' | 'databases' | 'storage' | 'api-providers' | 'ai-models' | 'future-chambers';
  readonly readiness: 'prepared';
  readonly note: string;
}

export interface SovereignPerceptionPackage {
  readonly packageId: string;
  readonly generatedAt: Date;
  readonly observations: readonly PerceptionObservation[];
  readonly readinessSignals: readonly PerceptionReadinessSignal[];
  readonly perceptionDirective: 'observation-only';
}

export interface PerceptionRuntimeSnapshot {
  readonly totalPackages: number;
  readonly totalObservations: number;
  readonly lastPackageId?: string;
  readonly lastObservedAt?: Date;
}
