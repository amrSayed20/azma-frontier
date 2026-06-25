/**
 * Chamber integration contracts for Core <-> Chamber communication.
 */

export enum ChamberStatus {
  DISCOVERED = 'DISCOVERED',
  LOADED = 'LOADED',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ERROR = 'ERROR'
}

export enum ChamberEventType {
  LIFECYCLE = 'LIFECYCLE',
  CAPABILITY = 'CAPABILITY',
  TELEMETRY = 'TELEMETRY',
  HEALTH = 'HEALTH',
  MESSAGE = 'MESSAGE'
}

export interface ChamberCapability {
  readonly capabilityId: string;
  readonly name: string;
  readonly version: string;
  readonly contract: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface ChamberMetadata {
  readonly chamberId: string;
  readonly chamberName: string;
  readonly version: string;
  readonly description: string;
  readonly owner: string;
  readonly tags: readonly string[];
  readonly capabilities: readonly ChamberCapability[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface ChamberHealth {
  readonly chamberId: string;
  readonly status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'UNKNOWN';
  readonly timestamp: number;
  readonly message: string;
  readonly metrics: Readonly<Record<string, number>>;
}

export interface ChamberEvent<TPayload extends Readonly<Record<string, unknown>>> {
  readonly eventId: string;
  readonly chamberId: string;
  readonly type: ChamberEventType;
  readonly timestamp: number;
  readonly payload: TPayload;
}

export interface ChamberMessage {
  readonly messageId: string;
  readonly sourceChamberId: string;
  readonly targetChamberId: string;
  readonly operation: string;
  readonly timestamp: number;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface ChamberEndpoint {
  readonly chamberId: string;
  readonly metadata: ChamberMetadata;
  readonly status: ChamberStatus;
}

export interface ChamberManifest {
  readonly metadata: ChamberMetadata;
  readonly modulePath: string;
}

export interface ChamberAdapter {
  readonly chamberId: string;
  load(): Promise<void>;
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  health(): Promise<ChamberHealth>;
  handleMessage(message: ChamberMessage): Promise<Readonly<Record<string, unknown>>>;
}

export interface ChamberBridge {
  publishEvent<TPayload extends Readonly<Record<string, unknown>>>(event: ChamberEvent<TPayload>): void;
  publishHealth(health: ChamberHealth): void;
}
