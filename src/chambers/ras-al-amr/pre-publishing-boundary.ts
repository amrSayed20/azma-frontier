/**
 * AZMA OS - Phase 5: Ras Al-Amr Assembly Architecture
 * File: src/chambers/ras-al-amr/pre-publishing-boundary.ts
 *
 * The Pre-Publishing Compilation Boundary.
 * The final execution gateway of Ras Al-Amr. Validates, seals, and compiles
 * a Sovereign Canvas into a definitive graph ready for Makman Al-Ghayah
 * (Distribution & Monetization).
 *
 * PACKAGE XXVI — SOVEREIGN RENDERING ENGINE (2026-07-28, constitutional
 * naming only, zero logic changed): `PrePublishingBoundary` IS the
 * Sovereign Rendering Engine, and `CompiledAssemblyGraph` IS the Render
 * Graph — see direction-workspace-constitution.ts's own Package XXVI
 * disclosure for the full investigation. It faithfully materializes
 * whatever the Sovereign Direction State currently is; it never decides,
 * creates, or modifies Direction Decisions — `compileForPublishing` only
 * ever reads the canvas it is given.
 */

import { SovereignCanvas, CanvasType } from './assembly-contracts';
import { VaultRehydrationBridge, HydratedSovereignCanvas } from './vault-rehydration-bridge';
import type { AudioMixingDirective } from './assembly-directive-payloads';
import type { SubtitleDirective } from './subtitle-directive';

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
 * MINISTRY IV — SOVEREIGN MIXING ENGINE: the resolved mixing parameters for
 * a single Direction Node in the Render Graph. Extracted from the node's own
 * `customDirectives.audio` (AudioMixingDirective) by
 * `PrePublishingBoundary.compileMixPlan()`. Absent directives resolve to
 * honest zero-defaults matching the pre-Ministry-IV behaviour — no node
 * ever suddenly changes its effective mix because it had no directive yet.
 */
export interface CompiledNodeMix {
  readonly nodeId: string;
  readonly trackId: string;
  readonly volumeDb: number;
  readonly panCenter: number;
  readonly isMuted: boolean;
  readonly fadeInSeconds?: number;
  readonly fadeOutSeconds?: number;
}

/**
 * MINISTRY IV — SOVEREIGN MIXING ENGINE: the resolved track-level fader
 * state for one track. Extracted from `AssemblyTrack.trackVolumeDb` and
 * `isMuted` by `PrePublishingBoundary.compileMixPlan()`. Absent
 * `trackVolumeDb` resolves to 0 dB (unity) — the pre-existing honest
 * default every track without an explicit fader already behaved as.
 */
export interface CompiledTrackMix {
  readonly trackId: string;
  readonly trackVolumeDb: number;
  readonly isMuted: boolean;
}

/**
 * MINISTRY IV — SOVEREIGN MIXING ENGINE: the full structured mix plan
 * compiled by `PrePublishingBoundary.compileMixPlan()` and carried in
 * `CompiledAssemblyGraph`. This is how the Sovereign Mixing Engine becomes
 * consumable by the Rendering Engine — the already-real
 * `PrePublishingBoundary` reads every audio node's Direction State and
 * emits one unified, export-ready plan with zero new execution paths.
 * `nodeMixes` excludes nodes on muted or hidden tracks; `trackMixes`
 * includes every track (the export layer must honour the track-level fader
 * even when it decides which tracks to render).
 */
export interface CompiledMixPlan {
  readonly nodeMixes: readonly CompiledNodeMix[];
  readonly trackMixes: readonly CompiledTrackMix[];
}

/**
 * MINISTRY V — SOVEREIGN SUBTITLE SYSTEM: a single subtitle cue with
 * ABSOLUTE master-timeline positions, derived from the parent Direction
 * Node's own `temporal.globalStartTimeSeconds` + the cue's own relative
 * start/end. Absent temporal directive (un-timed node) means the cue's
 * absolute times are treated as if the node starts at 0, matching the
 * Automatic Director's existing fallback behaviour for un-timed nodes.
 */
export interface CompiledSubtitleCue {
  readonly cueId: string;
  readonly nodeId: string;
  readonly trackId: string;
  readonly absoluteStartSeconds: number;
  readonly absoluteEndSeconds: number;
  readonly text: string;
  readonly language?: string;
}

/**
 * MINISTRY V — SOVEREIGN SUBTITLE SYSTEM: the full, merged, chronologically
 * ordered subtitle plan for the compiled canvas. Extracted from every
 * active Direction Node's own `SubtitleDirective` by
 * `PrePublishingBoundary.compileSubtitlePlan()`. Nodes on muted/hidden
 * tracks contribute no entries — matching the compile-time skip already
 * applied to metadata and mix-plan. Cues are sorted by
 * `absoluteStartSeconds` ascending — the natural consumption order for any
 * renderer or exporter.
 */
