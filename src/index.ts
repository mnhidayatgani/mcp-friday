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
import { SmartSearchStrategy, formatSmartSearchResults } from "./tools/smart-search.js";
import { ConfigLoader } from "./utils/config-loader.js";
import {
  browserNavigateTool,
  browserScreenshotTool,
  browserEvaluateTool,
  browserTabsTool,
  browserConsoleTool,
  browserClickTool,
  browserTypeTool,
  browserPressTool,
  browserPerformanceTool,
  browserNetworkTool,
  browserPdfTool,
  browserEmulateTool,
  browserStorageTool,
} from "./tools/browser/index.js";
import type { BrowserNavigateArgs } from "./tools/browser/navigate.js";
import type { BrowserEvaluateArgs } from "./tools/browser/evaluate.js";
import type { BrowserConsoleArgs } from "./tools/browser/console.js";
import type { BrowserClickArgs, BrowserTypeArgs, BrowserPressArgs } from "./tools/browser/interact.js";
import type { BrowserNetworkArgs } from "./tools/browser/network.js";
import type { BrowserEmulateArgs } from "./tools/browser/emulate.js";
import { cleanupBrowserManager } from "./browser/index.js";

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
  server.setRequestHandler(ListToolsRequestSchema, () => {
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
        {
          name: "friday-smart-search",
          description: "Smart search for new features (local → upstash → context7)",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string", description: "Feature or topic to search for" },
              featureContext: { type: "string", description: "Additional context (optional)" },
            },
            required: ["query"],
          },
        },
        {
          name: "browser-navigate",
          description: "Navigate browser to URL or use history navigation",
          inputSchema: {
            type: "object",
            properties: {
              url: { type: "string" },
              action: { type: "string", enum: ["back", "forward", "reload"] },
              timeout: { type: "number" },
              waitUntil: { type: "string", enum: ["load", "domcontentloaded", "networkidle"] },
            },
          },
        },
        {
          name: "browser-screenshot",
          description: "Capture screenshot of current page",
          inputSchema: {
            type: "object",
            properties: {
              format: { type: "string", enum: ["png", "jpeg", "webp"] },
              quality: { type: "number" },
              fullPage: { type: "boolean" },
              filePath: { type: "string" },
            },
          },
        },
        {
          name: "browser-evaluate",
          description: "Execute JavaScript in browser context",
          inputSchema: {
            type: "object",
            properties: {
              function: { type: "string" },
              args: { 
                type: "array",
                items: { type: "string" }
              },
            },
            required: ["function"],
          },
        },
        {
          name: "browser-tabs",
          description: "Manage browser tabs (list, create, select, close)",
          inputSchema: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["list", "create", "select", "close"] },
              index: { type: "number" },
            },
            required: ["action"],
          },
        },
        {
          name: "browser-console",
          description: "View or clear browser console messages",
          inputSchema: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["list", "clear"] },
              onlyErrors: { type: "boolean" },
            },
            required: ["action"],
          },
        },
        {
          name: "browser-click",
          description: "Click an element on the page",
          inputSchema: {
            type: "object",
            properties: {
              selector: { type: "string" },
              button: { type: "string", enum: ["left", "right", "middle"] },
              clickCount: { type: "number" },
            },
            required: ["selector"],
          },
        },
        {
          name: "browser-type",
          description: "Type text into an input field",
          inputSchema: {
            type: "object",
            properties: {
              selector: { type: "string" },
              text: { type: "string" },
              delay: { type: "number" },
            },
            required: ["selector", "text"],
          },
        },
        {
          name: "browser-press",
          description: "Press a keyboard key",
          inputSchema: {
            type: "object",
            properties: {
              key: { type: "string" },
            },
            required: ["key"],
          },
        },
        {
          name: "browser-performance",
          description: "Performance tracing and metrics",
          inputSchema: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["start", "stop", "metrics"] },
            },
            required: ["action"],
          },
        },
        {
          name: "browser-network",
          description: "Network throttling, blocking, and monitoring",
          inputSchema: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["throttle", "block", "monitor"] },
              throttleType: { type: "string", enum: ["Fast 3G", "Slow 3G", "Offline", "None"] },
              blockedUrls: { type: "array", items: { type: "string" } },
            },
            required: ["action"],
          },
        },
        {
          name: "browser-pdf",
          description: "Generate PDF from current page",
          inputSchema: {
            type: "object",
            properties: {
              filePath: { type: "string" },
              format: { type: "string", enum: ["A4", "Letter", "Legal"] },
              landscape: { type: "boolean" },
              printBackground: { type: "boolean" },
            },
          },
        },
        {
          name: "browser-emulate",
          description: "Device emulation, geolocation, timezone, viewport",
          inputSchema: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["device", "geolocation", "timezone", "viewport"] },
              device: { type: "string" },
              latitude: { type: "number" },
              longitude: { type: "number" },
              timezone: { type: "string" },
              width: { type: "number" },
              height: { type: "number" },
            },
            required: ["action"],
          },
        },
        {
          name: "browser-storage",
          description: "Manage cookies, localStorage, sessionStorage",
          inputSchema: {
            type: "object",
            properties: {
              action: { type: "string", enum: ["get-cookies", "set-cookie", "clear-cookies", "local-storage", "session-storage"] },
              name: { type: "string" },
              value: { type: "string" },
              domain: { type: "string" },
              path: { type: "string" },
              key: { type: "string" },
            },
            required: ["action"],
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

      case "friday-greeting":
        return await greetingTool();

      case "friday-smart-search": {
        const config = ConfigLoader.load();
        const smartSearch = new SmartSearchStrategy(config.projectRoot);
        const query = (args as { query?: string })?.query || "";
        const featureContext = (args as { featureContext?: string })?.featureContext;
        const result = await smartSearch.search(query, featureContext);
        return {
          content: [
            {
              type: "text",
              text: formatSmartSearchResults(result),
            },
          ],
        };
      }

      case "browser-navigate":
        return await browserNavigateTool((args || {}) as unknown as BrowserNavigateArgs);

      case "browser-screenshot":
        return await browserScreenshotTool(args);

      case "browser-evaluate":
        return await browserEvaluateTool((args || { function: '' }) as unknown as BrowserEvaluateArgs);

      case "browser-tabs":
        return await browserTabsTool(args);

      case "browser-console":
        return await browserConsoleTool((args || { action: 'list' }) as unknown as BrowserConsoleArgs);

      case "browser-click":
        return await browserClickTool((args || { selector: 'body' }) as unknown as BrowserClickArgs);

      case "browser-type":
        return await browserTypeTool((args || { selector: '', text: '' }) as unknown as BrowserTypeArgs);

      case "browser-press":
        return await browserPressTool((args || { key: '' }) as unknown as BrowserPressArgs);

      case "browser-performance":
        return await browserPerformanceTool(args);

      case "browser-network":
        return await browserNetworkTool((args || { action: 'monitor' }) as unknown as BrowserNetworkArgs);

      case "browser-pdf":
        return await browserPdfTool(args);

      case "browser-emulate":
        return await browserEmulateTool((args || { action: 'viewport' }) as unknown as BrowserEmulateArgs);

      case "browser-storage":
        return await browserStorageTool(args);

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
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("FRIDAY MCP Server running on stdio");

  // Cleanup on exit
  process.on("SIGINT", () => {
    console.error("\nShutting down FRIDAY MCP Server...");
    void cleanupBrowserManager();
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.error("\nShutting down FRIDAY MCP Server...");
    void cleanupBrowserManager();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
