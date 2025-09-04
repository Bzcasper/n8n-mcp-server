/**
 * Transfer Credential Tool
 *
 * This tool transfers an existing credential to a different project.
 *
 * @format
 */
import { BaseCredentialToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the n8n_credential_transfer tool
 */
export declare class TransferCredentialHandler extends BaseCredentialToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing id and destinationProjectId
     * @returns Transfer confirmation
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the n8n_credential_transfer tool
 *
 * @returns Tool definition
 */
export declare function getTransferCredentialToolDefinition(): ToolDefinition;
