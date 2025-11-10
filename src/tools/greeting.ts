/**
 * FRIDAY Greeting Tool
 * Responds to user greetings with status and recommendations
 */

import { promises as fs } from "fs";
import path from "path";

interface ProjectStatus {
  currentPhase: string;
  completedTasks: string[];
  nextTasks: string[];
  recommendations: string[];
}

export async function greetingTool(): Promise<any> {
  const projectRoot = process.cwd();
  const status = await analyzeProjectStatus(projectRoot);

  const greeting = generateGreeting(status);

  return {
    content: [
      {
        type: "text",
        text: greeting,
      },
    ],
  };
}

async function analyzeProjectStatus(projectRoot: string): Promise<ProjectStatus> {
  const memoryPath = path.join(projectRoot, ".github", "memory");
  
  try {
    // Read current-state.md
    const statePath = path.join(memoryPath, "current-state.md");
    const stateContent = await fs.readFile(statePath, "utf-8");
    
    // Parse current phase
    const phaseMatch = stateContent.match(/Phase[:\s]+(\d+)/i);
    const currentPhase = phaseMatch ? `Phase ${phaseMatch[1]}` : "Initial Development";
    
    // Count implementations
    const implPath = path.join(memoryPath, "implementations");
    let completedTasks: string[] = [];
    try {
      const files = await fs.readdir(implPath);
      completedTasks = files.filter(f => f.endsWith(".md")).map(f => f.replace(".md", ""));
    } catch {}
    
    // Analyze next steps
    const nextTaskMatch = stateContent.match(/Next Steps?[:\s]+(.*?)(?:\n\n|\n#|$)/is);
    let nextTasks: string[] = [];
    if (nextTaskMatch) {
      nextTasks = nextTaskMatch[1]
        .split("\n")
        .filter(line => line.trim().startsWith("-") || /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^[-\d.)\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, 3);
    }
    
    // Generate recommendations
    const recommendations = generateRecommendations(completedTasks.length, currentPhase);
    
    return { currentPhase, completedTasks, nextTasks, recommendations };
  } catch {
    return {
      currentPhase: "Project Initialization",
      completedTasks: [],
      nextTasks: ["Run #friday-setup to initialize"],
      recommendations: ["Initialize FRIDAY memory system", "Set up project structure"],
    };
  }
}

function generateRecommendations(taskCount: number, phase: string): string[] {
  const recommendations: string[] = [];
  
  if (taskCount === 0) {
    recommendations.push("Begin implementing core features");
    recommendations.push("Document architectural decisions");
  } else if (taskCount < 5) {
    recommendations.push("Continue feature development");
    recommendations.push("Add unit tests for new features");
  } else if (taskCount < 10) {
    recommendations.push("Consider code review and refactoring");
    recommendations.push("Update documentation");
  } else {
    recommendations.push("Prepare for deployment");
    recommendations.push("Conduct comprehensive testing");
  }
  
  return recommendations.slice(0, 2);
}

function generateGreeting(status: ProjectStatus): string {
  const lines: string[] = [];
  
  // Greeting
  const hour = new Date().getHours();
  let timeGreeting = "Good evening";
  if (hour < 12) timeGreeting = "Good morning";
  else if (hour < 18) timeGreeting = "Good afternoon";
  
  lines.push(`${timeGreeting}, Sir. FRIDAY at your service.`);
  lines.push("");
  
  // Project status
  lines.push("📊 Project Status:");
  lines.push(`   Current: ${status.currentPhase}`);
  
  if (status.completedTasks.length > 0) {
    lines.push(`   Completed: ${status.completedTasks.length} implementations`);
  }
  
  lines.push("");
  
  // Recent progress
  if (status.completedTasks.length > 0) {
    lines.push("✅ Recent Progress:");
    status.completedTasks.slice(-3).forEach(task => {
      lines.push(`   - ${task}`);
    });
    lines.push("");
  }
  
  // Next tasks
  if (status.nextTasks.length > 0) {
    lines.push("🎯 Next Tasks:");
    status.nextTasks.forEach((task, i) => {
      lines.push(`   ${i + 1}. ${task}`);
    });
    lines.push("");
  }
  
  // Recommendations
  lines.push("💡 Recommendations:");
  status.recommendations.forEach(rec => {
    lines.push(`   • ${rec}`);
  });
  lines.push("");
  
  lines.push("How may I assist you today, Sir?");
  
  return lines.join("\n");
}

export const greetingToolDefinition = {
  name: "friday-greeting",
  description: "Greet FRIDAY and get project status with development recommendations",
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};
