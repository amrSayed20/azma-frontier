import { ConstitutionArticleDefinition, ConstitutionArticleId, ConstitutionLoadResult, ConstitutionPolicyDefinition, ConstitutionVersion } from './constitution-types';
import { ConstitutionPolicyConflictError } from './constitution-errors';

const VERSION: ConstitutionVersion = '1.0';

function article(
  articleNumber: number,
  articleId: ConstitutionArticleId,
  title: string,
  summary: string,
  layer: ConstitutionArticleDefinition['layer'],
  coreOwner: ConstitutionArticleDefinition['coreOwner'],
  executionFrequency: ConstitutionArticleDefinition['executionFrequency'],
  constitutionalRules: readonly string[],
  allowedActionTypes: ConstitutionArticleDefinition['allowedActionTypes'],
  prohibitedActionTypes: ConstitutionArticleDefinition['prohibitedActionTypes'],
  consumingChambers: readonly string[]
): ConstitutionArticleDefinition {
  return {
    articleId,
    articleNumber,
    title,
    summary,
    layer,
    coreOwner,
    runtimeBehavior: summary,
    executionFrequency,
    inputs: [],
    outputs: [],
    dependencies: [],
    communicationPath: 'constitution-runtime',
    eventSources: [],
    eventConsumers: [],
    memoryInteraction: 'Recorded in constitutional memory.',
    aiInteraction: 'Resolved through constitutional runtime governance.',
    founderInteraction: 'Presented as executive guidance.',
    failureBehavior: 'Fail closed and preserve identity.',
    recoveryBehavior: 'Recover from registry and history.',
    evolutionPath: 'May refine but not contradict.',
    constitutionalRules,
    allowedActionTypes,
    prohibitedActionTypes,
    consumingChambers,
  };
}

