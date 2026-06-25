# AL-WATEEN ARCHITECTURE REPORT

## Continuous Operating Intelligence of AZMA OS

---

## 1. COMPLETE FOLDER TREE

```
src/core/al-wateen-assistant/
├── index.ts                          [Root barrel export]
│
├── types/
│   └── al-wateen.types.ts
│
├── utils/
│   ├── constants.ts
│   ├── guards.ts
│   ├── logger.ts
│   └── time.ts
│
├── state/
│   └── al-wateen-state.ts
│
├── registry/
│   └── al-wateen-registry.ts
│
├── monitoring/
│   ├── monitoring-engine.ts
│   ├── monitoring-events.ts
│   └── monitoring-runtime.ts
│
├── health/
│   ├── health-checks.ts
│   ├── health-engine.ts
│   └── health-reporter.ts
│
├── recovery/
│   ├── repair-engine.ts
│   ├── restart-engine.ts
│   ├── failover-engine.ts
│   └── recovery-engine.ts
│
├── providers/
│   ├── provider-health.ts
│   ├── provider-selection.ts
│   └── provider-manager.ts
│
├── telemetry/
│   ├── telemetry-storage.ts
│   └── telemetry-engine.ts
│
├── reports/
│   ├── report-builder.ts
│   └── executive-report-engine.ts
│
├── notifications/
│   ├── notification-center.ts
│   └── notification-engine.ts
│
├── scheduler/
│   └── scheduler-engine.ts
│
├── services/
│   ├── assistant-bootstrap.ts
│   └── assistant-runtime.ts
│
└── ui/
    └── dashboard-contracts.ts
```

---

## 2. EVERY CREATED FILE WITH SINGLE-SENTENCE RESPONSIBILITIES

### types/
| File | Responsibility |
|------|-----------------|
| **al-wateen.types.ts** | Defines all core enums and interfaces representing system state, components, health, metrics, alerts, events, and recovery tasks. |

### utils/
| File | Responsibility |
|------|-----------------|
| **constants.ts** | Provides system-wide configuration constants for timeouts, intervals, thresholds, and component type definitions. |
| **guards.ts** | Implements 21 type guard functions for runtime validation of all core type definitions. |
| **logger.ts** | Provides structured logging with multiple severity levels (debug, info, warn, error, critical). |
| **time.ts** | Supplies utility functions for timestamp generation, time range creation, duration calculation, and temporal operations. |

### state/
| File | Responsibility |
|------|-----------------|
| **al-wateen-state.ts** | Maintains the complete mutable state of the assistant including status, chamber/agent/service statuses, alerts, events, recovery tasks, and monitoring snapshots. |

### registry/
| File | Responsibility |
|------|-----------------|
| **al-wateen-registry.ts** | Provides component discovery and type-indexed storage for chambers, agents, services, providers, and gateways. |

### monitoring/
| File | Responsibility |
|------|-----------------|
| **monitoring-engine.ts** | Orchestrates system-wide monitoring with interval-based snapshot capture and event recording. |
| **monitoring-events.ts** | Implements pub-sub event bus for broadcasting system events to listeners. |
| **monitoring-runtime.ts** | Captures resource usage, cost, and operation metrics at runtime. |

### health/
| File | Responsibility |
|------|-----------------|
| **health-checks.ts** | Defines health check implementations (basic, connection, resource, response-time) and registry for provider-based extension. |
| **health-engine.ts** | Manages lifecycle of health monitoring including check execution and report generation at configured intervals. |
| **health-reporter.ts** | Analyzes health check results and generates component health reports with severity assessment. |

### recovery/
| File | Responsibility |
|------|-----------------|
| **repair-engine.ts** | Executes repair actions using registered executors for specific component types. |
| **restart-engine.ts** | Manages restart sequences for restartable components with success tracking. |
| **failover-engine.ts** | Manages active-standby failover switching between primary and backup targets. |
| **recovery-engine.ts** | Orchestrates complete recovery workflows using strategy pattern with concurrent recovery tracking. |

