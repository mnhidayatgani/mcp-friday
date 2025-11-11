/**
 * Setup Orchestrator
 * Intelligent workflow optimization for conflict-free setup
 */

import { HybridMemoryManager } from "../../memory/hybrid-manager.js";
import { ConfigLoader } from "../../utils/config-loader.js";

export interface SetupPhase {
  name: string;
  description: string;
  priority: number;
  dependencies: string[];
  execute: () => Promise<PhaseResult>;
}

export interface PhaseResult {
  success: boolean;
  output: string[];
  errors: string[];
  data?: any;
}

export interface OrchestrationResult {
  phases: Map<string, PhaseResult>;
  totalDuration: number;
  success: boolean;
}

export class SetupOrchestrator {
  private phases: Map<string, SetupPhase> = new Map();
  private executedPhases: Set<string> = new Set();
  private phaseData: Map<string, any> = new Map();

  /**
   * Register a setup phase
   */
  registerPhase(phase: SetupPhase): void {
    this.phases.set(phase.name, phase);
  }

  /**
   * Execute all phases in optimal order
   */
  async execute(): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const result: OrchestrationResult = {
      phases: new Map(),
      totalDuration: 0,
      success: true,
    };

    try {
      // Sort phases by priority and dependencies
      const orderedPhases = this.resolveDependencies();

      // Execute phases sequentially
      for (const phaseName of orderedPhases) {
        const phase = this.phases.get(phaseName);
        if (!phase) continue;

        try {
          const phaseResult = await phase.execute();
          result.phases.set(phaseName, phaseResult);

          // Store phase data for dependent phases
          if (phaseResult.data) {
            this.phaseData.set(phaseName, phaseResult.data);
          }

          this.executedPhases.add(phaseName);

          if (!phaseResult.success) {
            result.success = false;
            // Continue with non-critical phases
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          result.phases.set(phaseName, {
            success: false,
            output: [],
            errors: [errorMsg],
          });
          result.success = false;
        }
      }
    } catch (error) {
      result.success = false;
    }

    result.totalDuration = Date.now() - startTime;
    return result;
  }

  /**
   * Resolve phase dependencies and return execution order
   */
  private resolveDependencies(): string[] {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const temp = new Set<string>();

    const visit = (name: string) => {
      if (temp.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }
      if (visited.has(name)) return;

      temp.add(name);
      const phase = this.phases.get(name);
      
      if (phase) {
        for (const dep of phase.dependencies) {
          if (this.phases.has(dep)) {
            visit(dep);
          }
        }
      }

      temp.delete(name);
      visited.add(name);
      sorted.push(name);
    };

    // Sort by priority first
    const phasesByPriority = Array.from(this.phases.entries())
      .sort((a, b) => a[1].priority - b[1].priority);

    for (const [name] of phasesByPriority) {
      if (!visited.has(name)) {
        visit(name);
      }
    }

    return sorted;
  }

  /**
   * Get data from previously executed phase
   */
  getPhaseData(phaseName: string): any {
    return this.phaseData.get(phaseName);
  }

  /**
   * Check if phase was executed
   */
  wasExecuted(phaseName: string): boolean {
    return this.executedPhases.has(phaseName);
  }

  /**
   * Generate execution report
   */
  generateReport(result: OrchestrationResult): string[] {
    const report: string[] = [];

    report.push("");
    report.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    report.push("📊 SETUP ORCHESTRATION REPORT");
    report.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    report.push("");

    const successful = Array.from(result.phases.entries())
      .filter(([_, r]) => r.success);
    const failed = Array.from(result.phases.entries())
      .filter(([_, r]) => !r.success);

    report.push(`✅ Successful Phases: ${successful.length}`);
    report.push(`❌ Failed Phases: ${failed.length}`);
    report.push(`⏱️  Total Duration: ${(result.totalDuration / 1000).toFixed(2)}s`);
    report.push("");

    if (failed.length > 0) {
      report.push("❌ Failed Phases:");
      failed.forEach(([name, res]) => {
        report.push(`   - ${name}`);
        res.errors.forEach(err => report.push(`     Error: ${err}`));
      });
      report.push("");
    }

    report.push(`Overall Status: ${result.success ? '✅ SUCCESS' : '⚠️  PARTIAL SUCCESS'}`);
    report.push("");

    return report;
  }
}
