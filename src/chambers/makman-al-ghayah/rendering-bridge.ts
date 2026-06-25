/**
 * AZMA OS - Phase 6: Makman Al-Ghayah Distribution Architecture
 * File: src/chambers/makman-al-ghayah/rendering-bridge.ts
 * 
 * The Flattened Rendering Bridge.
 * Evaluates whether a publication's assembly graph can be served dynamically 
 * or requires a hard render (flattening). Delegates rendering operations 
 * to Al-Watin Al-Siyadi and tracks the output.
 */

import { SovereignPublication } from './publication-contracts';
import { CompiledAssemblyGraph } from '../ras-al-amr/pre-publishing-boundary';
import { CanvasType } from '../ras-al-amr/assembly-contracts';
import { FleetDispatcher } from '../../orchestrator/al-watin/fleet/fleet-dispatcher';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';

// ==========================================
// 1. RENDERING STATE CONTRACTS
// ==========================================

export enum RenderStatus {
  DYNAMIC = 'DYNAMIC',               // No render needed (e.g., pure text narrative)
  PENDING = 'PENDING',               // Awaiting dispatch
  PROCESSING = 'PROCESSING',         // Currently rendering via Al-Watin
  COMPLETED = 'COMPLETED',           // Flattened into a single playable asset
  FAILED = 'FAILED'                  // Fleet rendering error
}

/**
 * Tracks the physical materialization state of a commercial publication.
 */
export interface PublicationRenderState {
  readonly publicationId: string;
  readonly status: RenderStatus;
  readonly flattenedVaultAssetId?: string; // The final MP4/WAV deposited in the Vault
  readonly activeOperationId?: string;     // The Operation Ledger ID tracking the render job
  readonly lastUpdatedAt: number;
}

// ==========================================
// 2. THE RENDERING BRIDGE
// ==========================================

export class FlattenedRenderingBridge {
  
  // In production, this maps to a secure database tracking render states
  private readonly renderStates = new Map<string, PublicationRenderState>();

  constructor(private readonly fleetDispatcher: FleetDispatcher) {}

  /**
   * Retrieves the current rendering state of a publication.
   * Crucial for determining if the consumption boundary can serve the file yet.
   */
  public getRenderState(publicationId: string): PublicationRenderState | undefined {
    return this.renderStates.get(publicationId);
  }

  /**
   * Evaluates the assembly graph. If it requires flattening (e.g., Cinematic), 
   * dispatches a rendering intent to Al-Watin Al-Siyadi.
   * 
   * @param publication The commercial publication wrapper.
   * @param masterGraph The pure structural assembly graph from Ras Al-Amr.
   */
  public async evaluateAndDispatchRender(
    publication: SovereignPublication, 
    masterGraph: CompiledAssemblyGraph
  ): Promise<PublicationRenderState> {
    
    // 1. Ensure the graph matches the publication
    if (publication.sourceCompilationId !== masterGraph.compilationId) {
      throw new Error(`Integrity Error: Graph [${masterGraph.compilationId}] does not match Publication [${publication.publicationId}].`);
    }

    // 2. Dynamic vs Flattened Decision Logic
    if (masterGraph.canvasType === CanvasType.NARRATIVE || masterGraph.canvasType === CanvasType.DIRECTORIAL) {
      // Logic graphs are served dynamically as structural JSON. No render required.
      const state = this.updateRenderState(publication.publicationId, RenderStatus.DYNAMIC);
      return state;
    }

    // 3. Dispatch Cinematic Flattening to Al-Watin
    if (masterGraph.canvasType === CanvasType.CINEMATIC) {
      
      const existingState = this.renderStates.get(publication.publicationId);
      if (existingState && (existingState.status === RenderStatus.PROCESSING || existingState.status === RenderStatus.COMPLETED)) {
        return existingState;
      }

      this.updateRenderState(publication.publicationId, RenderStatus.PENDING);

      // Create a system-level rendering intent
      // Notice: The subscriberTenantId belongs to the publisher, ensuring the 
      // compute cost of rendering is correctly attributed to the creator's ledger.
      const operationId = `op_render_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      
      const dispatchIntent = {
        operationId: operationId,
        subscriberTenantId: publication.publisherTenantId,
        capabilityTarget: CapabilityTarget.VISUAL, // Represents a master timeline render
        projectContainerId: publication.publicationId,
        contextReferences: [], 
        
        // Advanced Routing Context: Passing the raw structural graph to Al-Watin
        // so the FFMPEG/Sora adapter knows exactly what timeline to burn.
        structuralGraphPayload: masterGraph 
      } as any; // Cast as 'any' safely here to bridge the polymorphic intent boundary

      try {
        // Dispatch to the orchestrator
        const operationEntry = await this.fleetDispatcher.executeMaterialization(dispatchIntent);
        
        return this.updateRenderState(publication.publicationId, RenderStatus.PROCESSING, operationEntry.operationId);
      } catch (error) {
        console.error(`Rendering Dispatch Failed for Publication [${publication.publicationId}]`, error);
        return this.updateRenderState(publication.publicationId, RenderStatus.FAILED);
      }
    }

    throw new Error(`Unrecognized CanvasType for rendering: ${masterGraph.canvasType}`);
  }

  // ==========================================
  // INTERNAL STATE MANAGEMENT
  // ==========================================

  private updateRenderState(
    publicationId: string, 
    status: RenderStatus, 
    operationId?: string, 
    flattenedAssetId?: string
  ): PublicationRenderState {
    
    const newState: PublicationRenderState = {
      publicationId,
      status,
      activeOperationId: operationId,
      flattenedVaultAssetId: flattenedAssetId,
      lastUpdatedAt: Date.now()
    };

    this.renderStates.set(publicationId, newState);
    return newState;
  }
}