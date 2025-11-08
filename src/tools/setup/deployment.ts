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
  const templatePath = path.join(__dirname, "../../../.github/COPILOT-INSTRUCTIONS-TEMPLATE.md");

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

    // Read template
    const template = await fs.readFile(templatePath, "utf-8");

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
