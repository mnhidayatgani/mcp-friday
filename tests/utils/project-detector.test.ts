/**
 * Project Detector Tests
 * Precision detection with high confidence
 */

import { ProjectDetector } from "../../src/utils/project-detector";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

describe("ProjectDetector", () => {
  let tempDir: string;
  let detector: ProjectDetector;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "friday-detect-"));
    detector = new ProjectDetector(tempDir);
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("detect() - Web Projects", () => {
    it("should detect Next.js project", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          name: "my-nextjs-app",
          dependencies: {
            next: "^14.0.0",
            react: "^18.0.0",
          },
        })
      );

      const result = await detector.detect();

      expect(result.type).toBe("web");
      expect(result.techStack).toContain("Next.js");
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it("should detect React project", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          name: "react-app",
          dependencies: {
            react: "^18.0.0",
            "react-dom": "^18.0.0",
          },
        })
      );

      const result = await detector.detect();

      expect(result.type).toBe("web");
      expect(result.techStack).toContain("React");
    });
  });

  describe("detect() - API Projects", () => {
    it("should detect NestJS project", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          name: "nestjs-api",
          dependencies: {
            "@nestjs/core": "^10.0.0",
          },
        })
      );

      const result = await detector.detect();

      expect(result.type).toBe("api");
      expect(result.techStack).toContain("NestJS");
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it("should detect Express project", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          name: "express-api",
          dependencies: {
            express: "^4.18.0",
          },
        })
      );

      const result = await detector.detect();

      expect(result.techStack).toContain("Express");
    });
  });

  describe("detect() - TypeScript", () => {
    it("should detect TypeScript from dependencies", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          name: "ts-project",
          devDependencies: {
            typescript: "^5.0.0",
          },
        })
      );

      const result = await detector.detect();

      expect(result.techStack).toContain("TypeScript");
    });

    it("should detect TypeScript from tsconfig.json", async () => {
      await fs.writeFile(
        path.join(tempDir, "tsconfig.json"),
        JSON.stringify({})
      );
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({ name: "test" })
      );

      const result = await detector.detect();

      expect(result.techStack).toContain("TypeScript");
    });
  });

  describe("detect() - Database Technologies", () => {
    it("should detect Prisma", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          name: "prisma-app",
          dependencies: {
            "@prisma/client": "^5.0.0",
          },
        })
      );

      const result = await detector.detect();

      expect(result.techStack).toContain("Prisma");
    });

    it("should detect MongoDB", async () => {
      await fs.writeFile(
        path.join(tempDir, "package.json"),
        JSON.stringify({
          name: "mongo-app",
          dependencies: {
            mongoose: "^7.0.0",
          },
        })
      );

      const result = await detector.detect();

      expect(result.techStack).toContain("MongoDB");
    });
  });

  describe("detect() - Unknown Projects", () => {
    it("should return unknown for empty project", async () => {
      const result = await detector.detect();

      expect(result.type).toBe("unknown");
      expect(result.confidence).toBe(0);
    });

    it("should use directory name as project name", async () => {
      const result = await detector.detect();

      expect(result.name).toContain("friday-detect-");
    });
  });
});
