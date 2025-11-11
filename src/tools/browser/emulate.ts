/**
 * Browser Emulation Tool
 * Device emulation and viewport control
 */

import { getBrowserManager } from "../../browser/index.js";
import type { MCPToolResult } from "../../types/mcp-tool.js";

export interface BrowserEmulateArgs {
  action: "device" | "geolocation" | "timezone" | "viewport";
  device?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  width?: number;
  height?: number;
}

export async function browserEmulateTool(args: BrowserEmulateArgs): Promise<MCPToolResult> {
  const { action, device, latitude, longitude, timezone, width, height } = args;

  try {
    const browser = await getBrowserManager();
    const page = browser.getCurrentPage();

    switch (action) {
      case "device": {
        if (!device) {
          throw new Error("Device name required");
        }

        const devices = {
          "iPhone 13": {
            userAgent:
              "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
            viewport: { width: 390, height: 844 },
            deviceScaleFactor: 3,
            isMobile: true,
            hasTouch: true,
          },
          "iPad Pro": {
            userAgent:
              "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
            viewport: { width: 1024, height: 1366 },
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true,
          },
          "Pixel 6": {
            userAgent:
              "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Mobile Safari/537.36",
            viewport: { width: 412, height: 915 },
            deviceScaleFactor: 2.625,
            isMobile: true,
            hasTouch: true,
          },
        };

        const deviceConfig = devices[device as keyof typeof devices];
        if (!deviceConfig) {
          throw new Error(`Unknown device: ${device}`);
        }

        await page.setViewportSize(deviceConfig.viewport);
        await page.context().setExtraHTTPHeaders({
          "User-Agent": deviceConfig.userAgent,
        });

        return {
          content: [
            {
              type: "text",
              text: `✅ Device emulation: ${device}\n\nViewport: ${deviceConfig.viewport.width}x${deviceConfig.viewport.height}\nScale: ${deviceConfig.deviceScaleFactor}x`,
            },
          ],
        };
      }

      case "geolocation": {
        if (latitude === undefined || longitude === undefined) {
          throw new Error("Latitude and longitude required");
        }

        await page.context().setGeolocation({ latitude, longitude });
        await page.context().grantPermissions(["geolocation"]);

        return {
          content: [
            {
              type: "text",
              text: `✅ Geolocation set\n\nLatitude: ${latitude}\nLongitude: ${longitude}`,
            },
          ],
        };
      }

      case "timezone": {
        if (!timezone) {
          throw new Error("Timezone required");
        }

        await page.context().setExtraHTTPHeaders({
          "TZ": timezone,
        });

        return {
          content: [
            {
              type: "text",
              text: `✅ Timezone set: ${timezone}`,
            },
          ],
        };
      }

      case "viewport": {
        if (!width || !height) {
          throw new Error("Width and height required");
        }

        await page.setViewportSize({ width, height });

        return {
          content: [
            {
              type: "text",
              text: `✅ Viewport resized: ${width}x${height}`,
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
          text: `❌ Emulation failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
