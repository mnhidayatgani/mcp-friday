/**
 * Setup Tool V2 - Optimized with Orchestration
 * Conflict-free, intelligent setup workflow
 */

import { HybridMemoryManager } from "../../memory/hybrid-manager.js";
import { ConfigLoader } from "../../utils/config-loader.js";
import { ProjectDetector } from "../../utils/project-detector.js";
import { analyzeProject } from "./analysis.js";
import { CICDDeployer } from "./cicd-deployer.js";
import { deployCopilotInstructions } from "./deployment.js";
import { ExtensionMemoryMigrator } from "./extension-migrator.js";
import { GitHubOptimizer } from "./github-optimizer.js";
import { MemoryStats } from "./memory-stats.js";
import { PhaseResult, SetupOrchestrator } from "./orchestrator.js";
import { ProjectLearner } from "./project-learner.js";

export async function setupToolV2(args: any) {
  const output: string[] = [];
  
  // Header
  output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  output.push("🤖 FRIDAY Setup V2 - Optimized Workflow");
  output.push("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  output.push("");

  try {
    const config = ConfigLoader.load();
    const orchestrator = new SetupOrchestrator();
    const memoryStats = new MemoryStats();

    // Register all phases in optimal order
    
    // Phase 1: GitHub Optimization (Priority 1)
    orchestrator.registerPhase({
      name: "github-optimization",
      description: "Optimize .github/ folder structure",
      priority: 1,
      dependencies: [],
      execute: async (): Promise<PhaseResult> => {
        const phaseOutput: string[] = [];
        phaseOutput.push("🔧 Phase 1: GitHub Folder Optimization");
        
        try {
          const optimizer = new GitHubOptimizer(config.projectRoot);
          const result = await optimizer.optimize();
          const report = optimizer.generateReport(result);
          phaseOutput.push(...report);
          
          return {
            success: true,
            output: phaseOutput,
            errors: result.errors,
            data: result,
          };
        } catch (error) {
          return {
            success: false,
            output: phaseOutput,
            errors: [error instanceof Error ? error.message : String(error)],
          };
        }
      },
    });

    // Phase 2: Extension Migration (Priority 2)
    orchestrator.registerPhase({
      name: "extension-migration",
      description: "Detect and migrate extension memory",
      priority: 2,
      dependencies: ["github-optimization"],
      execute: async (): Promise<PhaseResult> => {
        const phaseOutput: string[] = [];
        phaseOutput.push("📦 Phase 2: Extension Memory Migration");
        
        try {
          const migrator = new ExtensionMemoryMigrator(config.projectRoot);
          const result = await migrator.migrateExtensions();
          
          if (result.detected.length > 0) {
            phaseOutput.push(`   ✅ Found ${result.detected.length} extension(s)`);
            result.detected.forEach(ext => {
              phaseOutput.push(`      - ${ext.name} (${ext.dataFiles.length} files)`);
            });
            
            if (result.migrated.length > 0) {
              phaseOutput.push("");
              phaseOutput.push(`   📦 Migrated ${result.migrated.length} file(s)`);
              
              const instructions = migrator.generateRemovalInstructions(result.detected);
              phaseOutput.push(...instructions);
            }
          } else {
            phaseOutput.push("   ℹ️  No extensions detected");
          }
          phaseOutput.push("");
          
          return {
            success: true,
            output: phaseOutput,
            errors: result.errors,
            data: result,
          };
        } catch (error) {
          return {
            success: false,
            output: phaseOutput,
            errors: [error instanceof Error ? error.message : String(error)],
          };
        }
      },
    });

    // Phase 3: Project Detection (Priority 3)
    orchestrator.registerPhase({
      name: "project-detection",
      description: "Detect project type and tech stack",
      priority: 3,
      dependencies: [],
      execute: async (): Promise<PhaseResult> => {
        const phaseOutput: string[] = [];
        phaseOutput.push("🔍 Phase 3: Project Detection");
        
        try {
          const detector = new ProjectDetector();
          const project = await detector.detect();
          
          phaseOutput.push(`   Name: ${project.name}`);
          phaseOutput.push(`   Type: ${project.type} (${Math.round(project.confidence * 100)}% confidence)`);
          phaseOutput.push(`   Tech Stack: ${project.techStack.join(", ") || "Generic"}`);
          phaseOutput.push("");
          
          return {
            success: true,
            output: phaseOutput,
            errors: [],
            data: project,
          };
        } catch (error) {
          return {
            success: false,
            output: phaseOutput,
            errors: [error instanceof Error ? error.message : String(error)],
          };
        }
      },
    });

    // Phase 4: Memory Initialization (Priority 4)
    orchestrator.registerPhase({
      name: "memory-initialization",
      description: "Initialize hybrid memory system",
      priority: 4,
      dependencies: ["github-optimization", "project-detection"],
      execute: async (): Promise<PhaseResult> => {
        const phaseOutput: string[] = [];
        phaseOutput.push("💾 Phase 4: Memory Initialization");
        
        try {
          const hybridMemory = new HybridMemoryManager(config);
          const isInitialized = await hybridMemory.isInitialized();
          
          if (!isInitialized) {
            phaseOutput.push("   📁 Creating memory structure...");
            await hybridMemory.initialize();
            
            // Deep analysis for first time
            const analysis = await analyzeProject(config);
            phaseOutput.push("   ✅ Memory structure created");
            phaseOutput.push("   ✅ Project analysis complete");
          } else {
            phaseOutput.push("   ℹ️  Memory already initialized");
          }
          
          // Create/update index
          const project = orchestrator.getPhaseData<{ name: string; type: string; techStack: string[] }>("project-detection");
          if (project) {
            await hybridMemory.createIndex({
              name: project.name,
              type: project.type,
              techStack: project.techStack,
              created: new Date(),
              updated: new Date(),
            });
            await hybridMemory.createCurrentState(project.name, project.type);
          }
          
          phaseOutput.push("");
          
          return {
            success: true,
            output: phaseOutput,
            errors: [],
            data: { hybridMemory, isInitialized },
          };
        } catch (error) {
          return {
            success: false,
            output: phaseOutput,
            errors: [error instanceof Error ? error.message : String(error)],
          };
        }
      },
    });

    // Phase 5: Project Learning (Priority 5)
    orchestrator.registerPhase({
      name: "project-learning",
      description: "Learn from user's project",
      priority: 5,
      dependencies: ["memory-initialization"],
      execute: async (): Promise<PhaseResult> => {
        const phaseOutput: string[] = [];
        phaseOutput.push("🧠 Phase 5: Project Learning");
        
        try {
          const memoryData = orchestrator.getPhaseData<{ hybridMemory: HybridMemoryManager; isInitialized: boolean }>("memory-initialization");
          const learner = new ProjectLearner(config.projectRoot, memoryData!.hybridMemory);
          const result = await learner.learn();
          const report = learner.generateReport(result);
          
          phaseOutput.push(...report);
          
          return {
            success: true,
            output: phaseOutput,
            errors: [],
            data: result,
          };
        } catch (error) {
          return {
            success: false,
            output: phaseOutput,
            errors: [error instanceof Error ? error.message : String(error)],
          };
        }
      },
    });

    // Phase 6: AI Protocol Deployment (Priority 6)
    orchestrator.registerPhase({
      name: "ai-protocol",
      description: "Deploy AI protocol and copilot instructions",
      priority: 6,
      dependencies: ["github-optimization"],
      execute: async (): Promise<PhaseResult> => {
        const phaseOutput: string[] = [];
        phaseOutput.push("📝 Phase 6: AI Protocol Deployment");
        
        try {
          await deployCopilotInstructions(config.projectRoot);
          phaseOutput.push("   ✅ Copilot instructions deployed");
          phaseOutput.push("");
          
          return {
            success: true,
            output: phaseOutput,
            errors: [],
          };
        } catch (error) {
          return {
            success: false,
            output: phaseOutput,
            errors: [error instanceof Error ? error.message : String(error)],
          };
        }
      },
    });

    // Phase 7: Redis Health Check (Priority 7)
    orchestrator.registerPhase({
      name: "redis-health",
      description: "Check Redis connection",
      priority: 7,
      dependencies: ["memory-initialization"],
      execute: async (): Promise<PhaseResult> => {
        const phaseOutput: string[] = [];
        phaseOutput.push("🔌 Phase 7: Redis Health Check");
        
        try {
          const memoryData = orchestrator.getPhaseData<{ hybridMemory: HybridMemoryManager; isInitialized: boolean }>("memory-initialization");
          const hybridMemory = memoryData!.hybridMemory;
          
          const redisEnabled = hybridMemory.isRedisEnabled();
          if (redisEnabled) {
            const health = await hybridMemory.getRedisHealth();
            if (health.connected) {
              phaseOutput.push("   ✅ Upstash Redis connected");
              phaseOutput.push("   ✅ Hybrid memory active (Git + Redis)");
            } else {
              phaseOutput.push("   ⚠️  Redis connection failed");
              phaseOutput.push(`   Error: ${health.error}`);
              phaseOutput.push("   ℹ️  Falling back to Git-only memory");
            }
          } else {
            phaseOutput.push("   ℹ️  Redis not configured (Git-only mode)");
          }
          phaseOutput.push("");
          
          return {
            success: true,
            output: phaseOutput,
            errors: [],
          };
        } catch (error) {
          return {
            success: false,
            output: phaseOutput,
            errors: [error instanceof Error ? error.message : String(error)],
          };
        }
      },
    });

    // Phase 8: CI/CD Deployment (Priority 8)
    orchestrator.registerPhase({
      name: "cicd-deployment",
      description: "Deploy CI/CD pipeline and code review",
      priority: 8,
      dependencies: ["project-detection"],
      execute: async (): Promise<PhaseResult> => {
        const phaseOutput: string[] = [];
        phaseOutput.push("🚀 Phase 8: CI/CD Deployment");
        
        try {
          const project = orchestrator.getPhaseData<{ name: string; type: string }>("project-detection");
          const deployer = new CICDDeployer(config.projectRoot, project?.type || "generic");
          const result = await deployer.deploy();
          const report = deployer.generateReport(result);
          
          phaseOutput.push(...report);
          
          return {
            success: true,
            output: phaseOutput,
            errors: [],
            data: result,
          };
        } catch (error) {
          return {
            success: false,
            output: phaseOutput,
            errors: [error instanceof Error ? error.message : String(error)],
          };
        }
      },
    });

    // Execute all phases
    const result = await orchestrator.execute();

    // Collect all phase outputs
    result.phases.forEach((phaseResult, phaseName) => {
      output.push(...phaseResult.output);
    });

    // Generate orchestration report
    const report = orchestrator.generateReport(result);
    output.push(...report);

    // Return result
    return {
      content: [
        {
          type: "text" as const,
          text: output.join("\n"),
        },
      ],
      isError: false,
    };

  } catch (error) {
    output.push("");
    output.push("❌ Setup failed:");
    output.push(`   ${error instanceof Error ? error.message : String(error)}`);
    
    return {
      content: [
        {
          type: "text" as const,
          text: output.join("\n"),
        },
      ],
      isError: true,
    };
  }
}