### providers/
| File | Responsibility |
|------|-----------------|
| **provider-health.ts** | Tracks individual AI provider health through success rates, failure counts, and response times. |
| **provider-selection.ts** | Implements intelligent provider selection using weighted scoring of capacity, success rate, and response time. |
| **provider-manager.ts** | Manages AI provider lifecycle including registration, status updates, and intelligent selection. |

### telemetry/
| File | Responsibility |
|------|-----------------|
| **telemetry-storage.ts** | Provides in-memory storage for telemetry records with category indexing and LRU eviction. |
| **telemetry-engine.ts** | Batches and flushes telemetry records to storage at configurable intervals. |

### reports/
| File | Responsibility |
|------|-----------------|
| **report-builder.ts** | Aggregates system data and generates executive reports with health assessment and recommendations. |
| **executive-report-engine.ts** | Schedules and manages periodic generation of executive reports. |

### notifications/
| File | Responsibility |
|------|-----------------|
| **notification-center.ts** | Implements pub-sub notification distribution with listener management and LRU retention. |
| **notification-engine.ts** | Generates notifications from system alerts and events, routing by severity to appropriate channels. |

### scheduler/
| File | Responsibility |
|------|-----------------|
| **scheduler-engine.ts** | Manages scheduled task lifecycle including registration, execution, enabling/disabling, and lifecycle control. |

### services/
| File | Responsibility |
|------|-----------------|
| **assistant-bootstrap.ts** | Orchestrates ordered initialization of all subsystems and feature flag management. |
| **assistant-runtime.ts** | Provides runtime execution context with pause/resume capabilities and health checking. |

### ui/
| File | Responsibility |
|------|-----------------|
| **dashboard-contracts.ts** | Defines UI component contracts for dashboard visualization of system state, health, metrics, alerts, events, and reports. |

### root/
| File | Responsibility |
|------|-----------------|
| **index.ts** | Exports all public symbols from subsystems for module consumption. |

---

## 3. PUBLIC EXPORTS

### By Subsystem

#### **types/**
- Enums: `AssistantStatus`, `ChamberStatus`, `AgentStatus`, `ServiceStatus`, `ProviderStatus`, `HealthCheckStatus`, `AlertSeverity`, `SystemEventType`, `AIProviderType`, `RepairActionType`
- Interfaces: `ResourceMetrics`, `CostMetrics`, `UsageMetrics`, `HealthReport`, `HealthCheck`, `SystemAlert`, `SystemEvent`, `MonitoringSnapshot`, `ExecutiveReport`, `Notification`, `RecoveryTask`, `AIProvider`, `RepairAction`, `TelemetryRecord`

#### **utils/**
- Classes: `Logger`
- Interfaces: `ILogger`
- Enums: `LogLevel`
- Functions: 21 type guards (`isAssistantStatus`, `isChamberStatus`, `isHealthReport`, etc.)
- Constants: `ASSISTANT_CONFIG`, `COMPONENT_TYPES`, `RECOVERY_PRIORITIES`, `ALERT_RETENTION_POLICIES`, `HEALTH_THRESHOLD`
- Time utilities: `Duration`, `TimeRange` interfaces and functions

#### **state/**
- Class: `AlWateenStateManager`
- Interface: `AlWateenState`
- Methods: `getState()`, `setAssistantStatus()`, `updateChamberStatus()`, `updateAgentStatus()`, `updateServiceStatus()`, `updateProviderStatus()`, `addAlert()`, `removeAlert()`, `addEvent()`, `addRecoveryTask()`, `removeRecoveryTask()`, `updateLastMonitoringSnapshot()`, `calculateUptime()`, `reset()`

#### **registry/**
- Class: `AlWateenRegistry`
- Interface: `ComponentRegistry`
- Methods: `register()`, `unregister()`, `get()`, `getByType()`, `getAll()`, `exists()`, `getRegistry()`

