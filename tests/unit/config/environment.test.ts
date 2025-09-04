/**
 * Environment Configuration Tests
 *
 * @format
 */

import { describe, it, expect, jest, beforeEach } from "@jest/globals";

// Mock environment variables
const mockEnv = {
  N8N_API_URL: "https://api.test.n8n.io",
  N8N_API_KEY: "test-key-123",
  N8N_API_TIMEOUT: "5000",
  MCP_SERVER_TIMEOUT: "25000",
  NODE_ENV: "test",
  DEBUG: "true",
};

// Mock process.env
const originalEnv = process.env;

beforeEach(() => {
  // Reset process.env
  process.env = { ...originalEnv, ...mockEnv };

  // Clear module cache to ensure fresh environment handling
  jest.resetModules();
});

afterEach(() => {
  // Restore original process.env
  process.env = originalEnv;
});

describe("Environment Configuration", () => {
  describe("getEnvConfig", () => {
    it("should return valid configuration with required variables", async () => {
      const { getEnvConfig } = await import(
        "../../../src/config/environment.js"
      );

      const config = getEnvConfig();

      expect(config).toEqual({
        n8nApiUrl: mockEnv.N8N_API_URL,
        n8nApiKey: mockEnv.N8N_API_KEY,
        n8nApiTimeout: 5000,
        mcpServerTimeout: 25000,
        nodeEnv: mockEnv.NODE_ENV,
        debug: true,
        n8nWebhookBaseUrl: undefined,
        n8nWebhookUsername: undefined,
        n8nWebhookPassword: undefined,
        corsAllowedOrigins: undefined,
        vercelUrl: undefined,
        vercelEnv: undefined,
        redisUrl: undefined,
      });
    });

    it("should throw error with invalid URL", async () => {
      process.env.N8N_API_URL = "invalid-url";

      const { getEnvConfig } = await import(
        "../../../src/config/environment.js"
      );

      expect(() => getEnvConfig()).toThrow(
        "Invalid URL format for N8N_API_URL: invalid-url"
      );
    });

    it("should throw error for missing required environment variables", async () => {
      delete process.env.N8N_API_URL;

      const { getEnvConfig } = await import(
        "../../../src/config/environment.js"
      );

      expect(() => getEnvConfig()).toThrow(
        "Missing required environment variable: N8N_API_URL"
      );
    });

    it("should throw error for invalid timeout values", async () => {
      process.env.N8N_API_TIMEOUT = "invalid";

      const { getEnvConfig } = await import(
        "../../../src/config/environment.js"
      );

      expect(() => getEnvConfig()).toThrow(
        "Invalid timeout for N8N_API_TIMEOUT: must be a positive number, got NaN"
      );
    });

    it("should use default timeout values when not provided", async () => {
      delete process.env.N8N_API_TIMEOUT;
      delete process.env.MCP_SERVER_TIMEOUT;

      const { getEnvConfig } = await import(
        "../../../src/config/environment.js"
      );

      const config = getEnvConfig();

      expect(config.n8nApiTimeout).toBe(10000); // Default API timeout
      expect(config.mcpServerTimeout).toBe(30000); // Default server timeout
    });

    it("should throw error for zero timeout values", async () => {
      process.env.N8N_API_TIMEOUT = "0";

      const { getEnvConfig } = await import(
        "../../../src/config/environment.js"
      );

      expect(() => getEnvConfig()).toThrow(
        "Invalid timeout for N8N_API_TIMEOUT: must be a positive number, got 0"
      );
    });
  });
});