export interface CompiledSubtitlePlan {
  readonly absoluteCues: readonly CompiledSubtitleCue[];
}

/**
 * The immutable, final output of the Ras Al-Amr chamber.
 * This is the exact payload handed to the rendering and distribution engines.
 * MINISTRY IV — `mixPlan` carries the structured, export-ready mix state
 * for every audio node and track in the canvas.
 */
export interface CompiledAssemblyGraph {
  compilationId: string;
  sourceCanvasId: string;
  subscriberTenantId: string;
  canvasType: CanvasType;
  hydratedCanvas: HydratedSovereignCanvas;
  metadata: CompilationMetadata;
  mixPlan: CompiledMixPlan;
  subtitlePlan: CompiledSubtitlePlan;
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

    // 5. Compile the Mixing Plan (Ministry IV)
    const mixPlan = this.compileMixPlan(hydratedCanvas);

    // 6. Compile the Subtitle Plan (Ministry V)
    const subtitlePlan = this.compileSubtitlePlan(hydratedCanvas);

    // 7. Seal and Return the Compiled Graph
    return {
      compilationId: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      sourceCanvasId: hydratedCanvas.canvasId,
      subscriberTenantId: hydratedCanvas.subscriberTenantId,
      canvasType: hydratedCanvas.canvasType,
      hydratedCanvas,
      metadata,
      mixPlan,
      subtitlePlan,
      compiledAt: Date.now()
    };
  }

  // ==========================================
  // INTERNAL COMPUTATION
  // ==========================================

  /**
   * MINISTRY IV — SOVEREIGN MIXING ENGINE: walks the hydrated canvas and
   * extracts every audio node's `AudioMixingDirective` plus every track's
   * `trackVolumeDb`/`isMuted` into a single, structured `CompiledMixPlan`.
   * The plan covers ALL tracks in `trackMixes` (so the export layer can
   * honour track-level faders), but skips muted/hidden tracks' nodes in
   * `nodeMixes` (matching the existing compile behaviour for content nodes).
   * No new execution path — reads the same `hydratedCanvas` the rest of
   * `compileForPublishing` already has.
   */
  private compileMixPlan(hydratedCanvas: HydratedSovereignCanvas): CompiledMixPlan {
    const nodeMixes: CompiledNodeMix[] = [];
    const trackMixes: CompiledTrackMix[] = [];

    for (const track of hydratedCanvas.tracks) {
      trackMixes.push({
        trackId: track.trackId,
        trackVolumeDb: track.trackVolumeDb ?? 0,
        isMuted: track.isMuted,
      });

      if (track.isMuted || track.isHidden) continue;

      for (const node of track.nodes) {
        const audio = node.customDirectives?.audio as AudioMixingDirective | undefined;
        nodeMixes.push({
          nodeId: node.nodeId,
          trackId: track.trackId,
          volumeDb: audio?.volumeDb ?? 0,
          panCenter: audio?.panCenter ?? 0,
          isMuted: audio?.isMuted ?? false,
          fadeInSeconds: audio?.fadeInSeconds,
          fadeOutSeconds: audio?.fadeOutSeconds,
        });
      }
    }

    return { nodeMixes, trackMixes };
  }

  /**
   * MINISTRY V — SOVEREIGN SUBTITLE SYSTEM: walks the hydrated canvas and
   * extracts every active Direction Node's own SubtitleDirective into a
   * single, chronologically ordered CompiledSubtitlePlan. Cue times are
   * made absolute by adding the parent node's own globalStartTimeSeconds
   * (or 0 when the node has no temporal directive, matching the Automatic
   * Director's own un-timed-node fallback). Nodes on muted/hidden tracks
   * are skipped — matching compileMixPlan() and computeMasterMetadata().
   */
  private compileSubtitlePlan(hydratedCanvas: HydratedSovereignCanvas): CompiledSubtitlePlan {
    const absoluteCues: CompiledSubtitleCue[] = [];

    for (const track of hydratedCanvas.tracks) {
      if (track.isMuted || track.isHidden) continue;

      for (const node of track.nodes) {
        const directive = node.customDirectives?.subtitles as SubtitleDirective | undefined;
        if (!directive || directive.cues.length === 0) continue;

        const nodeStartSeconds = node.temporal?.globalStartTimeSeconds ?? 0;

        for (const cue of directive.cues) {
          absoluteCues.push({
            cueId: cue.cueId,
            nodeId: node.nodeId,
            trackId: track.trackId,
            absoluteStartSeconds: nodeStartSeconds + cue.startSeconds,
            absoluteEndSeconds: nodeStartSeconds + cue.endSeconds,
            text: cue.text,
            language: directive.language,
          });
        }
      }
    }

    absoluteCues.sort((a, b) => a.absoluteStartSeconds - b.absoluteStartSeconds);
    return { absoluteCues };
  }

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