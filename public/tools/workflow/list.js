/**
 * List Workflows Tool
 *
 * This tool retrieves a list of workflows from n8n.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
/**
 * Handler for the list_workflows tool
 */
export class ListWorkflowsHandler extends BaseWorkflowToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments
     * @returns List of workflows
     */
    async execute(args) {
        return this.handleExecution(async () => {
            const { includeData, projectId, limit, cursor } = args;
            const params = {};
            if (includeData !== undefined)
                params.includeData = includeData;
            if (projectId !== undefined)
                params.projectId = projectId;
            if (limit !== undefined)
                params.limit = limit;
            if (cursor !== undefined)
                params.cursor = cursor;
            const workflows = await this.apiService.getWorkflows(params);
            // Format the workflows for display
            const formattedWorkflows = workflows.map((workflow) => ({
                id: workflow.id,
                name: workflow.name,
                active: workflow.active,
                updatedAt: workflow.updatedAt,
            }));
            return this.formatSuccess(formattedWorkflows, `Found ${formattedWorkflows.length} workflow(s)`);
        }, args);
    }
}
/**
 * Get tool definition for the n8n-workflow-list tool
 *
 * @returns Tool definition
 */
export function getListWorkflowsToolDefinition() {
    return {
        name: "n8n-workflow-list",
        description: "Retrieve a list of n8n workflows with optional filtering and pagination",
        inputSchema: {
            type: "object",
            properties: {
                includeData: {
                    type: "boolean",
                    description: "Include workflow data in response",
                },
                projectId: {
                    type: "string",
                    description: "Filter workflows by project ID",
                },
                limit: {
                    type: "integer",
                    description: "Maximum number of workflows to return",
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