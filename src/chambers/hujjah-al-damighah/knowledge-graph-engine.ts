/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Graph Engine
 *
 * Status: V1.0
 * Knowledge Network Layer
 */

export interface KnowledgeNode {
  id: string;

  title: string;

  category: string;
}

export interface KnowledgeEdge {
  sourceId: string;

  targetId: string;

  relation: string;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];

  edges: KnowledgeEdge[];
}

export function createKnowledgeGraph(): KnowledgeGraph {
  return {
    nodes: [],
    edges: [],
  };
}

export function addKnowledgeNode(
  graph: KnowledgeGraph,
  node: KnowledgeNode
): KnowledgeGraph {
  return {
    ...graph,
    nodes: [...graph.nodes, node],
  };
}

export function addKnowledgeEdge(
  graph: KnowledgeGraph,
  edge: KnowledgeEdge
): KnowledgeGraph {
  return {
    ...graph,
    edges: [...graph.edges, edge],
  };
}

export function findNode(
  graph: KnowledgeGraph,
  id: string
): KnowledgeNode | undefined {
  return graph.nodes.find(
    (node) => node.id === id
  );
}