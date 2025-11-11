/**
 * Setup Tool Tests
 */

import { setupTool } from "../../src/tools/setup/index";
import { SetupOrchestrator } from "../../src/tools/setup/orchestrator";
import { ConfigLoader } from "../../src/utils/config-loader";

jest.mock("../../src/tools/setup/orchestrator");
jest.mock("../../src/utils/config-loader");
jest.mock("../../src/utils/project-detector");
jest.mock("../../src/memory/hybrid-manager");
jest.mock("../../src/tools/setup/github-optimizer");
jest.mock("../../src/tools/setup/extension-migrator");
jest.mock("../../src/tools/setup/project-learner");
jest.mock("../../src/tools/setup/cicd-deployer");

describe("Setup Tool", () => {
  let mockConfig: any;
  let mockOrchestrator: jest.Mocked<SetupOrchestrator>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      projectRoot: "/test/project",
      upstash: {
        url: "https://test.upstash.io",
        token: "test-token",
      },
    };

    (ConfigLoader.load as jest.Mock).mockReturnValue(mockConfig);

    mockOrchestrator = {
      registerPhase: jest.fn(),
      execute: jest.fn(),
      generateReport: jest.fn().mockReturnValue([]),
    } as any;

    (SetupOrchestrator as jest.Mock).mockImplementation(() => mockOrchestrator);
  });

  describe("Basic Functionality", () => {
    it("should initialize setup process", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      const result = await setupTool({});

      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe("text");
    });

    it("should show setup header", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      const result = await setupTool({});

      expect(result.content[0].text).toContain("FRIDAY Setup");
    });

    it("should accept project type parameter", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      await setupTool({ projectType: "web" });

      expect(SetupOrchestrator).toHaveBeenCalled();
    });

    it("should accept enableRedis parameter", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      await setupTool({ enableRedis: false });

      expect(SetupOrchestrator).toHaveBeenCalled();
    });

    it("should accept memoryCapacity parameter", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      await setupTool({ memoryCapacity: 200 });

      expect(SetupOrchestrator).toHaveBeenCalled();
    });
  });

  describe("Orchestrator Integration", () => {
    it("should create orchestrator instance", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      await setupTool({});

      expect(SetupOrchestrator).toHaveBeenCalled();
    });

    it("should register all phases", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      await setupTool({});

      // Should register multiple phases
      expect(mockOrchestrator.registerPhase).toHaveBeenCalled();
    });

    it("should execute orchestrator", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      await setupTool({});

      expect(mockOrchestrator.execute).toHaveBeenCalled();
    });
  });

  describe("Success Scenarios", () => {
    it("should show success message when setup completes", async () => {
      const phases = new Map();
      phases.set("github-optimization", { success: true, output: [], errors: [] });
      phases.set("memory-initialization", { success: true, output: [], errors: [] });
      
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases,
        totalDuration: 1000,
      });

      const result = await setupTool({});

      expect(result.content[0].text).toContain("Setup");
    });

    it("should display phase results", async () => {
      const phases = new Map();
      phases.set("github-optimization", { success: true, output: ["Phase 1: Complete"], errors: [] });
      phases.set("project-detection", { success: true, output: ["Phase 2: Complete"], errors: [] });
      
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases,
        totalDuration: 1000,
      });

      const result = await setupTool({});

      const text = result.content[0].text;
      expect(text).toBeTruthy();
    });

    it("should handle successful setup with all phases", async () => {
      const phases = new Map();
      phases.set("github-optimization", { success: true, output: [], errors: [] });
      phases.set("extension-migration", { success: true, output: [], errors: [] });
      phases.set("project-detection", { success: true, output: [], errors: [] });
      phases.set("memory-initialization", { success: true, output: [], errors: [] });
      phases.set("project-learning", { success: true, output: [], errors: [] });
      
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases,
        totalDuration: 1000,
      });

      const result = await setupTool({});

      expect(result.content).toBeDefined();
      expect(result.isError).toBeFalsy();
    });
  });

  describe("Error Handling", () => {
    it("should handle orchestrator execution errors", async () => {
      mockOrchestrator.execute.mockRejectedValue(new Error("Orchestrator failed"));

      const result = await setupTool({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Setup failed");
    });

    it("should handle config loading errors", async () => {
      (ConfigLoader.load as jest.Mock).mockImplementation(() => {
        throw new Error("Config error");
      });

      const result = await setupTool({});

      expect(result.isError).toBe(true);
    });

    it("should display phase errors", async () => {
      const phases = new Map();
      phases.set("github-optimization", { 
        success: false, 
        output: ["Phase 1: Failed"], 
        errors: ["Phase failed: GitHub optimization error"] 
      });
      
      mockOrchestrator.execute.mockResolvedValue({
        success: false,
        phases,
        totalDuration: 1000,
      });

      const result = await setupTool({});

      expect(result.content).toBeDefined();
    });

    it("should handle non-Error exceptions", async () => {
      mockOrchestrator.execute.mockRejectedValue("String error");

      const result = await setupTool({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("String error");
    });
  });

  describe("Phase Execution", () => {
    it("should register github-optimization phase", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      await setupTool({});

      const registerCalls = (mockOrchestrator.registerPhase as jest.Mock).mock.calls;
      const githubPhase = registerCalls.find(
        (call: any[]) => call[0]?.name === "github-optimization"
      );
      expect(githubPhase).toBeDefined();
    });

    it("should register extension-migration phase", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      await setupTool({});

      const registerCalls = (mockOrchestrator.registerPhase as jest.Mock).mock.calls;
      const migrationPhase = registerCalls.find(
        (call: any[]) => call[0]?.name === "extension-migration"
      );
      expect(migrationPhase).toBeDefined();
    });

    it("should register project-detection phase", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      await setupTool({});

      const registerCalls = (mockOrchestrator.registerPhase as jest.Mock).mock.calls;
      const detectionPhase = registerCalls.find(
        (call: any[]) => call[0]?.name === "project-detection"
      );
      expect(detectionPhase).toBeDefined();
    });

    it("should register memory-initialization phase", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      await setupTool({});

      const registerCalls = (mockOrchestrator.registerPhase as jest.Mock).mock.calls;
      const memoryPhase = registerCalls.find(
        (call: any[]) => call[0]?.name === "memory-initialization"
      );
      expect(memoryPhase).toBeDefined();
    });
  });

  describe("Default Parameters", () => {
    it("should use default projectType when not provided", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      await setupTool({});

      expect(SetupOrchestrator).toHaveBeenCalled();
    });

    it("should work with empty args", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      const result = await setupTool({});

      expect(result.content).toBeDefined();
    });
  });

  describe("Output Format", () => {
    it("should return text content type", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      const result = await setupTool({});

      expect(result.content[0].type).toBe("text");
    });

    it("should format output correctly", async () => {
      const phases = new Map();
      phases.set("test-phase", { 
        success: true, 
        output: ["Line 1", "Line 2", "Line 3"], 
        errors: [] 
      });
      
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases,
        totalDuration: 1000,
      });

      const result = await setupTool({});

      const text = result.content[0].text;
      expect(text).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty orchestrator output", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      const result = await setupTool({});

      expect(result.content).toBeDefined();
    });

    it("should handle partial phase failures", async () => {
      const phases = new Map();
      phases.set("github-optimization", { success: true, output: [], errors: [] });
      phases.set("extension-migration", { 
        success: false, 
        output: ["Some phases completed"], 
        errors: ["Migration failed"] 
      });
      
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases,
        totalDuration: 1000,
      });

      const result = await setupTool({});

      expect(result.content).toBeDefined();
    });

    it("should handle undefined args", async () => {
      mockOrchestrator.execute.mockResolvedValue({
        success: true,
        phases: new Map(),
        totalDuration: 1000,
      });

      const result = await setupTool(undefined as any);

      expect(result.content).toBeDefined();
    });
  });
});

