import { randomUUID } from 'crypto';
import type { PlatformVitalityContract } from './sovereign-command-contract';
import type {
  FiveQuestions,
  PlatformVitalitySignal,
  VitalityStatus,
} from './sovereign-command-types';
import type { OsHeartbeatService } from './os-heartbeat-service';
import type { IncidentIntelligenceService } from './incident-intelligence-service';
import type { EmpireTreasuryService } from './empire-treasury-service';

function deriveStatus(questions: FiveQuestions): VitalityStatus {
  if (!questions.isAlive) return 'OFFLINE';
  if (!questions.isHealthy) return 'CRITICAL';
  if (questions.attentionRequired.length > 0) return 'DEGRADED';
  return 'ALIVE';
}

export class PlatformVitalityService implements PlatformVitalityContract {
  readonly serviceName = 'PlatformVitalityService' as const;

  constructor(
    private readonly heartbeatService: OsHeartbeatService,
    private readonly incidentService: IncidentIntelligenceService,
    private readonly treasuryService: EmpireTreasuryService,
  ) {}

  async fiveQuestions(): Promise<FiveQuestions> {
    const [heartbeat, treasury] = await Promise.all([
      this.heartbeatService.getHeartbeat(),
      this.treasuryService.getSnapshot(),
    ]);

    const incidents = this.incidentService.detectIncidents(heartbeat);

    const isAlive =
      heartbeat.l3Scheduling.layerNumber === 3 &&
      heartbeat.l4Memory.layerNumber === 4;

    const isHealthy = heartbeat.overallStatus === 'HEALTHY';

    const isProfitable = treasury.subscriptions.mrr > 0 || treasury.revenue.monthly > 0;

    const cacheHitRatios = heartbeat.l10Chambers
      .map((c) => c.metrics['cacheHitRatio'] ?? null)
      .filter((r): r is number => r !== null);
    const areUsersSucceeding =
      cacheHitRatios.length === 0 ||
      cacheHitRatios.some((r) => r > 0);

    const attentionRequired: string[] = [];
    for (const incident of this.incidentService.getOpenIncidents()) {
      attentionRequired.push(incident.what);
    }
    for (const newIncident of incidents) {
      if (!attentionRequired.includes(newIncident.what)) {
        attentionRequired.push(newIncident.what);
      }
    }
    if (!isProfitable) {
      attentionRequired.push('Platform has no active revenue — growth action required');
    }
    if (heartbeat.l8Intelligence.availableSources === 0) {
      attentionRequired.push('Sovereign Intelligence has no available knowledge sources');
    }

    return {
      isAlive,
      isHealthy,
      isProfitable,
      areUsersSucceeding,
      attentionRequired,
    };
  }

  async getVitalitySignal(): Promise<PlatformVitalitySignal> {
    const questions = await this.fiveQuestions();
    const status = deriveStatus(questions);

    const messages: Record<VitalityStatus, string> = {
      ALIVE: 'The Empire is alive and operating at full capacity',
      DEGRADED: `The Empire is alive with ${questions.attentionRequired.length} item(s) requiring attention`,
      CRITICAL: 'The Empire is alive but chamber health is degraded — immediate action required',
      OFFLINE: 'The Empire is offline — runtime initialization may be incomplete',
    };

    return {
      signalId: randomUUID(),
      status,
      message: messages[status],
      fiveQuestions: questions,
      checkedAt: new Date(),
    };
  }
}
