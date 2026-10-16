import { CanvasType, type AssemblyNode, type SovereignCanvas } from '../assembly-contracts';
import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { AssetFamily } from '../../../vault/sovereign-vault-types';
import { computeVisualWindow, visualOpacityAt } from '../cinematic-timing';
import { computeTemplateSlotTemporal, type TemplateSlotGrammar } from '../template-slots';

const isSound = (n: AssemblyNode) => n.capabilityOrigin === CapabilityTarget.AUDIO;

/** Adds `kinds` one by one exactly as the workspace does under a template. */
function fill(template: TemplateSlotGrammar, kinds: CapabilityTarget[]): AssemblyNode[] {
  const canvas: SovereignCanvas = {
    canvasId: 'c', subscriberTenantId: 't', canvasType: CanvasType.CINEMATIC, title: '',
    tracks: [{ trackId: 'track-1', trackName: '', isMuted: false, isHidden: false, nodes: [] }],
    createdAt: 0, updatedAt: 0,
  };
  kinds.forEach((capability, i) => {
    const node: AssemblyNode = { nodeId: `n${i}`, assetId: `a${i}`, assetFamily: AssetFamily.MEDIA, capabilityOrigin: capability };
    node.temporal = capability === CapabilityTarget.AUDIO
      ? { globalStartTimeSeconds: 0, playDurationSeconds: 30 }
      : computeTemplateSlotTemporal(template, canvas, isSound);
    canvas.tracks[0].nodes.push(node);
  });
  return canvas.tracks[0].nodes;
}

const crossfadeTemplate: TemplateSlotGrammar = { transitionPreference: 'crossfade', transitionDurationSeconds: 0.8, slotDurations: [2, 4, 4] };
const cutTemplate: TemplateSlotGrammar = { transitionPreference: 'cut', slotDurations: [1, 2, 2] };

describe('template slots', () => {
  it('runs slots back to back for their full duration, like the template preview', () => {
    const nodes = fill(crossfadeTemplate, [CapabilityTarget.VISUAL, CapabilityTarget.VISUAL, CapabilityTarget.MOTION]);
    expect(nodes.map((n) => [n.temporal?.globalStartTimeSeconds, n.temporal?.playDurationSeconds, n.temporal?.transitionInType])).toEqual([
      [0, 2, 'cut'], [2, 4, 'crossfade'], [6, 4, 'crossfade'],
    ]);
    // The dissolve happens before the slot starts; the slot itself is fully on screen.
    const second = computeVisualWindow(nodes[1].temporal, nodes[2].temporal);
    expect(visualOpacityAt(second, 1.6)).toBeCloseTo(0.5, 5);
    expect(visualOpacityAt(second, 2)).toBe(1);
    expect(visualOpacityAt(second, 5.9)).toBe(1);
  });

  it('never lets sound take a slot, wherever it is added', () => {
    const nodes = fill(cutTemplate, [CapabilityTarget.AUDIO, CapabilityTarget.VISUAL, CapabilityTarget.AUDIO, CapabilityTarget.VISUAL, CapabilityTarget.VISUAL]);
    const visual = nodes.filter((n) => !isSound(n));
    expect(visual.map((n) => [n.temporal?.globalStartTimeSeconds, n.temporal?.playDurationSeconds])).toEqual([[0, 1], [1, 2], [3, 2]]);
  });

  it('accepts fewer assets than slots, and more — a template is never a cap', () => {
    expect(fill(cutTemplate, [CapabilityTarget.VISUAL]).map((n) => n.temporal?.playDurationSeconds)).toEqual([1]);
    const many = fill(cutTemplate, Array(5).fill(CapabilityTarget.VISUAL));
    expect(many.map((n) => [n.temporal?.globalStartTimeSeconds, n.temporal?.playDurationSeconds])).toEqual([
      [0, 1], [1, 2], [3, 2], [5, 5], [10, 5],
    ]);
  });

  it('keeps a crossfade no longer than half of a short slot', () => {
    const short: TemplateSlotGrammar = { transitionPreference: 'crossfade', transitionDurationSeconds: 1.2, slotDurations: [1, 1] };
    expect(fill(short, [CapabilityTarget.VISUAL, CapabilityTarget.VISUAL])[1].temporal?.transitionInDurationSeconds).toBe(0.5);
  });
});
