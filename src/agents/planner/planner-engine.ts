import { 
  PlannerInput, 
  PlannerOutput, 
  ProjectDNA, 
  ProjectCategory, 
  VisualIdentity, 
  NarrativeIdentity 
} from './planner-types';
import { PlannerRulesEngine } from './planner-rules';
import { PlannerCostEngine } from './planner-costs';

export class PlannerEngine {
  /**
   * Primary entry point for the Planner Agent.
   * Orchestrates the sovereign analysis to produce a deterministic production plan.
   */
  public static async analyze(input: PlannerInput): Promise<PlannerOutput> {
    if (!input.idea || input.idea.trim().length === 0) {
      throw new Error('PlannerEngine Error: Project idea is required for analysis.');
    }

    // 1. Classification
    const category = PlannerRulesEngine.determineCategory(input.idea, input.basePrompt);

    // 2. Generate Project DNA
    const dna = this.generateProjectDNA(input, category);

    // 3. Generate Workflow
    const workflow = PlannerRulesEngine.generateStandardWorkflow(category);

    // 4. Derive Required Agents
    const requiredAgents = PlannerRulesEngine.deriveRequiredAgents(workflow);

    // 5. Calculate Timeline
    const timeline = PlannerCostEngine.estimateTimeline(category, workflow);

    // 6. Calculate Costs
    const costs = PlannerCostEngine.calculateCosts(category, workflow);

    // 7. Assemble Output
    return {
      planId: `PLAN-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
      generatedAt: new Date(),
      dna,
      workflow,
      requiredAgents,
      timeline,
      costs
    };
  }

  /**
   * Synthesizes the Project DNA based on input content and derived category.
   * Enforces strict architectural constraints without relying on external uncertainty.
   */
  private static generateProjectDNA(input: PlannerInput, category: ProjectCategory): ProjectDNA {
    const titleIdea = input.idea.split('\n')[0].trim().substring(0, 100);
    const coreHypothesis = `Sovereign production centered around: ${titleIdea}`;
    
    return {
      id: `DNA-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
      category,
      topic: input.idea,
      coreHypothesis,
      visualIdentity: this.deriveVisualIdentity(category),
      narrativeIdentity: this.deriveNarrativeIdentity(category),
      structuralConstraints: PlannerRulesEngine.generateStructuralConstraints(category)
    };
  }

  /**
   * Deterministically assigns visual guidelines based on the classified project category.
   */
  private static deriveVisualIdentity(category: ProjectCategory): VisualIdentity {
    switch (category) {
      case 'cinematic':
        return {
          primaryColors: ['#000000', '#D4AF37', '#1A1A1A'],
          aestheticStyle: 'High-Contrast Cinematic',
          cinematicRules: ['Rule of Thirds', 'Dynamic Lighting', 'Shallow Depth of Field']
        };
      case 'podcast':
        return {
          primaryColors: ['#121212', '#D4AF37'],
          aestheticStyle: 'Acoustic Minimalist',
          cinematicRules: ['Audio-Wave Visualization', 'Static Cover Art']
        };
      case 'article':
        return {
          primaryColors: ['#FFFFFF', '#333333', '#D4AF37'],
          aestheticStyle: 'Editorial Clean',
          cinematicRules: ['Typographic Hierarchy', 'Grid Layout', 'Negative Space']
        };
      case 'research':
        return {
          primaryColors: ['#F5F5F5', '#0A0A0A', '#4A4A4A'],
          aestheticStyle: 'Academic Standard',
          cinematicRules: ['Data Visualization Priority', 'Information Density']
        };
      default:
        return {
          primaryColors: ['#000000', '#FFFFFF'],
          aestheticStyle: 'Standard Neutral',
          cinematicRules: []
        };
    }
  }

  /**
   * Deterministically assigns narrative tone and pacing based on the classified project category.
   */
  private static deriveNarrativeIdentity(category: ProjectCategory): NarrativeIdentity {
    switch (category) {
      case 'cinematic':
        return { 
          tone: 'Dramatic & Engaging', 
          pacing: 'Variable (Tension-driven)', 
          coreThemes: ['Visual Storytelling', 'Emotional Resonance'] 
        };
      case 'podcast':
        return { 
          tone: 'Conversational & Authoritative', 
          pacing: 'Steady', 
          coreThemes: ['Deep Dive Discussion', 'Audience Intimacy'] 
        };
      case 'article':
        return { 
          tone: 'Informative & Persuasive', 
          pacing: 'Fast (Scannable)', 
          coreThemes: ['Clear Communication', 'Structured Argumentation'] 
        };
      case 'research':
        return { 
          tone: 'Objective & Analytical', 
          pacing: 'Measured', 
          coreThemes: ['Empirical Analysis', 'Fact-based Verification'] 
        };
      default:
        return { 
          tone: 'Neutral', 
          pacing: 'Moderate', 
          coreThemes: ['General Information'] 
        };
    }
  }
}