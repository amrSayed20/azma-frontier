import { ConstitutionActionContext, ConstitutionArticleDefinition, ConstitutionPriority, ConstitutionPriorityResult } from './constitution-types';

const PRIORITY_WEIGHT: Record<ConstitutionPriority, number> = {
  low: 10,
  normal: 25,
  high: 50,
  critical: 80,
  constitutional: 100,
};

export class ConstitutionPriorityEngine {
  public resolvePriority(action: ConstitutionActionContext, article?: ConstitutionArticleDefinition): ConstitutionPriorityResult {
    let priority = action.priority;
    let reason = `Action priority preserved as ${priority}.`;

    if (article) {
      if (article.articleNumber <= 3) {
        priority = 'constitutional';
        reason = `Article ${article.articleNumber} carries constitutional priority.`;
      } else if (article.articleNumber <= 10 && priority === 'low') {
        priority = 'high';
        reason = 'Constitutional relevance elevates priority.';
      }
    }

    if (action.actionType === 'security' || action.actionType === 'founder-interaction') {
      priority = priority === 'low' ? 'high' : priority;
      reason = 'Security and Founder interactions require elevated urgency.';
    }

    return {
      actionId: action.actionId,
      articleId: article?.articleId,
      priority,
      weight: PRIORITY_WEIGHT[priority],
      reason,
    };
  }
}
