/**
 * Deactivate Workflow Tool
 *
 * This tool deactivates an existing workflow in n8n.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the n8n-workflow-deactivate tool
 */
export declare class DeactivateWorkflowHandler extends BaseWorkflowToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing id
     * @returns Deactivation confirmation
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n-workflow-deactivate tool
 *
 * @returns Tool definition
 */
export declare function getDeactivateWorkflowToolDefinition(): ToolDefinition;
