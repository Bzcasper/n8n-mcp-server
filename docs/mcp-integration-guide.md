<!-- @format -->

# MCP Server Integration Guide

This guide explains how to integrate with your deployed N8n MCP Server.

## 🔄 How the Architecture Works

```
MCP Client → MCP Server → N8n API
```

The MCP server acts as a bridge, providing programmatic access to N8n's workflow management capabilities.

## ⚠️ Important Note: Connection Direction

**The MCP Server is designed to be USED BY MCP clients (like Claude Desktop, VS Code, etc.), not by N8n itself.**

## 🎯 Ways to Use Your MCP Server

### 1. **MCP Client Integration** (Intended Use)

Your MCP server can be integrated with:

- **Claude Desktop** - Add MCP server tools
- **VS Code Extensions** - MCP server integration
- **Other MCP-supporting applications**

### 2. **Direct API Integration** (If you need N8n ↔ MCP Server communication)

If you want N8n workflows to trigger MCP operations:

#### Option A: HTTP Request Nodes

```javascript
// In N8n workflow, add HTTP Request node:
POST https://n8n-mcp-server-b92cyjwhg-bobby-caspers-projects-51c8e006.vercel.app
Headers: {
  "Content-Type": "application/json"
}
Body: {
  "jsonrpc": "2.0",
  "id": "workflow_1",
  "method": "tools/call",
  "params": {
    "name": "n8n-workflow-create",
    "arguments": {
      "name": "AI Workflow",
      "active": true,
      "nodes": [{
        "id": "ai_node",
        "name": "AI Assistant",
        "type": "n8n-nodes-base.aiConfig"
      }]
    }
  }
}
```

#### Option B: Custom Function Node

```javascript
// Add Function Node in N8n workflow:
const fetch = require("node-fetch");

async function callMCPServer() {
  const response = await fetch(
    "https://n8n-mcp-server-b92cyjwhg-bobby-caspers-projects-51c8e006.vercel.app",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "workflow_" + new Date().getTime(),
        method: "tools/call",
        params: {
          name: "n8n-workflow-create",
          arguments: {
            name: "New Workflow from N8n",
            active: false,
          },
        },
      }),
    }
  );

  const result = await response.json();
  return result;
}

return callMCPServer();
```

## 🌐 Webhook Integration with MCP

Your MCP server can trigger N8n workflows via webhooks:

1. Create N8n webhook workflow
2. Use MCP server's `n8n-webhook-run` tool
3. Configure webhook URL in your environment

## 🔐 Authentication Setup

For MCP server authentication:

1. Set up `N8N_WEBHOOK_USERNAME` and `N8N_WEBHOOK_PASSWORD` in environment
2. Configure Vercel deployment variables
3. Use authorized MCP client to communicate with server

## 📝 Environment Variables Needed

```bash
# For MCP server to communicate with N8n
N8N_API_URL=https://your-n8n-instance.com/api
N8N_API_KEY=your-n8n-api-key
N8N_WEBHOOK_USERNAME=webhook-username
N8N_WEBHOOK_PASSWORD=webhook-password

# For MCP server authentication
VERCEL_ENV=production
```

## 🛠️ Available MCP Tools

See [README.md](README.md) for complete tool reference.

## 🐛 Testing MCP Server

Test your deployed MCP server:

```bash
# Test with bypass token if needed
curl -X POST "https://n8n-mcp-server-b92cyjwhg-bobby-caspers-projects-51c8e006.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

## 📞 Support

If you need help with specific integrations, check:

- Claude Desktop MCP configuration
- VS Code extension settings
- Custom integration development
