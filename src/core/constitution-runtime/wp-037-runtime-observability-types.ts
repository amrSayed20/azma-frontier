/**
 * ════════════════════════════════════════════════════════════════════════════
 * WP-037: RUNTIME OBSERVABILITY FRAMEWORK — TYPE DEFINITIONS
 * 
 * Complete type system for runtime metrics, health monitoring, and observability
 * across all Runtime Civilization layers.
 * ════════════════════════════════════════════════════════════════════════════
 */

import { ConstitutionArticleId } from './constitution-types';

// ════════════════════════════════════════════════════════════════════════════
// 1. CORE HEALTH METRICS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Health rating scale (0-100)
 * 0-25: Critical | 25-50: Poor | 50-75: Fair | 75-90: Good | 90-100: Excellent
 */
export type HealthRating = number & { readonly __brand: 'HealthRating' };

/**
 * Operational status of a runtime component
 */
export enum OperationalStatus {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  OFFLINE = 'OFFLINE',
}

/**
 * Metric collection point with timestamp and value
 */
export interface MetricDataPoint {
  readonly timestamp: number;
  readonly value: number;
  readonly unit: string;
  readonly source: string;
}

/**
 * Statistical summary of a metric over time window
 */
export interface MetricStatistics {
  readonly current: number;
  readonly average: number;
  readonly minimum: number;
  readonly maximum: number;
  readonly stdDev: number;
  readonly percentile95: number;
  readonly percentile99: number;
  readonly sampleCount: number;
  readonly timeWindowMs: number;
}

// ════════════════════════════════════════════════════════════════════════════
// 2. LAYER HEALTH MONITORING
// ════════════════════════════════════════════════════════════════════════════

/**
 * Runtime layer identifiers
 */
export enum RuntimeLayer {
  CONSTITUTION = 'CONSTITUTION',
  EXECUTION = 'EXECUTION',
  SCHEDULING = 'SCHEDULING',
  MEMORY = 'MEMORY',
  DECISION = 'DECISION',
  AGENT_SOCIETY = 'AGENT_SOCIETY',
  COOPERATION = 'COOPERATION',
  TEMPORAL = 'TEMPORAL',
  OBSERVABILITY = 'OBSERVABILITY',
  SECURITY = 'SECURITY',
}

/**
 * Health metrics for a specific runtime layer
 */
export interface LayerHealthMetrics {
  readonly layer: RuntimeLayer;
  readonly status: OperationalStatus;
  readonly healthRating: HealthRating;
  readonly lastCheckAt: number;
  readonly uptime: number; // milliseconds
  readonly errorCount: number;
  readonly warningCount: number;
  readonly operationCount: number;
  readonly successRate: number; // 0-1
  readonly avgLatencyMs: number;
  readonly dependencyStatus: Map<RuntimeLayer, OperationalStatus>;
  readonly issues: string[];
}

/**
 * Cross-layer layer health report
 */
export interface RuntimeLayerHealthReport {
  readonly reportId: string;
  readonly generatedAt: number;
  readonly layers: Map<RuntimeLayer, LayerHealthMetrics>;
  readonly overallHealth: HealthRating;
  readonly criticalIssues: string[];
  readonly warnings: string[];
}

// ════════════════════════════════════════════════════════════════════════════
// 3. AGENT HEALTH MONITORING
// ════════════════════════════════════════════════════════════════════════════

/**
 * Health metrics for individual agents
 */
export interface AgentHealthMetrics {
  readonly agentId: string;
  readonly status: OperationalStatus;
  readonly healthRating: HealthRating;
  readonly decisionsProcessed: number;
  readonly successfulDecisions: number;
  readonly failedDecisions: number;
  readonly averageDecisionLatencyMs: number;
  readonly errorCount: number;
  readonly cooperationCount: number;
  readonly delegationsCompleted: number;
  readonly delegationsFailed: number;
  readonly memoryUtilization: number; // 0-1
  readonly lastActivityAt: number;
  readonly specialization: string;
}

/**
 * Agent health matrix for all agents
 */
export interface AgentHealthMatrix {
  readonly reportId: string;
  readonly generatedAt: number;
  readonly agents: Map<string, AgentHealthMetrics>;
  readonly totalAgents: number;
  readonly healthyAgents: number;
  readonly degradedAgents: number;
  readonly criticalAgents: number;
  readonly averageHealthRating: HealthRating;
}

// ════════════════════════════════════════════════════════════════════════════
// 4. QUEUE & CONCURRENCY HEALTH
// ════════════════════════════════════════════════════════════════════════════

/**
 * Queue health and throughput metrics
 */
export interface QueueHealthMetrics {
  readonly queueName: string;
  readonly currentDepth: number;
  readonly maxDepth: number;
  readonly utilizationPercent: number; // 0-100
  readonly averageWaitTimeMs: number;
  readonly peakWaitTimeMs: number;
  readonly itemsProcessed: number;
  readonly itemsFailed: number;
  readonly throughputPerSecond: number;
  readonly status: OperationalStatus;
  readonly healthRating: HealthRating;
}

/**
 * Concurrency health across system
 */
export interface ConcurrencyHealthMetrics {
  readonly activeOperations: number;
  readonly maxConcurrency: number;
  readonly utilizationPercent: number;
  readonly contentionCount: number;
  readonly deadlockCount: number;
  readonly status: OperationalStatus;
  readonly healthRating: HealthRating;
}

// ════════════════════════════════════════════════════════════════════════════
// 5. MEMORY & DECISION HEALTH
// ════════════════════════════════════════════════════════════════════════════

/**
 * Memory layer health metrics
 */
