/**
 * ════════════════════════════════════════════════════════════════════════════
 * WP-041: RUNTIME SECURITY FRAMEWORK — TYPES & SERVICES
 *
 * Constitutional security enforcement, integrity verification,
 * unauthorized operation detection, tamper detection, and audit logging.
 * ════════════════════════════════════════════════════════════════════════════
 */

import { ConstitutionArticleId } from './constitution-types';

// ════════════════════════════════════════════════════════════════════════════
// 1. SECURITY TYPES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Security event types
 */
export enum SecurityEventType {
  UNAUTHORIZED_OPERATION = 'UNAUTHORIZED_OPERATION',
  AUTHORITY_VIOLATION = 'AUTHORITY_VIOLATION',
  INTEGRITY_FAILURE = 'INTEGRITY_FAILURE',
  TAMPER_DETECTED = 'TAMPER_DETECTED',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  AUDIT_FAILURE = 'AUDIT_FAILURE',
  OPERATION_BLOCKED = 'OPERATION_BLOCKED',
  ESCALATION_REQUIRED = 'ESCALATION_REQUIRED',
}

/**
 * Security severity levels
 */
export enum SecuritySeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

/**
 * Security event record
 */
export interface SecurityEvent {
  readonly eventId: string;
  readonly timestamp: number;
  readonly eventType: SecurityEventType;
  readonly severity: SecuritySeverity;
  readonly agentId?: string;
  readonly operation: string;
  readonly details: string;
  readonly constitutionalBasis?: ConstitutionArticleId;
  readonly blocked: boolean;
  readonly remediation?: string;
}

/**
 * Authorization check result
 */
export interface AuthorizationCheck {
  readonly authorized: boolean;
  readonly agentId: string;
  readonly operation: string;
  readonly reason?: string;
  readonly constitutionalBasis: ConstitutionArticleId[];
  readonly requiredArticles: ConstitutionArticleId[];
  readonly checks: Map<string, boolean>;
}

/**
 * Integrity verification result
 */
export interface IntegrityVerification {
  readonly verified: boolean;
  readonly timestamp: number;
  readonly checksumValid: boolean;
  readonly stateValid: boolean;
  readonly contractsValid: boolean;
  readonly dependenciesValid: boolean;
  readonly violations: string[];
  readonly lastVerifiedAt: number;
}

/**
 * Tamper detection result
 */
export interface TamperDetectionResult {
  readonly tamperDetected: boolean;
  readonly timestamp: number;
  readonly suspiciousActivity: string[];
  readonly unauthorizedModifications: string[];
  readonly inconsistencies: string[];
  readonly integrityScore: number; // 0-100
}

/**
 * Security audit trail entry
 */
export interface SecurityAuditEntry {
  readonly entryId: string;
  readonly timestamp: number;
  readonly agentId: string;
  readonly operation: string;
  readonly authorized: boolean;
  readonly constitutionalBasis: ConstitutionArticleId[];
  readonly result: 'ALLOWED' | 'BLOCKED' | 'ESCALATED';
  readonly details: string;
}

/**
 * Security policy configuration
 */
export interface SecurityPolicy {
  readonly policyId: string;
  readonly name: string;
  readonly description: string;
  readonly rules: Map<string, string>;
  readonly enabled: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
}

// ════════════════════════════════════════════════════════════════════════════
// 2. SECURITY SERVICE CONTRACT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Runtime security service contract
 */
export interface RuntimeSecurityServiceContract {
  /**
   * Check if agent is authorized for operation
   */
  checkAuthorization(
    agentId: string,
    operation: string,
    context: Map<string, any>
  ): Promise<AuthorizationCheck>;

  /**
   * Enforce constitutional security on operation
   */
  enforceConstitutionalSecurity(
    agentId: string,
    operation: string,
    context: Map<string, any>
  ): Promise<boolean>;

