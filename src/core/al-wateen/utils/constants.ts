/**
 * Shared runtime constants for Al-Wateen core.
 */

export const AL_WATEEN_CONFIG = {
  HEARTBEAT_INTERVAL_MS: 5000,
  WATCHDOG_INTERVAL_MS: 3000,
  HEALTH_CHECK_INTERVAL_MS: 10000,
  TELEMETRY_FLUSH_INTERVAL_MS: 15000,
  REPORT_INTERVAL_MS: 60000,
  MAX_TELEMETRY_BUFFER: 1000,
  MAX_NOTIFICATIONS: 1000,
  TASK_HISTORY_LIMIT: 500,
  EXECUTIVE_SNAPSHOT_WINDOW_MS: 300000,
  HEALTH_WARNING_THRESHOLD: 0.85,
  HEALTH_CRITICAL_THRESHOLD: 0.6
} as const;

export const COMPONENTS = {
  RUNTIME: 'runtime',
  HEARTBEAT: 'heartbeat',
  WATCHDOG: 'watchdog',
  HEALTH: 'health',
  SCHEDULER: 'scheduler',
  DISPATCHER: 'dispatcher',
  RECOVERY: 'recovery',
  PROVIDERS: 'providers',
  TELEMETRY: 'telemetry',
  NOTIFICATIONS: 'notifications',
  REPORTS: 'reports'
} as const;
