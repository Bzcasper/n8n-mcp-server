/**
 * Tests for the Invite Users Tool
 *
 * @format
 */

import { describe, it, expect } from "@jest/globals";

// Import the actual function definitions to test MCP discovery
import { getInviteUsersToolDefinition } from "../../../src/tools/user/invite.js";

describe("InviteUsersTool", () => {
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
