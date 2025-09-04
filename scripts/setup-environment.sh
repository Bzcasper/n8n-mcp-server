#!/bin/bash

set -e  # Exit on any error

echo "🔧 Setting up environment variables for Vercel deployment..."

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

# Function to set environment variable with validation
set_env_var() {
    local key="$1"
    local value="$2"
    local environment="${3:-production}"

    if [ -z "$value" ]; then
        echo "⚠️  Skipping $key (empty value)"
        return
    fi

    echo "🔧 Setting $key for $environment environment..."

    # Use Vercel CLI to set environment variable
    if ! vercel env add "$key" "$environment" --token "$VERCEL_TOKEN" >/dev/null 2>&1 <<< "$value"; then
        echo "⚠️  $key may already be set or other verrcel cli issue, continuing..."
    fi
}

# Function to get environment variable from local .env or prompt
get_env_value() {
    local key="$1"
    local description="$2"
    local required="${3:-false}"

    # First try to get from environment
    local value="${!key}"

    # If not set, try from .env file
    if [ -z "$value" ] && [ -f ".env" ]; then
        value=$(grep "^$key=" .env | cut -d'=' -f2-)
    fi

    # If still not set and required, prompt user
    if [ -z "$value" ] && [ "$required" = "true" ]; then
        echo "⚠️  $key is required but not found in environment or .env file"
        echo "Please enter $description:"
        read -r value
        if [ -z "$value" ]; then
            echo "❌ Error: $key is required"
            exit 1
        fi
    fi

    echo "$value"
}

# Set up environment variables
echo "🚀 Setting up environment variables..."

# Core n8n variables
N8N_API_URL=$(get_env_value "N8N_API_URL" "N8N API URL (e.g., https://your-n8n-instance.com/api/v1)" true)
N8N_API_KEY=$(get_env_value "N8N_API_KEY" "N8N API Key" true)

# Optional n8n variables
N8N_WEBHOOK_BASE_URL=$(get_env_value "N8N_WEBHOOK_BASE_URL" "N8N Webhook Base URL")
N8N_WEBHOOK_USERNAME=$(get_env_value "N8N_WEBHOOK_USERNAME" "N8N Webhook Username")
N8N_WEBHOOK_PASSWORD=$(get_env_value "N8N_WEBHOOK_PASSWORD" "N8N Webhook Password")

# Supabase PostgreSQL variables
POSTGRES_URL=$(get_env_value "POSTGRES_URL" "Supabase PostgreSQL connection string")
SUPABASE_URL=$(get_env_value "SUPABASE_URL" "Supabase URL")
SUPABASE_ANON_KEY=$(get_env_value "SUPABASE_ANON_KEY" "Supabase Anonymous Key")
SUPABASE_SERVICE_ROLE_KEY=$(get_env_value "SUPABASE_SERVICE_ROLE_KEY" "Supabase Service Role Key")

# Optional variables
CORS_ALLOWED_ORIGINS=$(get_env_value "CORS_ALLOWED_ORIGINS" "CORS allowed origins")
DEBUG=$(get_env_value "DEBUG" "Debug mode (false/true)")
DISABLE_ANALYTICS=$(get_env_value "DISABLE_ANALYTICS" "Disable analytics (false/true)")

# Timeout configurations
N8N_API_TIMEOUT=$(get_env_value "N8N_API_TIMEOUT" "N8N API timeout in ms")
MCP_SERVER_TIMEOUT=$(get_env_value "MCP_SERVER_TIMEOUT" "MCP Server timeout in ms")
DATABASE_TIMEOUT=$(get_env_value "DATABASE_TIMEOUT" "Database timeout in ms")
DATABASE_MAX_CONNECTIONS=$(get_env_value "DATABASE_MAX_CONNECTIONS" "Database max connections")

# Parse PostgreSQL URL components if provided
if [ -n "$POSTGRES_URL" ]; then
    # Extract components from postgresql://user:password@host:port/database
    POSTGRES_USER=$(echo "$POSTGRES_URL" | sed -n 's|postgresql://\([^:]*\):.*|\1|p')
    POSTGRES_HOST=$(echo "$POSTGRES_URL" | sed -n 's|postgresql://[^:]*:[^@]*@\([^:]*\):.*|\1|p')
    POSTGRES_PASSWORD_ENCODED=$(echo "$POSTGRES_URL" | sed -n 's|postgresql://[^:]*:\([^@]*\)@.*|\1|p')
    # URL decode the password (basic handling)
    POSTGRES_PASSWORD=$(echo "$POSTGRES_PASSWORD_ENCODED" | sed 's/%20/ /g; s/%3A/:/g; s/%40/@/g; s/%2F/\//g')
    POSTGRES_DATABASE=$(echo "$POSTGRES_URL" | sed -n 's|postgresql://[^/]*\([^?]*\).*|\1|p' | sed 's|^/||')
