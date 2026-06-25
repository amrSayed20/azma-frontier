import { InteractionLogger } from './interaction-logger';

export interface DNASignal {
  primaryInterests: string[];
  researchPatterns: string[];
  lastEvolvedAt: Date;
}

export class DNAInitializer {
  public static extractSignals(): DNASignal {
    const logs = InteractionLogger.getLogs();
    
    const topicFrequency: Record<string, number> = {};
    const actionFrequency: Record<string, number> = {};

    for (const log of logs) {
      const normalizedTopic = log.topic.toLowerCase().trim();
      topicFrequency[normalizedTopic] = (topicFrequency[normalizedTopic] || 0) + 1;
      actionFrequency[log.action] = (actionFrequency[log.action] || 0) + 1;
    }

    const primaryInterests = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);

    const researchPatterns = Object.entries(actionFrequency)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => `Frequent operation: ${entry[0]}`);

    return {
      primaryInterests,
      researchPatterns,
      lastEvolvedAt: new Date(),
    };
  }
}