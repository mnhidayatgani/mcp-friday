/**
 * Browser Interaction Tools
 * Click, type, and other user interactions
 */

import { getBrowserManager } from "../../browser/index.js";
import type { MCPToolResult } from "../../types/mcp-tool.js";

export interface BrowserClickArgs {
  selector: string;
  button?: "left" | "right" | "middle";
  clickCount?: number;
}

export async function browserClickTool(args: BrowserClickArgs): Promise<MCPToolResult> {
  const { selector, button = "left", clickCount = 1 } = args;

  try {
    const browser = await getBrowserManager();
    const page = browser.getCurrentPage();

    await page.click(selector, { button, clickCount });

    return {
      content: [
        {
          type: "text",
          text: `✅ Clicked element: ${selector}\n\nButton: ${button}\nClicks: ${clickCount}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Click failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

export interface BrowserTypeArgs {
  selector: string;
  text: string;
  delay?: number;
}

export async function browserTypeTool(args: BrowserTypeArgs): Promise<MCPToolResult> {
  const { selector, text, delay = 0 } = args;

  try {
    const browser = await getBrowserManager();
    const page = browser.getCurrentPage();

    await page.fill(selector, ""); // Clear first
    await page.type(selector, text, { delay });

    return {
      content: [
        {
          type: "text",
          text: `✅ Typed text into: ${selector}\n\nLength: ${text.length} characters`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Type failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

export interface BrowserPressArgs {
  key: string;
}

export async function browserPressTool(args: BrowserPressArgs): Promise<MCPToolResult> {
  const { key } = args;

  try {
    const browser = await getBrowserManager();
    const page = browser.getCurrentPage();

    await page.keyboard.press(key);

    return {
      content: [
        {
          type: "text",
          text: `✅ Pressed key: ${key}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Key press failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
