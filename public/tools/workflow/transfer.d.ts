/**
 * Transfer Workflow Tool
 *
 * This tool transfers a workflow to a different project in n8n.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for the transfer_workflow tool
 */
export declare class TransferWorkflowHandler extends BaseWorkflowToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing workflow ID and destination project
     * @returns Transferred workflow information
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for the transfer_workflow tool
 *
 * @returns Tool definition
 */
export declare function getTransferWorkflowToolDefinition(): ToolDefinition;
