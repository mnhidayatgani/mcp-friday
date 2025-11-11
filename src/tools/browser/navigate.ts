/**
 * Browser Navigation Tool
 */

import { getBrowserManager } from "../../browser/index.js";
import type { NavigationAction, WaitUntil } from "../../browser/types.js";
import type { MCPToolResult } from "../../types/mcp-tool.js";

export interface BrowserNavigateArgs {
  url?: string;
  action?: NavigationAction;
  timeout?: number;
  waitUntil?: WaitUntil;
}

export async function browserNavigateTool(args: BrowserNavigateArgs): Promise<MCPToolResult> {
  const {
    url,
    action,
    timeout,
    waitUntil = "load",
  } = args;

  try {
    const browser = await getBrowserManager();
    const page = browser.getCurrentPage();

    if (url) {
      // Navigate to URL
      await page.goto(url, {
        timeout: timeout || browser.getConfig().timeout.navigation,
        waitUntil,
      });
    } else if (action === "back") {
      await page.goBack({ waitUntil });
    } else if (action === "forward") {
      await page.goForward({ waitUntil });
    } else if (action === "reload") {
      await page.reload({ waitUntil });
    } else {
      throw new Error("Must provide either url or action parameter");
    }

    const currentUrl = page.url();
    const title = await page.title();

    return {
      content: [
        {
          type: "text",
          text: `✅ Navigation successful\n\nURL: ${currentUrl}\nTitle: ${title}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Navigation failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
