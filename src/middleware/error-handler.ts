/**
 * Error Handler Middleware
 * Centralised error tracking and reporting for FRIDAY tools
 * Based on best practices from NodeKit and Node.js Backend Architecture
 */

export interface ErrorRecord {
  toolName: string;
  error: Error;
  timestamp: Date;
  context?: Record<string, unknown>;
}

export class ErrorHandler {
  private errorLog: ErrorRecord[] = [];
  private failureCount: Map<string, number> = new Map();
  private maxLogSize = 100;

  /**
   * Log an error with context
   */
  logError(toolName: string, error: Error, context?: Record<string, unknown>): void {
    const record: ErrorRecord = {
      toolName,
      error,
      timestamp: new Date(),
      context,
    };

    this.errorLog.push(record);

    // Keep log size bounded
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Track failure count
    const count = this.failureCount.get(toolName) || 0;
    this.failureCount.set(toolName, count + 1);

    // Log to stderr for monitoring
    console.error(`[FRIDAY Error] ${toolName}:`, error.message);
    if (context) {
      console.error('[Context]', JSON.stringify(context, null, 2));
    }
  }

  /**
   * Get failure statistics per tool
   */
  getFailureStats(): Map<string, number> {
    return new Map(this.failureCount);
  }

  /**
   * Get recent errors (last N)
   */
  getRecentErrors(limit = 10): ErrorRecord[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Generate error report
   */
  generateReport(): string {
    const report: string[] = [];
    
    report.push("🔴 FRIDAY Error Report");
    report.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    report.push("");

    if (this.errorLog.length === 0) {
      report.push("✅ No errors recorded");
      return report.join("\n");
    }

    report.push(`Total Errors: ${this.errorLog.length}`);
    report.push("");

    report.push("📊 Failure Count by Tool:");
    const sorted = Array.from(this.failureCount.entries())
      .sort((a, b) => b[1] - a[1]);
    
    sorted.forEach(([tool, count]) => {
      report.push(`   ${tool}: ${count} failure(s)`);
    });

    report.push("");
    report.push("📝 Recent Errors (last 5):");
    const recent = this.getRecentErrors(5);
    
    recent.forEach((record, idx) => {
      report.push(`   ${idx + 1}. [${record.toolName}] at ${record.timestamp.toISOString()}`);
      report.push(`      Error: ${record.error.message}`);
      if (record.context) {
        report.push(`      Context: ${JSON.stringify(record.context)}`);
      }
    });

    return report.join("\n");
  }

  /**
   * Clear error log
   */
  clear(): void {
    this.errorLog = [];
    this.failureCount.clear();
  }
}

// Singleton instance
export const errorHandler = new ErrorHandler();
