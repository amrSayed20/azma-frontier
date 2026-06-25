/**
 * AZMA OS – Al-Wateen Assistant
 * File: logger.ts
 *
 * Structured logging for Al-Wateen operations.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  CRITICAL = 4
}

export interface LogEntry {
  readonly timestamp: number;
  readonly level: LogLevel;
  readonly source: string;
  readonly message: string;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly error?: Error;
}

export interface ILogger {
  debug(source: string, message: string, data?: Readonly<Record<string, unknown>>): void;
  info(source: string, message: string, data?: Readonly<Record<string, unknown>>): void;
  warn(source: string, message: string, data?: Readonly<Record<string, unknown>>): void;
  error(source: string, message: string, error?: Error, data?: Readonly<Record<string, unknown>>): void;
  critical(source: string, message: string, error?: Error, data?: Readonly<Record<string, unknown>>): void;
}

export class Logger implements ILogger {
  private static readonly minLogLevel = LogLevel.INFO;

  public debug(
    source: string,
    message: string,
    data?: Readonly<Record<string, unknown>>
  ): void {
    this.log(LogLevel.DEBUG, source, message, undefined, data);
  }

  public info(
    source: string,
    message: string,
    data?: Readonly<Record<string, unknown>>
  ): void {
    this.log(LogLevel.INFO, source, message, undefined, data);
  }

  public warn(
    source: string,
    message: string,
    data?: Readonly<Record<string, unknown>>
  ): void {
    this.log(LogLevel.WARN, source, message, undefined, data);
  }

  public error(
    source: string,
    message: string,
    error?: Error,
    data?: Readonly<Record<string, unknown>>
  ): void {
    this.log(LogLevel.ERROR, source, message, error, data);
  }

  public critical(
    source: string,
    message: string,
    error?: Error,
    data?: Readonly<Record<string, unknown>>
  ): void {
    this.log(LogLevel.CRITICAL, source, message, error, data);
  }

  private log(
    level: LogLevel,
    source: string,
    message: string,
    error?: Error,
    data?: Readonly<Record<string, unknown>>
  ): void {
    if (level < Logger.minLogLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      source,
      message,
      data,
      error
    };

    this.output(entry);
  }

  private output(entry: LogEntry): void {
    const levelName = LogLevel[entry.level];
    const timestamp = new Date(entry.timestamp).toISOString();

    if (entry.error) {
      console.log(
        `[${timestamp}] ${levelName} [${entry.source}] ${entry.message}`,
        entry.error,
        entry.data ?? {}
      );
    } else {
      console.log(
        `[${timestamp}] ${levelName} [${entry.source}] ${entry.message}`,
        entry.data ?? {}
      );
    }
  }
}
