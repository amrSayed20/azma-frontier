/**
 * Notification dispatch and retention.
 */

import { NotificationMessage, NotificationSeverity } from '../types/al-wateen.types';
import { AL_WATEEN_CONFIG } from '../utils/constants';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';

export type NotificationListener = (message: NotificationMessage) => void;

export class NotificationDispatcher {
  private readonly listeners = new Set<NotificationListener>();
  private readonly messages: NotificationMessage[] = [];

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public dispatch(
    severity: NotificationSeverity,
    title: string,
    message: string,
    source: string,
    metadata: Readonly<Record<string, unknown>> = {}
  ): NotificationMessage {
    const payload: NotificationMessage = {
      id: buildId('notif'),
      timestamp: now(),
      severity,
      title,
      message,
      source,
      metadata
    };

    this.messages.unshift(payload);
    if (this.messages.length > AL_WATEEN_CONFIG.MAX_NOTIFICATIONS) {
      this.messages.length = AL_WATEEN_CONFIG.MAX_NOTIFICATIONS;
    }

    for (const listener of this.listeners) {
      listener(payload);
    }

    return payload;
  }

  public recent(): readonly NotificationMessage[] {
    return [...this.messages];
  }
}
