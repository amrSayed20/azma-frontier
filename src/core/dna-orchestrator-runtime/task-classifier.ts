import { AICapabilityType } from '../sovereign-ai-integration';
import { DNAModality, DNAOrchestrationRequest, DNATaskClassification, DNATaskType } from './dna-orchestrator-types';

type TaskRule = {
  readonly taskType: DNATaskType;
  readonly modality: DNAModality;
  readonly capability: AICapabilityType;
  readonly keywords: readonly string[];
};

const TASK_RULES: readonly TaskRule[] = [
  { taskType: 'image', modality: 'image', capability: 'image-generation', keywords: ['image', 'illustration', 'render', 'photo', 'picture', 'logo', 'visual'] },
  { taskType: 'video', modality: 'video', capability: 'text-generation', keywords: ['video', 'film', 'clip', 'animation', 'storyboard', 'scene'] },
  { taskType: 'audio', modality: 'audio', capability: 'audio-generation', keywords: ['audio', 'voice', 'speech', 'sound', 'music', 'transcribe'] },
  { taskType: 'code', modality: 'code', capability: 'text-generation', keywords: ['code', 'typescript', 'javascript', 'python', 'bug', 'compile', 'function', 'class'] },
  { taskType: 'reasoning', modality: 'text', capability: 'reasoning', keywords: ['reason', 'analyze', 'decide', 'plan', 'strategy', 'why'] },
  { taskType: 'search', modality: 'text', capability: 'tool-use', keywords: ['search', 'lookup', 'research', 'find current', 'latest', 'browse'] },
  { taskType: 'translation', modality: 'text', capability: 'text-generation', keywords: ['translate', 'translation', 'localize'] },
  { taskType: 'editing', modality: 'text', capability: 'text-generation', keywords: ['edit', 'rewrite', 'revise', 'proofread', 'improve'] },
  { taskType: 'summarization', modality: 'text', capability: 'text-generation', keywords: ['summarize', 'summary', 'brief'] },
  { taskType: 'data-analysis', modality: 'text', capability: 'reasoning', keywords: ['data', 'csv', 'metric', 'chart', 'analysis'] },
  { taskType: 'embedding', modality: 'text', capability: 'embedding', keywords: ['embedding', 'vector', 'semantic'] },
  { taskType: 'vision', modality: 'multimodal', capability: 'vision-analysis', keywords: ['inspect image', 'vision', 'screenshot', 'diagram'] },
  { taskType: 'tool-use', modality: 'text', capability: 'tool-use', keywords: ['tool', 'call', 'execute', 'workflow'] },
];

export class TaskClassifier {
  public classify(request: DNAOrchestrationRequest): DNATaskClassification {
    if (request.taskHint) {
      const hinted = TASK_RULES.find((rule) => rule.taskType === request.taskHint);
      if (hinted) {
        return this.toClassification(hinted, 0.95, 'Task hint supplied by caller.');
      }
    }

    const prompt = request.prompt.toLowerCase();
    const scored = TASK_RULES.map((rule) => ({
      rule,
      score: rule.keywords.filter((keyword) => prompt.includes(keyword)).length,
    })).sort((a, b) => b.score - a.score);

    const best = scored[0];
    if (best && best.score > 0) {
      return this.toClassification(best.rule, Math.min(0.9, 0.55 + best.score * 0.12), 'Prompt matched sovereign task taxonomy.');
    }

    return {
      taskType: 'conversation',
      modality: request.modalityHint ?? 'text',
      capability: 'chat-completion',
      confidence: 0.6,
      explanation: 'Defaulted to conversational orchestration because no specialized task signal dominated.',
    };
  }

  private toClassification(rule: TaskRule, confidence: number, explanation: string): DNATaskClassification {
    return {
      taskType: rule.taskType,
      modality: rule.modality,
      capability: rule.capability,
      confidence,
      explanation,
    };
  }
}
