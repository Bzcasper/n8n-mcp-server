/**
 * Create credential tool tests
 *
 * @format
 */

import { describe, it, expect } from "@jest/globals";

// Import the actual create tool definition to test MCP discovery
import { getCreateCredentialToolDefinition } from "../../../../src/tools/credential/create.js";

describe("Credential Tools", () => {
  describe("getCreateCredentialToolDefinition", () => {
    it("should return the correct tool definition for n8n-credentials-create", () => {
      const definition = getCreateCredentialToolDefinition();

      expect(definition.name).toBe("n8n-credentials-create");
      expect(definition.description).toBe(
        "Create a new n8n credential with the specified configuration"
      );
      expect(definition.inputSchema).toBeDefined();
      expect(definition.inputSchema.type).toBe("object");
      expect(definition.inputSchema.properties).toHaveProperty("name");
      expect(definition.inputSchema.properties).toHaveProperty("type");
      expect(definition.inputSchema.properties).toHaveProperty("data");
      expect(definition.inputSchema.properties?.name?.type).toBe("string");
      expect(definition.inputSchema.properties?.type?.type).toBe("string");
      expect(definition.inputSchema.properties?.data?.type).toBe("object");
      expect(definition.inputSchema.required).toEqual(["name", "type", "data"]);
    });

    it("should have the correct parameter schema structure", () => {
      const definition = getCreateCredentialToolDefinition();
      const schema = definition.inputSchema;

      expect(schema.required).toContain("name");
      expect(schema.required).toContain("type");
      expect(schema.required).toContain("data");

      expect(schema.properties?.name?.type).toBe("string");
      expect(schema.properties?.name?.description).toBe(
        "Name of the credential"
      );
      expect(schema.properties?.type?.type).toBe("string");
      expect(schema.properties?.type?.description).toBe(
        "Type of the credential (e.g., 'slackOAuth2Api', 'freshdeskApi')"
      );
      expect(schema.properties?.data?.type).toBe("object");
      expect(schema.properties?.data?.description).toBe(
        "Credential data object containing authentication parameters"
      );
    });

    it("should support optional nodesAccess parameter", () => {
      const definition = getCreateCredentialToolDefinition();
      const schema = definition.inputSchema;

      expect(schema.properties).toHaveProperty("nodesAccess");
      expect(schema.properties?.nodesAccess?.type).toBe("array");
      expect(schema.properties?.nodesAccess?.description).toBe(
        "Array of node types that can use this credential"
      );

      // nodesAccess should not be in required
      expect(schema.required).not.toContain("nodesAccess");
    });
  });
});
