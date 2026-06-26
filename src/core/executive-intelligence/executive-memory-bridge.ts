import { ExecutiveDecisionPackage, ExecutiveRiskAssessment, ExecutiveSituationUnderstanding } from './executive-intelligence-types';

export class ExecutiveMemoryBridge {
  private readonly situationLog: ExecutiveSituationUnderstanding[] = [];
  private readonly riskLog: ExecutiveRiskAssessment[] = [];
  private readonly packageLog: ExecutiveDecisionPackage[] = [];

  public bridge(packageValue: ExecutiveDecisionPackage): void {
    this.situationLog.push(packageValue.situation);
    this.riskLog.push(packageValue.risks);
    this.packageLog.push(packageValue);
  }

  public getLatestPackage(): ExecutiveDecisionPackage | undefined {
    return this.packageLog[this.packageLog.length - 1];
  }

  public getStats(): { readonly situations: number; readonly risks: number; readonly packages: number } {
    return {
      situations: this.situationLog.length,
      risks: this.riskLog.length,
      packages: this.packageLog.length,
    };
  }
}
