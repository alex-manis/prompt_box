/**
 * Centralized error handling and logging system
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  STORAGE = 'storage',
  NETWORK = 'network',
  VALIDATION = 'validation',
  RUNTIME = 'runtime',
  UNKNOWN = 'unknown',
}

export interface ErrorContext {
  userId?: string;
  action?: string;
  component?: string;
  metadata?: Record<string, unknown>;
}

export interface LoggedError {
  message: string;
  error: Error;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: ErrorContext;
  timestamp: number;
  stack?: string;
}

class ErrorHandler {
  private errorLog: LoggedError[] = [];
  private maxLogSize = 100; // Keep last 100 errors in memory

  /**
   * Logs an error with context and severity
   */
  logError(
    error: Error | unknown,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    context?: ErrorContext
  ): void {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    const loggedError: LoggedError = {
      message: errorObj.message,
      error: errorObj,
      severity,
      category,
      context,
      timestamp: Date.now(),
      stack: errorObj.stack,
    };

    // Add to in-memory log
    this.errorLog.push(loggedError);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift(); // Remove oldest
    }

    // Console logging based on severity
    this.consoleLog(loggedError);

    // In production, you could send to error tracking service (Sentry, LogRocket, etc.)
    if (import.meta.env.PROD) {
      this.sendToErrorService(loggedError);
    }
  }

  /**
   * Console logging with appropriate level
   */
  private consoleLog(loggedError: LoggedError): void {
    const { message, error, severity, category, context, stack } = loggedError;
    const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
    const categoryStr = `[${category.toUpperCase()}]`;

    switch (severity) {
      case ErrorSeverity.CRITICAL:
        console.error(`🚨 CRITICAL ${categoryStr}`, message, contextStr, error, stack);
        break;
      case ErrorSeverity.HIGH:
        console.error(`❌ HIGH ${categoryStr}`, message, contextStr, error);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(`⚠️ MEDIUM ${categoryStr}`, message, contextStr, error);
        break;
      case ErrorSeverity.LOW:
        console.info(`ℹ️ LOW ${categoryStr}`, message, contextStr);
        break;
    }
  }

  /**
   * Send error to external error tracking service
   * TODO: Integrate with Sentry, LogRocket, or similar
   */
  private sendToErrorService(_loggedError: LoggedError): void {
    // Example integration:
    // if (window.Sentry) {
    //   window.Sentry.captureException(loggedError.error, {
    //     level: loggedError.severity,
    //     tags: { category: loggedError.category },
    //     extra: loggedError.context,
    //   });
    // }
  }

  /**
   * Get recent error log
   */
  getErrorLog(limit?: number): LoggedError[] {
    if (limit) {
      return this.errorLog.slice(-limit);
    }
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Handle storage errors
   */
  handleStorageError(error: unknown, operation: string, context?: ErrorContext): void {
    let severity = ErrorSeverity.MEDIUM;
    let category = ErrorCategory.STORAGE;

    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        severity = ErrorSeverity.HIGH;
      } else if (error.name === 'SecurityError') {
        severity = ErrorSeverity.CRITICAL;
      }
    }

    this.logError(error, severity, category, {
      ...context,
      action: operation,
    });
  }

  /**
   * Handle validation errors
   */
  handleValidationError(error: unknown, field?: string, context?: ErrorContext): void {
    this.logError(error, ErrorSeverity.LOW, ErrorCategory.VALIDATION, {
      ...context,
      metadata: { field },
    });
  }

  /**
   * Handle import/export errors
   */
  handleImportExportError(error: unknown, operation: 'import' | 'export', context?: ErrorContext): void {
    this.logError(error, ErrorSeverity.MEDIUM, ErrorCategory.VALIDATION, {
      ...context,
      action: operation,
    });
  }

  /**
   * Handle runtime errors
   */
  handleRuntimeError(error: unknown, component?: string, context?: ErrorContext): void {
    this.logError(error, ErrorSeverity.HIGH, ErrorCategory.RUNTIME, {
      ...context,
      component,
    });
  }
}

// Singleton instance
export const errorHandler = new ErrorHandler();

/**
 * Convenience functions for common error scenarios
 */
export const logError = (
  error: Error | unknown,
  severity?: ErrorSeverity,
  category?: ErrorCategory,
  context?: ErrorContext
) => errorHandler.logError(error, severity, category, context);

export const handleStorageError = (error: unknown, operation: string, context?: ErrorContext) =>
  errorHandler.handleStorageError(error, operation, context);

export const handleValidationError = (error: unknown, field?: string, context?: ErrorContext) =>
  errorHandler.handleValidationError(error, field, context);

export const handleImportExportError = (error: unknown, operation: 'import' | 'export', context?: ErrorContext) =>
  errorHandler.handleImportExportError(error, operation, context);

export const handleRuntimeError = (error: unknown, component?: string, context?: ErrorContext) =>
  errorHandler.handleRuntimeError(error, component, context);
