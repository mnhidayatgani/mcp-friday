#!/usr/bin/env node
/**
 * FRIDAY Setup Test Runner
 * Standalone test script for friday-setup tool
 */

import { setupTool } from './dist/tools/setup/index.js';

async function runTest() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🧪 FRIDAY Setup Test - Standalone Runner");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("📍 Project: /home/senarokalie/Desktop/chatbot");
  console.log("💾 Backup: chatbot-backup-20251110-221624.tar.gz (339MB)");
  console.log("");

  try {
    // Change to chatbot directory
    process.chdir('/home/senarokalie/Desktop/chatbot');
    
    console.log("🚀 Running FRIDAY setup...");
    console.log("");
    
    // Run the setup tool
    const result = await setupTool({
      projectType: 'auto-detect',
      enableRedis: false,
      memoryCapacity: 100
    });
    
    // Display results
    if (result.content && result.content[0]) {
      console.log(result.content[0].text);
    }
    
    console.log("");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ Test Complete!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
  } catch (error) {
    console.error("");
    console.error("❌ Test Failed:");
    console.error(error);
    process.exit(1);
  }
}

runTest();
