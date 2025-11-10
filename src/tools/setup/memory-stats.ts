/**
 * Memory Statistics Tracker
 * Tracks and displays memory operations in real-time
 */

export interface MemoryOperation {
  action: "saved" | "updated" | "retrieved" | "deleted";
  type: string;
  id: string;
  size: number;
  timestamp: Date;
}

export class MemoryStats {
  private operations: MemoryOperation[] = [];
  private sessionStart: Date;

  constructor() {
    this.sessionStart = new Date();
  }

  /**
   * Track an operation
   */
  track(operation: MemoryOperation): void {
    this.operations.push(operation);
  }

  /**
   * Get grouped summary
   */
  getSummary(): string {
    const saved = this.operations.filter((op) => op.action === "saved");
    const updated = this.operations.filter((op) => op.action === "updated");
    const retrieved = this.operations.filter((op) => op.action === "retrieved");
    const deleted = this.operations.filter((op) => op.action === "deleted");

    const totalSize = this.operations.reduce((sum, op) => sum + op.size, 0);

    const lines: string[] = [];
    lines.push("");
    lines.push("📊 Memory Update:");

    if (saved.length > 0) {
      lines.push(
        `✅ Saved: ${saved.map((op) => `${op.type}/${op.id}.md`).join(", ")}`
      );
    }

    if (updated.length > 0) {
      lines.push(
        `📝 Updated: ${updated.map((op) => `${op.type}/${op.id}.md`).join(", ")}`
      );
    }

    if (retrieved.length > 0) {
      lines.push(`📖 Retrieved: ${retrieved.length} files`);
    }

    if (deleted.length > 0) {
      lines.push(
        `🗑️  Deleted: ${deleted.map((op) => `${op.type}/${op.id}.md`).join(", ")}`
      );
    }

    lines.push("");
    lines.push(`📈 Session Stats:`);
    lines.push(`   Total operations: ${this.operations.length}`);
    lines.push(`   Data processed: ${this.formatSize(totalSize)}`);
    lines.push(
      `   Duration: ${this.getDuration()}` 
    );
    lines.push("");

    return lines.join("\n");
  }

  /**
   * Format file size
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Get session duration
   */
  private getDuration(): string {
    const now = new Date();
    const diff = now.getTime() - this.sessionStart.getTime();
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Clear stats
   */
  clear(): void {
    this.operations = [];
    this.sessionStart = new Date();
  }
}
