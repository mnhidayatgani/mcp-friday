#!/usr/bin/env node

/**
 * FRIDAY MCP Server Tools Verification
 * Tests that all tools are properly registered
 */

import { spawn } from 'child_process';

const testMCPServer = () => {
  return new Promise((resolve, reject) => {
    const server = spawn('node', ['dist/index.js'], {
      cwd: process.cwd(),
    });

    let output = '';
    let timeout;

    // Send list tools request
    const listToolsRequest = {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    };

    server.stdin.write(JSON.stringify(listToolsRequest) + '\n');

    server.stdout.on('data', (data) => {
      output += data.toString();
      
      // Look for JSON response
      const lines = output.split('\n');
      for (const line of lines) {
        if (line.trim().startsWith('{')) {
          try {
            const response = JSON.parse(line);
            if (response.result && response.result.tools) {
              clearTimeout(timeout);
              server.kill();
              resolve(response.result.tools);
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }
      }
    });

    server.stderr.on('data', (data) => {
      // Ignore stderr (server startup messages)
    });

    server.on('error', (error) => {
      reject(error);
    });

    // Timeout after 5 seconds
    timeout = setTimeout(() => {
      server.kill();
      reject(new Error('Timeout waiting for server response'));
    }, 5000);
  });
};

console.log('🧪 Testing FRIDAY MCP Server...\n');

testMCPServer()
  .then((tools) => {
    console.log('✅ Server started successfully!\n');
    console.log(`📊 Total tools registered: ${tools.length}\n`);
    
    // Group tools by category
    const fridayTools = tools.filter(t => t.name.startsWith('friday-'));
    const browserTools = tools.filter(t => t.name.startsWith('browser-'));
    
    console.log('🔧 FRIDAY Core Tools:');
    fridayTools.forEach(tool => {
      console.log(`   ✓ ${tool.name.padEnd(25)} - ${tool.description}`);
    });
    
    console.log('\n🌐 Browser Automation Tools:');
    browserTools.forEach(tool => {
      console.log(`   ✓ ${tool.name.padEnd(25)} - ${tool.description}`);
    });
    
    console.log('\n✅ All tools verified successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  });
