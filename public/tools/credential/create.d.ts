/**
 * Create Credential Tool
 *
 * This tool creates a new credential in n8n.
 *
 * @format
 */
import { BaseCredentialToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the create_credential tool
 */
export declare class CreateCredentialHandler extends BaseCredentialToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing credential details
     * @returns Created credential information
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the create_credential tool
 *
 * @returns Tool definition
 */
export declare function getCreateCredentialToolDefinition(): ToolDefinition;
