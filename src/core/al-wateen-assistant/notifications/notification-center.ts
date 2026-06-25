/**
 * AZMA OS – Al-Wateen Assistant
 * File: notification-center.ts
 *
 * Notification distribution and management.
 */

import { Notification, NotificationType, NotificationPriority } from '../types/al-wateen.types';

export interface NotificationListener {
  (notification: Notification): void;
}

export interface NotificationCenter {
  subscribe(listener: NotificationListener): () => void;
  unsubscribe(listener: NotificationListener): void;
  publish(notification: Notification): void;
  getNotifications(unreadOnly?: boolean): readonly Notification[];
  markAsRead(notificationId: string): void;
}

export class AlWateenNotificationCenter implements NotificationCenter {
  private listeners: Set<NotificationListener> = new Set();
  private notifications: Map<string, Notification> = new Map();
  private maxNotifications: number = 1000;

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.unsubscribe(listener);
    };
  }

  public unsubscribe(listener: NotificationListener): void {
    this.listeners.delete(listener);
  }

  public publish(notification: Notification): void {
    if (this.notifications.size >= this.maxNotifications) {
      this.evictOldest();
    }

    this.notifications.set(notification.id, notification);

    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  public getNotifications(unreadOnly: boolean = false): readonly Notification[] {
    const all = Array.from(this.notifications.values());

    if (unreadOnly) {
      return all.filter(n => !n.read);
    }

    return all;
  }

  public markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);

    if (notification) {
      const updated: Notification = {
        ...notification,
        read: true,
        readAt: Date.now()
      };

      this.notifications.set(notificationId, updated);
    }
  }

  public markAllAsRead(): void {
    this.notifications.forEach((notification, id) => {
      this.markAsRead(id);
    });
  }

  private evictOldest(): void {
    let oldest: Notification | undefined;
    let oldestId: string | undefined;

    this.notifications.forEach((notification, id) => {
      if (!oldest || notification.timestamp < oldest.timestamp) {
        oldest = notification;
        oldestId = id;
      }
    });

    if (oldestId) {
      this.notifications.delete(oldestId);
    }
  }

  public clear(): void {
    this.notifications.clear();
  }

  public size(): number {
    return this.notifications.size;
  }
}