  /**
   * Verify runtime integrity
   */
  verifyRuntimeIntegrity(): Promise<IntegrityVerification>;

  /**
   * Detect tampering or unauthorized modifications
   */
  detectTamper(): Promise<TamperDetectionResult>;

  /**
   * Record security event
   */
  recordSecurityEvent(event: SecurityEvent): Promise<void>;

  /**
   * Get security event log
   */
  getSecurityEventLog(
    startTime?: number,
    endTime?: number
  ): Promise<SecurityEvent[]>;

  /**
   * Get security audit trail
   */
  getSecurityAuditTrail(
    agentId?: string,
    startTime?: number,
    endTime?: number
  ): Promise<SecurityAuditEntry[]>;

  /**
   * Block unauthorized operation
   */
  blockUnauthorizedOperation(
    agentId: string,
    operation: string,
    reason: string
  ): Promise<SecurityEvent>;

  /**
   * Escalate security concern
   */
  escalateSecurityConcern(
    severity: SecuritySeverity,
    details: string
  ): Promise<string>;

  /**
   * Get current security status
   */
  getSecurityStatus(): Promise<{
    overallStatus: 'SECURE' | 'COMPROMISED' | 'UNKNOWN';
    eventCount: number;
    blockedOperations: number;
    lastIncident?: SecurityEvent;
  }>;

  /**
   * Create security policy
   */
  createSecurityPolicy(policy: SecurityPolicy): Promise<void>;

  /**
   * Apply security policy
   */
  applySecurityPolicy(policyId: string): Promise<void>;
}

// ════════════════════════════════════════════════════════════════════════════
// 3. SECURITY SERVICE IMPLEMENTATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Runtime security service implementation
 */
export class RuntimeSecurityService implements RuntimeSecurityServiceContract {
  private securityEvents: SecurityEvent[] = [];
  private auditTrail: SecurityAuditEntry[] = [];
  private policies: Map<string, SecurityPolicy> = new Map();
  private blockedOperations: Set<string> = new Set();

  /**
   * Check if agent is authorized for operation
   */
  async checkAuthorization(
    agentId: string,
    operation: string,
    context: Map<string, any>
  ): Promise<AuthorizationCheck> {
    // Simulate authorization check
    const requiredArticles: ConstitutionArticleId[] = [
      'ARTICLE_1' as ConstitutionArticleId,
    ];
    const checks = new Map<string, boolean>([
      ['identity_verified', true],
      ['role_check', true],
      ['operation_allowed', true],
    ]);

    return {
      authorized: true,
      agentId,
      operation,
      constitutionalBasis: requiredArticles,
      requiredArticles,
      checks,
    };
  }

  /**
   * Enforce constitutional security on operation
   */
  async enforceConstitutionalSecurity(
    agentId: string,
    operation: string,
    context: Map<string, any>
  ): Promise<boolean> {
    const check = await this.checkAuthorization(agentId, operation, context);

    if (!check.authorized) {
      const event: SecurityEvent = {
        eventId: `sec-${Date.now()}`,
        timestamp: Date.now(),
        eventType: SecurityEventType.UNAUTHORIZED_OPERATION,
        severity: SecuritySeverity.CRITICAL,
        agentId,
        operation,
        details: `Unauthorized operation blocked: ${operation}`,
        constitutionalBasis: check.requiredArticles[0],
        blocked: true,
      };

      await this.recordSecurityEvent(event);
      return false;
    }

    return true;
  }

  /**
   * Verify runtime integrity
   */
  async verifyRuntimeIntegrity(): Promise<IntegrityVerification> {
    // Simulate integrity check
    return {
      verified: true,
      timestamp: Date.now(),
      checksumValid: true,
      stateValid: true,
      contractsValid: true,
      dependenciesValid: true,
      violations: [],
      lastVerifiedAt: Date.now(),
    };
  }

