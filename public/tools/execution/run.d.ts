/**
 * Run Execution via Webhook Tool Handler
 *
 * This module provides a tool for running n8n workflows via webhooks.
 *
 * @format
 */
import { z } from "zod";
import { ToolCallResult } from "../../types/index.js";
import { BaseExecutionToolHandler } from "./base-handler.js";
/**
 * Handler for the run_webhook tool
 */
export declare class RunWebhookHandler extends BaseExecutionToolHandler {
    /**
     * Tool definition for execution via webhook
     */
    static readonly inputSchema: z.ZodObject<{
        workflowName: z.ZodString;
        data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        headers: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    }, "strip", z.ZodTypeAny, {
        workflowName: string;
        data?: Record<string, any> | undefined;
        headers?: Record<string, string> | undefined;
    }, {
        workflowName: string;
        data?: Record<string, any> | undefined;
        headers?: Record<string, string> | undefined;
    }>;
    /**
     * Extract N8N base URL from N8N API URL or use explicit webhook base URL
     * @returns N8N base URL
     */
    private getN8nBaseUrl;
    /**
     * Validate and execute webhook call
     *
     * @param args Tool arguments
     * @returns Tool call result
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get the tool definition for run_webhook
 *
 * @returns Tool definition object
 */
export declare function getRunWebhookToolDefinition(): {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            workflowName: {
                type: string;
                description: string;
            };
            data: {
                type: string;
                description: string;
            };
            headers: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
