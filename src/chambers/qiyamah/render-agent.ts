/**
 * AZMA OS – Qiyamah Chamber
 * File: render-agent.ts
 *
 * Render Agent
 * Responsible for managing sovereign generation execution
 * and tracking render lifecycle states.
 */

export type RenderStatus =
  | 'idle'
  | 'queued'
  | 'rendering'
  | 'completed'
  | 'failed';

export interface RenderSession {
  readonly id: string;
  readonly status: RenderStatus;
  readonly startedAt: Date;
  readonly completedAt: Date | null;
}

export class RenderAgent {
  /**
   * Starts a new render session.
   */
  public startRender(sessionId: string): RenderSession {
    return {
      id: sessionId,
      status: 'rendering',
      startedAt: new Date(),
      completedAt: null,
    };
  }

  /**
   * Marks a render session as completed.
   */
  public completeRender(session: RenderSession): RenderSession {
    return {
      ...session,
      status: 'completed',
      completedAt: new Date(),
    };
  }

  /**
   * Marks a render session as failed.
   */
  public failRender(session: RenderSession): RenderSession {
    return {
      ...session,
      status: 'failed',
      completedAt: new Date(),
    };
  }

  /**
   * Determines whether rendering is active.
   */
  public isRendering(session: RenderSession): boolean {
    return session.status === 'rendering';
  }
}
