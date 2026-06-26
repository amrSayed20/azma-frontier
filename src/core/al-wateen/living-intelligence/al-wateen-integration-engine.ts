import { ConstitutionRuntime } from '../../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../../executive-intelligence';
import { FutureSimulationRuntime } from '../../future-simulation';
import { SovereignIntelligenceBusApi } from '../../sovereign-intelligence-bus';
import { SovereignPerceptionRuntime } from '../../sovereign-perception';
import { StrategicIntelligenceRuntime } from '../../strategic-intelligence';
import {
  AlWateenIntegrationInput,
  AlWateenRuntimeSnapshot,
  ConstitutionalIntelligencePackage,
} from './al-wateen-integration-types';
import { AlWateenMemory } from './al-wateen-memory';
import { AlWateenRuntimeState } from './al-wateen-runtime-state';
import { BriefingPreparationEngine } from './briefing-preparation-engine';
import { ConstitutionalUnderstandingEngine } from './constitutional-understanding-engine';
import { IntelligenceCorrelator } from './intelligence-correlator';
import { IntelligenceStreamIngestor } from './intelligence-stream-ingestor';
import { IntegrationDiagnostics } from './integration-diagnostics';
import { RecommendationAdvisor } from './recommendation-advisor';

export class AlWateenIntegrationEngine {
  constructor(
    private readonly constitutionRuntime: ConstitutionRuntime,
    private readonly executiveRuntime: ExecutiveIntelligenceRuntime,
    private readonly strategicRuntime: StrategicIntelligenceRuntime,
    private readonly futureSimulationRuntime: FutureSimulationRuntime,
    private readonly busApi: SovereignIntelligenceBusApi,
    private readonly perceptionRuntime: SovereignPerceptionRuntime,
    private readonly streamIngestor: IntelligenceStreamIngestor,
    private readonly correlator: IntelligenceCorrelator,
    private readonly understandingEngine: ConstitutionalUnderstandingEngine,
    private readonly briefingEngine: BriefingPreparationEngine,
    private readonly recommendationAdvisor: RecommendationAdvisor,
    private readonly memory: AlWateenMemory,
    private readonly state: AlWateenRuntimeState,
    private readonly diagnostics: IntegrationDiagnostics
  ) {}

  public integrate(input: AlWateenIntegrationInput): ConstitutionalIntelligencePackage {
    const streams = this.streamIngestor.ingest(
      input,
      this.constitutionRuntime,
      this.executiveRuntime,
      this.strategicRuntime,
      this.futureSimulationRuntime,
      this.busApi,
      this.perceptionRuntime
    );

    const correlation = this.correlator.correlate(streams);
    const understanding = this.understandingEngine.build(streams, correlation);
    const founderBriefing = this.briefingEngine.founderBriefing(understanding, correlation);
    const executiveBriefing = this.briefingEngine.executiveBriefing(understanding, correlation);
    const strategicBriefing = this.briefingEngine.strategicBriefing(understanding, correlation);
    const recommendations = this.recommendationAdvisor.advise(understanding, correlation);

    const intelligencePackage: ConstitutionalIntelligencePackage = {
      packageId: `alw-package-${Date.now().toString(36)}`,
      generatedAt: new Date(),
      streams,
      correlation,
      understanding,
      founderBriefing,
      executiveBriefing,
      strategicBriefing,
      recommendations,
      immutable: true,
      directive: 'advisory-only',
    };

    this.memory.store(intelligencePackage);
    this.state.publish(intelligencePackage);

    return intelligencePackage;
  }

  public latest(): ConstitutionalIntelligencePackage | undefined {
    return this.memory.latest();
  }

  public snapshot(): AlWateenRuntimeSnapshot {
    return this.state.snapshot();
  }

  public diagnosticsSnapshot() {
    return this.diagnostics.generate(this.state.snapshot());
  }
}
