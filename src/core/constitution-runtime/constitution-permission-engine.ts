import { ConstitutionActionContext, ConstitutionArticleDefinition, ConstitutionDecision, ConstitutionPermissionResult } from './constitution-types';

export class ConstitutionPermissionEngine {
  public resolvePermissions(action: ConstitutionActionContext, article?: ConstitutionArticleDefinition): ConstitutionPermissionResult {
    if (!article) {
      return {
        actionId: action.actionId,
        articleId: undefined,
        decision: 'escalate',
        allowed: [],
        denied: [],
        escalated: [action.actionType],
        reasons: ['No constitutional article context available; action escalated for review.'],
      };
    }

    const allowed = article.allowedActionTypes.includes(action.actionType) ? [action.actionType] : [];
    const denied = article.prohibitedActionTypes.includes(action.actionType) ? [action.actionType] : [];
    const escalated = !allowed.length && !denied.length ? [action.actionType] : [];
    const decision: ConstitutionDecision = denied.length ? 'deny' : allowed.length ? 'allow' : 'escalate';

    return {
      actionId: action.actionId,
      articleId: article.articleId,
      decision,
      allowed,
      denied,
      escalated,
      reasons: denied.length
        ? [`Action type ${action.actionType} is prohibited by ${article.title}.`]
        : allowed.length
          ? [`Action type ${action.actionType} is permitted by ${article.title}.`]
          : [`Action type ${action.actionType} requires constitutional review.`],
    };
  }
}
