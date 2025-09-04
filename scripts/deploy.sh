#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting Vercel deployment process..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check VERCEL_TOKEN environment variable
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: VERCEL_TOKEN environment variable is not set."
    echo "Please set it using:"
    echo "export VERCEL_TOKEN=your_vercel_token_here"
    echo ""
    echo "You can obtain a token from: https://vercel.com/account/tokens"
    exit 1
fi
echo "✅ VERCEL_TOKEN environment variable is set."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Vercel CLI"
        exit 1
    fi
    echo "✅ Vercel CLI installed successfully."
else
    echo "✅ Vercel CLI is available."
fi

# Check Node.js version
NODE_VERSION=$(node --version | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Error: Node.js version $NODE_VERSION is too old. Minimum required: 20"
    exit 1
fi
echo "✅ Node.js version: $(node --version) (>=20 required)"

# Set up environment variables
echo "🔧 Setting up environment variables..."
if ! ./scripts/setup-environment.sh; then
    echo "❌ Environment setup failed. Please fix the issues above and try again."
    exit 1
fi
echo "✅ Environment variables configured."

# Run pre-deployment validations
echo "🔍 Running deployment validation..."
if ! npm run validate:deployment; then
    echo "❌ Deployment validation failed. Please fix the issues above and try again."
    exit 1
fi
echo "✅ Deployment validation passed."

# Build the project
echo "🔨 Building project..."
if ! npm run build; then
    echo "❌ Build failed."
    exit 1
fi
echo "✅ Build completed successfully."

# Run tests if available
if npm run test &> /dev/null; then
    echo "🧪 Running tests..."
    if ! npm test; then
        echo "❌ Tests failed."
        exit 1
    fi
    echo "✅ Tests passed."
else
    echo "⚠️  No tests configured or tests skipped."
fi

# Deploy to Vercel
echo "📤 Deploying to Vercel (production)..."
echo "This may take a few minutes..."

DEPLOY_OUTPUT=$(vercel --token "$VERCEL_TOKEN" --prod --yes 2>&1)
DEPLOY_EXIT_CODE=$?

if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
    echo "❌ Deployment failed:"
    echo "$DEPLOY_OUTPUT"
    echo ""
    echo "Common issues:"
    echo "- Check your Vercel token is valid"
    echo "- Ensure you have access to the Vercel project"
    echo "- Check network connectivity"
    echo "- Review the build and validation output above"
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "Deployment output:"
echo "$DEPLOY_OUTPUT"
echo ""

# Extract deployment URL if possible
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oE "https://[a-zA-Z0-9-]+\.vercel\.app" | head -1)
if [ -n "$DEPLOY_URL" ]; then
    echo "🌐 Your app is deployed at: $DEPLOY_URL"
else
    echo "🌐 Check the deployment output above for the deployment URL."
fi

echo ""
echo "📞 For support or issues, visit: https://github.com/leonardsellem/n8n-mcp-server/issues"