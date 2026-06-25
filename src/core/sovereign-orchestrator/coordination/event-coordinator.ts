/**
 * Event coordination for orchestration lifecycle notifications.
 */

import {
  ChamberEvent,
  ChamberEventType,
  ChamberIntegrationRuntime
} from '../../chamber-integration';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';

export class EventCoordinator {
  constructor(private readonly chamberRuntime: ChamberIntegrationRuntime) {}

  public publishLifecycle(
    requestId: string,
    phase: string,
    details: Readonly<Record<string, unknown>> = {}
  ): void {
    const event: ChamberEvent<Readonly<Record<string, unknown>>> = {
      eventId: buildId('orch-event'),
      chamberId: 'sovereign-orchestrator',
      type: ChamberEventType.LIFECYCLE,
      timestamp: now(),
      payload: {
        requestId,
        phase,
        ...details
      }
    };

    this.chamberRuntime.emitEvent(event);
  }
}
