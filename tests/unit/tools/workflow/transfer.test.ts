/**
 * Transfer Workflow Tool Tests
 *
 * Tests for the transfer workflow tool functionality.
 *
 * @format
 */

import { describe, it, expect } from "@jest/globals";

// Import the actual tool definition to test MCP discovery
import { getTransferWorkflowToolDefinition } from "../../../../src/tools/workflow/transfer.js";

describe("Transfer Workflow Tool", () => {
  describe("getTransferWorkflowToolDefinition", () => {
    it("should return the correct tool definition for n8n-workflow-transfer", () => {
      const definition = getTransferWorkflowToolDefinition();

      expect(definition.name).toBe("n8n-workflow-transfer");
      expect(definition.description).toBe(
        "Transfer a workflow to a different project"
      );
      expect(definition.inputSchema).toBeDefined();
      expect(definition.inputSchema.type).toBe("object");
    });

    it("should have correct id parameter", () => {
      const definition = getTransferWorkflowToolDefinition();

      expect(definition.inputSchema.properties).toHaveProperty("id");
      expect(definition.inputSchema.properties?.id?.type).toBe("string");
      expect(definition.inputSchema.properties?.id?.description).toBe(
        "Workflow ID to transfer"
      );
    });

    it("should have correct destinationProjectId parameter", () => {
      const definition = getTransferWorkflowToolDefinition();

      expect(definition.inputSchema.properties).toHaveProperty(
        "destinationProjectId"
      );
      expect(
        definition.inputSchema.properties?.destinationProjectId?.type
      ).toBe("string");
      expect(
        definition.inputSchema.properties?.destinationProjectId?.description
      ).toBe("Target project ID");
    });

    it("should require both id and destinationProjectId parameters", () => {
      const definition = getTransferWorkflowToolDefinition();

      expect(definition.inputSchema.required).toEqual([
        "id",
        "destinationProjectId",
      ]);
    });

    it("should have exactly two required parameters", () => {
      const definition = getTransferWorkflowToolDefinition();

      expect(definition.inputSchema.required).toHaveLength(2);
      expect(definition.inputSchema.required).toContain("id");
      expect(definition.inputSchema.required).toContain("destinationProjectId");
    });
  });
});
