/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Dispatch Engine
 *
 * Status: V1.0
 * Sovereign Distribution Layer
 */

export type DispatchTarget =
  | 'qiyamah'
  | 'vault'
  | 'makman';

export interface DispatchPayload {
  id: string;

  title: string;

  target: DispatchTarget;

  createdAt: string;
}

export interface DispatchResult {
  success: boolean;

  destination: DispatchTarget;

  timestamp: string;
}

export function createDispatchPayload(
  id: string,
  title: string,
  target: DispatchTarget
): DispatchPayload {
  return {
    id,
    title,
    target,
    createdAt: new Date().toISOString(),
  };
}

export function dispatchPayload(
  payload: DispatchPayload
): DispatchResult {
  return {
    success: true,

    destination: payload.target,

    timestamp: new Date().toISOString(),
  };
}

export function canDispatch(
  allowDispatch: boolean
): boolean {
  return allowDispatch;
}