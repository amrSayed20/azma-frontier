import type { SchedulingKernelContract } from '../constitution-runtime/wp-008-types';
import type { MemoryLayerContract } from '../constitution-runtime/wp-009-types';
import type { AgentSocietyLayerContract } from '../constitution-runtime/wp-013-020-agent-society-types';
import type { IntelligenceRuntimeContract } from '../sovereign-intelligence/intelligence-runtime-contract';
import type { ChamberAdapter } from '../chamber-integration/types/chamber-contracts';
import type { SovereignCommandContract } from './sovereign-command-contract';
import { EmpireChronicleService } from './empire-chronicle-service';
import { EmpireTreasuryService } from './empire-treasury-service';
import { ExecutiveIntelligenceService } from './executive-intelligence-service';
import { FounderApprovalGateService } from './founder-approval-gate-service';
import { IncidentIntelligenceService } from './incident-intelligence-service';
import { OsHeartbeatService } from './os-heartbeat-service';
import { PlatformVitalityService } from './platform-vitality-service';
import { PredictiveCommandService } from './predictive-command-service';
import { RuntimeObservatoryService } from './runtime-observatory-service';
import { SovereignGrantService } from './sovereign-grant-service';
import { SovereignReportingService } from './sovereign-reporting-service';

export class SovereignCommandLayer implements SovereignCommandContract {
  readonly layerName = 'SovereignCommand' as const;
  readonly version = '1.0.0' as const;
  readonly layerNumber = 9 as const;

  readonly osHeartbeat: OsHeartbeatService;
  readonly runtimeObservatory: RuntimeObservatoryService;
  readonly incidentIntelligence: IncidentIntelligenceService;
  readonly empireTreasury: EmpireTreasuryService;
  readonly predictiveCommand: PredictiveCommandService;
  readonly executiveIntelligence: ExecutiveIntelligenceService;
  readonly empireChronicle: EmpireChronicleService;
  readonly platformVitality: PlatformVitalityService;
  readonly sovereignReporting: SovereignReportingService;
  readonly sovereignGrants: SovereignGrantService;
  readonly founderApprovalGate: FounderApprovalGateService;

  constructor(
    kernelLayer3: SchedulingKernelContract,
    kernelLayer4: MemoryLayerContract,
    agentSociety: AgentSocietyLayerContract,
    sovereignIntelligence: IntelligenceRuntimeContract,
    getChamberAdapters: () => readonly ChamberAdapter[],
  ) {
    this.osHeartbeat = new OsHeartbeatService(
      kernelLayer3,
      kernelLayer4,
      agentSociety,
      sovereignIntelligence,
      getChamberAdapters,
    );
    this.runtimeObservatory = new RuntimeObservatoryService();
    this.incidentIntelligence = new IncidentIntelligenceService();
    this.empireTreasury = new EmpireTreasuryService();
    this.predictiveCommand = new PredictiveCommandService();
    this.executiveIntelligence = new ExecutiveIntelligenceService();

    this.empireChronicle = new EmpireChronicleService(kernelLayer4);

    this.platformVitality = new PlatformVitalityService(
      this.osHeartbeat,
      this.incidentIntelligence,
      this.empireTreasury,
    );

    this.sovereignReporting = new SovereignReportingService(
      kernelLayer3,
      kernelLayer4,
      agentSociety,
      sovereignIntelligence,
    );

    this.sovereignGrants = new SovereignGrantService(this.empireChronicle);
    this.founderApprovalGate = new FounderApprovalGateService(this.empireChronicle);
  }
}

export function createSovereignCommandLayer(
  kernelLayer3: SchedulingKernelContract,
  kernelLayer4: MemoryLayerContract,
  agentSociety: AgentSocietyLayerContract,
  sovereignIntelligence: IntelligenceRuntimeContract,
  getChamberAdapters: () => readonly ChamberAdapter[],
): SovereignCommandContract {
  return new SovereignCommandLayer(
    kernelLayer3,
    kernelLayer4,
    agentSociety,
    sovereignIntelligence,
    getChamberAdapters,
  );
}
