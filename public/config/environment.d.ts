/**
 * Environment Configuration
 *
 * This module handles loading and validating environment variables
 * required for connecting to the n8n API.
 *
 * @format
 */
export declare const ENV_VARS: {
    N8N_API_URL: string;
    N8N_API_KEY: string;
    N8N_API_TIMEOUT: string;
    N8N_WEBHOOK_BASE_URL: string;
    N8N_WEBHOOK_USERNAME: string;
    N8N_WEBHOOK_PASSWORD: string;
    MCP_SERVER_TIMEOUT: string;
    CORS_ALLOWED_ORIGINS: string;
    NODE_ENV: string;
    VERCEL_URL: string;
    VERCEL_ENV: string;
    DEBUG: string;
    REDIS_URL: string;
    POSTGRES_URL: string;
    POSTGRES_USER: string;
    POSTGRES_HOST: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DATABASE: string;
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    DISABLE_ANALYTICS: string;
    DATABASE_TIMEOUT: string;
    DATABASE_MAX_CONNECTIONS: string;
};
export interface EnvConfig {
    n8nApiUrl: string;
    n8nApiKey: string;
    n8nApiTimeout: number;
    n8nWebhookBaseUrl?: string;
    n8nWebhookUsername?: string;
    n8nWebhookPassword?: string;
    mcpServerTimeout: number;
    corsAllowedOrigins?: string;
    nodeEnv: string;
    vercelUrl?: string;
    vercelEnv?: string;
    debug: boolean;
    redisUrl?: string;
    postgresUrl?: string;
    postgresUser?: string;
    postgresHost?: string;
    postgresPassword?: string;
    postgresDatabase?: string;
    supabaseUrl?: string;
    supabaseAnonKey?: string;
    supabaseServiceRoleKey?: string;
    databaseTimeout: number;
    databaseMaxConnections: number;
}
/**
 * Load environment variables from .env file if present
 */
export declare function loadEnvironmentVariables(): void;
/**
 * Validate and retrieve required environment variables
 *
 * @returns Validated environment configuration
 * @throws {McpError} If required environment variables are missing
 */
export declare function getEnvConfig(): EnvConfig;
