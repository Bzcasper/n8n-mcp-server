---
title: "Getting Started with n8n MCP Server"
description: "Complete setup guide for n8n MCP Server - from installation to first workflow creation. Step-by-step instructions for beginners and advanced users with troubleshooting tips."
keywords:
  - "n8n MCP server setup"
  - "installation guide"
  - "configuration tutorial"
  - "first workflow"
  - "quick start guide"
  - "environment setup"
last_updated: "2024-09-04"
difficulty: "Beginner"
time_to_read: "10 minutes"
seo:
  meta_title: "Getting Started | n8n MCP Server Setup Guide"
  meta_description: "Learn how to install, configure, and use n8n MCP Server in this comprehensive getting started guide. From first installation to creating your first workflow."
  og_type: "article"
  og_image: "/docs/images/getting-started.png"
  twitter_card: "summary_large_image"
  structured_data_type: "HowTo"
---

<!-- @format -->

# 🚀 Getting Started with n8n MCP Server

Welcome to the n8n MCP Server! This comprehensive guide will walk you through everything you need to know to get up and running with AI-powered workflow automation. Whether you're a beginner or an experienced developer, we've got you covered.

## 📋 Prerequisites

Before we begin, ensure you have the following ready:

### System Requirements

- **Operating System**: Linux, macOS, or Windows 10+ (with WSL for Windows)
- **Node.js**: Version 20.0 or later (LTS recommended)
- **Memory**: Minimum 512MB RAM (1GB+ recommended)
- **Storage**: 200MB free space for installation and logs

### Required Software

```bash
# Check Node.js version
node --version  # Should be 20.x or higher

# Check npm version (comes with Node.js)
npm --version   # Should be 10.x or higher
```

**Don't have Node.js?** [Download it here](https://nodejs.org/) and choose the LTS version.

### n8n Instance

You'll need access to an n8n instance:

- **Self-hosted n8n**: Install locally or run via Docker
- **Cloud n8n**: Sign up at [n8n.io](https://n8n.io)
- **API Access**: Ensure API is enabled with proper authentication

## ⚡ Quick Installation (5 minutes)

### Option 1: Global Installation (Recommended)

```bash
# Install globally from npm
npm install -g @leonardsellem/n8n-mcp-server

# Verify installation
n8n-mcp-server --version
```

### Option 2: Project-Specific Installation

```bash
# Clone or download the project
git clone https://github.com/leonardsellem/n8n-mcp-server.git
cd n8n-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Option 3: Docker Installation

```bash
# Pull the official Docker image
docker pull leonardsellem/n8n-mcp-server

# Run with your configuration
docker run -d \
  --name n8n-mcp-server \
  -e N8N_API_URL=http://your-n8n-instance:5678/api/v1 \
  -e N8N_API_KEY=your_api_key_here \
  -e N8N_WEBHOOK_USERNAME=webhook_user \
  -e N8N_WEBHOOK_PASSWORD=webhook_pass \
  -p 3000:8000 \
  leonardsellem/n8n-mcp-server
```

## 🔧 Configuration (10 minutes)

Configuration is crucial for secure and reliable operation. Let's set it up properly.

### 1. Environment Variables Setup

Create a `.env` file in your working directory:

```bash
# Create environment file
touch .env

# Copy example configuration (if available)
cp .env.example .env 2>/dev/null || echo "# Copy example config manually"
```

### 2. Required Configuration

Edit your `.env` file with the following content:

```env
# n8n API Configuration (REQUIRED)
N8N_API_URL=http://localhost:5678/api/v1
N8N_API_KEY=n8n_your_api_key_here_replace_with_actual_key

# Webhook Authentication (OPTIONAL but recommended for webhook tools)
N8N_WEBHOOK_USERNAME=your_webhook_username
N8N_WEBHOOK_PASSWORD=your_secure_webhook_password

# Server Configuration
NODE_ENV=production
PORT=8000
HOST=0.0.0.0

# Logging
LOG_LEVEL=info
DEBUG=false

# Caching (Optional - improves performance)
REDIS_URL=redis://localhost:6379

# Analytics (Optional)
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

### 3. Generate n8n API Key

To get your n8n API key:

1. **Open n8n Web Interface**

   - Navigate to your n8n instance (usually http://localhost:5678)
   - Log in with your admin credentials

2. **Access API Settings**

   - Click on your user avatar in the top-right corner
   - Select "Settings" from the dropdown menu
   - Navigate to the "API" section

3. **Generate New API Key**

   - Click "Create New API Key"
   - Give it a descriptive name (e.g., "MCP Server")
   - Choose appropriate permissions
   - Copy the generated key immediately (you can't see it again!)

4. **Paste in Configuration**
   - Replace `n8n_your_api_key_here_replace_with_actual_key` with your actual key

### 4. Verify Configuration

Test your configuration:

```bash
# Test connection to n8n
n8n-mcp-server --test-connection

# Or if running from source
npm run test:connection
```

## 🤖 AI Assistant Integration (5 minutes)

### Claude Desktop Setup

1. **Locate Configuration File**

   ```bash
   # macOS
   ~/Library/Application Support/Claude/claude_desktop_config.json

   # Windows
   %APPDATA%\Claude\claude_desktop_config.json
   ```

2. **Edit Configuration**
   Add the following to your configuration:

   ```json
   {
     "mcpServers": {
       "n8n": {
         "command": "/usr/local/bin/n8n-mcp-server",
         "env": {
           "N8N_API_URL": "http://localhost:5678/api/v1",
           "N8N_API_KEY": "your_api_key_here",
           "N8N_WEBHOOK_USERNAME": "your_webhook_username",
           "N8N_WEBHOOK_PASSWORD": "your_webhook_password"
         }
       }
     }
   }
   ```

3. **Restart Claude Desktop**
   - Close Claude Desktop completely
   - Reopen the application
   - Check if n8n tools appear in the tool list

### VS Code Claude Extension

1. **Open User Settings**

   ```json
   // .vscode/settings.json
   {
     "claude.server.mcpServers": {
       "n8n": {
         "command": "n8n-mcp-server",
         "env": {
           "N8N_API_URL": "http://localhost:5678/api/v1",
           "N8N_API_KEY": "your_api_key_here",
           "N8N_WEBHOOK_USERNAME": "your_webhook_username",
           "N8N_WEBHOOK_PASSWORD": "your_webhook_password"
         }
       }
     }
   }
   ```

2. **Restart VS Code**
   - Reload the window (Ctrl/Cmd + Shift + P → "Developer: Reload Window")

## 🎯 Your First Workflow (3 minutes)

Let's create a simple workflow using natural language:

```javascript
// Tell your AI assistant:
// "Create a workflow that gets the current weather for London, extracts the temperature, and stores it in a database"

// The AI will use n8n MCP Server tools to:
// 1. Create a new workflow structure
// 2. Add HTTP Request node for weather API
// 3. Add data transformation logic
// 4. Configure database storage
// 5. Set up scheduling trigger
```

### Expected Result

Your AI assistant will generate a complete n8n workflow that:

- Fetches weather data from an API
- Processes the temperature information
- Stores results in your database
- Runs automatically on a schedule

## 🔍 Testing Your Setup

### 1. Health Check

```bash
# Run server in test mode
n8n-mcp-server --health-check

# Expected output:
# ✅ Connected to n8n API
# ✅ Webhook authentication working
# ✅ All tools registered
# ✅ Server ready for AI assistants
```

### 2. Tool Verification

Test individual tools through your AI assistant:

```
"List all workflows in my n8n instance"
"Create a simple test workflow"
"Execute the test workflow"
```

### 3. Log Monitoring

Watch server logs for issues:

```bash
# View logs in real-time
tail -f n8n-mcp-server.log

# Or with structured logging enabled
n8n-mcp-server --log-json | jq '.'
```

## 🛠️ Troubleshooting

### Common Issues

**❌ "Connection refused" error**

- Check if n8n is running and accessible
- Verify `N8N_API_URL` configuration
- Ensure network connectivity

**❌ "Invalid API key" error**

- Regenerate your n8n API key
- Check for special characters in the key
- Ensure the key has appropriate permissions

**❌ "Module not found" errors**

```bash
# Reinstall dependencies
npm install

# Clear npm cache
npm cache clean --force

# Rebuild if using TypeScript
npm run build
```

**❌ AI assistant doesn't recognize tools**

- Restart your AI assistant application
- Verify MCP configuration syntax
- Check that the server is running

### Advanced Diagnostics

```bash
# Full system diagnostics
npm run test:diagnostics

# n8n API connectivity test
npm run test:n8n-connection

# Webhook endpoint validation
npm run test:webhooks
```

## 🚀 Going Further

Now that you have the basics set up, explore these advanced topics:

- **📖 [API Reference](api-reference.md)** - Complete technical documentation
- **🔬 [Testing Guide](testing.md)** - Comprehensive testing practices
- **🚀 [Deployment Guide](deployment.md)** - Production deployment strategies
- **⚡ [Best Practices](best-practices.md)** - Optimization and performance tips
- **🔧 [Troubleshooting](troubleshooting.md)** - Advanced problem-solving

## 📞 Getting Help

Still having trouble? Here's how to get help:

1. **Check Documentation**: Visit our [full documentation](https://github.com/leonardsellem/n8n-mcp-server/docs)
2. **Community Support**: Join our [GitHub Discussions](https://github.com/leonardsellem/n8n-mcp-server/discussions)
3. **Report Issues**: Open a [GitHub Issue](https://github.com/leonardsellem/n8n-mcp-server/issues)
4. **Contribute**: Help improve the [documentation](https://github.com/leonardsellem/n8n-mcp-server/docs)

🎉 **Congratulations!** You now have a fully functional n8n MCP Server integrated with your AI assistant. Ready to automate some workflows?