function createArticles(): readonly ConstitutionArticleDefinition[] {
  return [
    article(1, 'constitutional-structure', 'Constitutional Structure', 'Defines the sovereign architecture.', 'constitutional-knowledge', 'system-root', 'event-driven', ['authority must remain explicit'], ['governance', 'communication'], ['infrastructure'], ['sovereign-high-council', 'al-wateen']),
    article(2, 'sovereign-high-council', 'Sovereign High Council', 'Visible Founder command environment.', 'founder-guidance', 'sovereign-high-council', 'event-driven', ['Council is the sovereign surface'], ['governance', 'communication'], [], ['sovereign-high-council']),
    article(3, 'al-wateen-constitutional-intelligence', 'Al-Wateen Constitutional Intelligence', 'Invisible constitutional intelligence.', 'executive-intelligence', 'al-wateen', 'continuous', ['continuous observation must not stop'], ['security', 'simulation', 'memory'], ['communication'], ['al-wateen']),
    article(4, 'empire-consciousness', 'Empire Consciousness', 'Observes the Empire as a living civilization.', 'runtime-behavior', 'al-wateen', 'continuous', ['the Empire is the subject of observation'], ['simulation', 'memory'], ['communication'], ['al-wateen']),
    article(5, 'living-digital-twin', 'Living Digital Twin', 'Canonical state of AZMA OS.', 'runtime-behavior', 'al-wateen', 'continuous', ['twin must remain canonical'], ['simulation', 'memory', 'communication'], ['infrastructure'], ['al-wateen', 'sovereign-orchestrator']),
    article(6, 'strategic-intelligence', 'Strategic Intelligence', 'Produces long-range strategic counsel.', 'executive-intelligence', 'al-wateen', 'continuous', ['strategy must improve the Empire'], ['simulation', 'evolution'], ['communication'], ['al-wateen']),
    article(7, 'sovereign-constitutional-memory', 'Sovereign Constitutional Memory', 'Records decisions and rationale.', 'living-memory', 'al-wateen', 'event-driven', ['memory must preserve why'], ['memory', 'simulation'], ['security'], ['al-wateen']),
    article(8, 'architectural-dna', 'Architectural DNA', 'Preserves immutable identity.', 'architectural-protection', 'constitution-runtime', 'event-driven', ['identity preservation outranks novelty'], ['security', 'evolution'], ['infrastructure'], ['constitution-runtime']),
    article(9, 'imperial-memory-timeline', 'Imperial Memory Timeline', 'Chronicles the evolution of the Empire.', 'living-memory', 'al-wateen', 'event-driven', ['history is constitutional wisdom'], ['memory', 'communication'], [], ['al-wateen']),
    article(10, 'constitutional-ethics', 'Constitutional Ethics', 'Rejects identity-eroding change.', 'architectural-protection', 'constitution-runtime', 'event-driven', ['identity is never traded away'], ['governance', 'evolution'], ['security'], ['constitution-runtime']),
    article(11, 'sovereign-future-simulation-engine', 'Sovereign Future Simulation Engine', 'Simulates futures before counsel is given.', 'executive-intelligence', 'constitution-runtime', 'event-driven', ['major counsel requires futures'], ['simulation', 'communication'], ['infrastructure'], ['constitution-runtime', 'al-wateen']),
    article(12, 'imperial-dream-layer', 'Imperial Dream Layer', 'Preserves future possibility.', 'living-memory', 'al-wateen', 'event-driven', ['the Empire must remember its dreams'], ['simulation', 'evolution'], [], ['al-wateen']),
    article(13, 'founder-experience', 'Founder Experience', 'Founder receives counsel, not dashboards.', 'founder-guidance', 'sovereign-high-council', 'on-demand', ['Founder must feel the Empire already knows'], ['communication', 'governance'], ['security'], ['sovereign-high-council', 'al-wateen']),
    article(14, 'human-ai-conversation-model', 'Human-AI Conversation Model', 'Defines the conversational style.', 'founder-guidance', 'al-wateen', 'on-demand', ['conversation must support decision-making'], ['communication', 'simulation'], [], ['al-wateen']),
    article(15, 'security-layers', 'Security Layers', 'Protects internal sovereignty.', 'architectural-protection', 'constitution-runtime', 'continuous', ['unauthorized users must never see sovereign depth'], ['security', 'governance'], ['infrastructure'], ['constitution-runtime']),
    article(16, 'visual-hierarchy', 'Visual Hierarchy', 'Ensures meaning before decoration.', 'founder-guidance', 'sovereign-high-council', 'event-driven', ['meaning outranks ornament'], ['communication'], [], ['sovereign-high-council']),
    article(17, 'motion-philosophy', 'Motion Philosophy', 'Motion as intelligence, not decoration.', 'founder-guidance', 'sovereign-high-council', 'event-driven', ['motion must not be theatrical'], ['communication'], [], ['sovereign-high-council']),
    article(18, 'lighting-philosophy', 'Lighting Philosophy', 'Light as meaning, not decoration.', 'founder-guidance', 'sovereign-high-council', 'event-driven', ['light should signal intelligence'], ['communication'], [], ['sovereign-high-council']),
    article(19, 'notification-philosophy', 'Notification Philosophy', 'Notifications as executive signals.', 'founder-guidance', 'al-wateen', 'event-driven', ['notifications must never become noise'], ['communication', 'security'], [], ['al-wateen', 'sovereign-high-council']),
    article(20, 'ai-brain-architecture', 'AI Brain Architecture', 'Separates identity from provider engines.', 'architectural-protection', 'constitution-runtime', 'event-driven', ['identity belongs to AZMA OS'], ['evolution', 'security'], ['infrastructure'], ['constitution-runtime', 'al-wateen']),
    article(21, 'expansion-zones', 'Expansion Zones', 'Defines where growth may occur.', 'runtime-behavior', 'constitution-runtime', 'periodic', ['growth must preserve coherence'], ['evolution', 'governance'], ['infrastructure'], ['constitution-runtime']),
    article(22, 'integration-with-chambers', 'Integration with Chambers', 'Defines chamber boundaries.', 'runtime-behavior', 'sovereign-orchestrator', 'event-driven', ['chambers remain subjects, not owners'], ['communication', 'security'], ['chamber-interaction'], ['sovereign-orchestrator', 'constitution-runtime']),
    article(23, 'integration-with-infrastructure', 'Integration with Infrastructure', 'Treats infrastructure as living imperial state.', 'runtime-behavior', 'constitution-runtime', 'continuous', ['infrastructure is part of the living Empire'], ['simulation', 'security'], ['infrastructure'], ['constitution-runtime']),
    article(24, 'integration-with-ai-providers', 'Integration with AI Providers', 'Keeps provider identity separate.', 'runtime-behavior', 'constitution-runtime', 'event-driven', ['providers are external intelligence sources'], ['evolution', 'security'], ['infrastructure'], ['constitution-runtime', 'al-wateen']),
    article(25, 'long-term-evolution-strategy', 'Long-Term Evolution Strategy', 'Makes the Empire stronger every month.', 'executive-intelligence', 'al-wateen', 'periodic', ['evolution must strengthen without erasing itself'], ['simulation', 'evolution'], ['communication'], ['al-wateen', 'constitution-runtime']),
    article(26, 'constitutional-synthesis', 'Constitutional Synthesis', 'Unifies all constitutional layers.', 'constitutional-knowledge', 'constitution-runtime', 'periodic', ['constitutional law must remain a whole'], ['governance', 'communication'], ['security'], ['constitution-runtime']),
    article(27, 'ratification-principle', 'Ratification Principle', 'Protects amendment discipline.', 'constitutional-knowledge', 'system-root', 'event-driven', ['no future decision may violate the constitution without amendment'], ['governance', 'security'], [], ['system-root', 'constitution-runtime']),
  ];
}

