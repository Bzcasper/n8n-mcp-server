/**
 * Update Workflow Tool
 *
 * This tool updates an existing workflow in n8n.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the n8n-workflow-update tool
 */
export declare class UpdateWorkflowHandler extends BaseWorkflowToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing workflow updates
     * @returns Updated workflow information
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the update_workflow tool
 *
 * @returns Tool definition
 */
export declare function getUpdateWorkflowToolDefinition(): ToolDefinition;
