/**
 * ID generation helper for chamber integration artifacts.
 */

export function buildId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
