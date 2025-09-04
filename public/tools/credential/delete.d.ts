/**
 * Delete Credential Tool
 *
 * This tool deletes an existing credential from n8n.
 *
 * @format
 */
import { BaseCredentialToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the n8n-credentials-delete tool
 */
export declare class DeleteCredentialHandler extends BaseCredentialToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing id
     * @returns Deletion confirmation
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n-credentials-delete tool
 *
 * @returns Tool definition
 */
export declare function getDeleteCredentialToolDefinition(): ToolDefinition;
