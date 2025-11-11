/**
 * Test script to execute all MCP tools and check for errors
 */

import { setupTool } from './dist/tools/setup/index.js';
import { searchTool } from './dist/tools/search.js';
import { syncTool } from './dist/tools/sync.js';
import { contextTool } from './dist/tools/context.js';
import { greetingTool } from './dist/tools/greeting.js';
import { SmartSearchStrategy, formatSmartSearchResults } from './dist/tools/smart-search.js';
import { ConfigLoader } from './dist/utils/config-loader.js';
import {
  browserNavigateTool,
  browserScreenshotTool,
  browserEvaluateTool,
  browserTabsTool,
  browserConsoleTool,
  browserClickTool,
  browserTypeTool,
  browserPressTool,
  browserPerformanceTool,
  browserNetworkTool,
  browserPdfTool,
  browserEmulateTool,
  browserStorageTool,
} from './dist/tools/browser/index.js';
import { cleanupBrowserManager } from './dist/browser/index.js';

async function testTool(name, fn, args = {}) {
  console.log(`\n🔍 Testing: ${name}`);
  try {
    const result = await fn(args);
    console.log(`✅ ${name} - SUCCESS`);
    return { name, success: true, result };
  } catch (error) {
    console.error(`❌ ${name} - ERROR: ${error.message}`);
    return { name, success: false, error: error.message, stack: error.stack };
  }
}

async function main() {
  console.log('🚀 Starting MCP Tools Test Suite\n');
  console.log('='.repeat(60));
  
  const results = [];

  // Test FRIDAY core tools
  results.push(await testTool('friday-greeting', greetingTool));
  results.push(await testTool('friday-context', contextTool));
  results.push(await testTool('friday-search', searchTool, { query: 'test' }));
  results.push(await testTool('friday-sync', syncTool));
  
  // Test friday-setup with minimal args
  results.push(await testTool('friday-setup', setupTool, { projectType: 'web' }));
  
  // Test smart search
  try {
    const config = ConfigLoader.load();
    const smartSearch = new SmartSearchStrategy(config.projectRoot);
    const result = await testTool('friday-smart-search', 
      async () => {
        const searchResult = await smartSearch.search('authentication');
        return {
          content: [{ type: 'text', text: formatSmartSearchResults(searchResult) }]
        };
      }
    );
    results.push(result);
  } catch (error) {
    console.error(`❌ friday-smart-search - ERROR: ${error.message}`);
    results.push({ name: 'friday-smart-search', success: false, error: error.message });
  }

  // Test browser tools
  results.push(await testTool('browser-tabs', browserTabsTool, { action: 'list' }));
  results.push(await testTool('browser-navigate', browserNavigateTool, { url: 'https://example.com' }));
  results.push(await testTool('browser-screenshot', browserScreenshotTool, { format: 'png' }));
  results.push(await testTool('browser-console', browserConsoleTool, { action: 'list' }));
  results.push(await testTool('browser-evaluate', browserEvaluateTool, { function: '() => document.title' }));
  results.push(await testTool('browser-performance', browserPerformanceTool, { action: 'metrics' }));
  results.push(await testTool('browser-network', browserNetworkTool, { action: 'monitor' }));
  results.push(await testTool('browser-emulate', browserEmulateTool, { action: 'viewport', width: 1920, height: 1080 }));
  results.push(await testTool('browser-storage', browserStorageTool, { action: 'get-cookies' }));
  
  // Test browser interaction tools (these need a page to be loaded)
  results.push(await testTool('browser-click', browserClickTool, { selector: 'body' }));
  results.push(await testTool('browser-type', browserTypeTool, { selector: 'body', text: 'test' }));
  results.push(await testTool('browser-press', browserPressTool, { key: 'Enter' }));
  results.push(await testTool('browser-pdf', browserPdfTool, { filePath: '/tmp/test.pdf' }));

  // Cleanup browser
  await cleanupBrowserManager();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📈 Total: ${results.length}`);
  
  if (failed.length > 0) {
    console.log('\n❌ Failed Tools:');
    failed.forEach(f => {
      console.log(`  - ${f.name}: ${f.error}`);
    });
    console.log('\nDetailed errors will be shown below:');
    failed.forEach(f => {
      console.log(`\n--- ${f.name} ---`);
      console.log(f.stack || f.error);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with error code if there are failures
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
