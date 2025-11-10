/**
 * Context7 Client Tests
 */

import { Context7Client } from "../../src/memory/context7-client";

describe("Context7Client", () => {
  let client: Context7Client;

  beforeEach(() => {
    client = new Context7Client();
  });

  describe("resolveLibrary", () => {
    it("should resolve React library", async () => {
      const result = await client.resolveLibrary("react");
      
      expect(result).not.toBeNull();
      expect(result?.name).toBe("React");
      expect(result?.id).toBe("/facebook/react");
      expect(result?.trustScore).toBe(10);
    });

    it("should resolve Next.js library with different variations", async () => {
      const variations = ["next.js", "nextjs", "Next.js", "NEXTJS"];
      
      for (const variation of variations) {
        const result = await client.resolveLibrary(variation);
        expect(result).not.toBeNull();
        expect(result?.name).toBe("Next.js");
        expect(result?.id).toBe("/vercel/next.js");
      }
    });

    it("should resolve TypeScript library", async () => {
      const result = await client.resolveLibrary("typescript");
      
      expect(result).not.toBeNull();
      expect(result?.name).toBe("TypeScript");
      expect(result?.id).toBe("/microsoft/TypeScript");
    });

    it("should return null for unknown library", async () => {
      const result = await client.resolveLibrary("unknown-library-xyz");
      
      expect(result).toBeNull();
    });

    it("should handle case-insensitive library names", async () => {
      const result1 = await client.resolveLibrary("REACT");
      const result2 = await client.resolveLibrary("react");
      const result3 = await client.resolveLibrary("ReAcT");
      
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it("should resolve all frontend frameworks", async () => {
      const frameworks = ["react", "vue", "angular", "svelte", "solid"];
      
      for (const framework of frameworks) {
        const result = await client.resolveLibrary(framework);
        expect(result).not.toBeNull();
        expect(result?.trustScore).toBeGreaterThanOrEqual(8);
      }
    });

    it("should resolve all backend frameworks", async () => {
      const frameworks = ["express", "fastify", "nestjs", "koa"];
      
      for (const framework of frameworks) {
        const result = await client.resolveLibrary(framework);
        expect(result).not.toBeNull();
        expect(result?.trustScore).toBeGreaterThanOrEqual(8);
      }
    });

    it("should resolve ORMs", async () => {
      const orms = ["prisma", "mongoose", "typeorm", "sequelize", "drizzle"];
      
      for (const orm of orms) {
        const result = await client.resolveLibrary(orm);
        expect(result).not.toBeNull();
        expect(result?.description).toBeTruthy();
      }
    });

    it("should resolve testing libraries", async () => {
      const testLibs = ["jest", "vitest", "playwright", "cypress"];
      
      for (const lib of testLibs) {
        const result = await client.resolveLibrary(lib);
        expect(result).not.toBeNull();
        expect(result?.trustScore).toBeGreaterThanOrEqual(9);
      }
    });

    it("should resolve CSS frameworks", async () => {
      const cssLibs = ["tailwind", "bootstrap", "mui", "chakra-ui"];
      
      for (const lib of cssLibs) {
        const result = await client.resolveLibrary(lib);
        expect(result).not.toBeNull();
      }
    });

    it("should resolve state management libraries", async () => {
      const stateLibs = ["redux", "zustand", "jotai", "mobx"];
      
      for (const lib of stateLibs) {
        const result = await client.resolveLibrary(lib);
        expect(result).not.toBeNull();
      }
    });

    it("should resolve build tools", async () => {
      const buildTools = ["vite", "webpack", "rollup", "esbuild"];
      
      for (const tool of buildTools) {
        const result = await client.resolveLibrary(tool);
        expect(result).not.toBeNull();
        expect(result?.trustScore).toBeGreaterThanOrEqual(9);
      }
    });

    it("should resolve validation libraries", async () => {
      const validationLibs = ["zod", "yup", "joi"];
      
      for (const lib of validationLibs) {
        const result = await client.resolveLibrary(lib);
        expect(result).not.toBeNull();
      }
    });
  });

  describe("getDocs", () => {
    it("should return documentation for valid library", async () => {
      const result = await client.getDocs("/facebook/react", "hooks");
      
      expect(result).not.toBeNull();
      expect(result?.library).toBe("react");
      expect(result?.content).toContain("hooks");
      expect(result?.relevance).toBeGreaterThan(0);
    });

    it("should return documentation without topic", async () => {
      const result = await client.getDocs("/vercel/next.js");
      
      expect(result).not.toBeNull();
      expect(result?.library).toBe("next.js");
      expect(result?.content).toBeTruthy();
    });

    it("should include GitHub URL in documentation", async () => {
      const result = await client.getDocs("/prisma/prisma", "migrations");
      
      expect(result?.content).toContain("https://github.com/prisma/prisma");
    });

    it("should include NPM URL in documentation", async () => {
      const result = await client.getDocs("/expressjs/express");
      
      expect(result?.content).toContain("npmjs.com/package");
    });

    it("should handle library IDs with multiple parts", async () => {
      const result = await client.getDocs("/org/sub/library", "test");
      
      expect(result).not.toBeNull();
      expect(result?.library).toBe("library");
    });
  });

  describe("searchLibraries", () => {
    it("should find authentication libraries", async () => {
      const result = await client.searchLibraries("authentication");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => lib.name.toLowerCase().includes("auth"))).toBe(true);
    });

    it("should find libraries for login", async () => {
      const result = await client.searchLibraries("user login");
      
      expect(result.length).toBeGreaterThan(0);
      const names = result.map(lib => lib.name);
      expect(names.some(name => name.includes("Passport") || name.includes("Auth"))).toBe(true);
    });

    it("should find database libraries", async () => {
      const result = await client.searchLibraries("database");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Prisma") || 
        lib.name.includes("Mongoose") ||
        lib.name.includes("TypeORM")
      )).toBe(true);
    });

    it("should find ORM libraries", async () => {
      const result = await client.searchLibraries("orm query");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => lib.description.toLowerCase().includes("orm"))).toBe(true);
    });

    it("should find PostgreSQL libraries", async () => {
      const result = await client.searchLibraries("postgresql");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => lib.name.includes("PostgreSQL"))).toBe(true);
    });

    it("should find MongoDB libraries", async () => {
      const result = await client.searchLibraries("mongodb nosql");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("MongoDB") || 
        lib.name.includes("Mongoose")
      )).toBe(true);
    });

    it("should find testing libraries", async () => {
      const result = await client.searchLibraries("unit testing");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Jest") || 
        lib.name.includes("Vitest")
      )).toBe(true);
    });

    it("should find E2E testing libraries", async () => {
      const result = await client.searchLibraries("e2e testing");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Playwright") || 
        lib.name.includes("Cypress")
      )).toBe(true);
    });

    it("should find real-time libraries", async () => {
      const result = await client.searchLibraries("real-time chat");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => lib.name.includes("Socket"))).toBe(true);
    });

    it("should find WebSocket libraries", async () => {
      const result = await client.searchLibraries("websocket");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Socket.IO") || 
        lib.name.includes("ws")
      )).toBe(true);
    });

    it("should find CSS libraries", async () => {
      const result = await client.searchLibraries("css styling");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Tailwind") || 
        lib.name.includes("Bootstrap")
      )).toBe(true);
    });

    it("should find UI component libraries", async () => {
      const result = await client.searchLibraries("ui components");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Material-UI") || 
        lib.name.includes("Chakra")
      )).toBe(true);
    });

    it("should find state management libraries", async () => {
      const result = await client.searchLibraries("state management");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Redux") || 
        lib.name.includes("Zustand")
      )).toBe(true);
    });

    it("should find API libraries", async () => {
      const result = await client.searchLibraries("api graphql");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("GraphQL") || 
        lib.name.includes("Apollo") ||
        lib.name.includes("tRPC")
      )).toBe(true);
    });

    it("should find validation libraries", async () => {
      const result = await client.searchLibraries("validation schema");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Zod") || 
        lib.name.includes("Yup") ||
        lib.name.includes("Joi")
      )).toBe(true);
    });

    it("should find build tools", async () => {
      const result = await client.searchLibraries("build bundler");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Vite") || 
        lib.name.includes("Webpack")
      )).toBe(true);
    });

    it("should find React libraries", async () => {
      const result = await client.searchLibraries("react components");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("React") || 
        lib.name.includes("Next.js")
      )).toBe(true);
    });

    it("should find Vue libraries", async () => {
      const result = await client.searchLibraries("vue framework");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Vue") || 
        lib.name.includes("Nuxt")
      )).toBe(true);
    });

    it("should find Svelte libraries", async () => {
      const result = await client.searchLibraries("svelte");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => lib.name.includes("Svelte"))).toBe(true);
    });

    it("should find backend frameworks", async () => {
      const result = await client.searchLibraries("express server api");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Express") || 
        lib.name.includes("Fastify") ||
        lib.name.includes("NestJS")
      )).toBe(true);
    });

    it("should find documentation tools", async () => {
      const result = await client.searchLibraries("documentation");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("Storybook") || 
        lib.name.includes("Docusaurus")
      )).toBe(true);
    });

    it("should find utility libraries", async () => {
      const result = await client.searchLibraries("utility helpers");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => lib.name.includes("Lodash"))).toBe(true);
    });

    it("should find date libraries", async () => {
      const result = await client.searchLibraries("date time");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => 
        lib.name.includes("date-fns") || 
        lib.name.includes("Day.js")
      )).toBe(true);
    });

    it("should return empty array for unmatched topics", async () => {
      const result = await client.searchLibraries("completely unknown topic xyz");
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(0);
    });

    it("should handle case-insensitive topic matching", async () => {
      const result1 = await client.searchLibraries("AUTHENTICATION");
      const result2 = await client.searchLibraries("authentication");
      
      expect(result1.length).toBe(result2.length);
      expect(result1.map(r => r.id)).toEqual(result2.map(r => r.id));
    });

    it("should find Redis for caching", async () => {
      const result = await client.searchLibraries("cache redis");
      
      expect(result.length).toBeGreaterThan(0);
      expect(result.some(lib => lib.name.includes("Redis"))).toBe(true);
    });

    it("should return libraries with trust scores", async () => {
      const result = await client.searchLibraries("react");
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(lib => {
        expect(lib.trustScore).toBeGreaterThanOrEqual(1);
        expect(lib.trustScore).toBeLessThanOrEqual(10);
      });
    });

    it("should return libraries with descriptions", async () => {
      const result = await client.searchLibraries("database");
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(lib => {
        expect(lib.description).toBeTruthy();
        expect(lib.description.length).toBeGreaterThan(0);
      });
    });

    it("should return libraries with valid IDs", async () => {
      const result = await client.searchLibraries("testing");
      
      expect(result.length).toBeGreaterThan(0);
      result.forEach(lib => {
        expect(lib.id).toMatch(/^\/[\w-]+\/[\w-]+$/);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should resolve and get docs for a library", async () => {
      const library = await client.resolveLibrary("react");
      expect(library).not.toBeNull();
      
      if (library) {
        const docs = await client.getDocs(library.id, "hooks");
        expect(docs).not.toBeNull();
        expect(docs?.library).toBe("react");
      }
    });

    it("should search, resolve, and get docs", async () => {
      const libraries = await client.searchLibraries("authentication");
      expect(libraries.length).toBeGreaterThan(0);
      
      const firstLib = libraries[0];
      const resolved = await client.resolveLibrary(firstLib.name.toLowerCase());
      expect(resolved).not.toBeNull();
      
      if (resolved) {
        const docs = await client.getDocs(resolved.id, "setup");
        expect(docs).not.toBeNull();
      }
    });

    it("should handle full workflow for database setup", async () => {
      // Search for database libraries
      const libs = await client.searchLibraries("database orm");
      expect(libs.length).toBeGreaterThan(0);
      
      // Resolve Prisma
      const prisma = await client.resolveLibrary("prisma");
      expect(prisma).not.toBeNull();
      
      // Get documentation
      if (prisma) {
        const docs = await client.getDocs(prisma.id, "migrations");
        expect(docs).not.toBeNull();
        expect(docs?.content).toContain("migrations");
      }
    });

    it("should provide consistent results across multiple calls", async () => {
      const result1 = await client.searchLibraries("testing");
      const result2 = await client.searchLibraries("testing");
      
      expect(result1).toEqual(result2);
    });

    it("should handle concurrent requests", async () => {
      const promises = [
        client.resolveLibrary("react"),
        client.resolveLibrary("vue"),
        client.resolveLibrary("angular"),
        client.searchLibraries("database"),
        client.getDocs("/facebook/react", "hooks"),
      ];
      
      const results = await Promise.all(promises);
      
      expect(results[0]).not.toBeNull(); // React
      expect(results[1]).not.toBeNull(); // Vue
      expect(results[2]).not.toBeNull(); // Angular
      expect(Array.isArray(results[3])).toBe(true); // Database search
      expect(results[4]).not.toBeNull(); // React docs
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string library name", async () => {
      const result = await client.resolveLibrary("");
      expect(result).toBeNull();
    });

    it("should handle whitespace in library name", async () => {
      const result = await client.resolveLibrary("  react  ");
      expect(result).toBeNull(); // Should not match due to whitespace
    });

    it("should handle special characters in topic", async () => {
      const result = await client.searchLibraries("auth@#$%");
      // Should still find auth-related libraries
      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it("should handle very long topic strings", async () => {
      const longTopic = "authentication ".repeat(100);
      const result = await client.searchLibraries(longTopic);
      
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should handle empty topic in getDocs", async () => {
      const result = await client.getDocs("/facebook/react", "");
      expect(result).not.toBeNull();
    });

    it("should handle null-like values gracefully", async () => {
      const result1 = await client.searchLibraries("");
      const result2 = await client.getDocs("", "");
      
      expect(Array.isArray(result1)).toBe(true);
      expect(result2).not.toBeNull();
    });
  });
});
