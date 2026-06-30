import { randomUUID } from 'crypto';
import type { IncidentIntelligenceContract } from './sovereign-command-contract';
import type {
  Incident,
  IncidentSeverity,
  OsHeartbeat,
} from './sovereign-command-types';

function deriveSeverity(chamberStatus: string): IncidentSeverity {
  if (chamberStatus === 'CRITICAL') return 'CRITICAL';
  if (chamberStatus === 'WARNING') return 'HIGH';
  if (chamberStatus === 'UNKNOWN') return 'MEDIUM';
  return 'LOW';
}

export class IncidentIntelligenceService implements IncidentIntelligenceContract {
  readonly serviceName = 'IncidentIntelligenceService' as const;

  private readonly incidents: Map<string, Incident> = new Map();

  detectIncidents(heartbeat: OsHeartbeat): readonly Incident[] {
    const newIncidents: Incident[] = [];

    for (const chamber of heartbeat.l10Chambers) {
      if (chamber.status === 'HEALTHY') continue;

      const existingOpen = [...this.incidents.values()].find(
        (i) => i.chamberId === chamber.chamberId && i.status === 'OPEN',
      );
      if (existingOpen !== undefined) continue;

      const severity = deriveSeverity(chamber.status);
      const incident: Incident = {
        incidentId: randomUUID(),
        severity,
        chamberId: chamber.chamberId,
        what: `Chamber ${chamber.chamberId} is reporting ${chamber.status} status`,
        why: chamber.message,
        resolution: 'Monitor chamber recovery; escalate to Founder if status persists beyond 5 minutes',
        usersAffected: chamber.status === 'CRITICAL',
        recommendation: `Review ${chamber.chamberId} metrics and consider runtime intervention via FounderApprovalGate`,
        detectedAt: heartbeat.timestamp,
        resolvedAt: null,
        status: 'OPEN',
      };
      this.incidents.set(incident.incidentId, incident);
      newIncidents.push(incident);
    }

    for (const [id, incident] of this.incidents.entries()) {
      if (incident.status !== 'OPEN') continue;
      if (incident.chamberId === null) continue;

      const chamberNowHealthy = heartbeat.l10Chambers.some(
        (c) => c.chamberId === incident.chamberId && c.status === 'HEALTHY',
      );
      if (chamberNowHealthy) {
        this.incidents.set(id, {
          ...incident,
          status: 'RESOLVED',
          resolvedAt: heartbeat.timestamp,
          resolution: `Chamber ${incident.chamberId} self-recovered to HEALTHY status`,
        });
      }
    }

    return newIncidents;
  }

  getOpenIncidents(): readonly Incident[] {
    return [...this.incidents.values()].filter((i) => i.status === 'OPEN');
  }

  resolveIncident(incidentId: string, resolution: string): void {
    const incident = this.incidents.get(incidentId);
    if (incident === undefined) return;
    this.incidents.set(incidentId, {
      ...incident,
      status: 'RESOLVED',
      resolvedAt: new Date(),
      resolution,
    });
  }

  getAllIncidents(): readonly Incident[] {
    return [...this.incidents.values()];
  }
}
