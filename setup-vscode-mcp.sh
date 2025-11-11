#!/bin/bash
# FRIDAY MCP Server - VS Code Setup Script

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_CONFIG_DIR="$HOME/.config/Code/User"
MCP_CONFIG_FILE="$MCP_CONFIG_DIR/mcp.json"

echo "🚀 FRIDAY MCP Server - VS Code Setup"
echo "===================================="
echo ""

# Check if VS Code config directory exists
if [ ! -d "$MCP_CONFIG_DIR" ]; then
    echo "📁 Creating VS Code config directory..."
    mkdir -p "$MCP_CONFIG_DIR"
fi

# Check if mcp.json exists
if [ -f "$MCP_CONFIG_FILE" ]; then
    echo "⚠️  MCP config already exists at: $MCP_CONFIG_FILE"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Create MCP config
echo "📝 Creating MCP configuration..."
cat > "$MCP_CONFIG_FILE" << JSON
{
  "mcpServers": {
    "friday": {
      "command": "node",
      "args": ["$PROJECT_DIR/dist/index.js"],
      "cwd": "$PROJECT_DIR",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
JSON

echo "✅ MCP configuration created at: $MCP_CONFIG_FILE"
echo ""
echo "📋 Next steps:"
echo "1. Build the project: npm run build"
echo "2. Restart VS Code"
echo "3. FRIDAY MCP server should be available in chat"
echo ""
echo "✨ Setup complete!"
