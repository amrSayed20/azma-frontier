/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Chronology Engine
 *
 * Status: V1.0
 * Sovereign Timeline Layer
 */

export interface ChronologyNode {
  id: string;

  title: string;

  source: string;

  timestamp: string;

  notes?: string;
}

export interface ChronologyChain {
  chainId: string;

  createdAt: string;

  nodes: ChronologyNode[];
}

export function createChronologyChain(
  chainId: string
): ChronologyChain {
  return {
    chainId,
    createdAt: new Date().toISOString(),
    nodes: [],
  };
}

export function addChronologyNode(
  chain: ChronologyChain,
  node: ChronologyNode
): ChronologyChain {
  return {
    ...chain,
    nodes: [...chain.nodes, node],
  };
}

export function getLatestNode(
  chain: ChronologyChain
): ChronologyNode | null {
  if (chain.nodes.length === 0) {
    return null;
  }

  return chain.nodes[chain.nodes.length - 1];
}

export function getChronologyLength(
  chain: ChronologyChain
): number {
  return chain.nodes.length;
}