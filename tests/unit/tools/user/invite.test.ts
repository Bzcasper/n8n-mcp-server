/**
 * Tests for the Invite Users Tool
 *
 * @format
 */

import { jest } from "@jest/globals";
import {
  InviteUsersHandler,
  getInviteUsersToolDefinition,
} from "../../../src/tools/user/invite.js";
import { N8nApiService } from "../../../src/api/n8n-client.js";

// Mock the API service - using relative paths for tests
jest.mock("../../../src/api/n8n-client.js", () => ({
  N8nApiService: jest.fn(),
  createApiService: jest.fn(),
}));

describe("InviteUsersHandler", () => {
  let handler: InviteUsersHandler;
  let mockApiService: jest.Mocked<N8nApiService>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create handler instance
    handler = new InviteUsersHandler();

    // Mock the API service through the base class
    mockApiService = {
      createUsers: jest.fn(),
    } as any;

    // Mock the base class apiService
    Object.defineProperty(handler, "apiService", {
      get: () => mockApiService,
    });
  });

  describe("execute", () => {
    it("should successfully invite a user without role", async () => {
      const mockUser = {
        id: "123",
        email: "user@example.com",
        firstName: "",
        lastName: "",
        role: null,
        isInvited: true,
        isPending: true,
      };

      mockApiService.createUsers.mockResolvedValue([mockUser]);

      const result = await handler.execute({
        email: "user@example.com",
      });

      expect(mockApiService.createUsers).toHaveBeenCalledWith([
        {
          email: "user@example.com",
          role: undefined,
        },
      ]);

      expect(result.content[0].type).toBe("text");
      expect(result.content[0].text).toContain("Successfully invited user");
      expect(result.isError).toBeUndefined();
    });

    it("should successfully invite a user with role", async () => {
      const mockUser = {
        id: "123",
        email: "user@example.com",
        firstName: "",
        lastName: "",
        role: "member",
        isInvited: true,
        isPending: true,
      };

      mockApiService.createUsers.mockResolvedValue([mockUser]);

      const result = await handler.execute({
        email: "user@example.com",
        role: "member",
      });

      expect(mockApiService.createUsers).toHaveBeenCalledWith([
        {
          email: "user@example.com",
          role: "member",
        },
      ]);

      expect(result.content[0].text).toContain("with role member");
    });

    it("should validate email format", async () => {
      const result = await handler.execute({
        email: "invalid-email",
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Invalid email format");
    });

    it("should require email parameter", async () => {
      const result = await handler.execute({});

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Email parameter is required");
    });

    it("should normalize email to lowercase", async () => {
      const mockUser = {
        id: "123",
        email: "user@example.com",
      };

      mockApiService.createUsers.mockResolvedValue([mockUser]);

      await handler.execute({
        email: "USER@EXAMPLE.COM",
      });

      expect(mockApiService.createUsers).toHaveBeenCalledWith([
        {
          email: "user@example.com",
        },
      ]);
    });

    it("should handle API errors", async () => {
      mockApiService.createUsers.mockRejectedValue(new Error("API Error"));

      const result = await handler.execute({
        email: "user@example.com",
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("API Error");
    });
  });

  describe("getInviteUsersToolDefinition", () => {
    it("should return correct tool definition", () => {
      const definition = getInviteUsersToolDefinition();

      expect(definition.name).toBe("n8n-users-invite");
      expect(definition.description).toContain("Invite new users");
      expect(definition.inputSchema.type).toBe("object");
      expect(definition.inputSchema.required).toEqual(["email"]);
      expect(definition.inputSchema.properties?.email).toBeDefined();
      expect(definition.inputSchema.properties?.role).toBeDefined();
    });
  });
});
