import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../executive-intelligence';
import { EmpireAwarenessEngine } from './empire-awareness-engine';
import { StrategicForecastEngine } from './strategic-forecast-engine';
import { StrategicIntelligenceEngine } from './strategic-intelligence-engine';
import { StrategicMemory } from './strategic-memory';
import { StrategicObjectiveTracker } from './strategic-objective-tracker';
import { StrategicOpportunityAnalyzer } from './strategic-opportunity-analyzer';
import { StrategicRecommendationEngine } from './strategic-recommendation-engine';
import { StrategicRuntimeState } from './strategic-runtime-state';
import { StrategicSituationModel } from './strategic-situation-model';
import { StrategicThreatAnalyzer } from './strategic-threat-analyzer';
import { StrategicTrendEngine } from './strategic-trend-engine';

export function createStrategicIntelligenceEngine(
  constitutionRuntime: ConstitutionRuntime,
  executiveRuntime?: ExecutiveIntelligenceRuntime
): StrategicIntelligenceEngine {
  return new StrategicIntelligenceEngine(
    new EmpireAwarenessEngine(constitutionRuntime, executiveRuntime),
    new StrategicSituationModel(),
    new StrategicOpportunityAnalyzer(),
    new StrategicThreatAnalyzer(),
    new StrategicForecastEngine(),
    new StrategicTrendEngine(),
    new StrategicObjectiveTracker(),
    new StrategicRecommendationEngine(),
    new StrategicMemory(),
    new StrategicRuntimeState()
  );
}
