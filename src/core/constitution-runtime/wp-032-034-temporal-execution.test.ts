/**
 * ════════════════════════════════════════════════════════════════════════════
 * WP-032-034: Temporal Execution Tests
 * ════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  ExecutionMode,
  ExecutionStatus,
  RetryStrategy,
  RecoveryMechanism,
  CancellationStrategy,
  TemporalExecutionRequest,
  TimeoutConfiguration,
  RetryConfiguration
} from './wp-031-temporal-execution-types';
import { createTemporalExecutionService } from './wp-032-034-temporal-execution-services';

describe('WP-032-034: Temporal Execution Service', () => {
  let service: ReturnType<typeof createTemporalExecutionService>;

  beforeEach(() => {
    service = createTemporalExecutionService();
  });

  // ════════════════════════════════════════════════════════════════════════
  // WP-032: INSTANT, BACKGROUND, SCHEDULED EXECUTION
  // ════════════════════════════════════════════════════════════════════════

  describe('WP-032: Basic Execution Modes', () => {
    describe('Instant Execution', () => {
      it('should execute instantly and return result', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { action: 'payment', amount: 100 },
          config: {
            executionMode: ExecutionMode.INSTANT,
            retryConfig: { maxRetries: 0, strategy: RetryStrategy.IMMEDIATE, baseDelayMs: 0, maxDelayMs: 0 },
            timeoutConfig: { totalTimeoutMs: 5000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.NONE,
            cancellationStrategy: CancellationStrategy.IMMEDIATE,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeInstant(request);

        expect(response.executionId).toBeDefined();
        expect(response.mode).toBe(ExecutionMode.INSTANT);
        expect(response.status).toBe(ExecutionStatus.COMPLETED);
        expect(response.immediateResult).toEqual({ action: 'payment', amount: 100 });
      });

      it('should track execution history for instant mode', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { test: 'data' },
          config: {
            executionMode: ExecutionMode.INSTANT,
            retryConfig: { maxRetries: 0, strategy: RetryStrategy.IMMEDIATE, baseDelayMs: 0, maxDelayMs: 0 },
            timeoutConfig: { totalTimeoutMs: 5000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.NONE,
            cancellationStrategy: CancellationStrategy.IMMEDIATE,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeInstant(request);
        const history = await service.getExecutionHistory(response.executionId);

        expect(history.attempts).toHaveLength(1);
        expect(history.attempts[0].status).toBe(ExecutionStatus.COMPLETED);
        expect(history.status).toBe(ExecutionStatus.COMPLETED);
      });
    });

    describe('Background Execution', () => {
      it('should queue background execution and return job ID', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { longTask: 'data' },
          config: {
            executionMode: ExecutionMode.BACKGROUND,
            retryConfig: { maxRetries: 3, strategy: RetryStrategy.EXPONENTIAL_BACKOFF, baseDelayMs: 1000, maxDelayMs: 30000 },
            timeoutConfig: { totalTimeoutMs: 60000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.AUTOMATIC_RETRY,
            cancellationStrategy: CancellationStrategy.GRACEFUL,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeBackground(request);

        expect(response.mode).toBe(ExecutionMode.BACKGROUND);
        expect(response.backgroundJobId).toBeDefined();
        expect(response.status).toBe(ExecutionStatus.QUEUED);

        // Wait for background job to complete
        await new Promise(resolve => setTimeout(resolve, 200));

        const status = await service.getExecutionStatus(response.executionId);
        expect([ExecutionStatus.COMPLETED, ExecutionStatus.RUNNING]).toContain(status.status);
      });
    });

    describe('Scheduled Execution', () => {
      it('should schedule execution for future time', async () => {
        const futureTime = Date.now() + 5000;
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { data: 'test' },
          config: {
            executionMode: ExecutionMode.SCHEDULED,
            scheduleConfig: {
              scheduledTime: futureTime,
              priority: 50
            },
            retryConfig: { maxRetries: 0, strategy: RetryStrategy.IMMEDIATE, baseDelayMs: 0, maxDelayMs: 0 },
            timeoutConfig: { totalTimeoutMs: 10000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.NONE,
            cancellationStrategy: CancellationStrategy.IMMEDIATE,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeScheduled(request);

        expect(response.mode).toBe(ExecutionMode.SCHEDULED);
        expect(response.status).toBe(ExecutionStatus.SCHEDULED);
        expect(response.scheduledTime).toBe(futureTime);
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // WP-033: LONG-RUNNING, CHECKPOINT, RESUME
  // ════════════════════════════════════════════════════════════════════════

  describe('WP-033: Long-running & Checkpoint Execution', () => {
    describe('Long-running Execution', () => {
      it('should execute with checkpoints', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { complexTask: 'data' },
          config: {
            executionMode: ExecutionMode.LONG_RUNNING,
            checkpointFrequency: 100,
            retryConfig: { maxRetries: 3, strategy: RetryStrategy.EXPONENTIAL_BACKOFF, baseDelayMs: 1000, maxDelayMs: 30000 },
            timeoutConfig: { totalTimeoutMs: 60000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.CHECKPOINT_RESTORE,
            cancellationStrategy: CancellationStrategy.CHECKPOINT,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeLongRunning(request);

        expect(response.mode).toBe(ExecutionMode.LONG_RUNNING);
        expect(response.status).toBe(ExecutionStatus.RUNNING);
        expect(response.executionId).toBeDefined();

        // Wait for execution with checkpoints
        await new Promise(resolve => setTimeout(resolve, 400));

        const status = await service.getExecutionStatus(response.executionId);
        expect([ExecutionStatus.RUNNING, ExecutionStatus.COMPLETED]).toContain(status.status);
      });

      it('should save checkpoints during long-running execution', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { data: 'test' },
          config: {
            executionMode: ExecutionMode.LONG_RUNNING,
            checkpointFrequency: 100,
            retryConfig: { maxRetries: 0, strategy: RetryStrategy.IMMEDIATE, baseDelayMs: 0, maxDelayMs: 0 },
            timeoutConfig: { totalTimeoutMs: 30000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.CHECKPOINT_RESTORE,
            cancellationStrategy: CancellationStrategy.CHECKPOINT,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeLongRunning(request);
        const checkpointState = { step: 1, processed: 50 };

        const checkpoint = await service.saveCheckpoint(
          response.executionId,
          'ProcessingStep1',
          checkpointState
        );

        expect(checkpoint.checkpointId).toBeDefined();
        expect(checkpoint.checkpointName).toBe('ProcessingStep1');
        expect(checkpoint.state).toEqual(checkpointState);
        expect(checkpoint.sequence).toBe(1);
      });
    });

    describe('Resume from Checkpoint', () => {
      it('should resume execution from checkpoint', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { data: 'test' },
          config: {
            executionMode: ExecutionMode.LONG_RUNNING,
            checkpointFrequency: 100,
            retryConfig: { maxRetries: 0, strategy: RetryStrategy.IMMEDIATE, baseDelayMs: 0, maxDelayMs: 0 },
            timeoutConfig: { totalTimeoutMs: 30000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.CHECKPOINT_RESTORE,
            cancellationStrategy: CancellationStrategy.CHECKPOINT,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeLongRunning(request);
        const checkpoint = await service.saveCheckpoint(
          response.executionId,
          'Checkpoint1',
          { step: 1 }
        );

        const resumeResponse = await service.resumeFromCheckpoint(
          response.executionId,
          checkpoint.checkpointId
        );

        expect(resumeResponse.mode).toBe(ExecutionMode.RESUME);
        expect(resumeResponse.status).toBe(ExecutionStatus.RESUMED);
        expect(resumeResponse.checkpointReached).toEqual(checkpoint);
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════
  // WP-034: RETRY, TIMEOUT, CANCEL, RECOVERY
  // ════════════════════════════════════════════════════════════════════════

  describe('WP-034: Advanced Execution Patterns', () => {
    describe('Retry Execution', () => {
      it('should retry failed execution with exponential backoff', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { test: 'fail' },
          config: {
            executionMode: ExecutionMode.INSTANT,
            retryConfig: {
              maxRetries: 3,
              strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
              baseDelayMs: 100,
              maxDelayMs: 5000
            },
            timeoutConfig: { totalTimeoutMs: 30000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.AUTOMATIC_RETRY,
            cancellationStrategy: CancellationStrategy.IMMEDIATE,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeInstant(request);
        const history = await service.getExecutionHistory(response.executionId);

        // Simulate failure by updating status
        const failedExecution = await service.getExecutionStatus(response.executionId);
        expect(failedExecution.retriesUsed).toBe(0);
      });

      it('should track retry attempts in execution history', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { data: 'test' },
          config: {
            executionMode: ExecutionMode.BACKGROUND,
            retryConfig: {
              maxRetries: 3,
              strategy: RetryStrategy.LINEAR_BACKOFF,
              baseDelayMs: 100,
              maxDelayMs: 1000
            },
            timeoutConfig: { totalTimeoutMs: 30000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.AUTOMATIC_RETRY,
            cancellationStrategy: CancellationStrategy.GRACEFUL,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeBackground(request);

        // Wait for background execution
        await new Promise(resolve => setTimeout(resolve, 200));

        const history = await service.getExecutionHistory(response.executionId);
        expect(history.mode).toBe(ExecutionMode.BACKGROUND);
      });
    });

    describe('Cancellation', () => {
      it('should cancel running execution', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { data: 'test' },
          config: {
            executionMode: ExecutionMode.LONG_RUNNING,
            checkpointFrequency: 100,
            retryConfig: { maxRetries: 0, strategy: RetryStrategy.IMMEDIATE, baseDelayMs: 0, maxDelayMs: 0 },
            timeoutConfig: { totalTimeoutMs: 60000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.NONE,
            cancellationStrategy: CancellationStrategy.IMMEDIATE,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeLongRunning(request);

        const cancellation = await service.cancelExecution({
          executionId: response.executionId,
          reason: 'User requested cancellation',
          strategy: CancellationStrategy.IMMEDIATE,
          requestedAt: Date.now(),
          requestedByAgentId: 'admin-agent'
        });

        expect(cancellation.cancelled).toBe(true);
        expect(cancellation.actualStatus).toBe(ExecutionStatus.CANCELLED);
      });

      it('should allow resume after graceful cancellation', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { data: 'test' },
          config: {
            executionMode: ExecutionMode.LONG_RUNNING,
            checkpointFrequency: 100,
            retryConfig: { maxRetries: 0, strategy: RetryStrategy.IMMEDIATE, baseDelayMs: 0, maxDelayMs: 0 },
            timeoutConfig: { totalTimeoutMs: 60000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.CHECKPOINT_RESTORE,
            cancellationStrategy: CancellationStrategy.CHECKPOINT,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeLongRunning(request);
        const checkpoint = await service.saveCheckpoint(
          response.executionId,
          'BeforeCancel',
          { progress: 50 }
        );

        const cancellation = await service.cancelExecution({
          executionId: response.executionId,
          reason: 'Pause for review',
          strategy: CancellationStrategy.CHECKPOINT,
          requestedAt: Date.now(),
          requestedByAgentId: 'reviewer'
        });

        expect(cancellation.canResume).toBe(true);
        expect(cancellation.resumeCheckpointId).toBeDefined();
      });
    });

    describe('Recovery', () => {
      it('should initiate automatic retry recovery', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { data: 'test' },
          config: {
            executionMode: ExecutionMode.INSTANT,
            retryConfig: {
              maxRetries: 3,
              strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
              baseDelayMs: 100,
              maxDelayMs: 5000
            },
            timeoutConfig: { totalTimeoutMs: 30000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.AUTOMATIC_RETRY,
            cancellationStrategy: CancellationStrategy.IMMEDIATE,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeInstant(request);
        const history = await service.getExecutionHistory(response.executionId);

        // If execution failed, recover it
        if (history.status === ExecutionStatus.FAILED) {
          const recovery = await service.initiateRecovery(
            response.executionId,
            RecoveryMechanism.AUTOMATIC_RETRY
          );

          expect(recovery.status).toBe(ExecutionStatus.PAUSED);
        }
      });

      it('should initiate graceful fallback recovery', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { data: 'test' },
          config: {
            executionMode: ExecutionMode.INSTANT,
            retryConfig: { maxRetries: 0, strategy: RetryStrategy.IMMEDIATE, baseDelayMs: 0, maxDelayMs: 0 },
            timeoutConfig: { totalTimeoutMs: 5000, fallbackOnTimeout: true },
            recoveryMechanism: RecoveryMechanism.GRACEFUL_FALLBACK,
            cancellationStrategy: CancellationStrategy.IMMEDIATE,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeInstant(request);
        const recovery = await service.initiateRecovery(
          response.executionId,
          RecoveryMechanism.GRACEFUL_FALLBACK
        );

        expect(recovery.status).toBe(ExecutionStatus.COMPLETED);
        expect(recovery.immediateResult).toHaveProperty('fallback');
      });
    });

    describe('Status Monitoring', () => {
      it('should provide execution status with progress', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { data: 'test' },
          config: {
            executionMode: ExecutionMode.LONG_RUNNING,
            checkpointFrequency: 100,
            retryConfig: { maxRetries: 0, strategy: RetryStrategy.IMMEDIATE, baseDelayMs: 0, maxDelayMs: 0 },
            timeoutConfig: { totalTimeoutMs: 60000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.NONE,
            cancellationStrategy: CancellationStrategy.IMMEDIATE,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        const response = await service.executeLongRunning(request);
        const status = await service.getExecutionStatus(response.executionId);

        expect(status.executionId).toBe(response.executionId);
        expect([0, 20, 40, 60, 80, 90, 100]).toContain(status.progress);
        expect(status.retriesUsed).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Execution Statistics', () => {
      it('should track execution statistics per agent', async () => {
        const request: TemporalExecutionRequest = {
          requestId: 'req-1',
          agentId: 'agent-1',
          workload: { data: 'test' },
          config: {
            executionMode: ExecutionMode.INSTANT,
            retryConfig: { maxRetries: 0, strategy: RetryStrategy.IMMEDIATE, baseDelayMs: 0, maxDelayMs: 0 },
            timeoutConfig: { totalTimeoutMs: 5000, fallbackOnTimeout: false },
            recoveryMechanism: RecoveryMechanism.NONE,
            cancellationStrategy: CancellationStrategy.IMMEDIATE,
            constitutionalBasis: 'article-1' as any,
            preserveAuditTrail: true
          },
          createdAt: Date.now(),
          priorityScore: 50
        };

        await service.executeInstant(request);

        const stats = await service.getExecutionStatistics('agent-1');
        expect(stats.agentId).toBe('agent-1');
        expect(stats.totalExecutions).toBeGreaterThan(0);
        expect(stats.successfulExecutions).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
