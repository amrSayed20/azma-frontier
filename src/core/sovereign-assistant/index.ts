/**
 * AZMA OS - Sovereign Assistant
 * Core Module Public API
 */

// Types
export type {
  SystemComponent,
  HealthStatus,
  UrgencyLevel,
  ComponentHealth,
  SystemHealthSnapshot,
  PlatformMetrics,
  FinancialMetrics,
  ResourceMetrics,
  PlatformRecommendation,
  EvolutionCandidate,
  Notification,
  NotificationChannel,
  NotificationPriority,
  NotificationPreferences,
  FounderCapability,
  FounderSession,
  BroadcastMessage,
  ArchitecturalDriftAlert,
  IntegrityCheckResult,
  CommandHall,
  CommandHallType,
  SovereignHighCouncilStatus,
} from './types/sovereign-types';

// Access Control
export {
  SovereignAccessControl,
  AccessAuditLog,
  createSovereignAccessControl,
} from './access-control/access-control';

export type {
  AccessControlConfig,
  AccessAuditEntry,
} from './access-control/access-control';

// Monitoring
export {
  PlatformMonitor,
  MetricsIntelligence,
} from './monitoring/platform-monitor';

// Notifications
export {
  NotificationDispatcher,
  NotificationPreferenceManager,
} from './notifications/notification-dispatcher';

export type {
  NotificationProvider,
  EmailNotificationProvider,
  SmsNotificationProvider,
  PushNotificationProvider,
  InAppNotificationProvider,
} from './notifications/notification-dispatcher';

// Evolution & Intelligence
export {
  RecommendationEngine,
  EvolutionEngine,
  IntelligenceSystem,
} from './evolution/intelligence-engine';

// Founder Command
export {
  ContentCreationCommand,
  UserManagementCommand,
  FinancialCommand,
  BroadcastCommand,
  MigrationApprovalCommand,
  FounderCommandCenter,
} from './founder-command/founder-command-center';

export type {
  UserGift,
} from './founder-command/founder-command-center';

// Main Sovereign Assistant
export {
  SovereignAssistant,
  SovereignAssistantBootstrap,
} from './sovereign-assistant';
