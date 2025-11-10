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
import { greetingTool } from "./tools/greeting.js";

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
          description: "Initialize FRIDAY in current project",
          inputSchema: {
            type: "object",
            properties: {
              projectType: { type: "string" },
              enableRedis: { type: "boolean" },
              memoryCapacity: { type: "number" },
            },
          },
        },
        {
          name: "friday-search",
          description: "Search FRIDAY memory",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string" },
            },
            required: ["query"],
          },
        },
        {
          name: "friday-context",
          description: "Load full project context",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "friday-sync",
          description: "Sync memory to Redis",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "friday-greeting",
          description: "Greet FRIDAY and get project status",
          inputSchema: { type: "object", properties: {} },
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

      case "friday-greeting":
        return await greetingTool();

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
