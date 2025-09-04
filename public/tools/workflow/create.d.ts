/**
 * Create Workflow Tool
 *
 * This tool creates a new workflow in n8n.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the create_workflow tool
 */
export declare class CreateWorkflowHandler extends BaseWorkflowToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing workflow details
     * @returns Created workflow information
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the create_workflow tool
 *
 * @returns Tool definition
 */
export declare function getCreateWorkflowToolDefinition(): ToolDefinition;
