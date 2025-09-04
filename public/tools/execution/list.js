/**
 * N8N Executions List Tool
 *
 * This tool retrieves a list of workflow executions from n8n with optional filtering.
 *
 * @format
 */
import { BaseExecutionToolHandler } from "./base-handler.js";
import { formatExecutionSummary } from "../../utils/execution-formatter.js";
/**
 * Handler for the n8n-executions-list tool
 */
export class ListExecutionsHandler extends BaseExecutionToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments
     * @returns List of executions
     */
    async execute(args) {
        return this.handleExecution(async () => {
            // Extract API parameters
            const apiParams = {};
            if (args.includeData !== undefined)
                apiParams.includeData = args.includeData;
            if (args.status)
                apiParams.status = args.status;
            if (args.workflowId)
                apiParams.workflowId = args.workflowId;
            if (args.projectId)
                apiParams.projectId = args.projectId;
            if (args.limit)
                apiParams.limit = args.limit;
            if (args.cursor)
                apiParams.cursor = args.cursor;
            // Fetch executions from API with parameters
            const executions = await this.apiService.getExecutions(apiParams);
            // Format the executions based on includeData
            let formattedExecutions;
            if (args.includeData) {
                // Return full execution objects if data is requested
                formattedExecutions = executions;
            }
            else {
                // Return formatted summaries
                formattedExecutions = executions.map((execution) => formatExecutionSummary(execution));
            }
            // Prepare response data
            const responseData = {
                executions: formattedExecutions,
                total: formattedExecutions.length,
                ...(apiParams.cursor ? { cursor: apiParams.cursor } : {}),
            };
            return this.formatSuccess(responseData, `Found ${formattedExecutions.length} execution(s)`);
        }, args);
    }
}
/**
 * Get tool definition for the n8n-executions-list tool
 *
 * @returns Tool definition
 */
export function getListExecutionsToolDefinition() {
    return {
        name: "n8n-executions-list",
        description: "List n8n workflow executions with optional filtering",
        inputSchema: {
            type: "object",
            properties: {
                includeData: {
                    type: "boolean",
                    description: "Whether to include execution data",
                },
                status: {
                    type: "string",
                    enum: ["error", "success", "waiting"],
                    description: "Filter by status",
                },
                workflowId: {
                    type: "string",
                    description: "Filter by specific workflow",
                },
                projectId: {
                    type: "string",
                    description: "Filter by specific project",
                },
                limit: {
                    type: "integer",
                    description: "Maximum number of results",
                },
                cursor: {
                    type: "string",
                    description: "Cursor for pagination",
                },
            },
            required: [],
        },
    };
}
//# sourceMappingURL=list.js.map