export interface MemoryHealthMetrics {
  readonly totalMemoryBytes: number;
  readonly usedMemoryBytes: number;
  readonly utilizationPercent: number;
  readonly allocationCount: number;
  readonly deallocationCount: number;
  readonly fragmentationPercent: number;
  readonly garbageCollectionCount: number;
  readonly status: OperationalStatus;
  readonly healthRating: HealthRating;
  readonly issues: string[];
}

/**
 * Decision latency and quality metrics
 */
export interface DecisionHealthMetrics {
  readonly decisionsProcessed: number;
  readonly averageLatencyMs: number;
  readonly p95LatencyMs: number;
  readonly p99LatencyMs: number;
  readonly successRate: number; // 0-1
  readonly escalationRate: number; // 0-1
  readonly vettoRate: number; // 0-1
  readonly overrideRate: number; // 0-1
  readonly humanEscalationCount: number;
  readonly status: OperationalStatus;
  readonly healthRating: HealthRating;
}

// ════════════════════════════════════════════════════════════════════════════
// 6. CONSTITUTIONAL COMPLIANCE METRICS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Constitutional compliance tracking
 */
export interface ConstitutionalComplianceMetrics {
  readonly reportId: string;
  readonly generatedAt: number;
  readonly totalOperations: number;
  readonly constitutionallyCompliantOperations: number;
  readonly complianceRate: number; // 0-1
  readonly violationCount: number;
  readonly authorityChainsVerified: number;
  readonly policyChainsVerified: number;
  readonly auditTrailsValid: number;
  readonly status: OperationalStatus;
  readonly healthRating: HealthRating;
  readonly violations: string[];
}

// ════════════════════════════════════════════════════════════════════════════
// 7. RUNTIME INTEGRITY METRICS
// ════════════════════════════════════════════════════════════════════════════

/**
 * Runtime integrity verification results
 */
export interface RuntimeIntegrityMetrics {
  readonly reportId: string;
  readonly verifiedAt: number;
  readonly layerCount: number;
  readonly layersConsistent: number;
  readonly consistencyRate: number; // 0-1
  readonly checksumValid: boolean;
  readonly stateConsistent: boolean;
  readonly dependencyGraphValid: boolean;
  readonly noCircularDependencies: boolean;
  readonly allContractsValid: boolean;
  readonly allVersionsCompatible: boolean;
  readonly status: OperationalStatus;
  readonly healthRating: HealthRating;
  readonly inconsistencies: string[];
}

// ════════════════════════════════════════════════════════════════════════════
// 8. CIVILIZATION-WIDE HEALTH
// ════════════════════════════════════════════════════════════════════════════

/**
 * Overall civilization health dashboard
 */
export interface CivilizationHealthDashboard {
  readonly reportId: string;
  readonly generatedAt: number;
  readonly overallHealthRating: HealthRating;
  readonly systemStatus: OperationalStatus;
  readonly layerHealthRatings: Map<RuntimeLayer, HealthRating>;
  readonly agentHealthRating: HealthRating;
  readonly queueHealthRating: HealthRating;
  readonly memoryHealthRating: HealthRating;
  readonly decisionHealthRating: HealthRating;
  readonly complianceHealthRating: HealthRating;
  readonly integrityHealthRating: HealthRating;
  readonly uptime: number; // milliseconds since start
  readonly totalOperations: number;
  readonly successfulOperations: number;
  readonly failedOperations: number;
  readonly criticalAlerts: string[];
  readonly warnings: string[];
}

// ════════════════════════════════════════════════════════════════════════════
// 9. OBSERVABILITY SERVICE CONTRACT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Complete observability and health monitoring service contract
 */
export interface RuntimeObservabilityServiceContract {
  /**
   * Record a metric data point
   */
  recordMetric(
    metricName: string,
    value: number,
    unit: string,
    tags: Map<string, string>
  ): Promise<void>;

  /**
   * Get statistics for a metric over time window
   */
  getMetricStatistics(
    metricName: string,
    windowMs: number
  ): Promise<MetricStatistics>;

  /**
   * Check health of specific layer
   */
  checkLayerHealth(layer: RuntimeLayer): Promise<LayerHealthMetrics>;

  /**
   * Get health report for all layers
   */
  getLayerHealthReport(): Promise<RuntimeLayerHealthReport>;

  /**
   * Check health of specific agent
   */
  checkAgentHealth(agentId: string): Promise<AgentHealthMetrics>;

  /**
   * Get health matrix for all agents
   */
  getAgentHealthMatrix(): Promise<AgentHealthMatrix>;

  /**
   * Check queue health
   */
  getQueueHealth(queueName: string): Promise<QueueHealthMetrics>;

  /**
   * Get concurrency health across system
   */
  getConcurrencyHealth(): Promise<ConcurrencyHealthMetrics>;

  /**
   * Check memory layer health
   */
  getMemoryHealth(): Promise<MemoryHealthMetrics>;

  /**
   * Check decision layer health
   */
  getDecisionHealth(): Promise<DecisionHealthMetrics>;

  /**
   * Verify constitutional compliance
   */
  verifyConstitutionalCompliance(): Promise<ConstitutionalComplianceMetrics>;

  /**
   * Verify runtime integrity
   */
  verifyRuntimeIntegrity(): Promise<RuntimeIntegrityMetrics>;

  /**
   * Get overall civilization health dashboard
   */
  getCivilizationHealthDashboard(): Promise<CivilizationHealthDashboard>;

  /**
   * Get metric history over time window
   */
  getMetricHistory(
    metricName: string,
    windowMs: number
  ): Promise<MetricDataPoint[]>;

  /**
   * Create alert when metric exceeds threshold
   */
  createAlert(
    metricName: string,
    threshold: number,
    operator: 'GT' | 'LT' | 'EQ',
    alertName: string
  ): Promise<string>;

  /**
   * Get all active alerts
   */
  getActiveAlerts(): Promise<string[]>;
}
