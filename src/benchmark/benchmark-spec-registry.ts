import { BenchmarkCapability, BenchmarkSpec } from './benchmark-types';
import { IMAGE_GENERATION_SPECS } from './specs/image-generation-specs';
import { IMAGE_EDITING_SPECS } from './specs/image-editing-specs';
import { IMAGE_UPSCALING_SPECS } from './specs/image-upscaling-specs';
import { VIDEO_GENERATION_SPECS } from './specs/video-generation-specs';
import { TEXT_TO_SPEECH_SPECS } from './specs/text-to-speech-specs';
import { VOICE_CLONING_SPECS } from './specs/voice-cloning-specs';

export class BenchmarkSpecRegistry {
  private readonly specs = new Map<string, BenchmarkSpec>();

  register(spec: BenchmarkSpec): void {
    if (this.specs.has(spec.testId)) {
      throw new Error(`Duplicate testId in benchmark registry: ${spec.testId}`);
    }
    this.specs.set(spec.testId, spec);
  }

  get(testId: string): BenchmarkSpec | undefined {
    return this.specs.get(testId);
  }

  listByCapability(capability: BenchmarkCapability): readonly BenchmarkSpec[] {
    return Array.from(this.specs.values()).filter((s) => s.capability === capability);
  }

  listAll(): readonly BenchmarkSpec[] {
    return Array.from(this.specs.values());
  }

  count(): number {
    return this.specs.size;
  }
}

export function createDefaultSpecRegistry(): BenchmarkSpecRegistry {
  const registry = new BenchmarkSpecRegistry();
  const allSpecs = [
    ...IMAGE_GENERATION_SPECS,
    ...IMAGE_EDITING_SPECS,
    ...IMAGE_UPSCALING_SPECS,
    ...VIDEO_GENERATION_SPECS,
    ...TEXT_TO_SPEECH_SPECS,
    ...VOICE_CLONING_SPECS,
  ];
  for (const spec of allSpecs) {
    registry.register(spec);
  }
  return registry;
}
