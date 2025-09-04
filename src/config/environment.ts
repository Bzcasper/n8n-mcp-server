/**
 * Environment Configuration
 *
 * This module handles loading and validating environment variables
 * required for connecting to the n8n API.
 *
 * @format
 */

import dotenv from "dotenv";
import findConfig from "find-config";
import path from "path";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode } from "../errors/error-codes.js";

// Environment variable names
export const ENV_VARS = {
  N8N_API_URL: "N8N_API_URL",
  N8N_API_KEY: "N8N_API_KEY",
  N8N_API_TIMEOUT: "N8N_API_TIMEOUT",
  N8N_WEBHOOK_BASE_URL: "N8N_WEBHOOK_BASE_URL",
  N8N_WEBHOOK_USERNAME: "N8N_WEBHOOK_USERNAME",
  N8N_WEBHOOK_PASSWORD: "N8N_WEBHOOK_PASSWORD",
  MCP_SERVER_TIMEOUT: "MCP_SERVER_TIMEOUT",
  CORS_ALLOWED_ORIGINS: "CORS_ALLOWED_ORIGINS",
  NODE_ENV: "NODE_ENV",
  VERCEL_URL: "VERCEL_URL",
  VERCEL_ENV: "VERCEL_ENV",
  DEBUG: "DEBUG",
  REDIS_URL: "REDIS_URL",
  POSTGRES_URL: "POSTGRES_URL",
  POSTGRES_USER: "POSTGRES_USER",
  POSTGRES_HOST: "POSTGRES_HOST",
  POSTGRES_PASSWORD: "POSTGRES_PASSWORD",
  POSTGRES_DATABASE: "POSTGRES_DATABASE",
  SUPABASE_URL: "SUPABASE_URL",
  SUPABASE_ANON_KEY: "SUPABASE_ANON_KEY",
  SUPABASE_SERVICE_ROLE_KEY: "SUPABASE_SERVICE_ROLE_KEY",
  SUPABASE_JWT_SECRET: "SUPABASE_JWT_SECRET",
  POSTGRES_PRISMA_URL: "POSTGRES_PRISMA_URL",
  POSTGRES_URL_NON_POOLING: "POSTGRES_URL_NON_POOLING",
  NEXT_PUBLIC_SUPABASE_URL: "NEXT_PUBLIC_SUPABASE_URL",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  DISABLE_ANALYTICS: "DISABLE_ANALYTICS",
  DATABASE_TIMEOUT: "DATABASE_TIMEOUT",
  DATABASE_MAX_CONNECTIONS: "DATABASE_MAX_CONNECTIONS",
};

// Interface for validated environment variables
export interface EnvConfig {
  n8nApiUrl: string;
  n8nApiKey: string;
  n8nApiTimeout: number;
  n8nWebhookBaseUrl?: string; // Optional webhook base URL
  n8nWebhookUsername?: string; // Made optional
  n8nWebhookPassword?: string; // Made optional
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
  supabaseJwtSecret?: string;
  postgresPrismaUrl?: string;
  postgresUrlNonPooling?: string;
  nextPublicSupabaseUrl?: string;
  nextPublicSupabaseAnonKey?: string;
  databaseTimeout: number;
  databaseMaxConnections: number;
}

/**
 * Load environment variables from .env file if present
 */
export function loadEnvironmentVariables(): void {
  const {
    N8N_API_URL,
    N8N_API_KEY,
    N8N_WEBHOOK_BASE_URL,
    N8N_WEBHOOK_USERNAME,
    N8N_WEBHOOK_PASSWORD,
  } = process.env;

  if (
    !N8N_API_URL &&
    !N8N_API_KEY &&
    !N8N_WEBHOOK_BASE_URL &&
    !N8N_WEBHOOK_USERNAME &&
    !N8N_WEBHOOK_PASSWORD
  ) {
    const projectRoot = findConfig("package.json");
    if (projectRoot) {
      const envPath = path.resolve(path.dirname(projectRoot), ".env");
      dotenv.config({ path: envPath });
    }
  }
}

/**
 * Validate and retrieve required environment variables
 *
 * @returns Validated environment configuration
 * @throws {McpError} If required environment variables are missing
 */
