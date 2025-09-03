/**
 * Activate Workflow Tool
 *
 * This tool activates an existing workflow in n8n.
 *
 * @format
 */

import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
import { N8nApiError } from "../../errors/index.js";

/**
 * Handler for the activate_workflow tool
 */
export class ActivateWorkflowHandler extends BaseWorkflowToolHandler {
  /**
   * Execute the tool
   *
   * @param args Tool arguments containing workflowId
   * @returns Activation confirmation
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async (args) => {
      const { id } = args;

      if (!id) {
        throw new N8nApiError("Missing required parameter: id");
      }

      // Activate the workflow
      const workflow = await this.apiService.activateWorkflow(id);

      return this.formatSuccess(
        {
          id: workflow.id,
          name: workflow.name,
          active: workflow.active,
        },
        `Workflow "${workflow.name}" (ID: ${id}) has been successfully activated`
      );
    }, args);
  }
}

/**
 * Get tool definition for the activate_workflow tool
 *
 * @returns Tool definition
 */
export function getActivateWorkflowToolDefinition(): ToolDefinition {
  return {
    name: "n8n-workflow-activate",
    description: "Activate an n8n workflow to accept triggers",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Workflow ID to activate",
        },
      },
      required: ["id"],
    },
  };
}
