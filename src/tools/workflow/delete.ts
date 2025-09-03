/**
 * Delete Workflow Tool
 *
 * This tool deletes an existing workflow from n8n.
 *
 * @format
 */

import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
import { N8nApiError } from "../../errors/index.js";

/**
 * Handler for the n8n-workflow-delete tool
 */
export class DeleteWorkflowHandler extends BaseWorkflowToolHandler {
  /**
   * Execute the tool
   *
   * @param args Tool arguments containing id
   * @returns Deletion confirmation
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async (args) => {
      const { id } = args;

      if (!id) {
        throw new N8nApiError("Missing required parameter: id");
      }

      // Get the workflow info first for the confirmation message
      const workflow = await this.apiService.getWorkflow(id);
      const workflowName = workflow.name;

      // Delete the workflow
      await this.apiService.deleteWorkflow(id);

      return this.formatSuccess(
        { id },
        `Workflow "${workflowName}" (ID: ${id}) has been successfully deleted`
      );
    }, args);
  }
}

/**
 * Get tool definition for the n8n-workflow-delete tool
 *
 * @returns Tool definition
 */
export function getDeleteWorkflowToolDefinition(): ToolDefinition {
  return {
    name: "n8n-workflow-delete",
    description: "Delete an n8n workflow by its ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Workflow ID to delete",
        },
      },
      required: ["id"],
    },
  };
}
