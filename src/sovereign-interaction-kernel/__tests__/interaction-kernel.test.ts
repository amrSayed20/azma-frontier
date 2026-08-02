import { prepareInteractionSession } from '../kernel';
import type { KernelRequest } from '../types';

describe('Sovereign Interaction Kernel', () => {
  describe('navigate intent — primary capability resolution', () => {
    it('resolves hujjah-al-damighah to its primary capability', () => {
      const request: KernelRequest = {
        intent: { kind: 'navigate', targetChamber: 'hujjah-al-damighah' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('hujjah-investigate-a-question');
      expect(session.resolvedCapability?.chamberId).toBe('hujjah-al-damighah');
    });

    it('resolves qiyamah-chamber to its primary capability', () => {
      const request: KernelRequest = {
        intent: { kind: 'navigate', targetChamber: 'qiyamah-chamber' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('qiyamah-generate-image');
    });

    it('resolves ras-amr to its primary capability', () => {
      const request: KernelRequest = {
        intent: { kind: 'navigate', targetChamber: 'ras-amr' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('ras-amr-create-direction-canvas');
    });

    it('resolves makman-al-ghayah to its primary capability', () => {
      const request: KernelRequest = {
        intent: { kind: 'navigate', targetChamber: 'makman-al-ghayah' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('makman-set-sovereign-purpose');
    });

    it('resolves sovereign-vault-palace to its primary capability', () => {
      const request: KernelRequest = {
        intent: { kind: 'navigate', targetChamber: 'sovereign-vault-palace' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('vault-list-assets');
    });
  });

  describe('navigate intent — explicit capability selection', () => {
    it('resolves to the exact capability when capabilityId is supplied', () => {
      const request: KernelRequest = {
        intent: {
          kind: 'navigate',
          targetChamber: 'qiyamah-chamber',
          capabilityId: 'qiyamah-list-generations',
        },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('qiyamah-list-generations');
    });

    it('returns NO_MATCHING_CAPABILITY for an unknown capabilityId', () => {
      const request: KernelRequest = {
        intent: {
          kind: 'navigate',
          targetChamber: 'ras-amr',
          capabilityId: 'capability-that-does-not-exist',
        },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('NO_MATCHING_CAPABILITY');
      expect(session.resolvedCapability).toBeNull();
    });
  });

  describe('text intent — capability scoring', () => {
    it('resolves "investigate" in write mode to Hujjah investigation', () => {
      const request: KernelRequest = {
        intent: { kind: 'text', rawText: 'investigate', preferredMode: 'write' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('hujjah-investigate-a-question');
      expect(session.resolvedCapability?.chamberId).toBe('hujjah-al-damighah');
    });

    it('resolves "generate image" in write mode to Qiyamah image generation', () => {
      const request: KernelRequest = {
        intent: { kind: 'text', rawText: 'generate image', preferredMode: 'write' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('qiyamah-generate-image');
    });

    it('resolves "compile canvas" in browse mode to assembly compilation', () => {
      const request: KernelRequest = {
        intent: { kind: 'text', rawText: 'compile canvas', preferredMode: 'browse' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('ras-amr-compile-production-into-assembly');
    });

    it('resolves "purpose" in write mode to Makman sovereign purpose declaration', () => {
      const request: KernelRequest = {
        intent: { kind: 'text', rawText: 'purpose', preferredMode: 'write' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('makman-set-sovereign-purpose');
    });

    it('resolves "list" in browse mode to Qiyamah list-generations', () => {
      const request: KernelRequest = {
        intent: { kind: 'text', rawText: 'list', preferredMode: 'browse' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('qiyamah-list-generations');
    });

    it('returns NEEDS_CLARIFICATION when "generate" matches two write-mode capabilities equally', () => {
      const request: KernelRequest = {
        intent: { kind: 'text', rawText: 'generate', preferredMode: 'write' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('NEEDS_CLARIFICATION');
      expect(session.resolvedCapability).toBeNull();
      expect(session.candidates.length).toBeGreaterThanOrEqual(2);
      const ids = session.candidates.map((c) => c.capabilityId);
      expect(ids).toContain('qiyamah-generate-image');
      expect(ids).toContain('vault-generate-speech-asset');
    });

    it('returns NO_MATCHING_CAPABILITY for empty text', () => {
      const request: KernelRequest = {
        intent: { kind: 'text', rawText: '', preferredMode: 'write' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('NO_MATCHING_CAPABILITY');
    });

    it('returns NO_MATCHING_CAPABILITY for whitespace-only text', () => {
      const request: KernelRequest = {
        intent: { kind: 'text', rawText: '   ', preferredMode: 'write' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('NO_MATCHING_CAPABILITY');
    });

    it('returns NO_MATCHING_CAPABILITY for unrecognized text', () => {
      const request: KernelRequest = {
        intent: { kind: 'text', rawText: 'xyzzy nothing here', preferredMode: 'write' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('NO_MATCHING_CAPABILITY');
    });
  });

  describe('voice intent', () => {
    it('resolves voice "investigate a question" to Hujjah investigation', () => {
      const request: KernelRequest = {
        intent: { kind: 'voice', transcript: 'investigate a question' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('hujjah-investigate-a-question');
      expect(session.activeInteractionMode).toBe('listen');
    });

    it('resolves voice "generate image" to Qiyamah image generation', () => {
      const request: KernelRequest = {
        intent: { kind: 'voice', transcript: 'generate image' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.resolvedCapability?.capabilityId).toBe('qiyamah-generate-image');
    });

    it('returns NO_MATCHING_CAPABILITY for voice targeting browse-only capabilities', () => {
      const request: KernelRequest = {
        intent: { kind: 'voice', transcript: 'browse assets' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('NO_MATCHING_CAPABILITY');
    });
  });

  describe('InteractionSession contract', () => {
    it('RESOLVED session carries required inputs from the manifest', () => {
      const request: KernelRequest = {
        intent: { kind: 'navigate', targetChamber: 'hujjah-al-damighah' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.requiredInputs.length).toBe(2);
      expect(session.requiredInputs[0].name).toBe('query');
      expect(session.requiredInputs[1].name).toBe('category');
    });

    it('RESOLVED session carries preconditions from the manifest', () => {
      const request: KernelRequest = {
        intent: { kind: 'navigate', targetChamber: 'qiyamah-chamber' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.preconditions.length).toBeGreaterThan(0);
    });

    it('each session receives a unique sessionId', () => {
      const request: KernelRequest = {
        intent: { kind: 'navigate', targetChamber: 'hujjah-al-damighah' },
      };
      const s1 = prepareInteractionSession(request);
      const s2 = prepareInteractionSession(request);
      expect(s1.sessionId).not.toBe(s2.sessionId);
    });

    it('navigate to vault-palace derives browse as activeInteractionMode from manifest', () => {
      const request: KernelRequest = {
        intent: { kind: 'navigate', targetChamber: 'sovereign-vault-palace' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.activeInteractionMode).toBe('browse');
    });

    it('navigate to hujjah derives write as activeInteractionMode from manifest', () => {
      const request: KernelRequest = {
        intent: { kind: 'navigate', targetChamber: 'hujjah-al-damighah' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('RESOLVED');
      expect(session.activeInteractionMode).toBe('write');
    });

    it('NEEDS_CLARIFICATION session has null resolvedCapability and null activeInteractionMode', () => {
      const request: KernelRequest = {
        intent: { kind: 'text', rawText: 'generate', preferredMode: 'write' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('NEEDS_CLARIFICATION');
      expect(session.resolvedCapability).toBeNull();
      expect(session.requiredInputs).toEqual([]);
      expect(session.activeInteractionMode).toBeNull();
      expect(session.activeOperatingMode).toBeNull();
    });

    it('NO_MATCHING_CAPABILITY session has null resolvedCapability and empty candidates', () => {
      const request: KernelRequest = {
        intent: { kind: 'text', rawText: '', preferredMode: 'write' },
      };
      const session = prepareInteractionSession(request);
      expect(session.status).toBe('NO_MATCHING_CAPABILITY');
      expect(session.resolvedCapability).toBeNull();
      expect(session.candidates).toEqual([]);
    });

    it('preparedAt is a valid ISO 8601 timestamp', () => {
      const request: KernelRequest = {
        intent: { kind: 'navigate', targetChamber: 'makman-al-ghayah' },
      };
      const session = prepareInteractionSession(request);
      expect(new Date(session.preparedAt).toISOString()).toBe(session.preparedAt);
    });
  });
});
