/**
 * AZMA OS — THE CONSTITUTIONAL MANIFESTATION SYSTEM
 * Constitutional Source Adapters
 * Constitutional Package II
 *
 * One pure-read function per registered Constitutional Source. Each
 * returns null rather than fabricating when no real data exists for the
 * given subject — never invents, never judges, never ranks. Adding a
 * future source means adding one function here, never modifying any
 * existing one.
 */

import { getToneProfile } from '../core/tongue';
import { CONTEXT_ROLES } from '../core/tongue';
import type { ChamberContext } from '../core/tongue';
import { composeExpressionForOrgan } from '../constitutional-expression';
import type { ConstitutionalSourceInput } from './types';

function isValidChamberContext(subjectKey: string): subjectKey is ChamberContext {
  return Object.keys(CONTEXT_ROLES).includes(subjectKey);
}

/**
 * The Imperial Tongue's own faithful expression for one chamber context.
 * Deliberately excludes ToneProfile's own `character` field, which is
 * documented as "internal only, never shown" — Manifestation faithfully
 * reveals what the Tongue already marks as Creator-facing, never what
 * it marks as internal.
 */
export function gatherFromImperialTongue(subjectKey: string): ConstitutionalSourceInput | null {
  if (!isValidChamberContext(subjectKey)) return null;
  const tone = getToneProfile(subjectKey);
  return {
    sourceId: 'imperial-tongue',
    subjectKey,
    content: `Voice: ${tone.vocabularyChar} vocabulary, ${tone.sentenceRhythm} rhythm, ${tone.questionStyle} questions, ${tone.exampleFrequency} examples.`,
  };
}

/** Constitutional Expression's own unified, dignity-checked expression for one organ. */
export function gatherFromConstitutionalExpression(subjectKey: string): ConstitutionalSourceInput | null {
  const expression = composeExpressionForOrgan(subjectKey);
  if (!expression) return null;
  return {
    sourceId: 'constitutional-expression',
    subjectKey,
    content: expression.unifiedSummary,
  };
}

/** Every registered source's adapter, in registration order — never reordered by significance. */
export function gatherFromAllSources(subjectKey: string): readonly ConstitutionalSourceInput[] {
  return [gatherFromImperialTongue(subjectKey), gatherFromConstitutionalExpression(subjectKey)].filter(
    (input): input is ConstitutionalSourceInput => input !== null,
  );
}
