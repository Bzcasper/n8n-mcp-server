/**
 * Delete Execution Tool
 *
 * This tool deletes a specific n8n workflow execution by ID.
 *
 * @format
 */

import { BaseExecutionToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode } from "../../errors/error-codes.js";

/**
 * Handler for the n8n-executions-delete tool
 */
export class DeleteExecutionHandler extends BaseExecutionToolHandler {
  /**
   * Execute the tool
   *
   * @param args Tool arguments (id)
   * @returns Deleted execution details
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async () => {
      // Validate required parameters
      if (!args.id) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "Missing required parameter: id"
        );
      }

      // Store execution ID for response message
      const executionId = args.id;

      // Get the execution details before deleting (for response)
      const execution = await this.apiService.getExecution(executionId);

      // Delete the execution
      await this.apiService.deleteExecution(executionId);

      return this.formatSuccess(
        execution,
        `Successfully deleted execution with ID: ${executionId}`
      );
    }, args);
  }
}

/**
 * Get tool definition for the n8n-executions-delete tool
 *
 * @returns Tool definition
 */
export function getDeleteExecutionToolDefinition(): ToolDefinition {
  return {
    name: "n8n-executions-delete",
    description: "Delete a specific n8n workflow execution by ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Execution ID to delete",
        },
      },
      required: ["id"],
    },
  };
}
