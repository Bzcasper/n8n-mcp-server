/**
 * Delete credential tool tests
 *
 * @format
 */

import { describe, it, expect } from "@jest/globals";

// Import the actual delete tool definition to test MCP discovery
import { getDeleteCredentialToolDefinition } from "../../../../src/tools/credential/delete.js";

describe("Delete Credential Tool", () => {
  describe("getDeleteCredentialToolDefinition", () => {
    it("should return the correct tool definition for n8n-credentials-delete", () => {
      const definition = getDeleteCredentialToolDefinition();

      expect(definition.name).toBe("n8n-credentials-delete");
      expect(definition.description).toBe(
        "Delete an n8n credential by its ID (you must own the credential)"
      );
      expect(definition.inputSchema).toBeDefined();
      expect(definition.inputSchema.type).toBe("object");
      expect(definition.inputSchema.properties).toHaveProperty("id");
      expect(definition.inputSchema.properties?.id?.type).toBe("string");
      expect(definition.inputSchema.required).toEqual(["id"]);
    });

    it("should have the correct parameter schema structure", () => {
      const definition = getDeleteCredentialToolDefinition();
      const schema = definition.inputSchema;

      expect(schema.required).toContain("id");

      expect(schema.properties?.id?.type).toBe("string");
      expect(schema.properties?.id?.description).toBe(
        "Credential ID to delete"
      );
    });
  });
});
