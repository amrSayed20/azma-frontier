/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Freeze
 *
 * Status: FINAL
 * Sovereign Freeze Layer
 */

export interface KnowledgeFreezeState {
  frozen: boolean;

  frozenAt: string;

  reason: string;
}

export function freezeKnowledge(
  reason = 'Sovereign Chamber Approved'
): KnowledgeFreezeState {
  return {
    frozen: true,

    frozenAt: new Date().toISOString(),

    reason,
  };
}

export function isKnowledgeFrozen(
  state: KnowledgeFreezeState
): boolean {
  return state.frozen;
}

export function unfreezeKnowledge(): KnowledgeFreezeState {
  return {
    frozen: false,

    frozenAt: '',

    reason: '',
  };
}