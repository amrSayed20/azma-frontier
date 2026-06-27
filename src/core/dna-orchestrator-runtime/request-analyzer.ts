import { DNAOrchestrationRequest, DNARequestAnalysis } from './dna-orchestrator-types';
import { TaskClassifier } from './task-classifier';

export class RequestAnalyzer {
  constructor(private readonly classifier: TaskClassifier) {}

  public analyze(request: DNAOrchestrationRequest): DNARequestAnalysis {
    const classification = this.classifier.classify(request);
    const prompt = request.prompt.toLowerCase();
    const requiresFreshContext = ['latest', 'current', 'today', 'search', 'browse'].some((signal) => prompt.includes(signal));
    const requiresToolUse = classification.capability === 'tool-use' || requiresFreshContext;
    const requiresMultimodalProvider = classification.modality === 'image' || classification.modality === 'audio' || classification.modality === 'multimodal';

    return {
      requestId: request.requestId,
      promptLength: request.prompt.length,
      priority: request.priority ?? 'normal',
      classification,
      requiresFreshContext,
      requiresToolUse,
      requiresMultimodalProvider,
      explanation: `DNA classified the request as ${classification.taskType} using ${classification.capability}.`,
    };
  }
}