#### **monitoring/**
- Class: `AlWateenMonitoringEngine`
- Class: `MonitoringEventBus`
- Class: `MonitoringRuntime`
- Interfaces: `MonitoringEngine`, `MonitoringEventEmitter`, `RuntimeMonitor`
- Methods: `startMonitoring()`, `stopMonitoring()`, `captureSnapshot()`, `recordSystemEvent()`, `getLastSnapshot()`

#### **health/**
- Class: `AlWateenHealthEngine`
- Class: `AlWateenHealthReporter`
- Classes: `BasicHealthCheck`, `ConnectionHealthCheck`, `ResourceHealthCheck`, `ResponseTimeHealthCheck`, `HealthCheckRegistry`
- Interfaces: `HealthEngine`, `HealthReporter`, `HealthCheckProvider`
- Methods: `startHealthMonitoring()`, `stopHealthMonitoring()`, `checkComponentHealth()`, `getLastHealthReport()`, `runAll()`, `runSpecific()`

#### **recovery/**
- Class: `AlWateenRecoveryEngine`
- Class: `AlWateenRestartEngine`
- Class: `FailoverEngine`
- Class: `RepairEngine`
- Interfaces: `RecoveryEngine`, `RecoveryStrategy`, `RestartEngine`, `RestartableComponent`, `FailoverGroup`, `RepairExecutor`
- Methods: `initiateRecovery()`, `getRecoveryStatus()`, `getActiveRecoveries()`, `restartComponent()`, `initiateFailover()`, `executeAction()`

#### **providers/**
- Class: `AlWateenProviderManager`
- Class: `AlWateenProviderHealthMonitor`
- Class: `ProviderSelector`
- Interfaces: `ProviderManager`, `ProviderHealthMonitor`
- Methods: `registerProvider()`, `unregisterProvider()`, `getProvider()`, `getAllProviders()`, `selectProvider()`, `updateProviderStatus()`

#### **telemetry/**
- Class: `AlWateenTelemetryEngine`
- Class: `InMemoryTelemetryStore`
- Interfaces: `TelemetryEngine`, `TelemetryStore`
- Methods: `recordEvent()`, `recordOperation()`, `flushTelemetry()`, `startAutoFlush()`, `stopAutoFlush()`, `getByTimeRange()`

#### **reports/**
- Class: `AlWateenExecutiveReportEngine`
- Class: `AlWateenReportBuilder`
- Interfaces: `ExecutiveReportEngine`, `ReportBuilder`
- Methods: `generateReport()`, `startReportScheduling()`, `stopReportScheduling()`, `getLastReport()`, `generateRecommendations()`

#### **notifications/**
- Class: `AlWateenNotificationEngine`
- Class: `AlWateenNotificationCenter`
- Interfaces: `NotificationEngine`, `NotificationCenter`
- Methods: `notifyAlert()`, `notifyEvent()`, `notifyInfo()`, `notifyWarning()`, `notifyError()`, `publish()`, `getNotifications()`, `markAsRead()`

#### **scheduler/**
- Class: `AlWateenSchedulerEngine`
- Interface: `SchedulerEngine`
- Methods: `scheduleTask()`, `unscheduleTask()`, `enableTask()`, `disableTask()`, `start()`, `stop()`, `getTaskStatus()`

#### **services/**
- Class: `AssistantBootstrap`
- Class: `AlWateenAssistantRuntime`
- Interfaces: `BootstrapConfig`, `BootstrappedServices`, `AssistantRuntime`
- Methods: `initialize()`, `shutdown()`, `getStatus()`, `isHealthy()`, `executeOperation()`, `pause()`, `resume()`

