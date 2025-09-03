/**
 * Transfer Workflow Tool
 *
 * This tool transfers a workflow to a different project in n8n.
 *
 * @format
 */

import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
import { N8nApiError } from "../../errors/index.js";

/**
 * Handler for the transfer_workflow tool
 */
export class TransferWorkflowHandler extends BaseWorkflowToolHandler {
  /**
   * Execute the tool
   *
   * @param args Tool arguments containing workflow ID and destination project
   * @returns Transferred workflow information
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async (args) => {
      const { id, destinationProjectId } = args;

      if (!id) {
        throw new N8nApiError("Missing required parameter: id");
      }

      if (!destinationProjectId) {
        throw new N8nApiError(
          "Missing required parameter: destinationProjectId"
        );
      }

      if (typeof id !== "string") {
        throw new N8nApiError("Parameter 'id' must be a string");
      }

      if (typeof destinationProjectId !== "string") {
        throw new N8nApiError(
          "Parameter 'destinationProjectId' must be a string"
        );
      }

      // Transfer the workflow
      const workflow = await this.apiService.transferWorkflow(
        id,
        destinationProjectId
      );

      return this.formatSuccess(
        {
          id: workflow.id,
          name: workflow.name,
          destinationProjectId,
        },
        `Workflow transferred successfully`
      );
    }, args);
  }
}

/**
 * Get tool definition for the transfer_workflow tool
 *
 * @returns Tool definition
 */
export function getTransferWorkflowToolDefinition(): ToolDefinition {
  return {
    name: "n8n-workflow-transfer",
    description: "Transfer a workflow to a different project",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Workflow ID to transfer",
        },
        destinationProjectId: {
          type: "string",
          description: "Target project ID",
        },
      },
      required: ["id", "destinationProjectId"],
    },
  };
}
