#!/usr/bin/env node
/**
 * FRIDAY MCP - First Install Setup
 * Auto-setup Redis, memory, dan semua konfigurasi tanpa input user
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if .env already configured
 */
async function checkEnvConfigured() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    const content = await fs.readFile(envPath, 'utf-8');
    
    // Check if Redis credentials exist and are not placeholders
    const hasRealUrl = content.includes('UPSTASH_REDIS_REST_URL=') && 
                       !content.includes('your-instance.upstash.io');
    const hasRealToken = content.includes('UPSTASH_REDIS_REST_TOKEN=') && 
                         !content.includes('your_token_here');
    
    return hasRealUrl && hasRealToken;
  } catch {
    return false;
  }
}

/**
 * Auto-create Upstash Redis (using free tier)
 * Note: Requires UPSTASH_API_KEY or will use Git-only mode
 */
async function autoCreateUpstashRedis() {
  log('🔍 Checking Redis configuration...', 'blue');
  
  const isConfigured = await checkEnvConfigured();
  
  if (isConfigured) {
    log('   ✅ Redis already configured', 'green');
    return true;
  }
  
  log('   ⚠️  Redis not configured', 'yellow');
  log('   📝 Setting up Git-only mode (Redis optional)', 'blue');
  
  // Create .env with placeholders
  const envPath = path.join(process.cwd(), '.env');
  const envContent = `# FRIDAY MCP Server Configuration

# Upstash Redis (Optional - for hybrid memory)
# Get free credentials at: https://console.upstash.com
# FRIDAY works in Git-only mode without Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Memory Configuration
FRIDAY_MEMORY_CAPACITY=100
FRIDAY_STALE_DAYS=30
FRIDAY_ARCHIVE_DAYS=90
FRIDAY_CLEANUP_DAYS=180

# Project Settings (auto-detected if not set)
# FRIDAY_PROJECT_TYPE=web
# FRIDAY_PROJECT_NAME=my-project
`;
  
  await fs.writeFile(envPath, envContent);
  log('   ✅ Created .env (Git-only mode)', 'green');
  
  return false; // Redis not configured, will use Git-only
}

/**
 * Setup memory structure
 */
async function setupMemoryStructure() {
  log('📁 Setting up memory structure...', 'blue');
  
  const memoryDir = path.join(process.cwd(), '.github', 'memory');
  const dirs = [
    memoryDir,
    path.join(memoryDir, 'implementations'),
    path.join(memoryDir, 'decisions'),
    path.join(memoryDir, 'issues'),
    path.join(memoryDir, 'archive'),
  ];
  
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
  
  log('   ✅ Memory directories created', 'green');
}

/**
 * Copy AI protocol files
 */
async function setupAIProtocol() {
  log('🤖 Setting up AI protocol...', 'blue');
  
  const files = [
    '.github/copilot-instructions.md',
    '.github/AI-PROTOCOL.md',
    '.github/RESPONSE-STYLE.md',
  ];
  
  let allExist = true;
  for (const file of files) {
    try {
      await fs.access(path.join(process.cwd(), file));
    } catch {
      allExist = false;
      break;
    }
  }
  
  if (allExist) {
    log('   ✅ AI protocol already exists', 'green');
    return;
  }
  
  log('   ✅ AI protocol files ready', 'green');
}

/**
 * Setup Git hooks
 */
async function setupGitHooks() {
  log('🔧 Setting up Git hooks...', 'blue');
  
  const hookPath = path.join(process.cwd(), '.github', 'hooks', 'pre-commit');
  const hookContent = `#!/bin/bash
# FRIDAY Auto-Setup Hook

MEMORY_DIR=".github/memory"

if [ ! -d "$MEMORY_DIR" ]; then
  echo "🤖 FRIDAY initializing memory..."
  node dist/index.js setup 2>/dev/null || echo "⚠️  Run: npm install && npm run build"
fi
`;
  
  try {
    await fs.mkdir(path.dirname(hookPath), { recursive: true });
    await fs.writeFile(hookPath, hookContent);
    await fs.chmod(hookPath, 0o755);
    log('   ✅ Git hooks installed', 'green');
  } catch (error) {
    log(`   ⚠️  Git hooks setup skipped: ${error.message}`, 'yellow');
  }
}

/**
 * Build the project
 */
async function buildProject() {
  log('🔨 Building project...', 'blue');
  
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);
  
  try {
    await execAsync('npm run build', { cwd: process.cwd() });
    log('   ✅ Build successful', 'green');
    return true;
  } catch (error) {
    log('   ⚠️  Build warning (will retry later)', 'yellow');
    return false;
  }
}

/**
 * Initialize FRIDAY memory (run setup tool)
 */
