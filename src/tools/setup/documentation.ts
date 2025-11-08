/**
 * Setup Tool - Documentation Module
 * Automatic documentation generation
 */

import { promises as fs } from "fs";
import path from "path";
import { ProjectAnalyzer, ProjectAnalysis } from "../../utils/project-analyzer.js";

/**
 * Generate all project documentation
 */
export async function generateDocumentation(
  projectRoot: string,
  analysis: ProjectAnalysis
): Promise<string[]> {
  const output: string[] = [];
  const analyzer = new ProjectAnalyzer(projectRoot);

  // 1. Project Analysis Documentation
  const analysisDoc = await analyzer.createDocumentation(analysis);
  const analysisPath = path.join(projectRoot, ".github/memory/PROJECT-ANALYSIS.md");
  await fs.writeFile(analysisPath, analysisDoc);
  output.push("📝 Created PROJECT-ANALYSIS.md (architecture, patterns, risks)");

  // 2. Architecture Reference
  const archRef = await createArchitectureReference(analysis);
  const archPath = path.join(projectRoot, ".github/memory/ARCHITECTURE.md");
  await fs.writeFile(archPath, archRef);
  output.push("📝 Created ARCHITECTURE.md (structure reference)");

  // 3. Conventions Guide
  const conventions = await createConventionsGuide(analysis);
  const convPath = path.join(projectRoot, ".github/memory/CONVENTIONS.md");
  await fs.writeFile(convPath, conventions);
  output.push("📝 Created CONVENTIONS.md (coding standards)");

  return output;
}

/**
 * Create architecture reference document
 */
async function createArchitectureReference(analysis: ProjectAnalysis): Promise<string> {
  const lines: string[] = [];

  lines.push("# Project Architecture Reference");
  lines.push("");
  lines.push("**For AI Assistant: READ THIS BEFORE MAKING CHANGES**");
  lines.push("");

  lines.push("## Structure");
  lines.push("");
  lines.push(`This project follows **${analysis.architecture.structure}** architecture.`);
  lines.push("");
  lines.push("**Layers:**");
  analysis.architecture.layers.forEach((layer: string) => {
    lines.push(`- ${layer}`);
  });
  lines.push("");

  lines.push("## File Organization");
  lines.push("");
  lines.push(`**Pattern:** ${analysis.conventions.fileStructure}`);
  lines.push("");
  lines.push("When adding new features:");
  if (analysis.conventions.fileStructure === "feature-based") {
    lines.push("- Create new folder in src/features/");
    lines.push("- Keep all related files together");
    lines.push("- Export public API from index");
  } else {
    lines.push("- Place files in appropriate type folders");
    lines.push("- Follow existing naming patterns");
    lines.push("- Maintain separation of concerns");
  }
  lines.push("");

  return lines.join("\n");
}

/**
 * Create conventions guide
 */
async function createConventionsGuide(analysis: ProjectAnalysis): Promise<string> {
  const lines: string[] = [];

  lines.push("# Coding Conventions & Standards");
  lines.push("");
  lines.push("**IMPORTANT: Follow these conventions when writing code**");
  lines.push("");

  lines.push("## Naming Conventions");
  lines.push("");
  lines.push(`**Style:** ${analysis.conventions.naming}`);
  lines.push("");
  lines.push("Examples:");
  if (analysis.conventions.naming === "camelCase") {
    lines.push("- Variables: `userName`, `isActive`");
    lines.push("- Functions: `getUserData()`, `handleSubmit()`");
    lines.push("- Files: `userService.ts`, `authHelper.ts`");
  }
  lines.push("");

  lines.push("## Import/Export Patterns");
  lines.push("");
  lines.push(`**Imports:** ${analysis.conventions.imports}`);
  lines.push(`**Exports:** ${analysis.conventions.exports}`);
  lines.push("");

  if (analysis.patterns.architectural.length > 0) {
    lines.push("## Architectural Patterns");
    lines.push("");
    lines.push("This project uses:");
    analysis.patterns.architectural.forEach((pattern: string) => {
      lines.push(`- ${pattern}`);
    });
    lines.push("");
    lines.push("**Follow these patterns when adding new code!**");
    lines.push("");
  }

  return lines.join("\n");
}
