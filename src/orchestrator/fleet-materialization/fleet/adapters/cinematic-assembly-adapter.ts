/**
 * AZMA OS — Fleet Materialization Architecture
 * File: src/orchestrator/fleet-materialization/fleet/adapters/cinematic-assembly-adapter.ts
 *
 * The Cinematic Assembly Adapter.
 * Handles CapabilityTarget.MOTION — CINEMATIC timeline render jobs dispatched
 * by FlattenedRenderingBridge when a CINEMATIC canvas is published.
 *
 * MOTION (not VISUAL) is the constitutionally correct target for video output:
 * CapabilityTarget.MOTION = "materialize kinetic and temporal behavior".
 * CapabilityTarget.VISUAL = "materialize static visual representation" (images only).
 *
 * Execution flow:
 *   executeVendorDispatch() — extracts the CompiledAssemblyGraph from the dispatch
 *   payload, calls spawnEncoding() to start the system FFmpeg process, and returns
 *   ACCEPTED immediately. Encoding runs asynchronously.
 *
 *   checkOperationStatus() — called by the polling resolution path:
 *     • If encoding failed:  returns isError:true so the dispatcher marks FAILED.
 *     • If encoding is done: returns isComplete:true with the real MP4 asset URL.
 *     • If still running:    throws "not complete" — caught by
 *       AsynchronousResolutionGateway.checkAndResolveOperation() to return null
 *       (→ { status: 'processing' } to the Creator), preserving the polling loop
 *       without marking the ledger FAILED.
 */

import { BaseProviderAdapter } from './base-provider-adapter';
import type { HydratedAssetContext } from '../secure-context-hydrator';
import type { ProviderCapabilities, ProviderDispatchResponse, ProviderResolutionResponse } from '../fleet-types';
import type { OperationLedgerEntry } from '../../ledger/operation-ledger-types';
import { CapabilityTarget } from '../../../../core/sovereign-orchestrator/qiyamah-intent-types';
import type { CompiledAssemblyGraph } from '../../../../chambers/ras-al-amr/pre-publishing-boundary';
import {
  spawnEncoding,
  isEncodingComplete,
  getEncodingError,
} from './cinematic-ffmpeg-encoder';

export class CinematicAssemblyAdapter extends BaseProviderAdapter {
  public readonly providerId = 'azma-cinematic-assembly-v1';

  public static readonly CAPABILITIES: ProviderCapabilities = {
    supportedTargets: [CapabilityTarget.MOTION],
    maxConcurrentOperations: 100,
    unitCostMultiplier: 5.0,
    averageLatencyMs: 0,
    isAvailable: true,
  };

  public async getCapabilities(): Promise<ProviderCapabilities> {
    return CinematicAssemblyAdapter.CAPABILITIES;
  }

  protected async executeVendorDispatch(
    ledgerEntry: OperationLedgerEntry,
    _hydratedContext: HydratedAssetContext[],
  ): Promise<ProviderDispatchResponse> {
    if (ledgerEntry.capabilityTarget !== CapabilityTarget.MOTION) {
      throw new Error(
        `Execution Error: Adapter [${this.providerId}] cannot process target [${ledgerEntry.capabilityTarget}]`,
      );
    }

    // The rendering bridge embeds the CompiledAssemblyGraph as `structuralGraphPayload`
    // in the dispatch intent (cast as `any` at the bridge boundary — see rendering-bridge.ts).
    // It is stored verbatim in operation_ledger.source_intent_json and deserialized here.
    const graph = (ledgerEntry.sourceIntent as unknown as { structuralGraphPayload?: CompiledAssemblyGraph })
      .structuralGraphPayload;

    if (!graph) {
      throw new Error(
        `Execution Error: CINEMATIC dispatch for operation [${ledgerEntry.operationId}] is missing ` +
          `structuralGraphPayload. The rendering bridge must attach the CompiledAssemblyGraph.`,
      );
    }

    // Start encoding asynchronously. spawnEncoding() returns immediately.
    // If the graph is invalid (no image nodes, missing assets), the error is stored
    // in the encoder's job-state map and surfaced via checkOperationStatus().
    spawnEncoding(ledgerEntry.operationId, graph);

    return {
      externalJobId: ledgerEntry.operationId,
      status: 'ACCEPTED',
    };
  }

  public async checkOperationStatus(externalJobId: string): Promise<ProviderResolutionResponse> {
    // 1. Encoding failed — surface the real error so the dispatcher marks FAILED.
    const encodingError = getEncodingError(externalJobId);
    if (encodingError) {
      return {
        externalJobId,
        isComplete: true,
        isError: true,
        errorMessage: `CINEMATIC encoding failed: ${encodingError.message}`,
      };
    }

    // 2. Encoding complete — return the real MP4 asset URL.
    if (isEncodingComplete(externalJobId)) {
      return {
        externalJobId,
        isComplete: true,
        isError: false,
        assetUrl: `/renders/${externalJobId}.mp4`,
        rawMetadata: {
          encoderProviderId: this.providerId,
          outputFormat: 'H.264/AAC MP4',
          outputWidth: 1920,
          outputHeight: 1080,
        },
      };
    }

    // 3. Still encoding — throw so AsynchronousResolutionGateway catches "not complete"
    //    and returns null (→ { status: 'processing' }) without marking FAILED.
    throw new Error(`CINEMATIC encoding not complete for operation [${externalJobId}]`);
  }
}
