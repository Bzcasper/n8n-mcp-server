/**
 * Get Execution Tool
 *
 * This tool retrieves detailed information about a specific workflow execution.
 *
 * @format
 */
import { BaseExecutionToolHandler } from "./base-handler.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode } from "../../errors/error-codes.js";
import { formatExecutionDetails } from "../../utils/execution-formatter.js";
/**
 * Handler for the n8n-executions-get tool
 */
export class GetExecutionHandler extends BaseExecutionToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments (id, includeData)
     * @returns Execution details
     */
    async execute(args) {
        return this.handleExecution(async () => {
            // Validate required parameters
            if (!args.id) {
                throw new McpError(ErrorCode.InvalidRequest, "Missing required parameter: id");
            }
            // Prepare query parameters
            const params = {};
            if (args.includeData !== undefined) {
                params.includeData = args.includeData;
            }
            // Get execution details
            const execution = await this.apiService.getExecution(args.id, params);
            // Format the execution for display
            const formattedExecution = formatExecutionDetails(execution);
            return this.formatSuccess(formattedExecution, `Execution Details for ID: ${args.id}`);
        }, args);
    }
}
/**
 * Get tool definition for the n8n-executions-get tool
 *
 * @returns Tool definition
 */
export function getGetExecutionToolDefinition() {
    return {
        name: "n8n-executions-get",
        description: "Get details of a specific n8n workflow execution",
        inputSchema: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    description: "Execution ID to retrieve",
                },
                includeData: {
                    type: "boolean",
                    description: "Whether to include execution data",
                },
            },
            required: ["id"],
        },
    };
}
//# sourceMappingURL=get.js.map