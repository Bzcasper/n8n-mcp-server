/**
 * Get Workflow Tags Tool
 *
 * This tool retrieves tags for a specific workflow from n8n.
 *
 * @format
 */

import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
import { N8nApiError } from "../../errors/index.js";

/**
 * Handler for the n8n_workflow_tags_get tool
 */
export class GetWorkflowTagsHandler extends BaseWorkflowToolHandler {
  /**
   * Execute the tool
   *
   * @param args Tool arguments containing id
   * @returns Workflow tags
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async (args) => {
      const { id } = args;

      if (!id) {
        throw new N8nApiError("Missing required parameter: id");
      }

      const tags = await this.apiService.getWorkflowTags(id);

      return this.formatSuccess(
        tags,
        `Retrieved ${tags.length} tags for workflow: ${id}`
      );
    }, args);
  }
}

/**
 * Handler for the n8n_workflow_tags_update tool
 */
export class UpdateWorkflowTagsHandler extends BaseWorkflowToolHandler {
  /**
   * Execute the tool
   *
   * @param args Tool arguments containing id and tagIds
   * @returns Updated workflow tags
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async (args) => {
      const { id, tagIds } = args;

      if (!id) {
        throw new N8nApiError("Missing required parameter: id");
      }

      if (!tagIds || !Array.isArray(tagIds)) {
        throw new N8nApiError(
          "Missing required parameter: tagIds (array of tag IDs)"
        );
      }

      // Validate that tagIds is an array of objects with id property
      // or accept simple array of tag Ids
      if (tagIds.length > 0 && typeof tagIds[0] === "string") {
        // Convert array of strings to array of objects with id property
        const processedTagIds = tagIds.map((tagId) => ({ id: tagId }));
        const tags = await this.apiService.updateWorkflowTags(
          id,
          processedTagIds
        );

        return this.formatSuccess(
          tags,
          `Updated tags for workflow: ${id} (set to ${tagIds.length} tags)`
        );
      } else {
        // Assume it's already in the correct format
        const tags = await this.apiService.updateWorkflowTags(id, tagIds);

        return this.formatSuccess(
          tags,
          `Updated tags for workflow: ${id} (set to ${tagIds.length} tags)`
        );
      }
    }, args);
  }
}

/**
 * Get tool definition for the n8n-workflow-tags-get tool
 *
 * @returns Tool definition
 */
export function getGetWorkflowTagsToolDefinition(): ToolDefinition {
  return {
    name: "n8n_workflow_tags_get",
    description: "Get all tags associated with a specific n8n workflow",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Workflow ID to fetch tags for",
        },
      },
      required: ["id"],
    },
  };
}

/**
 * Get tool definition for the n8n-workflow-tags-update tool
 *
 * @returns Tool definition
 */
export function getUpdateWorkflowTagsToolDefinition(): ToolDefinition {
  return {
    name: "n8n_workflow_tags_update",
    description: "Update tags associated with a specific n8n workflow",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Workflow ID to update tags for",
        },
        tagIds: {
          type: "array",
          description: "Array of tag IDs to assign to the workflow",
          items: {
            type: "string",
          },
        },
      },
      required: ["id", "tagIds"],
    },
  };
}
