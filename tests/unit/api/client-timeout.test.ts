/**
 * API Client Timeout and Error Handling Tests
 *
 * @format
 */

import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import axios from "axios";
import { N8nApiClient } from "../../../src/api/client.js";
import { getEnvConfig } from "../../../src/config/environment.js";
import { N8nApiError } from "../../../src/errors/index.js";

// Mock axios
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

// Mock console.error for cleaner test output
const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

describe("N8nApiClient - Timeout and Error Handling", () => {
  let client: N8nApiClient;
  let mockConfig: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock environment config
    mockConfig = {
      n8nApiUrl: "https://api.test.n8n.io",
      n8nApiKey: "test-key-123",
      n8nApiTimeout: 5000, // 5 seconds
      debug: false,
    };

    // Create axios instance mock
    const mockAxiosInstance = {
      defaults: { timeout: mockConfig.n8nApiTimeout },
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };

    mockAxios.create.mockReturnValue(mockAxiosInstance as any);
    client = new N8nApiClient(mockConfig);
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("Timeout Handling", () => {
    it("should configure axios with the specified timeout", () => {
      expect(mockAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: mockConfig.n8nApiTimeout,
        })
      );
    });

    it("should handle ECONNABORTED timeout errors", async () => {
      const mockAxiosInstance = mockAxios.create();
      mockAxiosInstance.get.mockRejectedValue({
        code: "ECONNABORTED",
        message: "timeout of 5000ms exceeded",
      });

      await expect(client.getWorkflows()).rejects.toThrow(N8nApiError);
      await expect(client.getWorkflows()).rejects.toThrow(
        "Request timeout: Failed to fetch workflows"
      );
    });

    it("should handle timeout status code 408", async () => {
      const mockAxiosInstance = mockAxios.create();
      mockAxiosInstance.get.mockRejectedValue({
        response: {
          status: 408,
          statusText: "Request Timeout",
          data: { message: "Gateway timeout" },
        },
      });

      await expect(client.getWorkflows()).rejects.toThrow(N8nApiError);
      try {
        await client.getWorkflows();
      } catch (error: any) {
        expect(error.message).toContain("Gateway timeout");
        expect(error.statusCode).toBe(408);
      }
    });
  });

  describe("Network Error Handling", () => {
    it("should handle connection refused errors", async () => {
      const mockAxiosInstance = mockAxios.create();
      mockAxiosInstance.get.mockRejectedValue({
        code: "ECONNREFUSED",
        message: "Connection refused",
        request: {},
      });

      await expect(client.getWorkflows()).rejects.toThrow(N8nApiError);
      try {
        await client.getWorkflows();
      } catch (error: any) {
        expect(error.message).toBe("Network error connecting to n8n API");
        expect(error.statusCode).toBeUndefined();
      }
    });

    it("should handle ENOTFOUND errors for invalid URLs", async () => {
      const mockAxiosInstance = mockAxios.create();
      mockAxiosInstance.get.mockRejectedValue({
        code: "ENOTFOUND",
        message: "getaddrinfo ENOTFOUND api.invalid.n8n.local",
        request: {},
      });

      await expect(client.getWorkflows()).rejects.toThrow(N8nApiError);
      try {
        await client.getWorkflows();
      } catch (error: any) {
        expect(error.message).toContain("Network error connecting to n8n API");
      }
    });

    it("should handle generic axios errors with request property", async () => {
      const mockAxiosInstance = mockAxios.create();
      mockAxiosInstance.get.mockRejectedValue({
        message: "Network Error",
        request: {},
      });

      await expect(client.getWorkflows()).rejects.toThrow(N8nApiError);
      try {
        await client.getWorkflows();
      } catch (error: any) {
        expect(error.message).toContain("Network error connecting to n8n API");
      }
    });
  });

  describe("HTTP Status Code Handling", () => {
    it("should handle 401 unauthorized", async () => {
      const mockAxiosInstance = mockAxios.create();
      mockAxiosInstance.get.mockRejectedValue({
        response: {
          status: 401,
          statusText: "Unauthorized",
          data: { message: "Invalid API key" },
        },
      });

      await expect(client.getWorkflows()).rejects.toThrow(N8nApiError);
      try {
        await client.getWorkflows();
      } catch (error: any) {
        expect(error.code).toBe("AuthenticationError");
        expect(error.statusCode).toBe(401);
        expect(error.message).toContain("Invalid API key");
      }
    });

    it("should handle 403 forbidden", async () => {
      const mockAxiosInstance = mockAxios.create();
      mockAxiosInstance.get.mockRejectedValue({
        response: {
          status: 403,
          statusText: "Forbidden",
          data: { message: "Access denied" },
        },
      });

      await expect(client.getWorkflows()).rejects.toThrow(N8nApiError);
      try {
        await client.getWorkflows();
      } catch (error: any) {
        expect(error.code).toBe("AuthenticationError");
        expect(error.statusCode).toBe(403);
        expect(error.message).toContain("Access denied");
      }
    });

    it("should handle 404 not found", async () => {
      const mockAxiosInstance = mockAxios.create();
      mockAxiosInstance.get.mockRejectedValue({
        response: {
          status: 404,
          statusText: "Not Found",
          data: { message: "Workflow not found" },
        },
      });

      await expect(client.getWorkflows()).rejects.toThrow(N8nApiError);
      try {
        await client.getWorkflows();
      } catch (error: any) {
        expect(error.code).toBe("NotFoundError");
        expect(error.statusCode).toBe(404);
        expect(error.message).toContain("Workflow not found");
      }
    });

    it("should handle 400 bad request", async () => {
      const mockAxiosInstance = mockAxios.create();
      mockAxiosInstance.post.mockRejectedValue({
        response: {
          status: 400,
          statusText: "Bad Request",
          data: { message: "Invalid parameters" },
        },
      });

      await expect(client.createWorkflow({})).rejects.toThrow(N8nApiError);
      try {
        await client.createWorkflow({});
      } catch (error: any) {
        expect(error.code).toBe("InvalidRequest");
        expect(error.statusCode).toBe(400);
        expect(error.message).toContain("Invalid parameters");
      }
    });

    it("should handle 500 internal server error", async () => {
      const mockAxiosInstance = mockAxios.create();
      mockAxiosInstance.get.mockRejectedValue({
        response: {
          status: 500,
          statusText: "Internal Server Error",
          data: { message: "Internal error" },
        },
      });

      await expect(client.getWorkflows()).rejects.toThrow(N8nApiError);
      try {
        await client.getWorkflows();
      } catch (error: any) {
        expect(error.code).toBe("InternalError");
        expect(error.statusCode).toBe(500);
        expect(error.message).toContain("Internal error");
      }
    });
  });

  describe("Successful Requests", () => {
    it("should return data for successful requests", async () => {
      const mockWorkflows = [
        { id: "wf-1", name: "Test Workflow" },
        { id: "wf-2", name: "Another Workflow" },
      ];

      const mockAxiosInstance = mockAxios.create();
      mockAxiosInstance.get.mockResolvedValue({
        data: { data: mockWorkflows },
      });

      const result = await client.getWorkflows();
      expect(result).toEqual(mockWorkflows);
    });
  });
});
