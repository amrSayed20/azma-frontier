/**
 * Metadata catalog for chamber descriptors.
 */

import { ChamberMetadata } from '../types/chamber-contracts';

export class ChamberMetadataCatalog {
  private readonly catalog = new Map<string, ChamberMetadata>();

  public upsert(metadata: ChamberMetadata): void {
    this.catalog.set(metadata.chamberId, metadata);
  }

  public remove(chamberId: string): void {
    this.catalog.delete(chamberId);
  }

  public get(chamberId: string): ChamberMetadata | undefined {
    return this.catalog.get(chamberId);
  }

  public list(): readonly ChamberMetadata[] {
    return Array.from(this.catalog.values());
  }
}
