/**
 * AZMA OS - Sovereign Assistant
 * Main Orchestrator & Core Implementation
 *
 * AL-WATEEN AL-MUSAED AL-SIYADI
 * (The Sovereign Assistant)
 */

import { SovereignAccessControl } from './access-control/access-control';
import { PlatformMonitor, MetricsIntelligence } from './monitoring/platform-monitor';
import { NotificationDispatcher, NotificationPreferenceManager } from './notifications/notification-dispatcher';
import { IntelligenceSystem } from './evolution/intelligence-engine';
import { FounderCommandCenter } from './founder-command/founder-command-center';
import {
  SystemComponent,
  CommandHall,
  SovereignHighCouncilStatus,
  HealthStatus,
  SystemHealthSnapshot,
  FounderSession,
} from './types/sovereign-types';

/**
 * Core Sovereign Assistant implementation.
 */
export class SovereignAssistant {
  private readonly accessControl: SovereignAccessControl;
  private readonly monitor: PlatformMonitor;
  private readonly intelligence: IntelligenceSystem;
  private readonly notifications: NotificationDispatcher;
  private readonly preferences: NotificationPreferenceManager;
  private readonly founder: FounderCommandCenter;
  private readonly metrics: MetricsIntelligence;

  private readonly commandHalls: Map<string, CommandHall>;
  private lastHealthSnapshot: SystemHealthSnapshot | undefined;

  constructor(authorizedOwnerIds: readonly string[]) {
    this.accessControl = new SovereignAccessControl(authorizedOwnerIds);
    this.monitor = new PlatformMonitor();
    this.intelligence = new IntelligenceSystem();
    this.notifications = new NotificationDispatcher();
    this.preferences = new NotificationPreferenceManager();
    this.founder = new FounderCommandCenter();
    this.metrics = new MetricsIntelligence();

    this.commandHalls = this.initializeCommandHalls();
  }

  /**
   * Initializes the 14 Command Halls of the Sovereign High Council.
   */
  private initializeCommandHalls(): Map<string, CommandHall> {
    const halls = new Map<string, CommandHall>();

    const hallDefinitions: CommandHall[] = [
      {
        hallId: 'ch-sovereign-assistant',
        name: 'Sovereign Assistant',
        type: 'sovereign-assistant',
        description: 'Central supervisory intelligence for platform oversight',
        accessibleTo: [],
      },
      {
        hallId: 'ch-empire-pulse',
        name: 'Empire Pulse',
        type: 'empire-pulse',
        description: 'Real-time platform health and operational status',
        accessibleTo: [],
      },
      {
        hallId: 'ch-architectural-health',
        name: 'Architectural Health',
        type: 'architectural-health',
        description: 'Boundary integrity and layer health monitoring',
        accessibleTo: [],
      },
      {
        hallId: 'ch-infrastructure-health',
        name: 'Infrastructure Health',
        type: 'infrastructure-health',
        description: 'Systems, servers, and resource utilization',
        accessibleTo: [],
      },
      {
        hallId: 'ch-resource-intelligence',
        name: 'Resource Intelligence',
        type: 'resource-intelligence',
        description: 'CPU, memory, storage, and network analytics',
        accessibleTo: [],
      },
      {
        hallId: 'ch-financial-intelligence',
        name: 'Financial Intelligence',
        type: 'financial-intelligence',
        description: 'Revenue, costs, margins, and financial forecasting',
        accessibleTo: [],
      },
      {
        hallId: 'ch-evolution-intelligence',
        name: 'Evolution Intelligence',
        type: 'evolution-intelligence',
        description: 'AI model discovery and platform evolution',
        accessibleTo: [],
      },
      {
        hallId: 'ch-security-intelligence',
        name: 'Security Intelligence',
        type: 'security-intelligence',
        description: 'Access control, threat detection, and security events',
        accessibleTo: [],
      },
      {
        hallId: 'ch-founder-command',
        name: 'Founder Command Center',
        type: 'founder-command',
        description: 'Exclusive platform governance and creator capabilities',
        accessibleTo: [],
      },
      {
        hallId: 'ch-emergency-command',
        name: 'Emergency Command',
        type: 'emergency-command',
        description: 'Critical incident response and system recovery',
        accessibleTo: [],
      },
      {
        hallId: 'ch-development-observatory',
        name: 'Development Observatory',
        type: 'development-observatory',
        description: 'Development cycles and engineering metrics',
        accessibleTo: [],
      },
      {
        hallId: 'ch-broadcast-center',
        name: 'Broadcast Center',
        type: 'broadcast-center',
        description: 'Platform-wide communications and announcements',
        accessibleTo: [],
      },
      {
        hallId: 'ch-gift-distribution',
        name: 'Gift Distribution Center',
        type: 'gift-distribution',
        description: 'User rewards, credits, and subscriptions',
        accessibleTo: [],
      },
      {
        hallId: 'ch-future-laboratory',
        name: 'Future Laboratory',
        type: 'future-laboratory',
        description: 'Experimental features and future platform roadmap',
        accessibleTo: [],
      },
    ];

    for (const hall of hallDefinitions) {
      halls.set(hall.hallId, hall);
    }

    return halls;
  }

