<!-- @format -->

# Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the n8n-mcp-server to Vercel.

## Prerequisites

- [Vercel Account](https://vercel.com)
- Node.js 20 or later installed locally
- n8n API credentials (URL and API key)

## Automated Deployment Script

For a streamlined deployment experience, use the included deployment script that handles validation, building, and deployment automatically.

### Setup

1. **Obtain Vercel Token**

   Visit [Vercel Account Tokens](https://vercel.com/account/tokens) to create a new token with appropriate permissions.

2. **Set Environment Variable**

   ```bash
   export VERCEL_TOKEN=your_vercel_token_here
   ```

   For persistent setup, add this to your shell profile (e.g., `~/.bashrc`, `~/.zshrc`):

   ```bash
   echo 'export VERCEL_TOKEN=your_vercel_token_here' >> ~/.zshrc
   source ~/.zshrc
   ```

### Automated Deployment

1. **Run the Deployment Script**

   ```bash
   npm run deploy
   ```

   Or directly:

   ```bash
   ./scripts/deploy.sh
   ```

2. **What the Script Does**

   The script automatically:

   - Validates `VERCEL_TOKEN` is set
   - Installs Vercel CLI if not present
   - Checks Node.js version compatibility
   - Runs deployment validation
   - Builds the project
   - Runs tests (if configured)
   - Deploys to Vercel production
   - Provides detailed feedback and deployment URL

### Manual Steps After Deployment

After successful deployment, you still need to:

1. **Set Environment Variables in Vercel Dashboard**

   - Go to your project in Vercel dashboard
   - Navigate to Settings → Environment Variables
   - Add all required variables (see next section)

2. **Test the Deployment**
   - Use the provided curl commands to test endpoints
   - Verify n8n integration works properly

## Environment Variables

Configure the following environment variables in your Vercel dashboard:

### Required

- `N8N_API_URL` - Your n8n instance URL (e.g., https://n8n.trendradar.ai/api/v1)
- `N8N_API_KEY` - Your n8n API key
- `N8N_WEBHOOK_USERNAME` - Webhook authentication username
- `N8N_WEBHOOK_PASSWORD` - Webhook authentication password

### Optional

- `N8N_CA_FILE` - Path to CA certificate (if using custom SSL)
- `REDIS_URL` - Redis/Upstash URL for caching (optional)
- `KV_URL` - Vercel KV URL (auto-configured for Vercel)
- `KV_REST_API_URL` - Vercel KV REST API URL
- `KV_REST_API_TOKEN` - Vercel KV REST API token

## Pre-deployment Preparation

1. **Validate Configuration**

   ```bash
   npm run validate:deployment
   ```

   This script checks:

   - Node.js version compatibility
   - Required files presence
   - TypeScript compilation
   - Vercel and package.json configuration

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Build for Production**
   ```bash
   npm run build:production
   ```
   This runs linting, tests, and builds the project.

## Deployment Steps

### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not installed)

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to your project in the Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add all required variables

### Option B: Vercel Git Integration

1. **Push to Git Repository**

   - Commit your changes
   - Push to your Git repository

2. **Connect to Vercel**

   - Import your project in Vercel dashboard
   - Connect your Git repository

3. **Configure Build Settings**

   - Framework Preset: `Other`
   - Build Command: `npm run build:production`
   - Output Directory: `api` (optional)

4. **Set Environment Variables**
   - Add variables in project settings

## Post-Deployment

1. **Verify Deployment**

   - Check deployment logs in Vercel dashboard
   - Test MCP endpoint availability
   - Validate n8n integration

2. **Configure Domain** (Optional)
   - Add custom domain in Vercel project settings
   - Configure DNS records if required

## API Endpoints

After deployment, your MCP server will be available at:

- **Production URL**: `https://your-project.vercel.app/api/server`

## Testing Deployment

### Basic Health Check

```bash
curl -X POST https://your-project.vercel.app/api/server \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/list", "id": 1}'
```

### MCP Tool Test

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "n8n-workflow-list",
    "arguments": {}
  },
  "id": 2
}
```

## Troubleshooting

### Common Issues

1. **Build Fails**

   - Check Node.js version (must be >=20)
   - Verify all dependencies are installed
   - Run `npm run lint` and fix issues

2. **Runtime Errors**

   - Check environment variables are set correctly
   - Verify n8n API credentials and accessibility
   - Review Vercel function logs

3. **Timeout Errors**
   - MCP functions have 60-second timeout limit
   - Long-running operations may need optimization
   - Consider using background tasks for extended work

### Logs and Debugging

- **Vercel Dashboard**: Check "Functions" tab for logs
- **Local Testing**: Use `npm run dev` for local development
- **Build Logs**: Review build/output logs in Vercel

## Performance Optimization

- Functions use 1024 MB RAM limit
- Consider Redis/Upstash for caching long responses
- Monitor function durations and optimize slow operations

## Security Notes

- All requests are routed through the MCP protocol
- Security headers are configured for production
- Use strong API keys and restrict access

## Updating Deployment

To update your deployment:

1. **For CLI deployment**: Run `vercel --prod` again
2. **For Git integration**: Push changes to trigger automatic deployment
3. **Validate**: Always run `npm run validate:deployment` before deploying

## Migration Instructions

If you're migrating from another deployment:

1. Backup existing configuration
2. Set environment variables in Vercel
3. Test with staging deployment first
4. Update any client applications with new URL
5. Monitor for 24-48 hours after migration

---

Need help? Check the [main documentation](../index.md) or open an issue on GitHub.
