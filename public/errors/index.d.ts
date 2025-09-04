/**
 * Error Handling Module
 *
 * This module provides custom error classes and error handling utilities
 * for the n8n MCP Server.
 *
 * @format
 */
import { McpError as SdkMcpError } from "@modelcontextprotocol/sdk/types.js";
export { McpError } from "@modelcontextprotocol/sdk/types.js";
export { ErrorCode } from "./error-codes.js";
/**
 * n8n API Error class for handling errors from the n8n API
 */
export declare class N8nApiError extends SdkMcpError {
    constructor(message: string, statusCode?: number, details?: unknown);
}
/**
 * Safely parse JSON response from n8n API
 *
 * @param text Text to parse as JSON
 * @returns Parsed JSON object or null if parsing fails
 */
export declare function safeJsonParse(text: string): any;
/**
 * Handle axios errors and convert them to N8nApiError
 *
 * @param error Error object from axios
 * @param defaultMessage Default error message
 * @returns N8nApiError with appropriate details
 */
export declare function handleAxiosError(error: any, defaultMessage?: string): N8nApiError;
/**
 * Extract a readable error message from an error object
 *
 * @param error Error object
 * @returns Readable error message
 */
export declare function getErrorMessage(error: unknown): string;
