/**
 * AZMA OS Chamber Manifests
 *
 * Canonical discovery manifests for all four Layer 10 chambers.
 * Used by ChamberDiscovery and ChamberRegistry during OS startup.
 * Each entry declares the chamber's identity, capabilities, and adapter path.
 */

import type { ChamberManifest } from '../chamber-integration/types/chamber-contracts';

const HUJJAH_AL_DAMIGHAH_MANIFEST: ChamberManifest = {
  metadata: {
    chamberId: 'hujjah-al-damighah',
    chamberName: 'Hujjah Al-Damighah',
    version: '1.0.0',
    description: 'Intelligence Chamber — constitutional investigation and evidence extraction',
    owner: 'constitution-runtime',
    tags: ['intelligence', 'investigation', 'evidence', 'knowledge'],
    capabilities: [
      {
        capabilityId: 'investigate',
        name: 'Investigate',
        version: '1.0.0',
        contract: 'handleMessage:investigate',
        metadata: { priority: 'NORMAL', cacheTtlMs: 300000 },
      },
    ],
    metadata: { layer: 10, adapterVersion: '1.0.0' },
  },
  modulePath: 'src/core/chamber-integration/adapters/hujjah-al-damighah-adapter.ts',
};

const QIYAMAH_MANIFEST: ChamberManifest = {
  metadata: {
    chamberId: 'qiyamah-chamber',
    chamberName: 'Qiyamah Chamber',
    version: '1.0.0',
    description: 'Genesis Execution Chamber — project lifecycle and production plan management',
    owner: 'constitution-runtime',
    tags: ['genesis', 'project', 'planning', 'execution'],
    capabilities: [
      {
        capabilityId: 'get-state',
        name: 'Get Project State',
        version: '1.0.0',
        contract: 'handleMessage:get-state',
        metadata: { priority: 'NORMAL', cacheTtlMs: 30000 },
      },
      {
        capabilityId: 'update-project-input',
        name: 'Update Project Input',
        version: '1.0.0',
        contract: 'handleMessage:update-project-input',
        metadata: { priority: 'NORMAL' },
      },
      {
        capabilityId: 'generate-plan',
        name: 'Generate Production Plan',
        version: '1.0.0',
        contract: 'handleMessage:generate-plan',
        metadata: { priority: 'HIGH' },
      },
      {
        capabilityId: 'approve-project',
        name: 'Approve Project',
        version: '1.0.0',
        contract: 'handleMessage:approve-project',
        metadata: { priority: 'HIGH' },
      },
    ],
    metadata: { layer: 10, adapterVersion: '1.0.0' },
  },
  modulePath: 'src/core/chamber-integration/adapters/qiyamah-adapter.ts',
};

const RAS_AL_AMR_MANIFEST: ChamberManifest = {
  metadata: {
    chamberId: 'ras-al-amr',
    chamberName: 'Ras Al-Amr',
    version: '1.0.0',
    description: 'Sovereign Assembly Chamber — non-destructive canvas mutation engine',
    owner: 'constitution-runtime',
    tags: ['assembly', 'canvas', 'editing', 'media'],
    capabilities: [
      {
        capabilityId: 'apply-mutation',
        name: 'Apply Canvas Mutation',
        version: '1.0.0',
        contract: 'handleMessage:apply-mutation',
        metadata: { priority: 'NORMAL', stateless: true },
      },
    ],
    metadata: { layer: 10, adapterVersion: '1.0.0' },
  },
  modulePath: 'src/core/chamber-integration/adapters/ras-al-amr-adapter.ts',
};

const SOVEREIGN_HIGH_COUNCIL_MANIFEST: ChamberManifest = {
  metadata: {
    chamberId: 'sovereign-high-council',
    chamberName: 'Sovereign High Council',
    version: '1.0.0',
    description: 'Governance Runtime — founder session synchronization and strategic briefing',
    owner: 'constitution-runtime',
    tags: ['governance', 'council', 'synchronization', 'briefing'],
    capabilities: [
      {
        capabilityId: 'synchronize-session',
        name: 'Synchronize Founder Session',
        version: '1.0.0',
        contract: 'handleMessage:synchronize-session',
        metadata: { priority: 'HIGH', cacheTtlMs: 60000 },
      },
      {
        capabilityId: 'latest-synchronization',
        name: 'Get Latest Synchronization',
        version: '1.0.0',
        contract: 'handleMessage:latest-synchronization',
        metadata: { priority: 'NORMAL', cacheTtlMs: 60000 },
      },
      {
        capabilityId: 'snapshot',
        name: 'Get Runtime Snapshot',
        version: '1.0.0',
        contract: 'handleMessage:snapshot',
        metadata: { priority: 'NORMAL', cacheTtlMs: 15000 },
      },
    ],
    metadata: { layer: 10, adapterVersion: '1.0.0' },
  },
  modulePath: 'src/core/chamber-integration/adapters/sovereign-high-council-adapter.ts',
};

export const AZMA_OS_CHAMBER_MANIFESTS: readonly ChamberManifest[] = [
  HUJJAH_AL_DAMIGHAH_MANIFEST,
  QIYAMAH_MANIFEST,
  RAS_AL_AMR_MANIFEST,
  SOVEREIGN_HIGH_COUNCIL_MANIFEST,
] as const;
