/**
 * Setup Tool - Analysis Module
 * Deep project analysis functionality
 */

import { ProjectAnalyzer, ProjectAnalysis } from "../../utils/project-analyzer.js";
import { FridayConfig } from "../../utils/config-loader.js";

/**
 * Perform deep project analysis
 */
export async function analyzeProject(config: FridayConfig): Promise<ProjectAnalysis> {
  const analyzer = new ProjectAnalyzer(config.projectRoot);
  const analysis = await analyzer.analyze();
  return analysis;
}

/**
 * Format analysis results for output
 */
export function formatAnalysisOutput(analysis: ProjectAnalysis): string[] {
  const output: string[] = [];

  output.push("📊 Analysis Complete:");
  output.push(`   Architecture: ${analysis.architecture.structure}`);
  output.push(`   Patterns: ${analysis.patterns.design.length + analysis.patterns.architectural.length} detected`);
  output.push(`   Tech Stack: ${analysis.tech.frameworks.join(", ") || "Generic"}`);
  output.push(`   Risk Level: ${analysis.risks.level.toUpperCase()}`);
  output.push("");

  if (analysis.risks.warnings.length > 0) {
    output.push("⚠️  Warnings:");
    analysis.risks.warnings.forEach((warning) => {
      output.push(`   - ${warning}`);
    });
    output.push("");
  }

  return output;
}
