/**
 * Browser Tabs Management Tool
 */

import { getBrowserManager } from "../../browser/index.js";
import type { MCPToolResult } from "../../types/mcp-tool.js";

export interface BrowserTabsArgs {
  action: "list" | "create" | "select" | "close";
  index?: number;
}

export async function browserTabsTool(args: BrowserTabsArgs): Promise<MCPToolResult> {
  const { action, index } = args as BrowserTabsArgs;

  try {
    const browser = await getBrowserManager();

    switch (action) {
      case "list": {
        const pages = browser.getAllPages();
        const tabsList: string[] = [];

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const url = page.url();
          const title = await page.title();
          const isActive = i === browser["state"].currentPageIndex;
          tabsList.push(
            `${i + 1}. ${title || "Untitled"} - ${url}${isActive ? " [active]" : ""}`
          );
        }

        return {
          content: [
            {
              type: "text",
              text: `📑 Open tabs (${pages.length}):\n\n${tabsList.join("\n")}`,
            },
          ],
        };
      }

      case "create": {
        const newPage = await browser.createPage();
        await newPage.goto("about:blank");

        return {
          content: [
            {
              type: "text",
              text: `✅ New tab created\n\nTotal tabs: ${browser.getAllPages().length}`,
            },
          ],
        };
      }

      case "select": {
        if (index === undefined) {
          throw new Error("Index required for select action");
        }

        browser.selectPage(index);
        const page = browser.getCurrentPage();
        const url = page.url();
        const title = await page.title();

        return {
          content: [
            {
              type: "text",
              text: `✅ Switched to tab ${index + 1}\n\n${title} - ${url}`,
            },
          ],
        };
      }

      case "close": {
        const closeIndex = index ?? browser["state"].currentPageIndex;
        const page = browser.getAllPages()[closeIndex];
        const title = await page.title();

        await browser.closePage(closeIndex);

        return {
          content: [
            {
              type: "text",
              text: `✅ Tab closed: ${title}\n\nRemaining tabs: ${browser.getAllPages().length}`,
            },
          ],
        };
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
          text: `❌ Tab operation failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
