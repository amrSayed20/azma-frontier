/**
 * Watchdog to detect heartbeat stalls and emit critical alerts.
 */

import { EventType, NotificationSeverity } from '../types/al-wateen.types';
import { AL_WATEEN_CONFIG, COMPONENTS } from '../utils/constants';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';
import { RuntimeEventBus } from './event-bus';

export class WatchdogEngine {
  private timer: NodeJS.Timeout | undefined;
  private lastHeartbeatAt = 0;

  constructor(private readonly bus: RuntimeEventBus) {}

  public start(): void {
    if (this.timer) {
      return;
    }

    this.bus.subscribe(EventType.HEARTBEAT, event => {
      this.lastHeartbeatAt = event.timestamp;
    });

    this.timer = setInterval(() => {
      const threshold = AL_WATEEN_CONFIG.HEARTBEAT_INTERVAL_MS * 2;
      if (this.lastHeartbeatAt > 0 && now() - this.lastHeartbeatAt > threshold) {
        this.bus.publish({
          id: buildId('event'),
          type: EventType.NOTIFICATION,
          timestamp: now(),
          source: COMPONENTS.WATCHDOG,
          payload: {
            severity: NotificationSeverity.CRITICAL,
            title: 'Heartbeat stalled',
            message: 'Watchdog detected heartbeat timeout.'
          }
        });
      }
    }, AL_WATEEN_CONFIG.WATCHDOG_INTERVAL_MS);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
