/**
 * Browser Manager
 * Manages Playwright browser instances and sessions
 */

import { chromium, firefox, webkit } from "playwright";
import type { Page, CDPSession } from "playwright";
import type { BrowserConfig, BrowserState, ConsoleMessage } from "./types.js";
import { DEFAULT_BROWSER_CONFIG, validateBrowserConfig } from "./browser-config.js";

export class BrowserManager {
  private state: BrowserState;

  constructor(config?: Partial<BrowserConfig>) {
    const fullConfig = { ...DEFAULT_BROWSER_CONFIG, ...config };
    
    // Validate configuration
    const validation = validateBrowserConfig(fullConfig);
    if (!validation.valid) {
      throw new Error(`Invalid browser config: ${validation.errors.join(", ")}`);
    }

    this.state = {
      browser: null,
      context: null,
      pages: [],
      currentPageIndex: 0,
      cdpSession: null,
      consoleMessages: [],
      config: fullConfig,
    };
  }

  /**
   * Initialize browser and create first page
   */
  async initialize(): Promise<void> {
    if (this.state.browser) {
      return; // Already initialized
    }

    const { browser: browserConfig, viewport, timeout } = this.state.config;

    // Launch browser based on type
    let browserType;
    switch (browserConfig.type) {
      case "firefox":
        browserType = firefox;
        break;
      case "webkit":
        browserType = webkit;
        break;
      default:
        browserType = chromium;
    }

    this.state.browser = await browserType.launch({
      headless: browserConfig.headless,
      devtools: browserConfig.devtools,
      slowMo: browserConfig.slowMo,
      args: browserConfig.args,
    });

    // Create context
    this.state.context = await this.state.browser.newContext({
      viewport,
      ignoreHTTPSErrors: true,
    });

    // Set timeouts
    this.state.context.setDefaultNavigationTimeout(timeout.navigation);
    this.state.context.setDefaultTimeout(timeout.action);

    // Create first page
    const page = await this.state.context.newPage();
    this.state.pages.push(page);

    // Setup console message listener
    page.on("console", (msg) => {
      const consoleMsg: ConsoleMessage = {
        type: msg.type() as ConsoleMessage["type"],
        text: msg.text(),
        timestamp: Date.now(),
        location: msg.location()
          ? {
              url: msg.location().url,
              lineNumber: msg.location().lineNumber || 0,
              columnNumber: msg.location().columnNumber || 0,
            }
          : undefined,
      };
      this.state.consoleMessages.push(consoleMsg);
    });

    // Create CDP session for Chromium
    if (browserConfig.type === "chromium") {
      try {
        this.state.cdpSession = await this.state.context.newCDPSession(page);
      } catch (error) {
        console.warn("CDP session creation failed:", error);
      }
    }
  }

  /**
   * Get current active page
   */
  getCurrentPage(): Page {
    if (this.state.pages.length === 0) {
      throw new Error("No pages available");
    }
    return this.state.pages[this.state.currentPageIndex];
  }

  /**
   * Get all pages
   */
  getAllPages(): Page[] {
    return this.state.pages;
  }

  /**
   * Create new page/tab
   */
  async createPage(): Promise<Page> {
    if (!this.state.context) {
      throw new Error("Browser not initialized");
    }

    const page = await this.state.context.newPage();
    this.state.pages.push(page);
    this.state.currentPageIndex = this.state.pages.length - 1;

    // Setup console listener
    page.on("console", (msg) => {
      const consoleMsg: ConsoleMessage = {
        type: msg.type() as ConsoleMessage["type"],
        text: msg.text(),
        timestamp: Date.now(),
      };
      this.state.consoleMessages.push(consoleMsg);
    });

    return page;
  }

  /**
   * Switch to page by index
   */
  selectPage(index: number): void {
    if (index < 0 || index >= this.state.pages.length) {
      throw new Error(`Invalid page index: ${index}`);
    }
    this.state.currentPageIndex = index;
  }

  /**
   * Close page by index
   */
  async closePage(index?: number): Promise<void> {
    const closeIndex = index ?? this.state.currentPageIndex;

    if (this.state.pages.length === 1) {
      throw new Error("Cannot close the last page");
    }

    const page = this.state.pages[closeIndex];
    await page.close();

    this.state.pages.splice(closeIndex, 1);

    // Adjust current index
    if (this.state.currentPageIndex >= this.state.pages.length) {
      this.state.currentPageIndex = this.state.pages.length - 1;
    }
  }

  /**
   * Get CDP session
   */
  getCDPSession(): CDPSession {
    if (!this.state.cdpSession) {
      throw new Error("CDP session not available");
    }
    return this.state.cdpSession;
  }

  /**
   * Get console messages
   */
  getConsoleMessages(onlyErrors = false): ConsoleMessage[] {
    if (onlyErrors) {
      return this.state.consoleMessages.filter((msg) => msg.type === "error");
    }
    return this.state.consoleMessages;
  }

  /**
   * Clear console messages
   */
  clearConsoleMessages(): void {
    this.state.consoleMessages = [];
  }

  /**
   * Get browser configuration
   */
  getConfig(): BrowserConfig {
    return this.state.config;
  }

  /**
   * Check if browser is initialized
   */
  isInitialized(): boolean {
    return this.state.browser !== null;
  }

  /**
   * Cleanup and close browser
   */
  async cleanup(): Promise<void> {
    if (this.state.cdpSession) {
      try {
        await this.state.cdpSession.detach();
      } catch {
        // Ignore detach errors
      }
      this.state.cdpSession = null;
    }

    if (this.state.context) {
      await this.state.context.close();
      this.state.context = null;
    }

    if (this.state.browser) {
      await this.state.browser.close();
      this.state.browser = null;
    }

    this.state.pages = [];
    this.state.consoleMessages = [];
  }
}

// Global singleton instance
let browserManagerInstance: BrowserManager | null = null;

/**
 * Get or create browser manager instance
 */
export async function getBrowserManager(): Promise<BrowserManager> {
  if (!browserManagerInstance) {
    browserManagerInstance = new BrowserManager();
    await browserManagerInstance.initialize();
  }
  return browserManagerInstance;
}

/**
 * Cleanup global browser manager
 */
export async function cleanupBrowserManager(): Promise<void> {
  if (browserManagerInstance) {
    await browserManagerInstance.cleanup();
    browserManagerInstance = null;
  }
}
