/**
 * Browser Storage Tool
 * Manage cookies, localStorage, sessionStorage
 */

import { getBrowserManager } from "../../browser/index.js";
import type { MCPToolResult } from "../../types/mcp-tool.js";

export interface BrowserStorageArgs {
  action: "get-cookies" | "set-cookie" | "clear-cookies" | "local-storage" | "session-storage";
  name?: string;
  value?: string;
  domain?: string;
  path?: string;
  key?: string;
}

export async function browserStorageTool(args: BrowserStorageArgs): Promise<MCPToolResult> {
  const { action, name, value, domain, path = "/", key } = args as BrowserStorageArgs;

  try {
    const browser = await getBrowserManager();
    const page = browser.getCurrentPage();

    switch (action) {
      case "get-cookies": {
        const cookies = await page.context().cookies();

        return {
          content: [
            {
              type: "text",
              text: `🍪 Cookies (${cookies.length}):\n\n${cookies.map((c) => `${c.name} = ${c.value} (${c.domain})`).join("\n") || "No cookies"}`,
            },
          ],
        };
      }

      case "set-cookie": {
        if (!name || !value || !domain) {
          throw new Error("Name, value, and domain required");
        }

        await page.context().addCookies([
          {
            name,
            value,
            domain,
            path,
          },
        ]);

        return {
          content: [
            {
              type: "text",
              text: `✅ Cookie set\n\nName: ${name}\nValue: ${value}\nDomain: ${domain}`,
            },
          ],
        };
      }

      case "clear-cookies": {
        await page.context().clearCookies();

        return {
          content: [
            {
              type: "text",
              text: `✅ All cookies cleared`,
            },
          ],
        };
      }

      case "local-storage": {
        if (key && value) {
          // Set localStorage
          await page.evaluate(
            ({ k, v }) => localStorage.setItem(k, v),
            { k: key, v: value }
          );

          return {
            content: [
              {
                type: "text",
                text: `✅ localStorage set\n\nKey: ${key}\nValue: ${value}`,
              },
            ],
          };
        } else if (key) {
          // Get localStorage value
          const storageValue = await page.evaluate(
            (k) => localStorage.getItem(k),
            key
          );

          return {
            content: [
              {
                type: "text",
                text: `📦 localStorage.${key} = ${storageValue || "null"}`,
              },
            ],
          };
        } else {
          // Get all localStorage
          const storage = await page.evaluate(() => {
            const items: Record<string, string> = {};
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k) items[k] = localStorage.getItem(k) || "";
            }
            return items;
          });

          return {
            content: [
              {
                type: "text",
                text: `📦 localStorage:\n\n${Object.entries(storage).map(([k, v]) => `${k} = ${v}`).join("\n") || "Empty"}`,
              },
            ],
          };
        }
      }

      case "session-storage": {
        if (key && value) {
          // Set sessionStorage
          await page.evaluate(
            ({ k, v }) => sessionStorage.setItem(k, v),
            { k: key, v: value }
          );

          return {
            content: [
              {
                type: "text",
                text: `✅ sessionStorage set\n\nKey: ${key}\nValue: ${value}`,
              },
            ],
          };
        } else if (key) {
          // Get sessionStorage value
          const storageValue = await page.evaluate(
            (k) => sessionStorage.getItem(k),
            key
          );

          return {
            content: [
              {
                type: "text",
                text: `📦 sessionStorage.${key} = ${storageValue || "null"}`,
              },
            ],
          };
        } else {
          // Get all sessionStorage
          const storage = await page.evaluate(() => {
            const items: Record<string, string> = {};
            for (let i = 0; i < sessionStorage.length; i++) {
              const k = sessionStorage.key(i);
              if (k) items[k] = sessionStorage.getItem(k) || "";
            }
            return items;
          });

          return {
            content: [
              {
                type: "text",
                text: `📦 sessionStorage:\n\n${Object.entries(storage).map(([k, v]) => `${k} = ${v}`).join("\n") || "Empty"}`,
              },
            ],
          };
        }
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Storage operation failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
