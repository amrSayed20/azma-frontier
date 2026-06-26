import { ConstitutionPriority } from '../constitution-runtime';

export type BusModuleId =
  | 'constitution-runtime'
  | 'executive-intelligence'
  | 'strategic-intelligence'
  | 'future-simulation'
  | 'sovereign-intelligence-bus';

export type BusMessageType =
  | 'constitution-state'
  | 'executive-state'
  | 'strategic-state'
  | 'future-simulation-state'
  | 'executive-package'
  | 'strategic-package'
  | 'future-simulation-package'
  | 'diagnostics';

export type BusAuthorityLevel = 'constitutional' | 'executive' | 'strategic' | 'simulation' | 'bus';

export interface SovereignBusMessage {
  readonly messageId: string;
  readonly messageType: BusMessageType;
  readonly source: BusModuleId;
  readonly target: BusModuleId | 'all';
  readonly authorityLevel: BusAuthorityLevel;
  readonly priority: ConstitutionPriority;
  readonly createdAt: Date;
  readonly immutable: true;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface RoutedBusMessage {
  readonly routeId: string;
  readonly sourceMessageId: string;
  readonly source: BusModuleId;
  readonly target: BusModuleId;
  readonly authorityLevel: BusAuthorityLevel;
  readonly priority: ConstitutionPriority;
  readonly deliveredAt: Date;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface RoutingPlan {
  readonly messageId: string;
  readonly targets: readonly BusModuleId[];
}

export interface BusDiagnostics {
  readonly generatedAt: Date;
  readonly totalMessagesObserved: number;
  readonly totalMessagesRouted: number;
  readonly queueDepth: number;
  readonly invalidMessagesBlocked: number;
  readonly lastMessageId?: string;
  readonly healthy: boolean;
}

export interface BusRuntimeSnapshot {
  readonly totalPublishedMessages: number;
  readonly totalRoutedMessages: number;
  readonly totalSynchronizationCycles: number;
  readonly invalidMessagesBlocked: number;
  readonly lastMessageId?: string;
  readonly lastSynchronizationAt?: Date;
}
