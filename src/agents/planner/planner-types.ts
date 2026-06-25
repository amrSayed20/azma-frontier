export type ProjectCategory = 'documentary' | 'podcast' | 'article' | 'research' | 'cinematic' | 'unknown';

export type ChamberId = 'hujjah-al-damighah' | 'qiyamah' | 'ras-al-amr' | 'makman-al-ghayah' | 'external';

export interface VisualIdentity {
  primaryColors: string[];
  aestheticStyle: string;
  cinematicRules: string[];
}

export interface NarrativeIdentity {
  tone: string;
  pacing: string;
  coreThemes: string[];
}

export interface ProjectDNA {
  id: string;
  category: ProjectCategory;
  topic: string;
  coreHypothesis: string;
  visualIdentity: VisualIdentity;
  narrativeIdentity: NarrativeIdentity;
  structuralConstraints: string[];
}

export interface WorkflowStep {
  stepId: string;
  targetChamber: ChamberId;
  operationName: string;
  requiredInputs: string[];
  expectedOutputs: string[];
  assignedAgentRole: string;
  isCritical: boolean;
  orderIndex: number;
}

export interface AgentRequirement {
  roleId: string;
  requiredCapabilities: string[];
  priorityLevel: 'high' | 'medium' | 'low';
}

export interface ProductionMilestone {
  id: string;
  name: string;
  associatedChamber: ChamberId;
  percentOfTotalTime: number;
}

export interface ProductionTimeline {
  estimatedDurationHours: number;
  milestones: ProductionMilestone[];
}

export interface CostEstimation {
  totalComputeUnits: number;
  complexityMultiplier: number;
  baseCost: number;
  resourceBreakdown: Record<string, number>;
}

export interface PlannerInput {
  idea: string;
  basePrompt: string;
  injectedEvidenceIds?: string[];
}

export interface PlannerOutput {
  planId: string;
  generatedAt: Date;
  dna: ProjectDNA;
  workflow: WorkflowStep[];
  requiredAgents: AgentRequirement[];
  timeline: ProductionTimeline;
  costs: CostEstimation;
}