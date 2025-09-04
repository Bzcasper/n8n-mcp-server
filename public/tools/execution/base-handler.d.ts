/**
 * Base Execution Tool Handler
 *
 * This module provides a base handler for execution-related tools.
 */
import { ToolCallResult } from '../../types/index.js';
/**
 * Base class for execution tool handlers
 */
export declare abstract class BaseExecutionToolHandler {
    protected apiService: import("../../api/n8n-client.js").N8nApiService;
    /**
     * Validate and execute the tool
     *
     * @param args Arguments passed to the tool
     * @returns Tool call result
     */
    abstract execute(args: Record<string, any>): Promise<ToolCallResult>;
    /**
     * Format a successful response
     *
     * @param data Response data
     * @param message Optional success message
     * @returns Formatted success response
     */
    protected formatSuccess(data: any, message?: string): ToolCallResult;
    /**
     * Format an error response
     *
     * @param error Error object or message
     * @returns Formatted error response
     */
    protected formatError(error: Error | string): ToolCallResult;
    /**
     * Handle tool execution errors
     *
     * @param handler Function to execute
     * @param args Arguments to pass to the handler
     * @returns Tool call result
     */
    protected handleExecution(handler: (args: Record<string, any>) => Promise<ToolCallResult>, args: Record<string, any>): Promise<ToolCallResult>;
}
