/**
 * Delete Workflow Tool
 *
 * This tool deletes an existing workflow from n8n.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the n8n-workflow-delete tool
 */
export declare class DeleteWorkflowHandler extends BaseWorkflowToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing id
     * @returns Deletion confirmation
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n-workflow-delete tool
 *
 * @returns Tool definition
 */
export declare function getDeleteWorkflowToolDefinition(): ToolDefinition;
