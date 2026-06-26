import { ConstitutionalIntelligencePackage } from '../al-wateen';
import { CouncilBriefingBundle } from './runtime-types';

export class BriefingDistributor {
  public distribute(unifiedPackage: ConstitutionalIntelligencePackage): CouncilBriefingBundle {
    return {
      founderBriefing: unifiedPackage.founderBriefing,
      executiveBriefing: unifiedPackage.executiveBriefing,
      strategicBriefing: unifiedPackage.strategicBriefing,
    };
  }
}
