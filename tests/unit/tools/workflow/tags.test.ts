/**
 * Get Workflow Tags Tool Tests
 *
 * Tests for the get workflow tags tool functionality.
 *
 * @format
 */

import { describe, it, expect } from "@jest/globals";

// Import the actual tool definitions to test MCP discovery
import {
  getGetWorkflowTagsToolDefinition,
  getUpdateWorkflowTagsToolDefinition,
} from "../../../../src/tools/workflow/tags.js";

describe("Get Workflow Tags Tool", () => {
  describe("getGetWorkflowTagsToolDefinition", () => {
    it("should return the correct tool definition for n8n_workflow_tags_get", () => {
      const definition = getGetWorkflowTagsToolDefinition();

      expect(definition.name).toBe("n8n_workflow_tags_get");
      expect(definition.description).toBe(
        "Get all tags associated with a specific n8n workflow"
      );
      expect(definition.inputSchema).toBeDefined();
      expect(definition.inputSchema.type).toBe("object");
    });

    it("should have correct id parameter", () => {
      const definition = getGetWorkflowTagsToolDefinition();

      expect(definition.inputSchema.properties).toHaveProperty("id");
      expect(definition.inputSchema.properties?.id?.type).toBe("string");
      expect(definition.inputSchema.properties?.id?.description).toBe(
        "Workflow ID to fetch tags for"
      );
    });

    it("should require id parameter", () => {
      const definition = getGetWorkflowTagsToolDefinition();

      expect(definition.inputSchema.required).toEqual(["id"]);
    });

    it("should have exactly one required parameter", () => {
      const definition = getGetWorkflowTagsToolDefinition();

      expect(definition.inputSchema.required).toHaveLength(1);
      expect(definition.inputSchema.required).toContain("id");
    });

    it("should have valid JSON schema", () => {
      const definition = getGetWorkflowTagsToolDefinition();

      // Verify the schema is a valid JSON schema
      expect(definition.inputSchema.type).toBeDefined();
      expect(definition.inputSchema.properties).toBeDefined();
      expect(definition.inputSchema.required).toBeDefined();

      // Ensure properties object only contains expected properties
      const properties = Object.keys(definition.inputSchema.properties);
      expect(properties).toHaveLength(1);
      expect(properties).toContain("id");
    });
  });
});

describe("Update Workflow Tags Tool", () => {
  describe("getUpdateWorkflowTagsToolDefinition", () => {
    it("should return the correct tool definition for n8n_workflow_tags_update", () => {
      const definition = getUpdateWorkflowTagsToolDefinition();

      expect(definition.name).toBe("n8n_workflow_tags_update");
      expect(definition.description).toBe(
        "Update tags associated with a specific n8n workflow"
      );
      expect(definition.inputSchema).toBeDefined();
      expect(definition.inputSchema.type).toBe("object");
    });

    it("should have correct id parameter", () => {
      const definition = getUpdateWorkflowTagsToolDefinition();

      expect(definition.inputSchema.properties).toHaveProperty("id");
      expect(definition.inputSchema.properties?.id?.type).toBe("string");
      expect(definition.inputSchema.properties?.id?.description).toBe(
        "Workflow ID to update tags for"
      );
    });

    it("should have correct tagIds parameter", () => {
      const definition = getUpdateWorkflowTagsToolDefinition();

      expect(definition.inputSchema.properties).toHaveProperty("tagIds");
      expect(definition.inputSchema.properties?.tagIds?.type).toBe("array");
      expect(definition.inputSchema.properties?.tagIds?.description).toBe(
        "Array of tag IDs to assign to the workflow"
      );
      expect(definition.inputSchema.properties?.tagIds?.items?.type).toBe(
        "string"
      );
    });

    it("should require both id and tagIds parameters", () => {
      const definition = getUpdateWorkflowTagsToolDefinition();

      expect(definition.inputSchema.required).toEqual(["id", "tagIds"]);
    });

    it("should have exactly two required parameters", () => {
      const definition = getUpdateWorkflowTagsToolDefinition();

      expect(definition.inputSchema.required).toHaveLength(2);
      expect(definition.inputSchema.required).toContain("id");
      expect(definition.inputSchema.required).toContain("tagIds");
    });

    it("should have valid JSON schema", () => {
      const definition = getUpdateWorkflowTagsToolDefinition();

      // Verify the schema is a valid JSON schema
      expect(definition.inputSchema.type).toBeDefined();
      expect(definition.inputSchema.properties).toBeDefined();
      expect(definition.inputSchema.required).toBeDefined();

      // Ensure properties object only contains expected properties
      const properties = Object.keys(definition.inputSchema.properties);
      expect(properties).toHaveLength(2);
      expect(properties).toContain("id");
      expect(properties).toContain("tagIds");
    });
  });
});
