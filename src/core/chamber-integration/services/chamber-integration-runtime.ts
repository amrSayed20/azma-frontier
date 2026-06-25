/**
 * Chamber integration runtime facade for discovery, lifecycle, health, events, and communication.
 */

import { ChamberActivationService } from '../activation/chamber-activation-service';
import { ChamberDeactivationService } from '../deactivation/chamber-deactivation-service';
import { ChamberDiscovery } from '../discovery/chamber-discovery';
import { ChamberEventBridge } from '../bridges/chamber-event-bridge';
import { ChamberHealthBridge } from '../bridges/chamber-health-bridge';
import { ChamberLoader } from '../loading/chamber-loader';
import { ChamberMetadataCatalog } from '../metadata/chamber-metadata-catalog';
import { CapabilityRegistry } from '../registry/capability-registry';
import { ChamberRegistry } from '../registry/chamber-registry';
import { ChamberCommunicationService } from './chamber-communication-service';
import {
  ChamberEvent,
  ChamberHealth,
  ChamberManifest,
  ChamberStatus
} from '../types/chamber-contracts';

export class ChamberIntegrationRuntime {
  constructor(
    private readonly discovery: ChamberDiscovery,
    private readonly metadataCatalog: ChamberMetadataCatalog,
    private readonly chamberRegistry: ChamberRegistry,
    private readonly capabilityRegistry: CapabilityRegistry,
    private readonly loader: ChamberLoader,
    private readonly activation: ChamberActivationService,
    private readonly deactivation: ChamberDeactivationService,
    private readonly eventBridge: ChamberEventBridge,
    private readonly healthBridge: ChamberHealthBridge,
    private readonly communication: ChamberCommunicationService
  ) {}

  public registerManifests(manifests: readonly ChamberManifest[]): void {
    const discovered = this.discovery.discover(manifests);
    for (const manifest of discovered) {
      this.metadataCatalog.upsert(manifest.metadata);
      this.chamberRegistry.register(manifest.metadata, ChamberStatus.DISCOVERED);
      for (const capability of manifest.metadata.capabilities) {
        this.capabilityRegistry.register(manifest.metadata.chamberId, capability);
      }
    }
  }

  public async loadChamber(chamberId: string): Promise<void> {
    await this.loader.load(chamberId);
    this.chamberRegistry.updateStatus(chamberId, ChamberStatus.LOADED);
  }

  public async activateChamber(chamberId: string): Promise<void> {
    await this.activation.activate(chamberId);
  }

  public async deactivateChamber(chamberId: string): Promise<void> {
    await this.deactivation.deactivate(chamberId);
  }

  public emitEvent(event: ChamberEvent<Readonly<Record<string, unknown>>>): void {
    this.eventBridge.publishEvent(event);
  }

  public emitHealth(health: ChamberHealth): void {
    this.healthBridge.publishHealth(health);
  }

  public async communicate(
    sourceChamberId: string,
    targetChamberId: string,
    operation: string,
    payload: Readonly<Record<string, unknown>>
  ): Promise<Readonly<Record<string, unknown>>> {
    return this.communication.send(sourceChamberId, targetChamberId, operation, payload);
  }
}
