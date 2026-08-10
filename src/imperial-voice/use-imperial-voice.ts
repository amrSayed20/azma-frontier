'use client';

/**
 * AZMA OS — useImperialVoice
 * A React hook that composes the ambient ImperialVoice for a given
 * chamber context. Chambers call this on mount to receive the Empire's
 * voice — tone, citizen profile, creator profile — calibrated to their
 * specific constitutional context. No TongueIntent is supplied here
 * (intention remains honestly null); per-interaction intent is composed
 * by the Sovereign Interaction Kernel via establishFirstConstitutionalMotion.
 */

import { useMemo } from 'react';
import { composeImperialVoice } from './voice-composer';
import type { ChamberContext } from '../core/tongue';
import type { ImperialVoice } from './types';

export function useImperialVoice(context: ChamberContext): ImperialVoice {
  return useMemo(() => composeImperialVoice(context), [context]);
}