  /**
   * Detect tampering or unauthorized modifications
   */
  async detectTamper(): Promise<TamperDetectionResult> {
    // Simulate tamper detection
    return {
      tamperDetected: false,
      timestamp: Date.now(),
      suspiciousActivity: [],
      unauthorizedModifications: [],
      inconsistencies: [],
      integrityScore: 100,
    };
  }

  /**
   * Record security event
   */
  async recordSecurityEvent(event: SecurityEvent): Promise<void> {
    this.securityEvents.push(event);

    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents.shift();
    }
  }

  /**
   * Get security event log
   */
  async getSecurityEventLog(
    startTime?: number,
    endTime?: number
  ): Promise<SecurityEvent[]> {
    const now = Date.now();
    const start = startTime || now - 86400000; // Last 24 hours
    const end = endTime || now;

    return this.securityEvents.filter(
      (e) => e.timestamp >= start && e.timestamp <= end
    );
  }

  /**
   * Get security audit trail
   */
  async getSecurityAuditTrail(
    agentId?: string,
    startTime?: number,
    endTime?: number
  ): Promise<SecurityAuditEntry[]> {
    const now = Date.now();
    const start = startTime || now - 86400000;
    const end = endTime || now;

    return this.auditTrail.filter((e) => {
      const timeMatch = e.timestamp >= start && e.timestamp <= end;
      const agentMatch = !agentId || e.agentId === agentId;
      return timeMatch && agentMatch;
    });
  }

  /**
   * Block unauthorized operation
   */
  async blockUnauthorizedOperation(
    agentId: string,
    operation: string,
    reason: string
  ): Promise<SecurityEvent> {
    const event: SecurityEvent = {
      eventId: `blocked-${Date.now()}`,
      timestamp: Date.now(),
      eventType: SecurityEventType.OPERATION_BLOCKED,
      severity: SecuritySeverity.CRITICAL,
      agentId,
      operation,
      details: reason,
      blocked: true,
    };

    await this.recordSecurityEvent(event);
    this.blockedOperations.add(`${agentId}:${operation}`);

    return event;
  }

  /**
   * Escalate security concern
   */
  async escalateSecurityConcern(
    severity: SecuritySeverity,
    details: string
  ): Promise<string> {
    const escalationId = `escalation-${Date.now()}`;

    const event: SecurityEvent = {
      eventId: escalationId,
      timestamp: Date.now(),
      eventType: SecurityEventType.ESCALATION_REQUIRED,
      severity,
      operation: 'ESCALATION',
      details,
      blocked: false,
    };

    await this.recordSecurityEvent(event);
    return escalationId;
  }

  /**
   * Get current security status
   */
  async getSecurityStatus(): Promise<{
    overallStatus: 'SECURE' | 'COMPROMISED' | 'UNKNOWN';
    eventCount: number;
    blockedOperations: number;
    lastIncident?: SecurityEvent;
  }> {
    const criticalEvents = this.securityEvents.filter(
      (e) => e.severity === SecuritySeverity.CRITICAL
    );

    return {
      overallStatus:
        criticalEvents.length === 0 ? 'SECURE' : 'COMPROMISED',
      eventCount: this.securityEvents.length,
      blockedOperations: this.blockedOperations.size,
      lastIncident:
        this.securityEvents.length > 0
          ? this.securityEvents[this.securityEvents.length - 1]
          : undefined,
    };
  }

  /**
   * Create security policy
   */
  async createSecurityPolicy(policy: SecurityPolicy): Promise<void> {
    this.policies.set(policy.policyId, policy);
  }

  /**
   * Apply security policy
   */
  async applySecurityPolicy(policyId: string): Promise<void> {
    const policy = this.policies.get(policyId);
    if (policy) {
      (policy as any).applied = true;
    }
  }
}

/**
 * Factory function to create runtime security service
 */
export function createRuntimeSecurityService(): RuntimeSecurityServiceContract {
  return new RuntimeSecurityService();
}
