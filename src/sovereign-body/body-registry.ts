/**
 * AZMA OS — THE SOVEREIGN BODY
 * The Constitutional Body Registry
 * Construction Phase I — The Constitutional Skeleton
 *
 * Authority: "The Sovereign Body — Constitutional Vision" (Chapter I,
 * Articles I-III) and the Final Imperial Declaration of "The Constitutional
 * Birth of the Sovereign Body" (Anatomy Ch. XII).
 */

import type { ConstitutionalBody } from './types';

export const SOVEREIGN_BODY: ConstitutionalBody = {
  name: 'The Sovereign Body',
  purpose:
    'To define the living organism in which every sovereign organ of AZMA OS exists. The Body owns no business logic, executes no Creator requests, renders no interface, and possesses no independent intelligence — its sole constitutional responsibility is defining the organism, not acting as one.',
  foundingAuthority:
    'AZMA OS — The Sovereign Body: Constitutional Vision, Books I-V (Existence, Life, Unity, Will, Awareness), and the Constitutional Anatomy of the Living Empire, Chapters I-XII.',
  regionIds: [
    'region-of-consciousness',
    'region-of-life',
    'region-of-identity',
    'region-of-intelligence',
    'region-of-creation',
    'region-of-governance',
  ],
} as const;
