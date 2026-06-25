/**
 * AZMA OS – Al-Wateen Assistant
 * File: index.ts
 *
 * Root export for Al-Wateen Assistant module.
 */

// Types
export * from './types/al-wateen.types';

// Utils
export { Logger, LogLevel } from './utils/logger';
export type { ILogger, LogEntry } from './utils/logger';
export * from './utils/guards';
export * from './utils/constants';
export * from './utils/time';

// State Management
export { AlWateenStateManager } from './state/al-wateen-state';
export type { AlWateenState, StateUpdateOptions } from './state/al-wateen-state';

// Registry
export { AlWateenRegistry } from './registry/al-wateen-registry';
export type { RegistryEntry, ComponentRegistry } from './registry/al-wateen-registry';

// Monitoring
export { AlWateenMonitoringEngine } from './monitoring/monitoring-engine';
export type { MonitoringEngine } from './monitoring/monitoring-engine';
export { MonitoringEventBus } from './monitoring/monitoring-events';
export type { MonitoringEventEmitter } from './monitoring/monitoring-events';
export { MonitoringRuntime } from './monitoring/monitoring-runtime';
export type { RuntimeMonitor } from './monitoring/monitoring-runtime';

// Health
export { AlWateenHealthEngine } from './health/health-engine';
export type { HealthEngine } from './health/health-engine';
export { AlWateenHealthReporter } from './health/health-reporter';
export type { HealthReporter } from './health/health-reporter';
export {
  BasicHealthCheck,
  ConnectionHealthCheck,
  ResourceHealthCheck,
  ResponseTimeHealthCheck,
  HealthCheckRegistry
} from './health/health-checks';
export type { HealthCheckFunction, HealthCheckProvider } from './health/health-checks';

// Recovery
export { AlWateenRecoveryEngine } from './recovery/recovery-engine';
export type { RecoveryStrategy, RecoveryEngine } from './recovery/recovery-engine';
export { AlWateenRestartEngine } from './recovery/restart-engine';
export type { RestartableComponent, RestartEngine } from './recovery/restart-engine';
export { FailoverEngine } from './recovery/failover-engine';
export type { FailoverTarget, FailoverGroup } from './recovery/failover-engine';
export { RepairEngine } from './recovery/repair-engine';
export type { RepairExecutor, RepairActionExecutor } from './recovery/repair-engine';

// Providers
export { AlWateenProviderManager } from './providers/provider-manager';
export type { ProviderManager } from './providers/provider-manager';
export { AlWateenProviderHealthMonitor } from './providers/provider-health';
export type { ProviderHealthMonitor } from './providers/provider-health';
export { ProviderSelector } from './providers/provider-selection';
export type { ProviderSelector as IProviderSelector } from './providers/provider-selection';

// Telemetry
export { AlWateenTelemetryEngine } from './telemetry/telemetry-engine';
export type { TelemetryEngine } from './telemetry/telemetry-engine';
export { InMemoryTelemetryStore } from './telemetry/telemetry-storage';
export type { TelemetryStore } from './telemetry/telemetry-storage';

// Reports
export { AlWateenExecutiveReportEngine } from './reports/executive-report-engine';
export type { ExecutiveReportEngine } from './reports/executive-report-engine';
export { AlWateenReportBuilder } from './reports/report-builder';
export type { ReportBuilder } from './reports/report-builder';

// Notifications
export { AlWateenNotificationEngine } from './notifications/notification-engine';
export type { NotificationEngine } from './notifications/notification-engine';
export { AlWateenNotificationCenter } from './notifications/notification-center';
export type { NotificationCenter, NotificationListener } from './notifications/notification-center';

// Scheduler
export { AlWateenSchedulerEngine } from './scheduler/scheduler-engine';
export type { ScheduledTask, SchedulerEngine } from './scheduler/scheduler-engine';

// Services
export { AssistantBootstrap } from './services/assistant-bootstrap';
export type { BootstrapConfig, BootstrappedServices } from './services/assistant-bootstrap';
export { AlWateenAssistantRuntime } from './services/assistant-runtime';
export type { RuntimeOperation, AssistantRuntime } from './services/assistant-runtime';

// UI
export { DashboardContractsValidator } from './ui/dashboard-contracts';
export type {
  DashboardComponentStatus,
  DashboardHealthPanel,
  DashboardMetricsPanel,
  DashboardAlertsPanel,
  DashboardEventsPanel,
  DashboardReportsPanel,
  DashboardData,
  DashboardProvider
} from './ui/dashboard-contracts';
