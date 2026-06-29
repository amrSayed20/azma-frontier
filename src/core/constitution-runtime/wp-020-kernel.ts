/**
 * WP-020: Agent Society Layer Kernel
 * Orchestrates all four canonical agent society services
 *
 * Factory function creates the immutable public contract for Layer 8+ consumers.
 * All agent types register through one canonical interface.
 * All agents execute through one canonical pipeline.
 */

import type { AgentSocietyLayerContract } from './wp-013-020-agent-society-types';
import { AgentRegistryService } from './wp-013-020-agent-society-services';
import { AgentSelectionRouter } from './wp-013-020-agent-society-services';
import { AgentExecutionGateway } from './wp-013-020-agent-society-services';
import { AgentLifecycleService } from './wp-013-020-agent-society-services';

/**
 * Create and initialize the Agent Society Layer (Layer 7)
 * Returns the immutable public contract
 */
export function createAgentSocietyLayer(): AgentSocietyLayerContract {
  const registry = new AgentRegistryService();
  const router = new AgentSelectionRouter(registry);
  const gateway = new AgentExecutionGateway(registry);
  const lifecycle = new AgentLifecycleService();

  return {
    layerName: 'AgentSocietyLayer',
    version: '1.0.0',
    layerNumber: 7,
    agentRegistryService: registry,
    agentSelectionRouter: router,
    agentExecutionGateway: gateway,
    agentLifecycleService: lifecycle,
  } as const;
}

// Re-export all types and services
export * from './wp-013-020-agent-society-types';
export { AgentRegistryService, AgentSelectionRouter, AgentExecutionGateway, AgentLifecycleService } from './wp-013-020-agent-society-services';
