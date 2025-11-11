/**
 * Browser Console Tool
 */

import { getBrowserManager } from "../../browser/index.js";
import type { MCPToolResult } from "../../types/mcp-tool.js";

export interface BrowserConsoleArgs {
  action: "list" | "clear";
  onlyErrors?: boolean;
}

export async function browserConsoleTool(args: BrowserConsoleArgs): Promise<MCPToolResult> {
  const { action, onlyErrors = false } = args;

  try {
    const browser = await getBrowserManager();

    switch (action) {
      case "list": {
        const messages = browser.getConsoleMessages(onlyErrors);

        if (messages.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `📋 Console messages: Empty\n\nNo ${onlyErrors ? "error " : ""}messages recorded`,
              },
            ],
          };
        }

        const messagesList = messages.map((msg, i) => {
          const icon =
            msg.type === "error"
              ? "❌"
              : msg.type === "warn"
                ? "⚠️ "
                : msg.type === "info"
                  ? "ℹ️ "
                  : "📝";
          const time = new Date(msg.timestamp).toLocaleTimeString();
          let location = "";
          if (msg.location) {
            location = ` [${msg.location.url}:${msg.location.lineNumber}]`;
          }
          return `${i + 1}. ${icon} [${time}] ${msg.text}${location}`;
        });

        return {
          content: [
            {
              type: "text",
              text: `📋 Console messages (${messages.length}):\n\n${messagesList.join("\n")}`,
            },
          ],
        };
      }

      case "clear": {
        const count = browser.getConsoleMessages().length;
        browser.clearConsoleMessages();

        return {
          content: [
            {
              type: "text",
              text: `✅ Console cleared\n\nRemoved ${count} message(s)`,
            },
          ],
        };
      }

      default: {
        // TypeScript exhaustive check
        const _exhaustive: never = action;
        throw new Error(`Unknown action: ${String(_exhaustive)}`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Console operation failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
