/**
 * AZMA OS — RAS AL AMR: MINISTRY V — SOVEREIGN SUBTITLE SYSTEM
 * The Subtitle Directive.
 *
 * Subtitles are Direction — not Rendering, not Export, not Publishing.
 * A SubtitleDirective lives in AssemblyNode.customDirectives.subtitles,
 * written via the already-real UPDATE_ADVANCED_DIRECTIVE('subtitles') path
 * and compiled into CompiledSubtitlePlan by PrePublishingBoundary.
 *
 * Times in SubtitleCue are RELATIVE to the parent Direction Node's own
 * globalStartTimeSeconds. Absolute times are derived only during compilation
 * — the Direction State stores relative cues, which remain correct even if
 * the node is reordered or its start time is adjusted by the Director.
 */

/**
 * A single timed text entry within a SubtitleDirective. Times are relative
 * to the parent Direction Node's own globalStartTimeSeconds — never
 * absolute master-timeline positions, so that subtitle cues survive node
 * reordering and temporal edits without manual recalculation.
 */
export interface SubtitleCue {
  cueId: string;
  startSeconds: number;
  endSeconds: number;
  text: string;
}

/**
 * The full subtitle state for one Direction Node. Stored in
 * AssemblyNode.customDirectives.subtitles. Replacing the whole directive
 * replaces the whole cue set — non-destructive to the underlying Vault
 * Asset, exactly as AudioMixingDirective is to audio.
 *
 * `language` is optional; absent means the Creator has not yet declared
 * a language — never inferred from file content or node metadata.
 */
export interface SubtitleDirective {
  cues: readonly SubtitleCue[];
  language?: string;
}
