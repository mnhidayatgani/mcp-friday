#!/usr/bin/env node
// FRIDAY setup runner script

import { setupTool } from '../dist/tools/setup/index.js';

async function main() {
  console.log('Running FRIDAY setup V2...');
  const result = await setupTool({});
  const text = result.content?.[0]?.text || 'No output';
  console.log('\n=== FRIDAY SETUP OUTPUT START ===\n');
  console.log(text);
  console.log('\n=== FRIDAY SETUP OUTPUT END ===');
}

main().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
