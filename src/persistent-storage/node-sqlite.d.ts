/**
 * AZMA OS — PERSISTENT STORAGE FOUNDATION
 * Minimal ambient type declaration for Node's built-in `node:sqlite`
 * module, scoped to exactly what this module uses. The installed
 * @types/node version predates this module's type definitions — this
 * avoids bumping a shared, repository-wide dependency for one internal
 * detail.
 */

declare module 'node:sqlite' {
  export class StatementSync {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: unknown[]): Record<string, unknown> | undefined;
    all(...params: unknown[]): Record<string, unknown>[];
  }

  export class DatabaseSync {
    constructor(path: string, options?: { open?: boolean });
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    close(): void;
  }
}
