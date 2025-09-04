/**
 * N8N Executions List Tool
 *
 * This tool retrieves a list of workflow executions from n8n with optional filtering.
 *
 * @format
 */
import { BaseExecutionToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the n8n-executions-list tool
 */
export declare class ListExecutionsHandler extends BaseExecutionToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments
     * @returns List of executions
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n-executions-list tool
 *
 * @returns Tool definition
 */
export declare function getListExecutionsToolDefinition(): ToolDefinition;
