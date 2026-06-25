/**
 * Chamber discovery from provided manifests.
 */

import { ChamberManifest } from '../types/chamber-contracts';

export class ChamberDiscovery {
  public discover(manifests: readonly ChamberManifest[]): readonly ChamberManifest[] {
    const byId = new Map<string, ChamberManifest>();
    for (const manifest of manifests) {
      byId.set(manifest.metadata.chamberId, manifest);
    }
    return Array.from(byId.values());
  }
}
