import { StrategicForecast, StrategicObjective, StrategicThreat } from './strategic-intelligence-types';

export class StrategicObjectiveTracker {
  public track(
    forecast: StrategicForecast,
    threats: readonly StrategicThreat[]
  ): readonly StrategicObjective[] {
    const highThreatCount = threats.filter((threat) => threat.level === 'high' || threat.level === 'critical').length;

    return [
      {
        objectiveId: 'obj-constitutional-durability',
        title: 'أبقِ متانةَ الدستور فوق العتبة الاستراتيجيّة.',
        owner: 'strategic-intelligence',
        status: forecast.projectedConstitutionalHealth >= 75 ? 'on-track' : 'at-risk',
        progress: Math.min(100, forecast.projectedConstitutionalHealth),
        rationale: 'الإسقاطُ الدستوريّ يحدّد متانةَ الحوكمة بعيدةَ المدى.',
      },
      {
        objectiveId: 'obj-architecture-coherence',
        title: 'احفظ تماسكَ البنيان بتوجيهٍ استراتيجيٍّ متّصل.',
        owner: 'strategic-intelligence',
        status: highThreatCount > 0 ? 'watch' : 'on-track',
        progress: Math.max(40, forecast.projectedArchitecturalHealth),
        rationale: 'ضغطُ التهديد يؤثّر في تماسك البنيان عبر آفاقٍ متعدّدة السنوات.',
      },
      {
        objectiveId: 'obj-platform-evolution',
        title: 'ارفع صحّةَ تطوّر المنصّة بدوراتِ وعيٍ استشاريّةٍ لا تنفيذيّة.',
        owner: 'strategic-intelligence',
        status: forecast.projectedPlatformEvolutionHealth >= 70 ? 'on-track' : 'watch',
        progress: Math.max(45, forecast.projectedPlatformEvolutionHealth),
        rationale: 'حزمُ الوعي الاستراتيجيّ تقود التطوّر دون أن تُنفِّذ سلطةً مباشرة.',
      },
    ];
  }
}
