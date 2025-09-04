/**
 * List Users Tool
 *
 * This tool retrieves a list of users from n8n.
 *
 * @format
 */
import { BaseUserToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the list_users tool
 */
export declare class ListUsersHandler extends BaseUserToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments
     * @returns List of users
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n-users-list tool
 *
 * @returns Tool definition
 */
export declare function getListUsersToolDefinition(): ToolDefinition;
