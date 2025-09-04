/**
 * Get Workflow Tool
 *
 * This tool retrieves a specific workflow from n8n by ID.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the n8n-workflow-get tool
 */
export declare class GetWorkflowHandler extends BaseWorkflowToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing id and optional includeData
     * @returns Workflow details
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n-workflow-get tool
 *
 * @returns Tool definition
 */
export declare function getGetWorkflowToolDefinition(): ToolDefinition;