#### **ui/**
- Class: `DashboardContractsValidator`
- Interfaces: `DashboardComponentStatus`, `DashboardHealthPanel`, `DashboardMetricsPanel`, `DashboardAlertsPanel`, `DashboardEventsPanel`, `DashboardReportsPanel`, `DashboardData`, `DashboardProvider`
- Methods: `getDashboardData()`, `getComponentHistory()`, `getMetricsHistory()`, `exportDashboardData()`

---

## 4. INTERNAL DEPENDENCIES

### Subsystem Dependencies (Within Al-Wateen Module)

| Subsystem | Depends On |
|-----------|-----------|
| **state/** | types/ |
| **registry/** | types/, state/ |
| **monitoring/** | types/, utils/, state/ |
| **health/** | types/, utils/, state/ |
| **recovery/** | types/, utils/, state/ |
| **providers/** | types/, utils/, state/ |
| **telemetry/** | types/, utils/, state/ |
| **reports/** | types/, utils/, state/ |
| **notifications/** | types/, utils/, state/ |
| **scheduler/** | types/, utils/, state/ |
| **services/** | All subsystems |
| **ui/** | types/, state/ |

### Cross-File Dependencies

#### monitoring/
- `monitoring-engine.ts` → `monitoring-events.ts`, `monitoring-runtime.ts`, types/, utils/
- `monitoring-events.ts` → types/
- `monitoring-runtime.ts` → types/, utils/

#### health/
- `health-engine.ts` → `health-checks.ts`, `health-reporter.ts`, types/, utils/, state/
- `health-reporter.ts` → types/
- `health-checks.ts` → types/, utils/

#### recovery/
- `recovery-engine.ts` → `repair-engine.ts`, types/, utils/, state/
- `failover-engine.ts` → types/, utils/
- `restart-engine.ts` → types/, utils/
- `repair-engine.ts` → types/

#### providers/
- `provider-manager.ts` → `provider-health.ts`, `provider-selection.ts`, types/, utils/
- `provider-selection.ts` → types/, utils/
- `provider-health.ts` → types/, utils/

#### telemetry/
- `telemetry-engine.ts` → `telemetry-storage.ts`, types/, utils/
- `telemetry-storage.ts` → types/

#### reports/
- `executive-report-engine.ts` → `report-builder.ts`, types/, utils/
- `report-builder.ts` → types/, state/

#### notifications/
- `notification-engine.ts` → `notification-center.ts`, types/, utils/
- `notification-center.ts` → types/

#### services/
- `assistant-bootstrap.ts` → `assistant-runtime.ts`, all other subsystems, types/, utils/
- `assistant-runtime.ts` → types/, utils/

---

## 5. EXTERNAL DEPENDENCIES

### External TypeScript Packages
- **None** — Al-Wateen Assistant is standalone with zero third-party dependencies

### External Node.js Built-ins
- `NodeJS.Timeout` — Used in interval management across monitoring, health, recovery, reports, scheduler subsystems
- Standard TypeScript/JavaScript primitives: `Map`, `Set`, `Array`, etc.

### External Project Dependencies
- **None** — No dependencies on chambers, gateway, or orchestrator modules
- No imports from `src/chambers/`, `src/gateway/`, `src/orchestrator/`, or `src/shared/`

---

## 6. FUTURE HOME MAPPING

### Feature → Responsible Subsystem/File

| Feature | Primary File | Secondary Files |
|---------|-------------|-----------------|
| **Health Monitoring** | `health/health-engine.ts` | `health/health-checks.ts`, `health/health-reporter.ts` |
| **Recovery** | `recovery/recovery-engine.ts` | `recovery/repair-engine.ts`, `recovery/restart-engine.ts`, `recovery/failover-engine.ts` |
| **Self Healing** | `recovery/recovery-engine.ts` | `recovery/repair-engine.ts`, `recovery/restart-engine.ts` |
| **AI Providers** | `providers/provider-manager.ts` | `providers/provider-health.ts`, `providers/provider-selection.ts` |
| **Notifications** | `notifications/notification-engine.ts` | `notifications/notification-center.ts` |
| **Executive Reports** | `reports/executive-report-engine.ts` | `reports/report-builder.ts` |
| **Resource Monitoring** | `monitoring/monitoring-runtime.ts` | `monitoring/monitoring-engine.ts` |
| **Cost Monitoring** | `monitoring/monitoring-runtime.ts` | `monitoring/monitoring-engine.ts` |
| **Telemetry** | `telemetry/telemetry-engine.ts` | `telemetry/telemetry-storage.ts` |
| **Scheduling** | `scheduler/scheduler-engine.ts` | — |

### Subsystem Integration Points

- **monitoring/** — Captures all resource and cost metrics, feeds into health checks and reports
- **health/** — Consumes monitoring data, produces health reports, triggers recovery if needed
- **recovery/** — Receives health alerts, executes repair/restart/failover sequences
- **providers/** — Maintains AI provider pool, selection during recovery and operation
- **telemetry/** — Records all system events and operations for analysis and reporting
- **reports/** — Aggregates monitoring, health, and telemetry data into executive summaries
- **notifications/** — Distributes alerts, events, and reports to listeners
- **scheduler/** — Triggers periodic monitoring, health checks, reporting, and telemetry flush
- **state/** — Central source of truth for all component statuses and metrics
- **registry/** — Discovers and tracks chambers, agents, services, providers for observation

---

## 7. ARCHITECTURAL PATTERNS USED

### Design Patterns Implemented

| Pattern | Subsystems | Purpose |
|---------|-----------|---------|
| **Manager Pattern** | state/, registry/, providers/, telemetry/ | Encapsulate subsystem state and lifecycle |
| **Engine Pattern** | monitoring/, health/, recovery/, reports/, notifications/, scheduler/ | Orchestrate operations and lifecycle |
| **Event-Driven** | monitoring/, notifications/ | Pub-sub event propagation |
| **Strategy Pattern** | recovery/ | Pluggable recovery approaches |
| **Registry Pattern** | registry/ | Component discovery and lookup |
| **Bootstrap Pattern** | services/ | Ordered initialization and shutdown |
| **Factory Pattern** | health/, providers/ | Create instances of checks and executors |

---

## 8. INITIALIZATION SEQUENCE

`services/assistant-bootstrap.ts` orchestrates initialization in this order:

1. `state/al-wateen-state.ts` — Initialize state manager
2. `registry/al-wateen-registry.ts` — Initialize component registry
3. `monitoring/monitoring-engine.ts` — Initialize monitoring engine
4. `health/health-engine.ts` — Initialize health engine
5. `recovery/recovery-engine.ts` — Initialize recovery engine
6. `providers/provider-manager.ts` — Initialize provider manager
7. `telemetry/telemetry-engine.ts` — Initialize telemetry engine
8. `reports/executive-report-engine.ts` — Initialize report engine
9. `notifications/notification-engine.ts` — Initialize notification engine
10. `scheduler/scheduler-engine.ts` — Initialize scheduler engine
11. Set assistant status to RUNNING

---

## 9. MODULE CHARACTERISTICS

- **31 Production-Ready TypeScript Files**
- **14 Subsystems** — Each with single responsibility
- **Zero Technical Debt** — No placeholders, TODOs, or mock implementations
- **Strict Type Safety** — Full TypeScript with readonly properties and explicit typing
- **Fully Isolated** — No dependencies on existing chambers or business logic
- **Extensible Interfaces** — Strategy pattern, provider-based extensions for all components
- **Production-Grade Logging** — Structured logging across all subsystems
- **Immutable Types** — All interfaces use readonly properties
- **Compile-Time Verified** — TypeScript compilation passes without errors

---

**Document Generated:** AZMA OS Al-Wateen Assistant Architecture Report
**Module Status:** Production-Ready Foundation Complete
**Ready for Chamber Integration:** Phase 2
