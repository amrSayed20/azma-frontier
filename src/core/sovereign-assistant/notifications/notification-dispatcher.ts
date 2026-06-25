/**
 * AZMA OS - Sovereign Assistant
 * Notification Architecture & Provider Interfaces
 */

import {
  Notification,
  NotificationChannel,
  NotificationPriority,
  NotificationPreferences,
} from '../types/sovereign-types';

/**
 * Notification provider interface.
 * Implementations must deliver notifications through their respective channels.
 */
export interface NotificationProvider {
  readonly channelType: NotificationChannel;
  
  /**
   * Sends a notification through this provider's channel.
   */
  send(notification: Notification, recipientIdentifier: string): Promise<boolean>;
  
  /**
   * Tests provider connectivity.
   */
  testConnectivity(): Promise<boolean>;
}

/**
 * Email notification provider interface.
 */
export interface EmailNotificationProvider extends NotificationProvider {
  readonly channelType: 'email';
  sendBatch(notifications: readonly Notification[], recipients: readonly string[]): Promise<number>;
}

/**
 * SMS notification provider interface.
 */
export interface SmsNotificationProvider extends NotificationProvider {
  readonly channelType: 'sms';
  sendBatch(notifications: readonly Notification[], phoneNumbers: readonly string[]): Promise<number>;
}

/**
 * Push notification provider interface.
 */
export interface PushNotificationProvider extends NotificationProvider {
  readonly channelType: 'push';
  sendToAll(notification: Notification): Promise<number>;
}

/**
 * In-app notification provider (local storage).
 */
export interface InAppNotificationProvider extends NotificationProvider {
  readonly channelType: 'in-app';
  getAllForUser(userId: string): Promise<readonly Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
}

/**
 * Central notification dispatcher coordinating all providers.
 */
export class NotificationDispatcher {
  private readonly providers: Map<NotificationChannel, NotificationProvider> = new Map();

  /**
   * Registers a notification provider for a specific channel.
   */
  public registerProvider(provider: NotificationProvider): void {
    this.providers.set(provider.channelType, provider);
  }

  /**
   * Dispatches a notification through preferred channels.
   */
  public async dispatch(
    notification: Notification,
    recipientIdentifier: string,
    preferences: NotificationPreferences
  ): Promise<boolean> {
    // Select channels for this notification based on priority and preferences
    const selectedChannels = this.selectChannels(
      notification.priority,
      preferences
    );

    if (selectedChannels.length === 0) {
      return false;
    }

    let sent = false;
    for (const channel of selectedChannels) {
      const provider = this.providers.get(channel);
      if (provider) {
        try {
          const result = await provider.send(notification, recipientIdentifier);
          if (result) {
            sent = true;
          }
        } catch (error) {
          console.error(`Failed to send via ${channel}:`, error);
        }
      }
    }

    return sent;
  }

  /**
   * Tests all registered providers.
   */
  public async testAllProviders(): Promise<Record<NotificationChannel, boolean>> {
    const results: Record<NotificationChannel, boolean> = {
      email: false,
      sms: false,
      push: false,
      'in-app': false,
    };

    for (const [channel, provider] of this.providers) {
      try {
        results[channel] = await provider.testConnectivity();
      } catch {
        results[channel] = false;
      }
    }

    return results;
  }

  /**
   * Selects appropriate channels based on notification priority and preferences.
   */
  private selectChannels(
    priority: NotificationPriority,
    preferences: NotificationPreferences
  ): NotificationChannel[] {
    // Always include in-app
    const channels: NotificationChannel[] = ['in-app'];

    // Priority-based routing
    const priorityChannels = preferences.priorities[priority];
    if (priorityChannels) {
      channels.push(...priorityChannels.filter(c => c !== 'in-app'));
    } else {
      // Fall back to enabled channels
      channels.push(...preferences.enabledChannels.filter(c => c !== 'in-app'));
    }

    // Remove duplicates
    return Array.from(new Set(channels));
  }
}

/**
 * Notification preference manager.
 */
export class NotificationPreferenceManager {
  private readonly preferences: Map<string, NotificationPreferences> = new Map();

  /**
   * Gets or creates preferences for a user.
   */
  public getPreferences(userId: string): NotificationPreferences {
    if (!this.preferences.has(userId)) {
      this.preferences.set(userId, {
        userId,
        enabledChannels: ['in-app'],
        priorities: {
          low: ['in-app'],
          normal: ['in-app'],
          high: ['in-app'],
          critical: ['in-app'],
        },
        categories: {},
      });
    }

    return this.preferences.get(userId)!;
  }

  /**
   * Updates notification preferences.
   */
  public updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): NotificationPreferences {
    const current = this.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...current,
      ...updates,
      userId,
    };
    this.preferences.set(userId, updated);
    return updated;
  }

  /**
   * Enables a channel for a user.
   */
  public enableChannel(userId: string, channel: NotificationChannel): void {
    const prefs = this.getPreferences(userId);
    if (!prefs.enabledChannels.includes(channel)) {
      const updated: NotificationPreferences = {
        ...prefs,
        enabledChannels: [...prefs.enabledChannels, channel],
      };
      this.preferences.set(userId, updated);
    }
  }

  /**
   * Disables a channel for a user.
   */
  public disableChannel(userId: string, channel: NotificationChannel): void {
    const prefs = this.getPreferences(userId);
    const updated: NotificationPreferences = {
      ...prefs,
      enabledChannels: prefs.enabledChannels.filter(c => c !== channel),
    };
    this.preferences.set(userId, updated);
  }
}