function createPolicies(articles: readonly ConstitutionArticleDefinition[]): readonly ConstitutionPolicyDefinition[] {
  return articles.map((current) => ({
    policyId: `policy-${current.articleNumber.toString().padStart(2, '0')}-${current.articleId}`,
    articleId: current.articleId,
    name: current.title,
    description: current.summary,
    mode: current.prohibitedActionTypes.length > 0 ? 'require' : 'allow',
    scope: 'all',
    priority: current.articleNumber <= 3 ? 'constitutional' : current.articleNumber <= 10 ? 'critical' : 'high',
    rules: current.constitutionalRules,
    effects: current.outputs,
    constitutionalJustification: current.summary,
  }));
}

export class ConstitutionRegistry {
  private readonly articles = new Map<ConstitutionArticleId, ConstitutionArticleDefinition>();
  private readonly policies = new Map<string, ConstitutionPolicyDefinition>();
  private loadedAt: Date | undefined;

  public loadConstitution(): ConstitutionLoadResult {
    if (this.articles.size === 0) {
      for (const current of createArticles()) {
        this.articles.set(current.articleId, current);
      }
      for (const policy of createPolicies(this.getArticles())) {
        this.policies.set(policy.policyId, policy);
      }
    }

    this.loadedAt = new Date();

    return {
      constitutionVersion: VERSION,
      articleCount: this.articles.size,
      policyCount: this.policies.size,
      loadedAt: this.loadedAt,
      articleIds: Array.from(this.articles.keys()),
    };
  }

  public isLoaded(): boolean {
    return this.loadedAt !== undefined;
  }

  public getLoadedAt(): Date | undefined {
    return this.loadedAt;
  }

  public getVersion(): ConstitutionVersion {
    return VERSION;
  }

  public getArticle(articleId: ConstitutionArticleId): ConstitutionArticleDefinition | undefined {
    return this.articles.get(articleId);
  }

  public getRequiredArticle(articleId: ConstitutionArticleId): ConstitutionArticleDefinition {
    const current = this.getArticle(articleId);
    if (!current) {
      throw new ConstitutionPolicyConflictError(`Constitution article not found: ${articleId}`);
    }
    return current;
  }

  public getArticles(): readonly ConstitutionArticleDefinition[] {
    return Array.from(this.articles.values()).sort((left, right) => left.articleNumber - right.articleNumber);
  }

  public getPolicies(): readonly ConstitutionPolicyDefinition[] {
    return Array.from(this.policies.values());
  }

  public getPoliciesForArticle(articleId: ConstitutionArticleId): readonly ConstitutionPolicyDefinition[] {
    return Array.from(this.policies.values()).filter((policy) => policy.articleId === articleId);
  }

  public registerPolicy(policy: ConstitutionPolicyDefinition): ConstitutionPolicyDefinition {
    if (policy.rules.length === 0) {
      throw new ConstitutionPolicyConflictError(`Policy ${policy.policyId} must define at least one rule.`);
    }
    this.policies.set(policy.policyId, policy);
    return policy;
  }
}

export function createConstitutionRegistry(): ConstitutionRegistry {
  return new ConstitutionRegistry();
}
