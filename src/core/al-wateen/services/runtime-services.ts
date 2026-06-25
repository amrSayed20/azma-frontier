/**
 * Runtime service composition contracts.
 */

import { HealthEngine } from '../health/health-engine';
import { MonitoringEngine } from '../monitoring/monitoring-engine';
import { RuntimeEventBus } from '../monitoring/event-bus';
import { HeartbeatEngine } from '../monitoring/heartbeat-engine';
import { WatchdogEngine } from '../monitoring/watchdog-engine';
import { NotificationDispatcher } from '../notifications/notification-dispatcher';
import { ProviderManager } from '../providers/provider-manager';
import { RecoveryEngine } from '../recovery/recovery-engine';
import { SelfHealingCoordinator } from '../recovery/self-healing-coordinator';
import { ReportGenerator } from '../reports/report-generator';
import { ExecutiveStatusSnapshotService } from '../reports/executive-status-snapshot';
import { SchedulerEngine } from '../scheduler/scheduler-engine';
import { TaskDispatcher } from '../scheduler/task-dispatcher';
import { RuntimeStateStore } from '../state/runtime-state-store';
import { TelemetryCollector } from '../telemetry/telemetry-collector';
import { TelemetryEngine } from '../telemetry/telemetry-engine';

export interface AlWateenServices {
  readonly stateStore: RuntimeStateStore;
  readonly eventBus: RuntimeEventBus;
  readonly monitoring: MonitoringEngine;
  readonly heartbeat: HeartbeatEngine;
  readonly watchdog: WatchdogEngine;
  readonly health: HealthEngine;
  readonly scheduler: SchedulerEngine;
  readonly dispatcher: TaskDispatcher;
  readonly recovery: RecoveryEngine;
  readonly selfHealing: SelfHealingCoordinator;
  readonly notifications: NotificationDispatcher;
  readonly telemetryCollector: TelemetryCollector;
  readonly telemetryEngine: TelemetryEngine;
  readonly providers: ProviderManager;
  readonly reports: ReportGenerator;
  readonly executiveSnapshot: ExecutiveStatusSnapshotService;
}
