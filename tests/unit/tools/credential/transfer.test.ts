/**
 * Transfer credential tool tests
 *
 * @format
 */

import { describe, it, expect } from "@jest/globals";

// Import the actual transfer tool definition to test MCP discovery
import { getTransferCredentialToolDefinition } from "../../../../src/tools/credential/transfer.js";

describe("Transfer Credential Tool", () => {
  describe("getTransferCredentialToolDefinition", () => {
    it("should return the correct tool definition for n8n_credential_transfer", () => {
      const definition = getTransferCredentialToolDefinition();

      expect(definition.name).toBe("n8n_credential_transfer");
      expect(definition.description).toBe(
        "Transfer an n8n credential to a different project (you must own the credential)"
      );
      expect(definition.inputSchema).toBeDefined();
      expect(definition.inputSchema.type).toBe("object");
      expect(definition.inputSchema.properties).toHaveProperty("id");
      expect(definition.inputSchema.properties).toHaveProperty(
        "destinationProjectId"
      );
      expect(definition.inputSchema.properties?.id?.type).toBe("string");
      expect(
        definition.inputSchema.properties?.destinationProjectId?.type
      ).toBe("string");
      expect(definition.inputSchema.required).toEqual([
        "id",
        "destinationProjectId",
      ]);
    });

    it("should have the correct parameter schema structure", () => {
      const definition = getTransferCredentialToolDefinition();
      const schema = definition.inputSchema;

      expect(schema.required).toContain("id");
      expect(schema.required).toContain("destinationProjectId");

      expect(schema.properties?.id?.type).toBe("string");
      expect(schema.properties?.id?.description).toBe(
        "Credential ID to transfer"
      );

      expect(schema.properties?.destinationProjectId?.type).toBe("string");
      expect(schema.properties?.destinationProjectId?.description).toBe(
        "Target project ID"
      );
    });
  });
});
