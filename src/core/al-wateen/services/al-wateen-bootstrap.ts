/**
 * Bootstrapper for sovereign core runtime services.
 */

import { HealthCheckRegistry } from '../health/health-checks';
import { HealthEngine } from '../health/health-engine';
import { ExecutionMetricsTracker } from '../monitoring/execution-metrics';
import { RuntimeEventBus } from '../monitoring/event-bus';
import { HeartbeatEngine } from '../monitoring/heartbeat-engine';
import { MonitoringEngine } from '../monitoring/monitoring-engine';
import { WatchdogEngine } from '../monitoring/watchdog-engine';
import { NotificationDispatcher } from '../notifications/notification-dispatcher';
import { ProviderManager } from '../providers/provider-manager';
import { ProviderPool } from '../providers/provider-abstractions';
import { RecoveryEngine } from '../recovery/recovery-engine';
import { SelfHealingCoordinator } from '../recovery/self-healing-coordinator';
import { ExecutiveStatusSnapshotService } from '../reports/executive-status-snapshot';
import { ReportGenerator } from '../reports/report-generator';
import { SchedulerEngine } from '../scheduler/scheduler-engine';
import { TaskDispatcher } from '../scheduler/task-dispatcher';
import { RuntimeStateStore } from '../state/runtime-state-store';
import { TelemetryCollector } from '../telemetry/telemetry-collector';
import { TelemetryEngine, TelemetrySink } from '../telemetry/telemetry-engine';
import { AlWateenRuntime } from './al-wateen-runtime';
import { AlWateenServices } from './runtime-services';

export interface BootstrapResult {
  readonly services: AlWateenServices;
  readonly runtime: AlWateenRuntime;
}

export class AlWateenBootstrap {
  public static initialize(sink: TelemetrySink): BootstrapResult {
    const stateStore = new RuntimeStateStore();
    const eventBus = new RuntimeEventBus();
    const metrics = new ExecutionMetricsTracker();

    const monitoring = new MonitoringEngine(stateStore, eventBus, metrics);
    const heartbeat = new HeartbeatEngine(eventBus);
    const watchdog = new WatchdogEngine(eventBus);
    const healthRegistry = new HealthCheckRegistry();
    const health = new HealthEngine(healthRegistry, eventBus);
    const scheduler = new SchedulerEngine();
    const dispatcher = new TaskDispatcher();
    const recovery = new RecoveryEngine();
    const selfHealing = new SelfHealingCoordinator(recovery);
    const notifications = new NotificationDispatcher();
    const telemetryCollector = new TelemetryCollector();
    const telemetryEngine = new TelemetryEngine(telemetryCollector, sink);
    const providers = new ProviderManager(new ProviderPool());
    const reports = new ReportGenerator();
    const executiveSnapshot = new ExecutiveStatusSnapshotService(stateStore, reports);

    const services: AlWateenServices = {
      stateStore,
      eventBus,
      monitoring,
      heartbeat,
      watchdog,
      health,
      scheduler,
      dispatcher,
      recovery,
      selfHealing,
      notifications,
      telemetryCollector,
      telemetryEngine,
      providers,
      reports,
      executiveSnapshot
    };

    return {
      services,
      runtime: new AlWateenRuntime(services)
    };
  }
}
