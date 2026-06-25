/**
 * AZMA OS – Al-Wateen Assistant
 * File: monitoring-events.ts
 *
 * Event definitions for monitoring subsystem.
 */

import { SystemEvent, SystemEventType, AlertSeverity } from '../types/al-wateen.types';

export interface MonitoringEventEmitter {
  on(eventType: SystemEventType, listener: (event: SystemEvent) => void): void;
  off(eventType: SystemEventType, listener: (event: SystemEvent) => void): void;
  emit(eventType: SystemEventType, event: SystemEvent): void;
}

export class MonitoringEventBus implements MonitoringEventEmitter {
  private listeners: Map<SystemEventType, Set<(event: SystemEvent) => void>> = new Map();

  constructor() {
    this.initializeListeners();
  }

  private initializeListeners(): void {
    Object.values(SystemEventType).forEach(eventType => {
      this.listeners.set(eventType as SystemEventType, new Set());
    });
  }

  public on(eventType: SystemEventType, listener: (event: SystemEvent) => void): void {
    const set = this.listeners.get(eventType);
    if (set) {
      set.add(listener);
    }
  }

  public off(eventType: SystemEventType, listener: (event: SystemEvent) => void): void {
    const set = this.listeners.get(eventType);
    if (set) {
      set.delete(listener);
    }
  }

  public emit(eventType: SystemEventType, event: SystemEvent): void {
    const set = this.listeners.get(eventType);
    if (set) {
      set.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in monitoring event listener:', error);
        }
      });
    }
  }

  public removeAllListeners(eventType?: SystemEventType): void {
    if (eventType) {
      this.listeners.set(eventType, new Set());
    } else {
      this.listeners.forEach(set => set.clear());
    }
  }
}
