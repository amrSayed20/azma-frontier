import { BenchmarkSpec } from '../benchmark-types';
import { SPEC_VERSIONS } from '../benchmark-version';

const V = SPEC_VERSIONS['video-generation'];

// Section 4: prompt adherence, character consistency, scene consistency,
// camera movement, motion coherence, physical plausibility, temporal consistency,
// lip synchronization where applicable, detail preservation during motion,
// output quality, generation latency.

export const VIDEO_GENERATION_SPECS: readonly BenchmarkSpec[] = [
  {
    testId: 'vid-gen-001',
    version: V,
    capability: 'video-generation',
    name: 'Prompt Adherence — Simple Object Motion',
    description: 'Evaluates basic prompt adherence with a simple, deterministic physical motion.',
    scoringDimensions: ['promptAdherence', 'physicalPlausibility', 'temporalConsistency', 'outputQuality'],
    input: {
      prompt: 'A solid red ball rolls slowly from the left edge to the right edge of a clean white table, reaches the right edge, and falls off frame. 5 seconds. Side-view camera, static shot. Soft studio lighting from above. No text, no other objects.',
      parameters: { durationSeconds: 5, fps: 24, aspectRatio: '16:9', cameraMotion: 'static' },
      resolution: '1280x720',
    },
    evaluationGuidance: 'promptAdherence: correct color, correct motion direction left-to-right, fall off right edge. physicalPlausibility: rolling motion physics, gravity during fall. temporalConsistency: no flickering, no shape changes, stable background.',
  },
  {
    testId: 'vid-gen-002',
    version: V,
    capability: 'video-generation',
    name: 'Camera Movement — Cinematic Dolly-In',
    description: 'Evaluates correct interpretation of a named cinematic camera movement.',
    scoringDimensions: ['cameraMovement', 'promptAdherence', 'motionCoherence', 'outputQuality'],
    input: {
      prompt: 'Slow cinematic dolly-in toward a single lit white candle in slow motion. Candle is centered in frame. Dark bokeh background throughout. Flame subtly flickers. Camera moves forward smoothly and continuously from a medium shot to a close-up over 6 seconds.',
      parameters: { durationSeconds: 6, fps: 24, aspectRatio: '16:9', cameraMotion: 'dolly-in', slowMotion: true },
      resolution: '1280x720',
    },
    evaluationGuidance: 'cameraMovement: smooth, continuous forward motion with no jitter or stutter. promptAdherence: candle centered, bokeh background, flame flicker visible, slow-motion pacing. motionCoherence: no background perspective inconsistency during forward motion.',
  },
  {
    testId: 'vid-gen-003',
    version: V,
    capability: 'video-generation',
    name: 'Physical Plausibility — Fluid Dynamics',
    description: 'Evaluates realism of simulated fluid behavior.',
    scoringDimensions: ['physicalPlausibility', 'promptAdherence', 'temporalConsistency', 'outputQuality'],
    input: {
      prompt: 'Water pours slowly from a glass pitcher into a white ceramic bowl. Realistic fluid behavior: splash on first impact, concentric ripples spreading outward, water level visibly rising. 6 seconds. 45-degree overhead angle. Soft natural daylight.',
      parameters: { durationSeconds: 6, fps: 24, aspectRatio: '16:9', physicsSimulation: 'fluid', cameraAngle: '45-overhead' },
      resolution: '1280x720',
    },
    evaluationGuidance: 'physicalPlausibility: splash physics on impact, ripple propagation speed, water level accumulation. temporalConsistency: stable fluid surface color and reflections across frames. promptAdherence: correct angle, correct vessels.',
  },
  {
    testId: 'vid-gen-004',
    version: V,
    capability: 'video-generation',
    name: 'Scene Consistency — Horizontal Pan',
    description: 'Evaluates scene and lighting consistency during a slow horizontal camera pan.',
    scoringDimensions: ['sceneConsistency', 'cameraMovement', 'temporalConsistency', 'outputQuality'],
    input: {
      prompt: 'A slow, smooth camera pan from left to right across a busy marketplace with colorful merchant stalls: fabrics, spices, ceramics. Consistent warm lighting throughout the full pan. Scene elements remain stable — no objects appear or disappear mid-pan. 8 seconds.',
      parameters: { durationSeconds: 8, fps: 24, aspectRatio: '16:9', cameraMotion: 'pan-left-to-right' },
      resolution: '1920x1080',
    },
    evaluationGuidance: 'sceneConsistency: no unexpected scene element changes during pan. cameraMovement: smooth, constant-velocity pan without stutter. temporalConsistency: uniform lighting color and intensity across the full duration.',
  },
  {
    testId: 'vid-gen-005',
    version: V,
    capability: 'video-generation',
    name: 'Character Consistency — Walk Toward Camera',
    description: 'Evaluates character identity consistency across frames during continuous motion.',
    scoringDimensions: ['characterConsistency', 'motionCoherence', 'temporalConsistency', 'promptAdherence'],
    input: {
      prompt: 'A young woman in a dark navy coat walks forward directly toward the camera down an empty modern corridor. Her facial features, coat color, hair, and posture remain identical in every frame. Tracking shot follows her forward motion. 5 seconds.',
      parameters: { durationSeconds: 5, fps: 24, aspectRatio: '16:9', cameraMotion: 'tracking-forward' },
      resolution: '1280x720',
    },
    evaluationGuidance: 'characterConsistency: stable face identity, stable coat color (dark navy — no shifts), stable body proportions across all frames. motionCoherence: natural walk cycle without morphing or limb instability. temporalConsistency: no frame-to-frame identity breaks.',
  },
  {
    testId: 'vid-gen-006',
    version: V,
    capability: 'video-generation',
    name: 'Motion Coherence — Ambient Natural Wind',
    description: 'Evaluates natural ambient motion generation without explicit physics prompt.',
    scoringDimensions: ['motionCoherence', 'physicalPlausibility', 'temporalConsistency', 'outputQuality'],
    input: {
      prompt: 'Autumn leaves on a tree branch moving gently and naturally in a light breeze. Motion must be asymmetric and non-repeating — not a loop. Leaves of varying sizes move at slightly different rates. Outdoor daylight. No people. 6 seconds.',
      parameters: { durationSeconds: 6, fps: 24, aspectRatio: '16:9', motionType: 'ambient-wind' },
      resolution: '1280x720',
    },
    evaluationGuidance: 'motionCoherence: natural, non-repeating leaf motion with organic variation. physicalPlausibility: mass-appropriate motion (heavier leaves slower, lighter faster). temporalConsistency: no looping seam, no freeze frames, no sudden position jumps.',
  },
];
