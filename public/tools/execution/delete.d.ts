/**
 * Delete Execution Tool
 *
 * This tool deletes a specific n8n workflow execution by ID.
 *
 * @format
 */
import { BaseExecutionToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the n8n-executions-delete tool
 */
export declare class DeleteExecutionHandler extends BaseExecutionToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments (id)
     * @returns Deleted execution details
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n-executions-delete tool
 *
 * @returns Tool definition
 */
export declare function getDeleteExecutionToolDefinition(): ToolDefinition;
