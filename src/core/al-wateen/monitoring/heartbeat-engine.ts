/**
 * Heartbeat publisher for liveness observation.
 */

import { EventType, HeartbeatRecord, RuntimeStatus } from '../types/al-wateen.types';
import { AL_WATEEN_CONFIG, COMPONENTS } from '../utils/constants';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';
import { RuntimeEventBus } from './event-bus';

export class HeartbeatEngine {
  private timer: NodeJS.Timeout | undefined;
  private sequence = 0;

  constructor(private readonly bus: RuntimeEventBus) {}

  public start(getStatus: () => RuntimeStatus): void {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      this.sequence += 1;
      const heartbeat: HeartbeatRecord = {
        sequence: this.sequence,
        timestamp: now(),
        status: getStatus()
      };

      this.bus.publish({
        id: buildId('event'),
        type: EventType.HEARTBEAT,
        timestamp: heartbeat.timestamp,
        source: COMPONENTS.HEARTBEAT,
        payload: {
          sequence: heartbeat.sequence,
          status: heartbeat.status
        }
      });
    }, AL_WATEEN_CONFIG.HEARTBEAT_INTERVAL_MS);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
