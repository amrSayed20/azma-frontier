/**
 * Structured runtime logger abstraction.
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface RuntimeLogger {
  debug(source: string, message: string, context?: Readonly<Record<string, unknown>>): void;
  info(source: string, message: string, context?: Readonly<Record<string, unknown>>): void;
  warn(source: string, message: string, context?: Readonly<Record<string, unknown>>): void;
  error(source: string, message: string, context?: Readonly<Record<string, unknown>>): void;
}

export class ConsoleRuntimeLogger implements RuntimeLogger {
  public debug(source: string, message: string, context: Readonly<Record<string, unknown>> = {}): void {
    this.log(LogLevel.DEBUG, source, message, context);
  }

  public info(source: string, message: string, context: Readonly<Record<string, unknown>> = {}): void {
    this.log(LogLevel.INFO, source, message, context);
  }

  public warn(source: string, message: string, context: Readonly<Record<string, unknown>> = {}): void {
    this.log(LogLevel.WARN, source, message, context);
  }

  public error(source: string, message: string, context: Readonly<Record<string, unknown>> = {}): void {
    this.log(LogLevel.ERROR, source, message, context);
  }

  private log(
    level: LogLevel,
    source: string,
    message: string,
    context: Readonly<Record<string, unknown>>
  ): void {
    const stamp = new Date().toISOString();
    console.log(`[${stamp}] ${level} ${source}: ${message}`, context);
  }
}
