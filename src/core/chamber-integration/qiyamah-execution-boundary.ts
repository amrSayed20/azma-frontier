/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/chambers/qiyamah/qiyamah-execution-boundary.ts
 * 
 * The Qiyamah Execution Boundary.
 * The strict API gateway connecting the UI production domains (Script, Cinematic, 
 * Visual, Motion, Audio) to Al-Watin Al-Siyadi's Fleet Dispatcher.
 */

import { 
  AZMAPolymorphicIntent, 
  CapabilityTarget, 
  VaultContextReference,
  WritingIntent,
  DirectorialIntent,
  VisualIntent,
  MotionIntent,
  AudioIntent
} from '../sovereign-orchestrator/qiyamah-intent-types';

import { FleetDispatcher } from '../../orchestrator/al-watin/fleet/fleet-dispatcher';
import { OperationLedgerEntry } from '../../orchestrator/al-watin/ledger/operation-ledger-types';

/**
 * The untrusted payload received from the frontend Qiyamah UI.
 * Notice the absence of operationId and subscriberTenantId, as the client 
 * is not authorized to dictate its own security context or ledger identity.
 */
export interface RawClientIntentPayload {
  capabilityTarget: CapabilityTarget;
  contextReferences: VaultContextReference[];
  projectContainerId?: string;
  domainParameters: Record<string, any>; // The specialized parameters for the specific domain
}

export class QiyamahExecutionBoundary {
  constructor(private readonly fleetDispatcher: FleetDispatcher) {}

  /**
   * The physical entry point for all Qiyamah materialization operations.
   * 
   * @param rawPayload The raw intent from the UI.
   * @param authenticatedTenantId The securely extracted ID from the user's auth token.
   */
  public async submitMaterializationIntent(
    rawPayload: RawClientIntentPayload, 
    authenticatedTenantId: string
  ): Promise<OperationLedgerEntry> {
    
    // 1. Instantiate the Operation Lineage
    const generatedOperationId = `op_qiyamah_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    // 2. Construct the securely typed Polymorphic Intent
    const secureIntent = this.constructSecureIntent(
      generatedOperationId,
      authenticatedTenantId,
      rawPayload
    );

    // 3. Dispatch to Al-Watin Al-Siyadi for accounting and physical execution
    return await this.fleetDispatcher.executeMaterialization(secureIntent);
  }

  /**
   * Safely maps the untrusted domain parameters into the strict AZMAPolymorphicIntent contracts.
   */
  private constructSecureIntent(
    operationId: string, 
    tenantId: string, 
    payload: RawClientIntentPayload
  ): AZMAPolymorphicIntent {
    
    const baseContext = {
      operationId: operationId,
      subscriberTenantId: tenantId, // Strict Security Overwrite
      contextReferences: payload.contextReferences || [],
      projectContainerId: payload.projectContainerId
    };

    switch (payload.capabilityTarget) {
      case CapabilityTarget.WRITING:
        return {
          ...baseContext,
          capabilityTarget: CapabilityTarget.WRITING,
          structuralFormat: payload.domainParameters.structuralFormat || 'NARRATIVE',
          thematicParameters: payload.domainParameters.thematicParameters || {},
          toneMarkers: payload.domainParameters.toneMarkers || []
        } as WritingIntent;

      case CapabilityTarget.DIRECTORIAL:
        return {
          ...baseContext,
          capabilityTarget: CapabilityTarget.DIRECTORIAL,
          cameraLogic: payload.domainParameters.cameraLogic || '',
          spatialMovement: payload.domainParameters.spatialMovement || '',
          lensRules: payload.domainParameters.lensRules || '',
          lightingParameters: payload.domainParameters.lightingParameters || '',
          scenePacing: payload.domainParameters.scenePacing || 'STANDARD'
        } as DirectorialIntent;

      case CapabilityTarget.VISUAL:
        return {
          ...baseContext,
          capabilityTarget: CapabilityTarget.VISUAL,
          aspectRatio: payload.domainParameters.aspectRatio || '16:9',
          compositionWeights: payload.domainParameters.compositionWeights || {},
          aestheticRules: payload.domainParameters.aestheticRules || []
        } as VisualIntent;

      case CapabilityTarget.MOTION:
        return {
          ...baseContext,
          capabilityTarget: CapabilityTarget.MOTION,
          durationVectorsSeconds: payload.domainParameters.durationVectorsSeconds || 5,
          physicsScales: payload.domainParameters.physicsScales || 'REALISTIC',
          kineticMarkers: payload.domainParameters.kineticMarkers || []
        } as MotionIntent;

      case CapabilityTarget.AUDIO:
        return {
          ...baseContext,
          capabilityTarget: CapabilityTarget.AUDIO,
          soundscapeLayers: payload.domainParameters.soundscapeLayers || [],
          frequencyRules: payload.domainParameters.frequencyRules || 'BALANCED',
          vocalPresence: payload.domainParameters.vocalPresence,
          tempoBPM: payload.domainParameters.tempoBPM
        } as AudioIntent;

      default:
        throw new Error(`Execution Boundary Error: Unrecognized capability target [${payload.capabilityTarget}]`);
    }
  }
}