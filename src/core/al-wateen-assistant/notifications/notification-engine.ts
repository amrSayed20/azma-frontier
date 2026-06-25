/**
 * AZMA OS – Al-Wateen Assistant
 * File: notification-engine.ts
 *
 * Notification generation and routing.
 */

import { Notification, NotificationType, NotificationPriority, SystemAlert, SystemEvent } from '../types/al-wateen.types';
import { ILogger } from '../utils/logger';
import { AlWateenNotificationCenter } from './notification-center';

export interface NotificationEngine {
  notifyAlert(alert: SystemAlert): void;
  notifyEvent(event: SystemEvent): void;
  notifyInfo(title: string, message: string, source: string): void;
  notifyWarning(title: string, message: string, source: string): void;
  notifyError(title: string, message: string, source: string): void;
}

export class AlWateenNotificationEngine implements NotificationEngine {
  private center: AlWateenNotificationCenter;

  constructor(private readonly logger: ILogger) {
    this.center = new AlWateenNotificationCenter();
    this.logger.info('AlWateenNotificationEngine', 'Initialized');
  }

  public notifyAlert(alert: SystemAlert): void {
    const type = this.mapSeverityToType(alert.severity);
    const priority = this.mapSeverityToPriority(alert.severity);

    const notification: Notification = {
      id: this.generateNotificationId(),
      timestamp: Date.now(),
      type,
      priority,
      title: `Alert: ${alert.type}`,
      message: alert.message,
      source: alert.source,
      read: false,
      metadata: { alertId: alert.id }
    };

    this.center.publish(notification);
    this.logger.info('AlWateenNotificationEngine', `Alert notification created`, { alertId: alert.id });
  }

  public notifyEvent(event: SystemEvent): void {
    const type = this.mapEventTypeToNotificationType(event.type);
    const priority = this.mapSeverityToPriority(event.severity);

    const notification: Notification = {
      id: this.generateNotificationId(),
      timestamp: Date.now(),
      type,
      priority,
      title: `Event: ${event.type}`,
      message: event.data?.message as string || 'System event occurred',
      source: event.source,
      read: false,
      metadata: { eventId: event.id }
    };

    this.center.publish(notification);
    this.logger.debug('AlWateenNotificationEngine', `Event notification created`, { eventId: event.id });
  }

  public notifyInfo(title: string, message: string, source: string): void {
    const notification: Notification = {
      id: this.generateNotificationId(),
      timestamp: Date.now(),
      type: NotificationType.INFO,
      priority: NotificationPriority.LOW,
      title,
      message,
      source,
      read: false,
      metadata: {}
    };

    this.center.publish(notification);
  }

  public notifyWarning(title: string, message: string, source: string): void {
    const notification: Notification = {
      id: this.generateNotificationId(),
      timestamp: Date.now(),
      type: NotificationType.WARNING,
      priority: NotificationPriority.MEDIUM,
      title,
      message,
      source,
      read: false,
      metadata: {}
    };

    this.center.publish(notification);
  }

  public notifyError(title: string, message: string, source: string): void {
    const notification: Notification = {
      id: this.generateNotificationId(),
      timestamp: Date.now(),
      type: NotificationType.ERROR,
      priority: NotificationPriority.HIGH,
      title,
      message,
      source,
      read: false,
      metadata: {}
    };

    this.center.publish(notification);
  }

  public getCenter(): AlWateenNotificationCenter {
    return this.center;
  }

  private mapSeverityToType(severity: string): NotificationType {
    switch (severity) {
      case 'CRITICAL':
        return NotificationType.ALERT;
      case 'ERROR':
        return NotificationType.ERROR;
      case 'WARNING':
        return NotificationType.WARNING;
      default:
        return NotificationType.INFO;
    }
  }

  private mapSeverityToPriority(severity: string): NotificationPriority {
    switch (severity) {
      case 'CRITICAL':
        return NotificationPriority.CRITICAL;
      case 'ERROR':
        return NotificationPriority.HIGH;
      case 'WARNING':
        return NotificationPriority.MEDIUM;
      default:
        return NotificationPriority.LOW;
    }
  }

  private mapEventTypeToNotificationType(eventType: string): NotificationType {
    switch (eventType) {
      case 'ERROR_OCCURRED':
      case 'RECOVERY_FAILED':
        return NotificationType.ERROR;
      case 'PERFORMANCE_DEGRADED':
        return NotificationType.WARNING;
      default:
        return NotificationType.INFO;
    }
  }

  private generateNotificationId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public shutdown(): void {
    this.center.clear();
  }
}