export function getEnvConfig(): EnvConfig {
  const n8nApiUrl = process.env[ENV_VARS.N8N_API_URL];
  const n8nApiKey = process.env[ENV_VARS.N8N_API_KEY];
  const n8nApiTimeout = parseInt(
    process.env[ENV_VARS.N8N_API_TIMEOUT] || "10000",
    10
  );
  const n8nWebhookBaseUrl = process.env[ENV_VARS.N8N_WEBHOOK_BASE_URL];
  const n8nWebhookUsername = process.env[ENV_VARS.N8N_WEBHOOK_USERNAME];
  const n8nWebhookPassword = process.env[ENV_VARS.N8N_WEBHOOK_PASSWORD];
  const mcpServerTimeout = parseInt(
    process.env[ENV_VARS.MCP_SERVER_TIMEOUT] || "30000",
    10
  );
  const corsAllowedOrigins = process.env[ENV_VARS.CORS_ALLOWED_ORIGINS];
  const nodeEnv = process.env[ENV_VARS.NODE_ENV] || "development";
  const vercelUrl = process.env[ENV_VARS.VERCEL_URL];
  const vercelEnv = process.env[ENV_VARS.VERCEL_ENV];
  const debug = process.env[ENV_VARS.DEBUG]?.toLowerCase() === "true";
  const redisUrl = process.env[ENV_VARS.REDIS_URL];
  const postgresUrl = process.env[ENV_VARS.POSTGRES_URL];
  const postgresUser = process.env[ENV_VARS.POSTGRES_USER];
  const postgresHost = process.env[ENV_VARS.POSTGRES_HOST];
  const postgresPassword = process.env[ENV_VARS.POSTGRES_PASSWORD];
  const postgresDatabase = process.env[ENV_VARS.POSTGRES_DATABASE];
  const supabaseUrl = process.env[ENV_VARS.SUPABASE_URL];
  const supabaseAnonKey = process.env[ENV_VARS.SUPABASE_ANON_KEY];
  const supabaseServiceRoleKey =
    process.env[ENV_VARS.SUPABASE_SERVICE_ROLE_KEY];
  const supabaseJwtSecret = process.env[ENV_VARS.SUPABASE_JWT_SECRET];
  const postgresPrismaUrl = process.env[ENV_VARS.POSTGRES_PRISMA_URL];
  const postgresUrlNonPooling = process.env[ENV_VARS.POSTGRES_URL_NON_POOLING];
  const nextPublicSupabaseUrl = process.env[ENV_VARS.NEXT_PUBLIC_SUPABASE_URL];
  const nextPublicSupabaseAnonKey =
    process.env[ENV_VARS.NEXT_PUBLIC_SUPABASE_ANON_KEY];
  const databaseTimeout = parseInt(
    process.env[ENV_VARS.DATABASE_TIMEOUT] || "10000",
    10
  );
  const databaseMaxConnections = parseInt(
    process.env[ENV_VARS.DATABASE_MAX_CONNECTIONS] || "5",
    10
  );

  // Validate required core environment variables
  if (!n8nApiUrl) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Missing required environment variable: ${ENV_VARS.N8N_API_URL}`
    );
  }

  if (!n8nApiKey) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Missing required environment variable: ${ENV_VARS.N8N_API_KEY}`
    );
  }

  // N8N_WEBHOOK_USERNAME and N8N_WEBHOOK_PASSWORD are now optional at startup.
  // Tools requiring them should perform checks at the point of use.

  // Validate API URL format
  try {
    new URL(n8nApiUrl);
  } catch (error) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Invalid URL format for ${ENV_VARS.N8N_API_URL}: ${n8nApiUrl}`
    );
  }

  // Validate webhook base URL format if provided
  if (n8nWebhookBaseUrl) {
    try {
      new URL(n8nWebhookBaseUrl);
    } catch (error) {
      throw new McpError(
        ErrorCode.InitializationError,
        `Invalid URL format for ${ENV_VARS.N8N_WEBHOOK_BASE_URL}: ${n8nWebhookBaseUrl}`
      );
    }
  }

  // Validate timeouts are positive numbers
  if (isNaN(n8nApiTimeout) || n8nApiTimeout <= 0) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Invalid timeout for ${ENV_VARS.N8N_API_TIMEOUT}: must be a positive number, got ${n8nApiTimeout}`
    );
  }

  if (isNaN(mcpServerTimeout) || mcpServerTimeout <= 0) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Invalid timeout for ${ENV_VARS.MCP_SERVER_TIMEOUT}: must be a positive number, got ${mcpServerTimeout}`
    );
  }

  // Validate CORS allowed origins if provided
  if (corsAllowedOrigins && corsAllowedOrigins.trim() !== "") {
    // Basic validation: should be comma-separated URLs or origins
    try {
      const origins = corsAllowedOrigins
        .split(",")
        .map((origin) => origin.trim());
      for (const origin of origins) {
        if (origin !== "*") {
          new URL(origin);
        }
      }
    } catch (error) {
      throw new McpError(
        ErrorCode.InitializationError,
        `Invalid format for ${ENV_VARS.CORS_ALLOWED_ORIGINS}: must be comma-separated URLs or '*', got ${corsAllowedOrigins}`
      );
    }
  }

  // Validate Redis URL format if provided
  if (redisUrl) {
    try {
      new URL(redisUrl);
    } catch (error) {
      throw new McpError(
        ErrorCode.InitializationError,
        `Invalid URL format for ${ENV_VARS.REDIS_URL}: ${redisUrl}`
      );
    }
  }

  // Validate PostgreSQL URL format if provided
  if (postgresUrl) {
    try {
      new URL(postgresUrl);
    } catch (error) {
      throw new McpError(
        ErrorCode.InitializationError,
        `Invalid URL format for ${ENV_VARS.POSTGRES_URL}: ${postgresUrl}`
      );
    }
  }

  // Validate Supabase URL format if provided
  if (supabaseUrl) {
    try {
      new URL(supabaseUrl);
    } catch (error) {
      throw new McpError(
        ErrorCode.InitializationError,
        `Invalid URL format for ${ENV_VARS.SUPABASE_URL}: ${supabaseUrl}`
      );
    }
  }

  // Validate Supabase keys format if provided (JWT tokens should be reasonably long)
  if (
    supabaseAnonKey &&
    (supabaseAnonKey.length < 100 || !supabaseAnonKey.startsWith("eyJ"))
  ) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Invalid format for ${ENV_VARS.SUPABASE_ANON_KEY}: should be a valid JWT token starting with 'eyJ'`
    );
  }

  if (
    supabaseServiceRoleKey &&
    (supabaseServiceRoleKey.length < 100 ||
      !supabaseServiceRoleKey.startsWith("eyJ"))
  ) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Invalid format for ${ENV_VARS.SUPABASE_SERVICE_ROLE_KEY}: should be a valid JWT token starting with 'eyJ'`
    );
  }

  // Validate database timeout
  if (isNaN(databaseTimeout) || databaseTimeout <= 0) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Invalid database timeout for ${ENV_VARS.DATABASE_TIMEOUT}: must be a positive number, got ${databaseTimeout}`
    );
  }

  // Validate database max connections
  if (
    isNaN(databaseMaxConnections) ||
    databaseMaxConnections <= 0 ||
    databaseMaxConnections > 100
  ) {
    throw new McpError(
      ErrorCode.InitializationError,
      `Invalid database max connections for ${ENV_VARS.DATABASE_MAX_CONNECTIONS}: must be between 1-100, got ${databaseMaxConnections}`
    );
  }

  return {
    n8nApiUrl,
    n8nApiKey,
    n8nApiTimeout,
    n8nWebhookBaseUrl: n8nWebhookBaseUrl || undefined,
    n8nWebhookUsername: n8nWebhookUsername || undefined, // Ensure undefined if empty
    n8nWebhookPassword: n8nWebhookPassword || undefined, // Ensure undefined if empty
    mcpServerTimeout,
    corsAllowedOrigins: corsAllowedOrigins || undefined,
    nodeEnv,
    vercelUrl: vercelUrl || undefined,
    vercelEnv: vercelEnv || undefined,
    debug,
    redisUrl: redisUrl || undefined,
    postgresUrl: postgresUrl || undefined,
    postgresUser: postgresUser || undefined,
    postgresHost: postgresHost || undefined,
    postgresPassword: postgresPassword || undefined,
    postgresDatabase: postgresDatabase || undefined,
    supabaseUrl: supabaseUrl || undefined,
    supabaseAnonKey: supabaseAnonKey || undefined,
    supabaseServiceRoleKey: supabaseServiceRoleKey || undefined,
    supabaseJwtSecret: supabaseJwtSecret || undefined,
    postgresPrismaUrl: postgresPrismaUrl || undefined,
    postgresUrlNonPooling: postgresUrlNonPooling || undefined,
    nextPublicSupabaseUrl: nextPublicSupabaseUrl || undefined,
    nextPublicSupabaseAnonKey: nextPublicSupabaseAnonKey || undefined,
    databaseTimeout,
    databaseMaxConnections,
  };
}
