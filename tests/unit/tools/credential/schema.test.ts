/**
 * Get credential schema tool tests
 *
 * @format
 */

import { describe, it, expect } from "@jest/globals";

// Import the actual schema tool definition to test MCP discovery
import { getGetCredentialSchemaToolDefinition } from "../../../../src/tools/credential/schema.js";

describe("Credential Schema Tool", () => {
  describe("getGetCredentialSchemaToolDefinition", () => {
    it("should return the correct tool definition for n8n-credentials-schema-get", () => {
      const definition = getGetCredentialSchemaToolDefinition();

      expect(definition.name).toBe("n8n-credentials-schema-get");
      expect(definition.description).toBe(
        "Retrieve the JSON schema for a specific n8n credential type"
      );
      expect(definition.inputSchema).toBeDefined();
      expect(definition.inputSchema.type).toBe("object");
      expect(definition.inputSchema.properties).toHaveProperty(
        "credentialTypeName"
      );
      expect(definition.inputSchema.properties?.credentialTypeName?.type).toBe(
        "string"
      );
      expect(definition.inputSchema.required).toEqual(["credentialTypeName"]);
    });

    it("should have the correct parameter schema structure", () => {
      const definition = getGetCredentialSchemaToolDefinition();
      const schema = definition.inputSchema;

      expect(schema.required).toContain("credentialTypeName");

      expect(schema.properties?.credentialTypeName?.type).toBe("string");
      expect(schema.properties?.credentialTypeName?.description).toBe(
        "The credential type name (e.g., 'slackOAuth2Api', 'freshdeskApi')"
      );
    });
  });
});
