/**
 * Browser Evaluate Tool
 * Execute JavaScript in browser context
 */

import { getBrowserManager } from "../../browser/index.js";

export interface BrowserEvaluateArgs {
  function: string;
  args?: unknown[];
}

export async function browserEvaluateTool(args: BrowserEvaluateArgs) {
  const { function: functionString, args: functionArgs = [] } = args;

  try {
    const browser = await getBrowserManager();
    const page = browser.getCurrentPage();

    // Create function from string
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const evalFunction = new Function("return " + functionString)() as (...args: unknown[]) => unknown;

    // Execute in page context
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await page.evaluate(evalFunction, ...functionArgs);

    // Format result for display
    let resultText: string;
    if (typeof result === "object") {
      resultText = JSON.stringify(result, null, 2);
    } else {
      resultText = String(result);
    }

    return {
      content: [
        {
          type: "text",
          text: `✅ JavaScript executed\n\nResult:\n${resultText}`,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: `❌ Evaluation failed: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
