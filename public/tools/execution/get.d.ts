/**
 * Get Execution Tool
 *
 * This tool retrieves detailed information about a specific workflow execution.
 *
 * @format
 */
import { BaseExecutionToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the n8n-executions-get tool
 */
export declare class GetExecutionHandler extends BaseExecutionToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments (id, includeData)
     * @returns Execution details
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n-executions-get tool
 *
 * @returns Tool definition
 */
export declare function getGetExecutionToolDefinition(): ToolDefinition;
