/**
 * AZMA OS - Phase 5: Ras Al-Amr Assembly Architecture
 * File: src/chambers/ras-al-amr/pre-publishing-boundary.ts
 * 
 * The Pre-Publishing Compilation Boundary.
 * The final execution gateway of Ras Al-Amr. Validates, seals, and compiles 
 * a Sovereign Canvas into a definitive graph ready for Makman Al-Ghayah 
 * (Distribution & Monetization).
 */

import { SovereignCanvas, CanvasType } from './assembly-contracts';
import { VaultRehydrationBridge, HydratedSovereignCanvas } from './vault-rehydration-bridge';

// ==========================================
// 1. COMPILATION CONTRACTS
// ==========================================

export interface CompilationMetadata {
  totalTracks: number;
  totalNodes: number;
  estimatedDurationSeconds?: number; // Crucial for CINEMATIC timelines
  aggregatedAssetFamilies: string[]; // Defines the multi-modal footprint of the project
}

/**
 * The immutable, final output of the Ras Al-Amr chamber.
 * This is the exact payload handed to the rendering and distribution engines.
 */
export interface CompiledAssemblyGraph {
  compilationId: string;
  sourceCanvasId: string;
  subscriberTenantId: string;
  canvasType: CanvasType;
  hydratedCanvas: HydratedSovereignCanvas;
  metadata: CompilationMetadata;
  compiledAt: number;
}

// ==========================================
// 2. THE COMPILATION BOUNDARY
// ==========================================

export class PrePublishingBoundary {
  constructor(private readonly rehydrationBridge: VaultRehydrationBridge) {}

  /**
   * Executes the final compilation sequence for a Sovereign Canvas.
   * Enforces absolute tenant security before sealing the master graph.
   * 
   * @param canvas The raw, pure-reference canvas state to be compiled.
   * @param authenticatedTenantId The secure session ID of the user triggering the publish.
   */
  public async compileForPublishing(
    canvas: SovereignCanvas,
    authenticatedTenantId: string
  ): Promise<CompiledAssemblyGraph> {
    
    // 1. Final Security Audit
    if (canvas.subscriberTenantId !== authenticatedTenantId) {
      throw new Error(`Compilation Security Breach: Tenant [${authenticatedTenantId}] is not authorized to compile Canvas [${canvas.canvasId}].`);
    }

    // 2. Deep Rehydration
    // Converts the pure-reference canvas into a fully metadata-rich runtime graph
    const hydratedCanvas = await this.rehydrationBridge.hydrateCanvas(canvas);

    // 3. Structural Validation
    if (hydratedCanvas.tracks.length === 0) {
      throw new Error(`Compilation Error: Canvas [${canvas.canvasId}] is structurally empty. Cannot publish zero tracks.`);
    }

    // 4. Compute Master Metadata
    const metadata = this.computeMasterMetadata(hydratedCanvas);

    // 5. Seal and Return the Compiled Graph
    return {
      compilationId: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      sourceCanvasId: hydratedCanvas.canvasId,
      subscriberTenantId: hydratedCanvas.subscriberTenantId,
      canvasType: hydratedCanvas.canvasType,
      hydratedCanvas,
      metadata,
      compiledAt: Date.now()
    };
  }

  // ==========================================
  // INTERNAL COMPUTATION
  // ==========================================

  private computeMasterMetadata(hydratedCanvas: HydratedSovereignCanvas): CompilationMetadata {
    let totalNodes = 0;
    let maxCinematicDuration = 0;
    const assetFamilies = new Set<string>();

    for (const track of hydratedCanvas.tracks) {
      // Ignore muted/hidden tracks in the final calculation
      if (track.isMuted || track.isHidden) continue;

      totalNodes += track.nodes.length;
      
      for (const node of track.nodes) {
        // Track the footprint of asset families used
        assetFamilies.add(node.runtimeAsset.assetFamily);
        
        // Calculate the furthest temporal point for timeline bounding
        if (hydratedCanvas.canvasType === CanvasType.CINEMATIC && node.temporal) {
          const nodeEndTime = node.temporal.globalStartTimeSeconds + node.temporal.playDurationSeconds;
          if (nodeEndTime > maxCinematicDuration) {
            maxCinematicDuration = nodeEndTime;
          }
        }
      }
    }

    return {
      totalTracks: hydratedCanvas.tracks.filter(t => !t.isMuted && !t.isHidden).length,
      totalNodes,
      estimatedDurationSeconds: hydratedCanvas.canvasType === CanvasType.CINEMATIC ? maxCinematicDuration : undefined,
      aggregatedAssetFamilies: Array.from(assetFamilies)
    };
  }
}