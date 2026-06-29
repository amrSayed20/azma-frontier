/**
 * ════════════════════════════════════════════════════════════════════════════
 * WP-032-034: Temporal Execution Services
 * Implementation: Instant, Background, Scheduled, Long-running, Retry, etc.
 * ════════════════════════════════════════════════════════════════════════════
 */

import {
  ExecutionMode,
  ExecutionStatus,
  RetryStrategy,
  RecoveryMechanism,
  CancellationStrategy,
  TemporalExecutionConfig,
  ExecutionAttempt,
  ExecutionCheckpoint,
  TemporalExecutionHistory,
  ExecutionStatistics,
  TemporalExecutionRequest,
  TemporalExecutionResponse,
  ExecutionStatusCheckResponse,
  ExecutionCancellationRequest,
  ExecutionCancellationResponse,
  TemporalExecutionServiceContract
} from './wp-031-temporal-execution-types';

/**
 * Core temporal execution service implementing all execution modes
 */
class TemporalExecutionService implements TemporalExecutionServiceContract {
  private readonly executions = new Map<string, TemporalExecutionHistory>();
  private readonly scheduledQueue: Array<{ executionId: string; time: number }> = [];
  private readonly stats = new Map<string, ExecutionStatistics>();

  async executeInstant(request: TemporalExecutionRequest): Promise<TemporalExecutionResponse> {
    const executionId = `exec-instant-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const startTime = Date.now();

    const attempt: ExecutionAttempt = {
      attemptNumber: 1,
      startedAt: startTime,
      agentId: request.agentId,
      status: ExecutionStatus.RUNNING
    };

    try {
      // Simulate execution (would be actual decision logic)
      const result = JSON.parse(JSON.stringify(request.workload));
      const duration = Date.now() - startTime;

      const completedAttempt: ExecutionAttempt = {
        ...attempt,
        completedAt: Date.now(),
        duration_ms: duration,
        status: ExecutionStatus.COMPLETED,
        result
      };

      const history: TemporalExecutionHistory = {
        executionId,
        requestId: request.requestId,
        mode: ExecutionMode.INSTANT,
        initiatedAt: request.createdAt,
        startedAt: startTime,
        completedAt: Date.now(),
        totalDuration_ms: duration,
        status: ExecutionStatus.COMPLETED,
        attempts: [completedAttempt],
        checkpoints: [],
        finalResult: result,
        auditTrailId: `audit-${executionId}`
      };

      this.executions.set(executionId, history);
      this.recordStatistic(request.agentId, 'success');

      return {
        executionId,
        requestId: request.requestId,
        mode: ExecutionMode.INSTANT,
        immediateResult: result,
        status: ExecutionStatus.COMPLETED,
        createdAt: Date.now()
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const failedAttempt: ExecutionAttempt = {
        ...attempt,
        completedAt: Date.now(),
        duration_ms: duration,
        status: ExecutionStatus.FAILED,
        error: String(error),
        errorCode: 'INSTANT_EXEC_ERROR'
      };

      const history: TemporalExecutionHistory = {
        executionId,
        requestId: request.requestId,
        mode: ExecutionMode.INSTANT,
        initiatedAt: request.createdAt,
        startedAt: startTime,
        completedAt: Date.now(),
        totalDuration_ms: duration,
        status: ExecutionStatus.FAILED,
        attempts: [failedAttempt],
        checkpoints: [],
        finalError: String(error),
        auditTrailId: `audit-${executionId}`
      };

      this.executions.set(executionId, history);
      this.recordStatistic(request.agentId, 'failed');

      return {
        executionId,
        requestId: request.requestId,
        mode: ExecutionMode.INSTANT,
        status: ExecutionStatus.FAILED,
        createdAt: Date.now()
      };
    }
  }

  async executeBackground(request: TemporalExecutionRequest): Promise<TemporalExecutionResponse> {
    const executionId = `exec-bg-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const history: TemporalExecutionHistory = {
      executionId,
      requestId: request.requestId,
      mode: ExecutionMode.BACKGROUND,
      initiatedAt: request.createdAt,
      status: ExecutionStatus.QUEUED,
      attempts: [],
      checkpoints: [],
      auditTrailId: `audit-${executionId}`
    };

    this.executions.set(executionId, history);

    // Simulate async execution in background
    setTimeout(() => this.executeBackgroundJob(executionId, request), 100);

    return {
      executionId,
      requestId: request.requestId,
      mode: ExecutionMode.BACKGROUND,
      backgroundJobId: executionId,
      status: ExecutionStatus.QUEUED,
      createdAt: Date.now()
    };
  }

