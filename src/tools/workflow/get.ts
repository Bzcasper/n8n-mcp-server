/**
 * Get Workflow Tool
 *
 * This tool retrieves a specific workflow from n8n by ID.
 *
 * @format
 */

import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
import { N8nApiError } from "../../errors/index.js";

/**
 * Handler for the n8n-workflow-get tool
 */
export class GetWorkflowHandler extends BaseWorkflowToolHandler {
  /**
   * Execute the tool
   *
   * @param args Tool arguments containing id and optional includeData
   * @returns Workflow details
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async (args) => {
      const { id, includeData } = args;

      if (!id) {
        throw new N8nApiError("Missing required parameter: id");
      }

      const params: Record<string, any> = {};
      if (includeData !== undefined) params.includeData = includeData;

      const workflow = await this.apiService.getWorkflow(id, params);

      return this.formatSuccess(
        workflow,
        `Retrieved workflow: ${workflow.name}`
      );
    }, args);
  }
}

/**
 * Get tool definition for the n8n-workflow-get tool
 *
 * @returns Tool definition
 */
export function getGetWorkflowToolDefinition(): ToolDefinition {
  return {
    name: "n8n-workflow-get",
    description: "Get a specific n8n workflow by its ID",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Workflow ID",
        },
        includeData: {
          type: "boolean",
          description: "Whether to include workflow data",
        },
      },
      required: ["id"],
    },
  };
}
