/**
 * AZMA OS – Al-Wateen Assistant
 * File: guards.ts
 *
 * Type guards and validation utilities.
 */

import {
  AssistantStatus,
  ChamberStatus,
  AgentStatus,
  ServiceStatus,
  ProviderStatus,
  HealthCheckStatus,
  AlertSeverity,
  SystemEventType,
  RecoveryTaskStatus,
  RepairActionType,
  HealthReport,
  SystemAlert,
  SystemEvent,
  RecoveryTask,
  RepairAction,
  Notification,
  ResourceMetrics,
  CostMetrics,
  UsageMetrics
} from '../types/al-wateen.types';

export function isAssistantStatus(value: unknown): value is AssistantStatus {
  return typeof value === 'string' && Object.values(AssistantStatus).includes(value as AssistantStatus);
}

export function isChamberStatus(value: unknown): value is ChamberStatus {
  return typeof value === 'string' && Object.values(ChamberStatus).includes(value as ChamberStatus);
}

export function isAgentStatus(value: unknown): value is AgentStatus {
  return typeof value === 'string' && Object.values(AgentStatus).includes(value as AgentStatus);
}

export function isServiceStatus(value: unknown): value is ServiceStatus {
  return typeof value === 'string' && Object.values(ServiceStatus).includes(value as ServiceStatus);
}

export function isProviderStatus(value: unknown): value is ProviderStatus {
  return typeof value === 'string' && Object.values(ProviderStatus).includes(value as ProviderStatus);
}

export function isHealthCheckStatus(value: unknown): value is HealthCheckStatus {
  return typeof value === 'string' && Object.values(HealthCheckStatus).includes(value as HealthCheckStatus);
}

export function isAlertSeverity(value: unknown): value is AlertSeverity {
  return typeof value === 'string' && Object.values(AlertSeverity).includes(value as AlertSeverity);
}

export function isSystemEventType(value: unknown): value is SystemEventType {
  return typeof value === 'string' && Object.values(SystemEventType).includes(value as SystemEventType);
}

export function isRecoveryTaskStatus(value: unknown): value is RecoveryTaskStatus {
  return typeof value === 'string' && Object.values(RecoveryTaskStatus).includes(value as RecoveryTaskStatus);
}

export function isRepairActionType(value: unknown): value is RepairActionType {
  return typeof value === 'string' && Object.values(RepairActionType).includes(value as RepairActionType);
}

export function isHealthReport(value: unknown): value is HealthReport {
  return (
    typeof value === 'object' &&
    value !== null &&
    'componentId' in value &&
    'status' in value &&
    'timestamp' in value
  );
}

export function isSystemAlert(value: unknown): value is SystemAlert {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'severity' in value &&
    'timestamp' in value
  );
}

export function isSystemEvent(value: unknown): value is SystemEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'type' in value &&
    'timestamp' in value
  );
}

export function isRecoveryTask(value: unknown): value is RecoveryTask {
  return (
    typeof value === 'object' &&
    value !== null &&
    'taskId' in value &&
    'status' in value &&
    'timestamp' in value
  );
}

export function isRepairAction(value: unknown): value is RepairAction {
  return (
    typeof value === 'object' &&
    value !== null &&
    'actionId' in value &&
    'type' in value &&
    'timestamp' in value
  );
}

export function isNotification(value: unknown): value is Notification {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'type' in value &&
    'timestamp' in value
  );
}

export function isResourceMetrics(value: unknown): value is ResourceMetrics {
  return (
    typeof value === 'object' &&
    value !== null &&
    'cpuUsage' in value &&
    'memoryUsage' in value &&
    'timestamp' in value
  );
}

export function isCostMetrics(value: unknown): value is CostMetrics {
  return (
    typeof value === 'object' &&
    value !== null &&
    'totalCost' in value &&
    'timestamp' in value
  );
}

export function isUsageMetrics(value: unknown): value is UsageMetrics {
  return (
    typeof value === 'object' &&
    value !== null &&
    'operationsCount' in value &&
    'timestamp' in value
  );
}

export function isValidTimestamp(value: unknown): value is number {
  return typeof value === 'number' && value > 0 && Number.isFinite(value);
}

export function isValidId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}
