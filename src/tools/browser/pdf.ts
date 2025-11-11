/**
 * Browser PDF Tool
 * Generate PDFs from web pages
 */

import { getBrowserManager } from "../../browser/index.js";
import type { MCPToolResult } from "../../types/mcp-tool.js";
import path from "path";

export interface BrowserPdfArgs {
  filePath?: string;
  format?: "A4" | "Letter" | "Legal";
  landscape?: boolean;
  printBackground?: boolean;
}

export async function browserPdfTool(args: BrowserPdfArgs): Promise<MCPToolResult> {
  const {
    filePath = `./page-${Date.now()}.pdf`,
    format = "A4",
    landscape = false,
    printBackground = true,
  } = args as BrowserPdfArgs;

  try {
    const browser = await getBrowserManager();
    const page = browser.getCurrentPage();

    const pdfPath = path.resolve(filePath);

    await page.pdf({
      path: pdfPath,
      format,
      landscape,
      printBackground,
    });

    return {
      content: [
        {
          type: "text",
          text: `✅ PDF generated\n\nPath: ${pdfPath}\nFormat: ${format}\nLandscape: ${landscape}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ PDF generation failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
