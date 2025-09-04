/**
 * Deactivate Workflow Tool
 *
 * This tool deactivates an existing workflow in n8n.
 *
 * @format
 */

import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
import { N8nApiError } from "../../errors/index.js";
import { trackWorkflowPattern } from "../../analytics/index.js";

/**
 * Handler for the n8n-workflow-deactivate tool
 */
export class DeactivateWorkflowHandler extends BaseWorkflowToolHandler {
  /**
   * Execute the tool
   *
   * @param args Tool arguments containing id
   * @returns Deactivation confirmation
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async (args) => {
      const { id } = args;

      if (!id) {
        throw new N8nApiError("Missing required parameter: id");
      }

      // Deactivate the workflow
      const workflow = await this.apiService.deactivateWorkflow(id);

      // Track workflow deactivation pattern
      const nodeCount = workflow.nodes?.length || 0;
      const tagCount = workflow.tags?.length || 0;
      trackWorkflowPattern("deactivate", nodeCount, tagCount);

      return this.formatSuccess(
        {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
        },
        `Workflow "${workflow.name}" (ID: ${id}) has been successfully deactivated`
      );
    }, args);
  }
}

/**
 * Get tool definition for the n8n-workflow-deactivate tool
 *
 * @returns Tool definition
 */
export function getDeactivateWorkflowToolDefinition(): ToolDefinition {
  return {
    name: "n8n-workflow-deactivate",
    description: "Deactivate an n8n workflow to stop accepting triggers",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Workflow ID to deactivate",
        },
      },
      required: ["id"],
    },
  };
}
