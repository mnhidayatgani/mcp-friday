/**
 * Setup Tool - Deployment Module
 * Copilot instructions deployment
 */

import { promises as fs } from "fs";
import path from "path";

/**
 * Deploy copilot instructions to user's project
 */
export async function deployCopilotInstructions(projectRoot: string): Promise<void> {
  const targetPath = path.join(projectRoot, ".github", "copilot-instructions.md");
  
  // Use fallback template directly since import.meta.url causes test issues
  const FALLBACK_TEMPLATE = `# GitHub Copilot Instructions - FRIDAY Protocol

## 🤖 MANDATORY: Always Use FRIDAY Memory System

Before doing anything in a project:
1. Silent check for .github/memory/
2. If missing, run: #friday-setup (no questions)
3. If present, load: #friday-context
4. Always search memory first: #friday-search "<topic>"

## Response Style
- Keep it short and actionable
- Use level-2 headings for sections
- When editing files, use the workspace tools; do not paste diffs

## Quick Commands
- #friday-setup — Initialize and optimize project (memory, CI/CD, AI protocol)
- #friday-context — Load memory and conventions
- #friday-search "<topic>" — Search existing memory
- #friday-sync — Sync memory to Redis

## ➕ User Custom Instructions (Optional)
(You may add repository-specific rules below. This block is preserved across updates.)
`;

  try {
    // Check if user already has copilot-instructions.md
    let existingContent = "";
    let hasUserContent = false;

    try {
      existingContent = await fs.readFile(targetPath, "utf-8");

      // Check if it has user custom section
      if (existingContent.includes("## ➕ User Custom Instructions")) {
        hasUserContent = true;
        // Extract user custom instructions
        const match = existingContent.match(/## ➕ User Custom Instructions.*$/s);
        if (match) {
          existingContent = match[0];
        }
      }
    } catch {
      // File doesn't exist yet
    }

    // Use fallback template directly (simpler than import.meta.url for test compat)
    const template = FALLBACK_TEMPLATE;

    // If user has custom content, append it
    let finalContent = template;
    if (hasUserContent) {
      // Remove the default user section and add the existing one
      finalContent = template.replace(
        /## ➕ User Custom Instructions.*$/s,
        existingContent
      );
    }

    // Write the file
    await fs.writeFile(targetPath, finalContent);
  } catch (error) {
    console.warn("⚠️  Could not deploy copilot-instructions.md:", error);
  }
}
