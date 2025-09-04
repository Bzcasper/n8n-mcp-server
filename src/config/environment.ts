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
  };
}
