import { 
  ProjectCategory, 
  WorkflowStep, 
  AgentRequirement 
} from './planner-types';

export class PlannerRulesEngine {
  /**
   * Evaluates the core idea and prompt to deterministically classify the project category.
   * Acts as a sovereign heuristic filter before any external LLM processing.
   */
  public static determineCategory(idea: string, prompt: string): ProjectCategory {
    const normalizedInput = `${idea} ${prompt}`.toLowerCase();
    
    if (/(documentary|film|video|cinematic|visual|footage)/.test(normalizedInput)) {
      return 'cinematic';
    }
    if (/(podcast|audio|voice|interview|episode)/.test(normalizedInput)) {
      return 'podcast';
    }
    if (/(article|blog|essay|post|editorial)/.test(normalizedInput)) {
      return 'article';
    }
    if (/(research|study|paper|analysis|dossier)/.test(normalizedInput)) {
      return 'research';
    }
    
    return 'unknown';
  }

  /**
   * Generates the immutable, sovereign structural constraints based on project category.
   * Ensures that production standards are strictly enforced regardless of the project's content.
   */
  public static generateStructuralConstraints(category: ProjectCategory): string[] {
    const baseConstraints = [
      'All claims must be backed by evidence objects from Hujjah Al-Damighah.',
      'Output must adhere to the sovereign visual and narrative identity.'
    ];

    switch (category) {
      case 'cinematic':
        return [
          ...baseConstraints,
          'Must include a clear visual storyboard breakdown.',
          'Pacing must account for B-roll and visual transitions.',
          'Audio-visual cues must be explicitly synchronized in the script.'
        ];
      case 'podcast':
        return [
          ...baseConstraints,
          'Must include distinct audio cues for segment transitions.',
          'Dialogue must be optimized for spoken word and breath control.',
          'Requires detailed show notes mapping to timestamps.'
        ];
      case 'article':
        return [
          ...baseConstraints,
          'Must follow a strict hierarchical heading structure (H1, H2, H3).',
          'Paragraphs must be optimized for digital readability and scanning.',
          'In-line citations must map directly to the Evidence Bundle.'
        ];
      case 'research':
        return [
          ...baseConstraints,
          'Must include an Executive Summary and Methodology section.',
          'Confidence scores of evidence must be explicitly stated.',
          'Requires a counter-argument analysis section.'
        ];
      default:
        return baseConstraints;
    }
  }

  /**
   * Generates the deterministic production pipeline (Workflow) for a given category.
   * Enforces the architectural rule that specific tasks MUST happen in specific chambers.
   */
  public static generateStandardWorkflow(category: ProjectCategory): WorkflowStep[] {
    const baseWorkflow: WorkflowStep[] = [
      {
        stepId: `WFS-HUJJAH-01`,
        targetChamber: 'hujjah-al-damighah',
        operationName: 'Evidence Extraction & Intelligence Gathering',
        requiredInputs: ['idea', 'basePrompt'],
        expectedOutputs: ['EvidenceBundle', 'IntelligenceReport'],
        assignedAgentRole: 'IntelligenceExtractor',
        isCritical: true,
        orderIndex: 1
      },
      {
        stepId: `WFS-QIYAMAH-02`,
        targetChamber: 'qiyamah',
        operationName: 'Project DNA Definition & Workflow Planning',
        requiredInputs: ['IntelligenceReport'],
        expectedOutputs: ['ProjectDNA', 'ProductionPlan'],
        assignedAgentRole: 'MasterPlanner',
        isCritical: true,
        orderIndex: 2
      }
    ];

    if (category === 'research' || category === 'article') {
      baseWorkflow.push({
        stepId: `WFS-RAS-03`,
        targetChamber: 'ras-al-amr',
        operationName: 'Drafting & Narrative Construction',
        requiredInputs: ['ProjectDNA', 'EvidenceBundle'],
        expectedOutputs: ['DraftDocument'],
        assignedAgentRole: 'NarrativeArchitect',
        isCritical: true,
        orderIndex: 3
      });
    } else {
      baseWorkflow.push({
        stepId: `WFS-RAS-03`,
        targetChamber: 'ras-al-amr',
        operationName: 'Scripting & Directorial Breakdown',
        requiredInputs: ['ProjectDNA', 'EvidenceBundle'],
        expectedOutputs: ['ProductionScript', 'AssetList'],
        assignedAgentRole: 'CinematicDirector',
        isCritical: true,
        orderIndex: 3
      });
    }

    baseWorkflow.push({
      stepId: `WFS-MAKMAN-04`,
      targetChamber: 'makman-al-ghayah',
      operationName: 'Final Polish & Quality Assurance',
      requiredInputs: ['DraftDocument', 'ProductionScript'],
      expectedOutputs: ['FinalDeliverable'],
      assignedAgentRole: 'QualityAssuranceOverseer',
      isCritical: true,
      orderIndex: 4
    });

    return baseWorkflow;
  }

  /**
   * Dynamically derives the required agents based on the generated workflow.
   * Ensures the system knows exactly which specialized agents to spin up.
   */
  public static deriveRequiredAgents(workflow: WorkflowStep[]): AgentRequirement[] {
    const agentsMap = new Map<string, AgentRequirement>();

    for (const step of workflow) {
      if (!agentsMap.has(step.assignedAgentRole)) {
        agentsMap.set(step.assignedAgentRole, {
          roleId: step.assignedAgentRole,
          requiredCapabilities: [step.operationName],
          priorityLevel: step.isCritical ? 'high' : 'medium'
        });
      } else {
        // Upgrade capabilities and priority if agent is reused
        const existing = agentsMap.get(step.assignedAgentRole)!;
        if (!existing.requiredCapabilities.includes(step.operationName)) {
          existing.requiredCapabilities.push(step.operationName);
        }
        if (step.isCritical) {
          existing.priorityLevel = 'high';
        }
      }
    }

    return Array.from(agentsMap.values());
  }
}
