/**
 * Browser Performance Tool
 * Performance tracing and Core Web Vitals
 */

import { getBrowserManager } from "../../browser/index.js";
import type { MCPToolResult } from "../../types/mcp-tool.js";

export interface BrowserPerformanceArgs {
  action: "start" | "stop" | "metrics";
}

interface PerformanceNavigationTiming {
  entryType: string;
  domContentLoadedEventEnd?: number;
  domContentLoadedEventStart?: number;
  loadEventEnd?: number;
  loadEventStart?: number;
}

interface PerformancePaintTiming {
  entryType: string;
  name: string;
  startTime?: number;
}

interface PerformanceMetrics {
  domContentLoaded: number;
  load: number;
  firstPaint: number;
  firstContentfulPaint: number;
}

export async function browserPerformanceTool(args: BrowserPerformanceArgs): Promise<MCPToolResult> {
  const { action } = args as BrowserPerformanceArgs;

  try {
    const browser = await getBrowserManager();
    const page = browser.getCurrentPage();

    switch (action) {
      case "start": {
        // Start performance tracing
        await page.context().tracing.start({
          screenshots: true,
          snapshots: true,
        });

        return {
          content: [
            {
              type: "text",
              text: `✅ Performance tracing started\n\nCapturing screenshots and snapshots`,
            },
          ],
        };
      }

      case "stop": {
        // Stop tracing and save
        const tracePath = `./trace-${Date.now()}.zip`;
        await page.context().tracing.stop({ path: tracePath });

        return {
          content: [
            {
              type: "text",
              text: `✅ Performance tracing stopped\n\nTrace saved to: ${tracePath}`,
            },
          ],
        };
      }

      case "metrics": {
        // Get performance metrics
        const metrics = await page.evaluate((): PerformanceMetrics => {
          const perfEntries = performance.getEntries() as Array<PerformanceNavigationTiming | PerformancePaintTiming>;
          const navigation = perfEntries.find(
            (e): e is PerformanceNavigationTiming => e.entryType === "navigation"
          );
          const paints = perfEntries.filter(
            (e): e is PerformancePaintTiming => e.entryType === "paint"
          );

          const domContentLoaded = navigation && 
            navigation.domContentLoadedEventEnd !== undefined && 
            navigation.domContentLoadedEventStart !== undefined
            ? navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart
            : 0;

          const load = navigation && 
            navigation.loadEventEnd !== undefined && 
            navigation.loadEventStart !== undefined
            ? navigation.loadEventEnd - navigation.loadEventStart
            : 0;

          const firstPaint = paints.find((p) => p.name === "first-paint")?.startTime ?? 0;
          const firstContentfulPaint = paints.find((p) => p.name === "first-contentful-paint")?.startTime ?? 0;

          return {
            domContentLoaded,
            load,
            firstPaint,
            firstContentfulPaint,
          };
        });

        return {
          content: [
            {
              type: "text",
              text: `📊 Performance Metrics\n\nDOM Content Loaded: ${metrics.domContentLoaded.toFixed(2)}ms\nLoad Event: ${metrics.load.toFixed(2)}ms\nFirst Paint: ${metrics.firstPaint.toFixed(2)}ms\nFirst Contentful Paint: ${metrics.firstContentfulPaint.toFixed(2)}ms`,
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
          text: `❌ Performance operation failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
