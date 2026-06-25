/**
 * AZMA OS - Sovereign Assistant
 * Access Control & Security Architecture
 */

import { FounderCapability, FounderSession } from '../types/sovereign-types';

/**
 * Supreme leadership authorization layer.
 * Only verified platform owners may access the Sovereign High Council.
 */
export class SovereignAccessControl {
  private readonly authorizedOwnerIds: Set<string>;

  constructor(authorizedOwnerIds: readonly string[]) {
    this.authorizedOwnerIds = new Set(authorizedOwnerIds);
  }

  /**
   * Verifies whether a user is authorized as platform owner.
   */
  public isAuthorizedOwner(userId: string): boolean {
    return this.authorizedOwnerIds.has(userId);
  }

  /**
   * Creates a founder session with strict security controls.
   */
  public createFounderSession(
    userId: string,
    ipAddress: string,
    userAgent: string,
    sessionDurationMinutes: number = 60
  ): FounderSession | null {
    if (!this.isAuthorizedOwner(userId)) {
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + sessionDurationMinutes * 60 * 1000);

    return {
      sessionId: `fs_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      userId,
      startedAt: now,
      expiresAt,
      authorizedCapabilities: this.getOwnerCapabilities(),
      ipAddress,
      userAgent,
    };
  }

  /**
   * Validates active founder session.
   */
  public validateSession(session: FounderSession): boolean {
    const now = new Date();
    return (
      this.isAuthorizedOwner(session.userId) &&
      now < session.expiresAt
    );
  }

  /**
   * Returns all authorized capabilities for platform owner.
   */
  private getOwnerCapabilities(): readonly FounderCapability[] {
    return [
      'create-content',
      'generate-video',
      'generate-image',
      'manage-users',
      'grant-credits',
      'grant-subscriptions',
      'grant-gifts',
      'broadcast',
      'approve-migrations',
      'system-configuration',
    ];
  }

  /**
   * Checks whether session has specific capability.
   */
  public hasCapability(
    session: FounderSession,
    capability: FounderCapability
  ): boolean {
    if (!this.validateSession(session)) {
      return false;
    }
    return session.authorizedCapabilities.includes(capability);
  }
}

/**
 * Immutable access control configuration.
 */
export interface AccessControlConfig {
  readonly authorizedOwnerIds: readonly string[];
  readonly sessionTimeoutMinutes: number;
  readonly maxConcurrentSessions: number;
  readonly enableIpWhitelist: boolean;
  readonly enableAuditLog: boolean;
}

/**
 * Creates pre-configured access control instance.
 */
export function createSovereignAccessControl(
  config: AccessControlConfig
): SovereignAccessControl {
  return new SovereignAccessControl(config.authorizedOwnerIds);
}

/**
 * Audit log entry for access attempts.
 */
export interface AccessAuditEntry {
  readonly auditId: string;
  readonly timestamp: Date;
  readonly userId: string;
  readonly action: 'login' | 'logout' | 'access-denied' | 'capability-denied';
  readonly ipAddress: string;
  readonly userAgent: string;
  readonly details: string;
}

/**
 * Audit log manager for access control tracking.
 */
export class AccessAuditLog {
  private readonly entries: AccessAuditEntry[] = [];

  public logEntry(entry: Omit<AccessAuditEntry, 'auditId'>): void {
    this.entries.push({
      ...entry,
      auditId: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    });
  }

  public getEntries(limit: number = 100): readonly AccessAuditEntry[] {
    return [...this.entries].reverse().slice(0, limit);
  }

  public getEntriesByUser(userId: string): readonly AccessAuditEntry[] {
    return this.entries.filter(e => e.userId === userId);
  }
}
