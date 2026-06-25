/**
 * Bootstrapper for chamber integration layer.
 */

import { ChamberActivationService } from '../activation/chamber-activation-service';
import { ChamberEventBridge } from '../bridges/chamber-event-bridge';
import { ChamberHealthBridge } from '../bridges/chamber-health-bridge';
import { ChamberDeactivationService } from '../deactivation/chamber-deactivation-service';
import { ChamberDiscovery } from '../discovery/chamber-discovery';
import { ChamberLifecycleManager } from '../lifecycle/chamber-lifecycle-manager';
import { ChamberLoader } from '../loading/chamber-loader';
import { ChamberMetadataCatalog } from '../metadata/chamber-metadata-catalog';
import { CapabilityRegistry } from '../registry/capability-registry';
import { ChamberRegistry } from '../registry/chamber-registry';
import { ChamberCommunicationService } from './chamber-communication-service';
import { ChamberIntegrationRuntime } from './chamber-integration-runtime';

export interface ChamberIntegrationServices {
  readonly discovery: ChamberDiscovery;
  readonly metadataCatalog: ChamberMetadataCatalog;
  readonly chamberRegistry: ChamberRegistry;
  readonly capabilityRegistry: CapabilityRegistry;
  readonly loader: ChamberLoader;
  readonly lifecycle: ChamberLifecycleManager;
  readonly activation: ChamberActivationService;
  readonly deactivation: ChamberDeactivationService;
  readonly eventBridge: ChamberEventBridge;
  readonly healthBridge: ChamberHealthBridge;
  readonly communication: ChamberCommunicationService;
  readonly runtime: ChamberIntegrationRuntime;
}

export class ChamberIntegrationBootstrap {
  public static initialize(): ChamberIntegrationServices {
    const discovery = new ChamberDiscovery();
    const metadataCatalog = new ChamberMetadataCatalog();
    const chamberRegistry = new ChamberRegistry();
    const capabilityRegistry = new CapabilityRegistry();
    const loader = new ChamberLoader();
    const lifecycle = new ChamberLifecycleManager(chamberRegistry, loader);
    const activation = new ChamberActivationService(lifecycle);
    const deactivation = new ChamberDeactivationService(lifecycle);
    const eventBridge = new ChamberEventBridge();
    const healthBridge = new ChamberHealthBridge();
    const communication = new ChamberCommunicationService(loader);

    const runtime = new ChamberIntegrationRuntime(
      discovery,
      metadataCatalog,
      chamberRegistry,
      capabilityRegistry,
      loader,
      activation,
      deactivation,
      eventBridge,
      healthBridge,
      communication
    );

    return {
      discovery,
      metadataCatalog,
      chamberRegistry,
      capabilityRegistry,
      loader,
      lifecycle,
      activation,
      deactivation,
      eventBridge,
      healthBridge,
      communication,
      runtime
    };
  }
}