  /**
   * Initiates founder session for platform owner.
   */
  public createFounderSession(
    userId: string,
    ipAddress: string,
    userAgent: string
  ): FounderSession | null {
    return this.accessControl.createFounderSession(userId, ipAddress, userAgent);
  }

  /**
   * Validates founder session authenticity.
   */
  public validateFounderSession(session: FounderSession): boolean {
    return this.accessControl.validateSession(session);
  }

  /**
   * Captures comprehensive platform health snapshot.
   */
  public async captureHealthSnapshot(
    componentMetrics: Map<SystemComponent, number>
  ): Promise<SystemHealthSnapshot> {
    const snapshot = await this.monitor.captureHealthSnapshot(componentMetrics);
    this.lastHealthSnapshot = snapshot;
    return snapshot;
  }

  /**
   * Gets current overall platform health status.
   */
  public getOverallStatus(): HealthStatus {
    return this.lastHealthSnapshot?.overallStatus || 'offline';
  }

  /**
   * Gets command hall by type.
   */
  public getCommandHall(hallType: string): CommandHall | undefined {
    return Array.from(this.commandHalls.values()).find(
      h => h.type === hallType
    );
  }

  /**
   * Lists all available command halls.
   */
  public getAllCommandHalls(): readonly CommandHall[] {
    return Array.from(this.commandHalls.values());
  }

  /**
   * Generates Sovereign High Council status report.
   */
  public generateCouncilStatus(): SovereignHighCouncilStatus {
    const intelligence = this.intelligence.getIntelligence();
    const snapshot = this.lastHealthSnapshot;

    return {
      councilId: `council_${Date.now()}`,
      lastUpdateAt: new Date(),
      operationalStatus: snapshot?.overallStatus || 'offline',
      commandHalls: Array.from(this.commandHalls.values()),
      activeAlerts: snapshot?.componentHealth.filter(c => c.status !== 'healthy').length || 0,
      pendingRecommendations: intelligence.recommendations.length,
      systemScore: this.calculateSystemScore(snapshot),
    };
  }

  /**
   * Gets founder command center for governance operations.
   */
  public getFounderCommandCenter(): FounderCommandCenter {
    return this.founder;
  }

  /**
   * Gets intelligence system for recommendations and evolution.
   */
  public getIntelligenceSystem(): IntelligenceSystem {
    return this.intelligence;
  }

  /**
   * Gets platform monitor for health tracking.
   */
  public getPlatformMonitor(): PlatformMonitor {
    return this.monitor;
  }

  /**
   * Gets notification system.
   */
  public getNotificationDispatcher(): NotificationDispatcher {
    return this.notifications;
  }

  /**
   * Gets notification preferences manager.
   */
  public getPreferenceManager(): NotificationPreferenceManager {
    return this.preferences;
  }

  /**
   * Calculates overall platform health score (0-100).
   */
  private calculateSystemScore(snapshot: SystemHealthSnapshot | undefined): number {
    if (!snapshot) {
      return 0;
    }

    const healthyCount = snapshot.componentHealth.filter(c => c.status === 'healthy').length;
    const degradedCount = snapshot.componentHealth.filter(c => c.status === 'degraded').length;
    const totalCount = snapshot.componentHealth.length;

    if (totalCount === 0) {
      return 0;
    }

    const score = (healthyCount * 100 + degradedCount * 50) / totalCount;
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Analyzes platform health trends.
   */
  public analyzeHealthTrends(): {
    readonly trend: 'improving' | 'stable' | 'degrading';
    readonly recommendation: string;
  } {
    const history = this.monitor.getHealthHistory(10);

    if (history.length < 2) {
      return {
        trend: 'stable',
        recommendation: 'Insufficient data for trend analysis',
      };
    }

    const scores = history.map(s => this.calculateSystemScore(s));
    const recent = scores.slice(-3);
    const earlier = scores.slice(0, 3);

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;

    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    let recommendation = 'Platform stable, maintain current operations';

    if (recentAvg > earlierAvg * 1.1) {
      trend = 'improving';
      recommendation = 'Positive momentum - continue monitoring';
    } else if (recentAvg < earlierAvg * 0.9) {
      trend = 'degrading';
      recommendation = 'System degradation detected - investigate immediately';
    }

    return { trend, recommendation };
  }
}

/**
 * Bootstrap and initialization for Sovereign Assistant.
 */
export class SovereignAssistantBootstrap {
  /**
   * Creates fully initialized Sovereign Assistant instance.
   */
  public static initialize(authorizedOwnerIds: readonly string[]): SovereignAssistant {
    return new SovereignAssistant(authorizedOwnerIds);
  }
}