  async executeScheduled(request: TemporalExecutionRequest): Promise<TemporalExecutionResponse> {
    const executionId = `exec-sched-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const scheduledTime = request.config.scheduleConfig?.scheduledTime ?? Date.now() + 60000;

    const history: TemporalExecutionHistory = {
      executionId,
      requestId: request.requestId,
      mode: ExecutionMode.SCHEDULED,
      initiatedAt: request.createdAt,
      scheduledFor: scheduledTime,
      status: ExecutionStatus.SCHEDULED,
      attempts: [],
      checkpoints: [],
      auditTrailId: `audit-${executionId}`
    };

    this.executions.set(executionId, history);
    this.scheduledQueue.push({ executionId, time: scheduledTime });

    return {
      executionId,
      requestId: request.requestId,
      mode: ExecutionMode.SCHEDULED,
      scheduledTime,
      status: ExecutionStatus.SCHEDULED,
      createdAt: Date.now(),
      expectedCompletionTime: scheduledTime + 5000
    };
  }

  async executeLongRunning(request: TemporalExecutionRequest): Promise<TemporalExecutionResponse> {
    const executionId = `exec-lr-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const checkpointFrequency = request.config.checkpointFrequency ?? 5000;

    const history: TemporalExecutionHistory = {
      executionId,
      requestId: request.requestId,
      mode: ExecutionMode.LONG_RUNNING,
      initiatedAt: request.createdAt,
      startedAt: Date.now(),
      status: ExecutionStatus.RUNNING,
      attempts: [{
        attemptNumber: 1,
        startedAt: Date.now(),
        agentId: request.agentId,
        status: ExecutionStatus.RUNNING
      }],
      checkpoints: [],
      auditTrailId: `audit-${executionId}`
    };

    this.executions.set(executionId, history);

    // Simulate long-running execution with checkpoints
    setTimeout(() => this.executeLongRunningJob(executionId, request, checkpointFrequency), 100);

    return {
      executionId,
      requestId: request.requestId,
      mode: ExecutionMode.LONG_RUNNING,
      status: ExecutionStatus.RUNNING,
      createdAt: Date.now(),
      expectedCompletionTime: Date.now() + 30000
    };
  }

  async saveCheckpoint(
    executionId: string,
    checkpointName: string,
    state: Record<string, unknown>
  ): Promise<ExecutionCheckpoint> {
    const history = this.executions.get(executionId);
    if (!history) throw new Error(`Execution not found: ${executionId}`);

    const checkpoint: ExecutionCheckpoint = {
      checkpointId: `cp-${executionId}-${history.checkpoints.length + 1}`,
      checkpointName,
      sequence: history.checkpoints.length + 1,
      description: `Checkpoint: ${checkpointName}`,
      state,
      createdAt: Date.now(),
      duration_ms: Date.now() - (history.startedAt ?? Date.now()),
      dataSize: JSON.stringify(state).length,
      compressed: false
    };

    const updated: TemporalExecutionHistory = {
      ...history,
      checkpoints: [...history.checkpoints, checkpoint]
    };
    this.executions.set(executionId, updated);
    return checkpoint;
  }

