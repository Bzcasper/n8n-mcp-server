/**
 * Activate Workflow Tool
 *
 * This tool activates an existing workflow in n8n.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the activate_workflow tool
 */
export declare class ActivateWorkflowHandler extends BaseWorkflowToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing workflowId
     * @returns Activation confirmation
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the activate_workflow tool
 *
 * @returns Tool definition
 */
export declare function getActivateWorkflowToolDefinition(): ToolDefinition;
