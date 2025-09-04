/**
 * Invite Users Tool
 *
 * This tool invites new users to n8n instance with optional role assignment.
 *
 * @format
 */
import { BaseUserToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the n8n-users-invite tool
 */
export declare class InviteUsersHandler extends BaseUserToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments
     * @returns User invitation result
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n-users-invite tool
 *
 * @returns Tool definition
 */
export declare function getInviteUsersToolDefinition(): ToolDefinition;
