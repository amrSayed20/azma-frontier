/**
 * AZMA OS — The Manifest is a projection of Chamber Truth, never a rival.
 *
 * ─── WHAT THIS HOLDS SHUT ───────────────────────────────────────────────────
 *
 *   Before the Sovereign Journey ruling, two lists said what a Chamber can
 *   do and disagreed in every Chamber — and the Interaction Kernel launched
 *   every Foyer journey against the one with no service boundary behind it.
 *
 *   These tests do not check that the Manifest is well-formed. They check
 *   that it cannot say anything Chamber Truth does not: same ids, same
 *   order, same purpose, the one precondition Truth declares and no other.
 *   If someone hand-writes a capability into a Manifest again, this fails
 *   and names it.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { CHAMBER_TRUTH } from '@/src/chamber-truth';
import type { ChamberId } from '@/src/chamber-identity';
import { listAllChamberManifests, getChamberManifest } from '../queries';

const CHAMBERS = Object.keys(CHAMBER_TRUTH) as ChamberId[];

describe('every Manifest capability is a Truth capability', () => {
  for (const chamberId of CHAMBERS) {
    it(`${chamberId} — ids, order and purpose are Truth's`, () => {
      const manifest = getChamberManifest(chamberId);
      expect(manifest).toBeDefined();
      const truth = CHAMBER_TRUTH[chamberId].capabilities;
      expect(manifest!.capabilities.map((c) => c.capabilityId)).toEqual(truth.map((c) => c.id));
      for (const [i, capability] of manifest!.capabilities.entries()) {
        expect(capability.purpose).toBe(truth[i].performs);
      }
    });

    it(`${chamberId} — the only precondition is the one Truth declares`, () => {
      const manifest = getChamberManifest(chamberId)!;
      const truth = CHAMBER_TRUTH[chamberId].capabilities;
      for (const [i, capability] of manifest.capabilities.entries()) {
        expect(capability.preconditions.length).toBe(truth[i].requiresExistingAsset ? 1 : 0);
        // The Manifest describes no inputs: Truth declares boundaries, and
        // the boundary handler is the only authority on what it accepts.
        expect(capability.requiredInputs).toEqual([]);
        expect(capability.optionalInputs).toEqual([]);
      }
    });
  }

  it('the Manifest covers every Chamber Truth covers — no more, no fewer', () => {
    const manifested = listAllChamberManifests().map((m) => m.chamberId).sort();
    expect(manifested).toEqual([...CHAMBERS].sort());
  });

  it('no Manifest capability is offered in a mode the Kernel cannot deliver', () => {
    for (const manifest of listAllChamberManifests()) {
      for (const capability of manifest.capabilities) {
        expect(capability.interactionModes.length).toBeGreaterThan(0);
        expect(capability.operatingModes.length).toBeGreaterThan(0);
        // English matching vocabulary for the Kernel's [a-z0-9] scorer.
        expect(/[a-z]/i.test(capability.displayName)).toBe(true);
      }
    }
  });
});

describe('no capability is declared by hand anywhere in the Manifest', () => {
  /**
   * The derivation can be bypassed by writing `capabilities: [ { … } ]`
   * into a manifest again. This reads the source and refuses that shape.
   */
  it('manifests.ts declares every capabilities field through deriveManifestCapabilities', () => {
    const source = readFileSync(join(process.cwd(), 'src/sovereign-chamber-manifest/manifests.ts'), 'utf8');
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    const declarations = code.match(/capabilities:\s*[^\n]+/g) ?? [];
    expect(declarations).toHaveLength(CHAMBERS.length);
    for (const declaration of declarations) {
      expect(declaration).toMatch(/capabilities:\s*deriveManifestCapabilities\('[a-z-]+'\)/);
    }
    expect(code).not.toContain('capabilityId:');
  });

  it('the old Manifest ids no longer exist anywhere the Kernel can reach', () => {
    const ids = new Set(listAllChamberManifests().flatMap((m) => m.capabilities.map((c) => c.capabilityId)));
    for (const retired of [
      'hujjah-investigate-a-question', 'qiyamah-generate-image', 'vault-list-assets',
      'vault-generate-speech-asset', 'makman-record-observation', 'makman-request-knowledge-investigation',
    ]) {
      expect(ids.has(retired)).toBe(false);
    }
  });
});
