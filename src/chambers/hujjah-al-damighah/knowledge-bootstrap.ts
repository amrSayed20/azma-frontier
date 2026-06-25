/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Bootstrap
 *
 * Status: V1.0
 * Sovereign Bootstrap Layer
 */

import { isRuntimeHealthy } from './knowledge-runtime';

export interface BootstrapState {
  initialized: boolean;

  runtimeHealthy: boolean;

  bootedAt: string;
}

export function bootstrapKnowledge(): BootstrapState {
  return {
    initialized: true,

    runtimeHealthy: isRuntimeHealthy(),

    bootedAt: new Date().toISOString(),
  };
}

export function isKnowledgeBootstrapped(
  state: BootstrapState
): boolean {
  return (
    state.initialized &&
    state.runtimeHealthy
  );
}