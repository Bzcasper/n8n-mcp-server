/**
 * Get Credential Schema Tool
 *
 * This tool retrieves the JSON schema for a specific n8n credential type.
 *
 * @format
 */
import { BaseCredentialToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the get_credential_schema tool
 */
export declare class GetCredentialSchemaHandler extends BaseCredentialToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing credential type name
     * @returns JSON schema for the requested credential type
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the get_credential_schema tool
 *
 * @returns Tool definition
 */
export declare function getGetCredentialSchemaToolDefinition(): ToolDefinition;