else
    POSTGRES_USER=$(get_env_value "POSTGRES_USER" "Supabase PostgreSQL user")
    POSTGRES_HOST=$(get_env_value "POSTGRES_HOST" "Supabase PostgreSQL host")
    POSTGRES_PASSWORD=$(get_env_value "POSTGRES_PASSWORD" "Supabase PostgreSQL password")
    POSTGRES_DATABASE=$(get_env_value "POSTGRES_DATABASE" "Supabase PostgreSQL database")
fi

# Set environment target (production by default)
ENVIRONMENT="production"
if [ "${1:-}" = "preview" ]; then
    ENVIRONMENT="preview"
fi

echo "🎯 Setting up variables for $ENVIRONMENT environment..."

# Set all environment variables
set_env_var "N8N_API_URL" "$N8N_API_URL" "$ENVIRONMENT"
set_env_var "N8N_API_KEY" "$N8N_API_KEY" "$ENVIRONMENT"
set_env_var "N8N_WEBHOOK_BASE_URL" "$N8N_WEBHOOK_BASE_URL" "$ENVIRONMENT"
set_env_var "N8N_WEBHOOK_USERNAME" "$N8N_WEBHOOK_USERNAME" "$ENVIRONMENT"
set_env_var "N8N_WEBHOOK_PASSWORD" "$N8N_WEBHOOK_PASSWORD" "$ENVIRONMENT"
set_env_var "N8N_API_TIMEOUT" "$N8N_API_TIMEOUT" "$ENVIRONMENT"
set_env_var "MCP_SERVER_TIMEOUT" "$MCP_SERVER_TIMEOUT" "$ENVIRONMENT"
set_env_var "CORS_ALLOWED_ORIGINS" "$CORS_ALLOWED_ORIGINS" "$ENVIRONMENT"
set_env_var "DEBUG" "$DEBUG" "$ENVIRONMENT"
set_env_var "POSTGRES_URL" "$POSTGRES_URL" "$ENVIRONMENT"
set_env_var "POSTGRES_USER" "$POSTGRES_USER" "$ENVIRONMENT"
set_env_var "POSTGRES_HOST" "$POSTGRES_HOST" "$ENVIRONMENT"
set_env_var "POSTGRES_PASSWORD" "$POSTGRES_PASSWORD" "$ENVIRONMENT"
set_env_var "POSTGRES_DATABASE" "$POSTGRES_DATABASE" "$ENVIRONMENT"
set_env_var "SUPABASE_URL" "$SUPABASE_URL" "$ENVIRONMENT"
set_env_var "SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "$ENVIRONMENT"
set_env_var "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_ROLE_KEY" "$ENVIRONMENT"
set_env_var "SUPABASE_JWT_SECRET" "$SUPABASE_JWT_SECRET" "$ENVIRONMENT"
set_env_var "NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_URL" "$ENVIRONMENT"
set_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ENVIRONMENT"
set_env_var "POSTGRES_PRISMA_URL" "$POSTGRES_PRISMA_URL" "$ENVIRONMENT"
set_env_var "POSTGRES_URL_NON_POOLING" "$POSTGRES_URL_NON_POOLING" "$ENVIRONMENT"
set_env_var "DISABLE_ANALYTICS" "$DISABLE_ANALYTICS" "$ENVIRONMENT"
set_env_var "DATABASE_TIMEOUT" "$DATABASE_TIMEOUT" "$ENVIRONMENT"
set_env_var "DATABASE_MAX_CONNECTIONS" "$DATABASE_MAX_CONNECTIONS" "$ENVIRONMENT"

echo "✅ Environment variables setup completed!"
echo ""
echo "🔍 To verify the settings, run: vercel env ls --token \$VERCEL_TOKEN"
echo ""
echo "🚀 You can now deploy using: ./scripts/deploy.sh"
echo ""
echo "💡 Note: If you need to update any variables later, use:"
echo "   vercel env add VARIABLE_NAME ENVIRONMENT --token \$VERCEL_TOKEN"
echo "   vercel env rm VARIABLE_NAME ENVIRONMENT --token \$VERCEL_TOKEN"