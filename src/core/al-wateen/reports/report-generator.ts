/**
 * Report generator for runtime intelligence.
 */

import { ExecutiveStatusSnapshot, RuntimeSnapshot } from '../types/al-wateen.types';
import { AL_WATEEN_CONFIG } from '../utils/constants';
import { createRange, now } from '../utils/time';

export class ReportGenerator {
  public build(snapshot: RuntimeSnapshot): ExecutiveStatusSnapshot {
    const period = createRange(AL_WATEEN_CONFIG.EXECUTIVE_SNAPSHOT_WINDOW_MS, now());
    return {
      generatedAt: now(),
      periodStart: period.start,
      periodEnd: period.end,
      runtimeStatus: snapshot.status,
      healthStatus: snapshot.health,
      metrics: snapshot.metrics,
      resources: snapshot.resources,
      topAlerts: snapshot.activeAlerts.slice(0, 10),
      recommendations: this.recommend(snapshot)
    };
  }

  private recommend(snapshot: RuntimeSnapshot): readonly string[] {
    const recommendations: string[] = [];
    if (snapshot.health === 'CRITICAL') {
      recommendations.push('Immediate intervention is required for critical health findings.');
    }
    if (snapshot.metrics.tasksFailed > 0) {
      recommendations.push('Review failed task records and retry strategy.');
    }
    if (snapshot.resources.heapUsedBytes > snapshot.resources.heapTotalBytes * 0.9) {
      recommendations.push('Heap pressure is high; inspect runtime allocation hotspots.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Runtime posture is stable. Continue continuous monitoring.');
    }
    return recommendations;
  }
}
