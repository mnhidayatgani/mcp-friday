#!/usr/bin/env node

/**
 * FRIDAY MCP Server
 * Personal AI Agent with Upstash integration
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { setupTool } from "./tools/setup/index.js";
import { searchTool } from "./tools/search.js";
import { syncTool } from "./tools/sync.js";
import { contextTool } from "./tools/context.js";

const server = new Server(
  {
    name: "friday-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "friday-setup",
        description:
          "Initialize FRIDAY in current project with one command. " +
          "Creates memory structure, deploys copilot instructions, " +
          "configures Upstash Redis, and activates FRIDAY persona.",
        inputSchema: {
          type: "object",
          properties: {
            projectType: {
              type: "string",
              description: "Project type: web, api, cli, or auto-detect",
              enum: ["web", "api", "cli", "auto-detect"],
              default: "auto-detect",
            },
            enableRedis: {
              type: "boolean",
              description: "Enable Upstash Redis for session storage",
              default: true,
            },
            memoryCapacity: {
              type: "number",
              description: "Maximum number of memory files to keep",
              default: 100,
            },
          },
        },
      },
      {
        name: "friday-search",
        description:
          "Hybrid search across Git memory, Upstash Redis cache, and Context7 docs. " +
          "Finds relevant context using semantic search and ranking.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
            },
            sources: {
              type: "array",
              description: "Which sources to search",
              items: {
                type: "string",
                enum: ["git", "redis", "context7"],
              },
              default: ["git", "redis", "context7"],
            },
            maxResults: {
              type: "number",
              description: "Maximum results to return",
              default: 10,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "friday-sync",
        description:
          "Sync Git memory to Upstash Redis for fast global access. " +
          "Uploads .github/memory/ files to Redis with semantic indexing.",
        inputSchema: {
          type: "object",
          properties: {
            direction: {
              type: "string",
              description: "Sync direction",
              enum: ["git-to-redis", "redis-to-git", "bidirectional"],
              default: "git-to-redis",
            },
            force: {
              type: "boolean",
              description: "Force overwrite conflicts",
              default: false,
            },
          },
        },
      },
      {
        name: "friday-context",
        description:
          "Load project context from all memory sources. " +
          "Combines Git memory, Redis cache, and Context7 docs into unified context.",
        inputSchema: {
          type: "object",
          properties: {
            depth: {
              type: "string",
              description: "How much context to load",
              enum: ["minimal", "standard", "full"],
              default: "standard",
            },
            includeHistory: {
              type: "boolean",
              description: "Include historical implementations/decisions",
              default: true,
            },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "friday-setup":
        return await setupTool(args);

      case "friday-search":
        return await searchTool(args);

      case "friday-sync":
        return await syncTool(args);

      case "friday-context":
        return await contextTool(args);

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `Error executing ${name}: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("FRIDAY MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