  async resumeFromCheckpoint(
    executionId: string,
    checkpointId: string
  ): Promise<TemporalExecutionResponse> {
    const history = this.executions.get(executionId);
    if (!history) throw new Error(`Execution not found: ${executionId}`);

    const checkpoint = history.checkpoints.find(cp => cp.checkpointId === checkpointId);
    if (!checkpoint) throw new Error(`Checkpoint not found: ${checkpointId}`);

    const resumeId = `exec-resume-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newHistory: TemporalExecutionHistory = {
      ...history,
      executionId: resumeId,
      requestId: `${history.requestId}-resumed`,
      mode: ExecutionMode.RESUME,
      startedAt: Date.now(),
      status: ExecutionStatus.RESUMED,
      attempts: [
        ...history.attempts,
        {
          attemptNumber: history.attempts.length + 1,
          startedAt: Date.now(),
          agentId: history.attempts[0]?.agentId ?? 'unknown',
          status: ExecutionStatus.RUNNING
        }
      ]
    };

    this.executions.set(resumeId, newHistory);

    return {
      executionId: resumeId,
      requestId: newHistory.requestId,
      mode: ExecutionMode.RESUME,
      status: ExecutionStatus.RESUMED,
      createdAt: Date.now(),
      checkpointReached: checkpoint
    };
  }

  async retryExecution(
    executionId: string,
    strategy: RetryStrategy
  ): Promise<TemporalExecutionResponse> {
    const history = this.executions.get(executionId);
    if (!history) throw new Error(`Execution not found: ${executionId}`);
    if (history.status !== ExecutionStatus.FAILED) {
      throw new Error(`Cannot retry non-failed execution: ${executionId}`);
    }

    const lastAttempt = history.attempts[history.attempts.length - 1];
    const nextAttempt: ExecutionAttempt = {
      attemptNumber: history.attempts.length + 1,
      startedAt: Date.now(),
      agentId: lastAttempt?.agentId ?? 'unknown',
      status: ExecutionStatus.RUNNING
    };

    const delay = this.calculateRetryDelay(
      history.attempts.length,
      strategy,
      lastAttempt?.duration_ms ?? 1000
    );

    const updated: TemporalExecutionHistory = {
      ...history,
      status: ExecutionStatus.PAUSED,
      attempts: [...history.attempts, nextAttempt]
    };

    this.executions.set(executionId, updated);
    this.recordStatistic(lastAttempt?.agentId ?? 'unknown', 'retried');

    // Simulate retry after delay
    setTimeout(() => this.completeRetry(executionId), delay);

    return {
      executionId,
      requestId: history.requestId,
      mode: history.mode,
      status: ExecutionStatus.PAUSED,
      createdAt: Date.now(),
      expectedCompletionTime: Date.now() + delay + 5000
    };
  }

  async getExecutionStatus(executionId: string): Promise<ExecutionStatusCheckResponse> {
    const history = this.executions.get(executionId);
    if (!history) throw new Error(`Execution not found: ${executionId}`);

    const progress = this.calculateProgress(history);
    const lastAttempt = history.attempts[history.attempts.length - 1];

    return {
      executionId,
      status: history.status,
      progress,
      currentCheckpoint: history.checkpoints[history.checkpoints.length - 1],
      retriesUsed: history.attempts.length - 1,
      result: history.finalResult,
      error: history.finalError,
      lastUpdateAt: Date.now(),
      estimatedRemainingMs: progress < 100 ? (100 - progress) * 100 : 0
    };
  }

  async getExecutionHistory(executionId: string): Promise<TemporalExecutionHistory> {
    const history = this.executions.get(executionId);
    if (!history) throw new Error(`Execution not found: ${executionId}`);
    return history;
  }

  async cancelExecution(request: ExecutionCancellationRequest): Promise<ExecutionCancellationResponse> {
    const history = this.executions.get(request.executionId);
    if (!history) throw new Error(`Execution not found: ${request.executionId}`);

    const canResume = request.strategy !== CancellationStrategy.IMMEDIATE;
    const resumeCheckpoint = canResume ? history.checkpoints[history.checkpoints.length - 1] : undefined;

    const updated: TemporalExecutionHistory = {
      ...history,
      status: ExecutionStatus.CANCELLED,
      cancellationReason: request.reason,
      cancelledAt: Date.now()
    };

    this.executions.set(request.executionId, updated);
    this.recordStatistic(request.requestedByAgentId, 'cancelled');

    return {
      executionId: request.executionId,
      cancelled: true,
      actualStatus: ExecutionStatus.CANCELLED,
      cancelledAt: Date.now(),
      stateAtCancellation: history.checkpoints[history.checkpoints.length - 1]?.state ?? {},
      canResume,
      resumeCheckpointId: resumeCheckpoint?.checkpointId
    };
  }

  async initiateRecovery(
    executionId: string,
    mechanism: RecoveryMechanism
  ): Promise<TemporalExecutionResponse> {
    const history = this.executions.get(executionId);
    if (!history) throw new Error(`Execution not found: ${executionId}`);

    switch (mechanism) {
      case RecoveryMechanism.AUTOMATIC_RETRY:
        return this.retryExecution(executionId, RetryStrategy.EXPONENTIAL_BACKOFF);
      case RecoveryMechanism.CHECKPOINT_RESTORE: {
        const lastCheckpoint = history.checkpoints[history.checkpoints.length - 1];
        if (!lastCheckpoint) throw new Error('No checkpoint available for recovery');
        return this.resumeFromCheckpoint(executionId, lastCheckpoint.checkpointId);
      }
      case RecoveryMechanism.GRACEFUL_FALLBACK: {
        const updated: TemporalExecutionHistory = {
          ...history,
          status: ExecutionStatus.COMPLETED,
          finalResult: { fallback: true, originalError: history.finalError }
        };
        this.executions.set(executionId, updated);
        this.recordStatistic(history.attempts[0]?.agentId ?? 'unknown', 'recovered');
        return {
          executionId,
          requestId: history.requestId,
          mode: history.mode,
          status: ExecutionStatus.COMPLETED,
          createdAt: Date.now(),
          immediateResult: { fallback: true }
        };
      }
      default:
        throw new Error(`Unsupported recovery mechanism: ${mechanism}`);
    }
  }

  async getExecutionStatistics(agentId: string): Promise<ExecutionStatistics> {
    const stats = this.stats.get(agentId);
    if (!stats) {
      const newStats: ExecutionStatistics = {
        agentId,
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        retriedExecutions: 0,
        cancelledExecutions: 0,
        averageExecutionTimeMs: 0,
        totalExecutionTimeMs: 0,
        longestExecutionMs: 0,
        shortestExecutionMs: Infinity,
        timeoutCount: 0,
        recoveryCount: 0,
        checksumErrors: 0
      };
      this.stats.set(agentId, newStats);
      return newStats;
    }
    return stats;
  }

  // Private helper methods

  private async executeBackgroundJob(executionId: string, request: TemporalExecutionRequest): Promise<void> {
    const history = this.executions.get(executionId);
    if (!history) return;

    try {
      const result = JSON.parse(JSON.stringify(request.workload));
      const completed: TemporalExecutionHistory = {
        ...history,
        startedAt: Date.now() - 100,
        completedAt: Date.now(),
        totalDuration_ms: 100,
        status: ExecutionStatus.COMPLETED,
        finalResult: result,
        attempts: [{
          attemptNumber: 1,
          startedAt: Date.now() - 100,
          completedAt: Date.now(),
          duration_ms: 100,
          status: ExecutionStatus.COMPLETED,
          result,
          agentId: request.agentId
        }]
      };
      this.executions.set(executionId, completed);
      this.recordStatistic(request.agentId, 'success');
    } catch (error) {
      const failed: TemporalExecutionHistory = {
        ...history,
        startedAt: Date.now() - 100,
        completedAt: Date.now(),
        totalDuration_ms: 100,
        status: ExecutionStatus.FAILED,
        finalError: String(error),
        attempts: [{
          attemptNumber: 1,
          startedAt: Date.now() - 100,
          completedAt: Date.now(),
          duration_ms: 100,
          status: ExecutionStatus.FAILED,
          error: String(error),
          agentId: request.agentId
        }]
      };
      this.executions.set(executionId, failed);
      this.recordStatistic(request.agentId, 'failed');
    }
  }

  private async executeLongRunningJob(
    executionId: string,
    request: TemporalExecutionRequest,
    checkpointFrequency: number
  ): Promise<void> {
    let history = this.executions.get(executionId);
    if (!history) return;

    const steps = [
      { name: 'Step1', duration: checkpointFrequency },
      { name: 'Step2', duration: checkpointFrequency },
      { name: 'Step3', duration: checkpointFrequency }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.duration));

      const checkpoint = await this.saveCheckpoint(
        executionId,
        step.name,
        { step: step.name, completed: true }
      );

      history = this.executions.get(executionId);
      if (!history || history.status === ExecutionStatus.CANCELLED) break;
    }

    history = this.executions.get(executionId);
    if (history && history.status === ExecutionStatus.RUNNING) {
      const completed: TemporalExecutionHistory = {
        ...history,
        completedAt: Date.now(),
        totalDuration_ms: Date.now() - (history.startedAt ?? Date.now()),
        status: ExecutionStatus.COMPLETED,
        finalResult: JSON.parse(JSON.stringify(request.workload)),
        attempts: history.attempts.length > 0 ? [
          {
            ...history.attempts[0],
            completedAt: Date.now(),
            duration_ms: Date.now() - (history.startedAt ?? Date.now()),
            status: ExecutionStatus.COMPLETED,
            result: JSON.parse(JSON.stringify(request.workload))
          }
        ] : []
      };
      this.executions.set(executionId, completed);
    }
  }

  private calculateRetryDelay(attemptNumber: number, strategy: RetryStrategy, previousDuration: number): number {
    const baseDelay = 1000;
    switch (strategy) {
      case RetryStrategy.IMMEDIATE:
        return 0;
      case RetryStrategy.LINEAR_BACKOFF:
        return baseDelay * attemptNumber;
      case RetryStrategy.EXPONENTIAL_BACKOFF:
        return baseDelay * Math.pow(2, attemptNumber - 1);
      case RetryStrategy.FIBONACCI_BACKOFF: {
        const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34];
        const index = Math.min(attemptNumber - 1, fib.length - 1);
        return baseDelay * fib[index];
      }
      default:
        return baseDelay;
    }
  }

  private async completeRetry(executionId: string): Promise<void> {
    const history = this.executions.get(executionId);
    if (!history) return;

    const completed: TemporalExecutionHistory = {
      ...history,
      status: ExecutionStatus.COMPLETED,
      finalResult: { retried: true }
    };
    this.executions.set(executionId, completed);
  }

  private calculateProgress(history: TemporalExecutionHistory): number {
    if (history.status === ExecutionStatus.COMPLETED) return 100;
    if (history.status === ExecutionStatus.FAILED) return 0;
    return Math.min(history.checkpoints.length * 20, 90);
  }

  private recordStatistic(agentId: string, type: 'success' | 'failed' | 'retried' | 'cancelled' | 'recovered'): void {
    const stats = this.stats.get(agentId) ?? {
      agentId,
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      retriedExecutions: 0,
      cancelledExecutions: 0,
      averageExecutionTimeMs: 0,
      totalExecutionTimeMs: 0,
      longestExecutionMs: 0,
      shortestExecutionMs: Infinity,
      timeoutCount: 0,
      recoveryCount: 0,
      checksumErrors: 0
    };

    let updated: ExecutionStatistics;
    if (type === 'success') {
      updated = { ...stats, totalExecutions: stats.totalExecutions + 1, successfulExecutions: stats.successfulExecutions + 1 };
    } else if (type === 'failed') {
      updated = { ...stats, totalExecutions: stats.totalExecutions + 1, failedExecutions: stats.failedExecutions + 1 };
    } else if (type === 'retried') {
      updated = { ...stats, totalExecutions: stats.totalExecutions + 1, retriedExecutions: stats.retriedExecutions + 1 };
    } else if (type === 'cancelled') {
      updated = { ...stats, totalExecutions: stats.totalExecutions + 1, cancelledExecutions: stats.cancelledExecutions + 1 };
    } else {
      updated = { ...stats, totalExecutions: stats.totalExecutions + 1, recoveryCount: stats.recoveryCount + 1 };
    }

    this.stats.set(agentId, updated);
  }
}

/**
 * Create temporal execution service
 */
export function createTemporalExecutionService(): TemporalExecutionServiceContract {
  return new TemporalExecutionService();
}
