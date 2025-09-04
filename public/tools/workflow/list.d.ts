/**
 * List Workflows Tool
 *
 * This tool retrieves a list of workflows from n8n.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the list_workflows tool
 */
export declare class ListWorkflowsHandler extends BaseWorkflowToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments
     * @returns List of workflows
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n-workflow-list tool
 *
 * @returns Tool definition
 */
export declare function getListWorkflowsToolDefinition(): ToolDefinition;
