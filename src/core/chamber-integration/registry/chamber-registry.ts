/**
 * Registry for chamber endpoints and statuses.
 */

import { ChamberEndpoint, ChamberMetadata, ChamberStatus } from '../types/chamber-contracts';

export class ChamberRegistry {
  private readonly endpoints = new Map<string, ChamberEndpoint>();

  public register(metadata: ChamberMetadata, status: ChamberStatus = ChamberStatus.DISCOVERED): void {
    this.endpoints.set(metadata.chamberId, {
      chamberId: metadata.chamberId,
      metadata,
      status
    });
  }

  public unregister(chamberId: string): void {
    this.endpoints.delete(chamberId);
  }

  public updateStatus(chamberId: string, status: ChamberStatus): void {
    const endpoint = this.endpoints.get(chamberId);
    if (!endpoint) {
      return;
    }

    this.endpoints.set(chamberId, {
      ...endpoint,
      status
    });
  }

  public get(chamberId: string): ChamberEndpoint | undefined {
    return this.endpoints.get(chamberId);
  }

  public list(): readonly ChamberEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  public has(chamberId: string): boolean {
    return this.endpoints.has(chamberId);
  }
}
