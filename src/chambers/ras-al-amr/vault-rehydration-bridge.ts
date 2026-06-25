/**
 * AZMA OS - Phase 5: Ras Al-Amr Assembly Architecture
 * File: src/chambers/ras-al-amr/vault-rehydration-bridge.ts
 * * The Vault Rehydration Bridge.
 * Securely converts pure-reference AssemblyNodes into hydrated runtime structures.
 * Provides Ras Al-Amr with the asset metadata required to render timelines and 
 * logic graphs without duplicating media or mutating the Sovereign Vault.
 */

import { SovereignCanvas, AssemblyNode, AssemblyTrack } from './assembly-contracts';
import { SovereignVaultManager } from '../../vault/sovereign-vault-manager';
import { VaultAsset } from '../../vault/sovereign-vault-types';

// ==========================================
// 1. RUNTIME HYDRATION CONTRACTS
// ==========================================

/**
 * The runtime execution wrapper for an AssemblyNode.
 * Pairs the non-destructive directives with the immutable Vault Asset metadata.
 */
export interface HydratedAssemblyNode extends AssemblyNode {
  readonly runtimeAsset: VaultAsset;
}

/**
 * The runtime execution wrapper for an AssemblyTrack.
 */
export interface HydratedAssemblyTrack extends Omit<AssemblyTrack, 'nodes'> {
  readonly nodes: HydratedAssemblyNode[];
}

/**
 * The definitive runtime representation of the Sovereign Canvas.
 * Passed directly to the Ras Al-Amr UI or the Makman Al-Ghayah compiler.
 */
export interface HydratedSovereignCanvas extends Omit<SovereignCanvas, 'tracks'> {
  readonly tracks: HydratedAssemblyTrack[];
}

// ==========================================
// 2. THE REHYDRATION BRIDGE
// ==========================================

export class VaultRehydrationBridge {
  constructor(private readonly vaultManager: SovereignVaultManager) {}

  /**
   * Hydrates a pure-reference Sovereign Canvas into a runtime-ready structure.
   * Physically enforces Tenant Boundary Validation for every referenced asset.
   * * @param canvas The pure-reference Sovereign Canvas state.
   * @returns The fully hydrated, UI/Compiler-ready representation.
   */
  public async hydrateCanvas(canvas: SovereignCanvas): Promise<HydratedSovereignCanvas> {
    const hydratedTracks: HydratedAssemblyTrack[] = [];
    
    // Scoped cache to prevent redundant Vault queries for reused assets 
    // (e.g., repeating an audio track or looping a motion background).
    const assetCache = new Map<string, VaultAsset>();

    for (const track of canvas.tracks) {
      const hydratedNodes: HydratedAssemblyNode[] = [];

      for (const node of track.nodes) {
        let asset = assetCache.get(node.assetId);

        if (!asset) {
          // Absolute Multi-Tenant Security Execution:
          // The SovereignVaultManager guarantees that if the referenced asset 
          // does not belong to the canvas's subscriberTenantId, an exception is thrown.
          asset = await this.vaultManager.getAsset(node.assetId, canvas.subscriberTenantId);
          assetCache.set(node.assetId, asset);
        }

        // Generate the immutable runtime node
        // The original Vault Asset and the original AssemblyNode remain untouched
        hydratedNodes.push({
          ...node,
          runtimeAsset: asset
        });
      }

      hydratedTracks.push({
        ...track,
        nodes: hydratedNodes
      });
    }

    // Return the safe, fully hydrated runtime canvas
    return {
      ...canvas,
      tracks: hydratedTracks
    };
  }
}