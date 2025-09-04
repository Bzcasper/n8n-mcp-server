/**
 * Get Workflow Tags Tool
 *
 * This tool retrieves tags for a specific workflow from n8n.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the n8n_workflow_tags_get tool
 */
export declare class GetWorkflowTagsHandler extends BaseWorkflowToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing id
     * @returns Workflow tags
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Handler for the n8n_workflow_tags_update tool
 */
export declare class UpdateWorkflowTagsHandler extends BaseWorkflowToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing id and tagIds
     * @returns Updated workflow tags
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n-workflow-tags-get tool
 *
 * @returns Tool definition
 */
export declare function getGetWorkflowTagsToolDefinition(): ToolDefinition;
/**
 * Get tool definition for the n8n-workflow-tags-update tool
 *
 * @returns Tool definition
 */
export declare function getUpdateWorkflowTagsToolDefinition(): ToolDefinition;