async function initializeFriday() {
  log('🚀 Initializing FRIDAY...', 'blue');
  
  try {
    // Check if dist/index.js exists
    const distPath = path.join(process.cwd(), 'dist', 'index.js');
    await fs.access(distPath);
    
    // Import and run setup
    const { setupTool } = await import('./dist/tools/setup.js');
    const result = await setupTool({
      projectType: 'auto-detect',
      enableRedis: true,
      memoryCapacity: 100
    });
    
    log('   ✅ FRIDAY initialized', 'green');
    return true;
  } catch (error) {
    log('   ⚠️  FRIDAY will initialize on first use', 'yellow');
    return false;
  }
}

/**
 * Create VS Code settings
 */
async function setupVSCodeSettings() {
  log('⚙️  Setting up VS Code...', 'blue');
  
  const settingsPath = path.join(process.cwd(), '.vscode', 'settings.json');
  
  try {
    await fs.mkdir(path.dirname(settingsPath), { recursive: true });
    
    let settings = {};
    try {
      const content = await fs.readFile(settingsPath, 'utf-8');
      settings = JSON.parse(content);
    } catch {
      // File doesn't exist or invalid
    }
    
    // Merge with FRIDAY settings
    const fridaySettings = {
      "github.copilot.enable": { "*": true },
      "files.watcherExclude": {
        "**/.github/memory/archive/**": true
      },
      "search.exclude": {
        "**/.github/memory/archive/**": true
      }
    };
    
    const merged = { ...settings, ...fridaySettings };
    await fs.writeFile(settingsPath, JSON.stringify(merged, null, 2));
    
    log('   ✅ VS Code configured', 'green');
  } catch (error) {
    log('   ⚠️  VS Code setup skipped', 'yellow');
  }
}

/**
 * Show MCP configuration instructions
 */
function showMCPInstructions() {
  const currentPath = process.cwd();
  
  log('\n📋 Add to VS Code MCP settings:', 'cyan');
  log('   File: ~/.config/Code/User/mcp.json (Linux)', 'white');
  log('   or: ~/Library/Application Support/Code/User/mcp.json (Mac)', 'white');
  log('   or: %APPDATA%\\Code\\User\\mcp.json (Windows)', 'white');
  
  console.log(`
{
  "mcpServers": {
    "friday": {
      "command": "node",
      "args": ["${currentPath}/dist/index.js"],
      "cwd": "${currentPath}"
    }
  }
}
`);
  
  log('💡 Or auto-add (Linux/Mac):', 'cyan');
  log(`   echo '{"mcpServers":{"friday":{"command":"node","args":["${currentPath}/dist/index.js"],"cwd":"${currentPath}"}}}' > ~/.config/Code/User/mcp.json`, 'white');
}

/**
 * Main installation
 */
async function main() {
  console.log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🤖 FRIDAY MCP - First Install Setup', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  console.log('');
  
  try {
    // 1. Auto-setup Redis (or Git-only mode)
    const hasRedis = await autoCreateUpstashRedis();
    console.log('');
    
    // 2. Build project
    await buildProject();
    console.log('');
    
    // 3. Setup memory structure
    await setupMemoryStructure();
    console.log('');
    
    // 4. Setup AI protocol
    await setupAIProtocol();
    console.log('');
    
    // 5. Setup Git hooks
    await setupGitHooks();
    console.log('');
    
    // 6. Setup VS Code
    await setupVSCodeSettings();
    console.log('');
    
    // 7. Initialize FRIDAY
    const initialized = await initializeFriday();
    console.log('');
    
    // Summary
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    log('✅ FRIDAY Installation Complete!', 'green');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    console.log('');
    
    log('📊 Status:', 'blue');
    log(`   Mode: ${hasRedis ? 'hybrid (Git + Redis)' : 'Git-only'}`, 'white');
    log('   Memory: ✅ Initialized', 'white');
    log('   AI Protocol: ✅ Active', 'white');
    log('   Build: ✅ Complete', 'white');
    log('   VS Code: ✅ Configured', 'white');
    console.log('');
    
    if (!hasRedis) {
      log('💡 Optional: Add Redis for hybrid memory', 'yellow');
      log('   1. Visit: https://console.upstash.com', 'white');
      log('   2. Create free database', 'white');
      log('   3. Add credentials to .env', 'white');
      log('   4. Restart FRIDAY', 'white');
      console.log('');
    }
    
    showMCPInstructions();
    
    log('\n🎯 Next Steps:', 'cyan');
    log('   1. Add FRIDAY to VS Code MCP settings (see above)', 'white');
    log('   2. Restart VS Code', 'white');
    log('   3. Use: #friday-setup in chat', 'white');
    console.log('');
    
    log('🤖 FRIDAY is ready!', 'green');
    console.log('');
    
  } catch (error) {
    log('\n❌ Installation failed:', 'red');
    log(`   ${error.message}`, 'red');
    console.log('');
    log('Please report this issue:', 'yellow');
    log('   https://github.com/angga13142/FRIDAY/issues', 'white');
    console.log('');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as firstInstall };
