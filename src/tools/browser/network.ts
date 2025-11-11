/**
 * Browser Network Tool
 * Network monitoring and control
 */

import { getBrowserManager } from "../../browser/index.js";

export interface BrowserNetworkArgs {
  action: "throttle" | "block" | "monitor";
  throttleType?: "Fast 3G" | "Slow 3G" | "Offline" | "None";
  blockedUrls?: string[];
}

export async function browserNetworkTool(args: BrowserNetworkArgs) {
  const { action, throttleType = "None", blockedUrls = [] } = args;

  try {
    const browser = await getBrowserManager();
    const page = browser.getCurrentPage();

    switch (action) {
      case "throttle": {
        const cdp = browser.getCDPSession();

        const throttleConfigs = {
          "Fast 3G": {
            offline: false,
            downloadThroughput: (1.6 * 1024 * 1024) / 8,
            uploadThroughput: (750 * 1024) / 8,
            latency: 40,
          },
          "Slow 3G": {
            offline: false,
            downloadThroughput: (500 * 1024) / 8,
            uploadThroughput: (500 * 1024) / 8,
            latency: 400,
          },
          Offline: {
            offline: true,
            downloadThroughput: 0,
            uploadThroughput: 0,
            latency: 0,
          },
          None: {
            offline: false,
            downloadThroughput: -1,
            uploadThroughput: -1,
            latency: 0,
          },
        };

        const config = throttleConfigs[throttleType];
        await cdp.send("Network.emulateNetworkConditions", config);

        return {
          content: [
            {
              type: "text",
              text: `✅ Network throttling: ${throttleType}\n\nDownload: ${config.downloadThroughput === -1 ? "Unlimited" : `${((config.downloadThroughput * 8) / 1024).toFixed(0)} Kbps`}\nUpload: ${config.uploadThroughput === -1 ? "Unlimited" : `${((config.uploadThroughput * 8) / 1024).toFixed(0)} Kbps`}\nLatency: ${config.latency}ms`,
            },
          ],
        };
      }

      case "block": {
        await page.route(
          (url) => blockedUrls.some((blocked) => url.toString().includes(blocked)),
          (route) => route.abort()
        );

        return {
          content: [
            {
              type: "text",
              text: `✅ Network blocking enabled\n\nBlocked URLs (${blockedUrls.length}):\n${blockedUrls.map((url) => `- ${url}`).join("\n")}`,
            },
          ],
        };
      }

      case "monitor": {
        interface RequestInfo {
          url: string;
          method: string;
          resourceType: string;
        }
        const requests: RequestInfo[] = [];

        page.on("request", (request) => {
          requests.push({
            url: request.url(),
            method: request.method(),
            resourceType: request.resourceType(),
          });
        });

        return {
          content: [
            {
              type: "text",
              text: `✅ Network monitoring enabled\n\nMonitoring all requests`,
            },
          ],
        };
      }

      default: {
        const unknownAction: never = action;
        throw new Error(`Unknown action: ${unknownAction}`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Network operation failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
