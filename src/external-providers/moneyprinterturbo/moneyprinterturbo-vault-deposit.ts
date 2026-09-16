/**
 * AZMA OS — MoneyPrinterTurbo output → Sovereign Vault
 *
 * A produced MP4 is *generated*, not uploaded, so it is deposited through the
 * same boundary Qiyamah's generated assets already use —
 * SovereignVaultManager.depositAsset() — and never through
 * POST /api/vault/assets/upload, which hardcodes providerId 'creator-upload'
 * and would file a machine-generated video under a Creator's own hand.
 *
 * The provider's working directory is its own: nothing there is sovereign.
 * Only the final artefact is copied into AZMA's storage and given an identity.
 * Credentials never enter metadata.
 */

import { SovereignVaultManager } from '../../vault/sovereign-vault-manager';
import { AssetFamily, SourceChamber } from '../../vault/sovereign-vault-types';
import type { VaultAsset } from '../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import { persistUploadedAsset } from '../../vault/vault-asset-upload-storage';
import {
  MONEYPRINTERTURBO_PROVIDER_ID,
  type VideoProductionRequest,
  type VideoProductionResult,
} from './moneyprinterturbo-adapter';

const vaultManager = new SovereignVaultManager();

export interface SourceMediaAttribution {
  readonly provider: string;
  readonly url?: string;
  readonly durationSeconds?: number;
}

export interface DepositProductionInput {
  readonly creatorId: string;
  readonly production: VideoProductionResult;
  readonly request: VideoProductionRequest;
  /** The narration script the provider generated, when the caller captured it. */
  readonly generatedScript?: string;
  readonly searchTerms?: readonly string[];
  /** Public attribution for stock clips, when the provider surfaced it. */
  readonly sourceMedia?: readonly SourceMediaAttribution[];
}

/**
 * Strips anything that could carry a credential or a signed URL out of source
 * attribution before it is persisted. The provider itself whitelists these
 * fields, but an asset record outlives the provider that produced it.
 */
function safeAttribution(sources: readonly SourceMediaAttribution[]): ReadonlyArray<Record<string, unknown>> {
  return sources.map((s) => ({
    provider: s.provider,
    ...(s.url && !s.url.includes('?') ? { url: s.url } : {}),
    ...(typeof s.durationSeconds === 'number' ? { durationSeconds: s.durationSeconds } : {}),
  }));
}

/**
 * Writes the produced MP4 into AZMA's own storage and records it as an
 * independent VaultAsset owned by the Creator.
 */
export async function depositProductionIntoVault(input: DepositProductionInput): Promise<VaultAsset> {
  const { creatorId, production, request } = input;

  const persisted = await persistUploadedAsset(production.bytes, '.mp4');

  return vaultManager.depositAsset({
    // A generated video. The provider is an external hand; the chamber whose
    // responsibility it fulfils is Qiyamah. Article 10.
    creationChamber: SourceChamber.QIYAMAH,
    operationId: persisted.assetId,
    subscriberTenantId: creatorId,
    capabilityTarget: CapabilityTarget.MOTION,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: persisted.assetUrl,
    metadata: {
      providerId: MONEYPRINTERTURBO_PROVIDER_ID,
      providerTaskId: production.taskId,
      fileSizeBytes: production.bytes.length,
      generationSubject: request.subject,
      generationLanguage: request.language ?? 'Arabic',
      generationAspect: request.aspect ?? '9:16',
      subtitlesBurnedIn: request.subtitlesEnabled ?? true,
      productionElapsedMs: production.usage.elapsedMs,
      ...(input.generatedScript ? { generationScript: input.generatedScript } : {}),
      ...(input.searchTerms?.length ? { generationSearchTerms: [...input.searchTerms] } : {}),
      ...(input.sourceMedia?.length ? { sourceMedia: safeAttribution(input.sourceMedia) } : {}),
    },
  });
}
