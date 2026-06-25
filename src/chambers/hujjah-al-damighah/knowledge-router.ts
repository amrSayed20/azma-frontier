/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Router
 *
 * Status: V1.0
 * Sovereign Routing Layer
 */

export type KnowledgeRoute =
  | 'qiyamah'
  | 'vault'
  | 'makman'
  | 'memory';

export interface KnowledgeRoutePayload {
  id: string;

  title: string;

  route: KnowledgeRoute;

  createdAt: string;
}

export interface KnowledgeRouteResult {
  success: boolean;

  destination: KnowledgeRoute;

  timestamp: string;
}

export function createKnowledgeRoute(
  id: string,
  title: string,
  route: KnowledgeRoute
): KnowledgeRoutePayload {
  return {
    id,
    title,
    route,
    createdAt: new Date().toISOString(),
  };
}

export function routeKnowledge(
  payload: KnowledgeRoutePayload
): KnowledgeRouteResult {
  return {
    success: true,
    destination: payload.route,
    timestamp: new Date().toISOString(),
  };
}

export function isRouteAllowed(
  route: KnowledgeRoute
): boolean {
  return [
    'qiyamah',
    'vault',
    'makman',
    'memory',
  ].includes(route);
}