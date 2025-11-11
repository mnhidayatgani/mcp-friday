/**
 * Browser Screenshot Tool
 */

import { getBrowserManager } from "../../browser/index.js";
import type { ScreenshotFormat } from "../../browser/types.js";
import type { MCPToolResult } from "../../types/mcp-tool.js";
import path from "path";
import { promises as fs } from "fs";

export interface BrowserScreenshotArgs {
  format?: ScreenshotFormat;
  quality?: number;
  fullPage?: boolean;
  filePath?: string;
}

interface ScreenshotOptions {
  type: ScreenshotFormat;
  fullPage: boolean;
  quality?: number;
  path?: string;
}

// Type assertion untuk Playwright screenshot options
type PlaywrightScreenshotOptions = {
  type?: "png" | "jpeg";
  fullPage?: boolean;
  quality?: number;
  path?: string;
};

export async function browserScreenshotTool(args: BrowserScreenshotArgs): Promise<MCPToolResult> {
  const {
    format = "png",
    quality = 90,
    fullPage = false,
    filePath,
  } = args as BrowserScreenshotArgs;

  try {
    const browser = await getBrowserManager();
    const page = browser.getCurrentPage();

    // Playwright hanya support png dan jpeg, webp akan di-convert ke jpeg
    const playwrightFormat: "png" | "jpeg" = format === "webp" ? "jpeg" : format;
    
    const screenshotOptions: PlaywrightScreenshotOptions = {
      type: playwrightFormat,
      fullPage,
    };

    if (playwrightFormat === "jpeg") {
      screenshotOptions.quality = quality;
    }

    if (filePath) {
      screenshotOptions.path = filePath;
    }

    const screenshot = await page.screenshot(screenshotOptions);

    if (filePath) {
      const absolutePath = path.resolve(filePath);
      const stats = await fs.stat(absolutePath);

      return {
        content: [
          {
            type: "text",
            text: `✅ Screenshot saved\n\nPath: ${absolutePath}\nSize: ${(stats.size / 1024).toFixed(2)} KB\nFormat: ${format}\nFull page: ${fullPage}`,
          },
        ],
      };
    } else {
      // Return inline screenshot
      const base64Data = screenshot.toString("base64");

      return {
        content: [
          {
            type: "text",
            text: `✅ Screenshot captured\n\nFormat: ${format}\nSize: ${(screenshot.length / 1024).toFixed(2)} KB\nFull page: ${fullPage}`,
          },
          {
            type: "image",
            data: base64Data,
            mimeType: `image/${format}`,
          },
        ],
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Screenshot failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
