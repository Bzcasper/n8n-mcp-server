/**
 * Analytics Module
 *
 * Provides GDPR-compliant, privacy-focused analytics tracking for n8n MCP server
 * using Vercel Analytics programmatic API.
 *
 * @format
 */
/**
 * GDPR-safe event names (no personal data)
 */
export declare const EVENTS: {
    readonly TOOL_CALLED: "mcp_tool_called";
    readonly TOOL_SUCCESS: "mcp_tool_success";
    readonly TOOL_ERROR: "mcp_tool_error";
    readonly RESOURCE_REQUESTED: "mcp_resource_requested";
    readonly RESOURCE_ERROR: "mcp_resource_error";
    readonly SERVER_START: "mcp_server_start";
    readonly SERVER_ERROR: "mcp_server_error";
    readonly API_TIMEOUT: "mcp_api_timeout";
    readonly WORKFLOW_PATTERN: "mcp_workflow_pattern";
    readonly EXECUTION_PATTERN: "mcp_execution_pattern";
    readonly CREDENTIAL_PATTERN: "mcp_credential_pattern";
};
/**
 * Event properties interface for type safety
 */
export interface EventProperties {
    [key: string]: string | number | boolean | null;
}
/**
 * Core analytics tracking function
 */
export declare function trackEvent(event: keyof typeof EVENTS, properties?: EventProperties): void;
/**
 * Track MCP tool usage with timing
 */
export declare function trackToolCall(toolName: string, success: boolean, duration?: number, errorType?: string): void;
/**
 * Track resource access
 */
export declare function trackResourceAccess(resourceType: string, success: boolean, duration?: number): void;
/**
 * Track server-level events
 */
export declare function trackServerEvent(event: "start" | "error" | "timeout", errorType?: string): void;
/**
 * Track workflow-related patterns (non-specific to user data)
 */
export declare function trackWorkflowPattern(patternType: "create" | "update" | "delete" | "activate" | "deactivate", nodeCount?: number, tagCount?: number): void;
/**
 * Track execution patterns
 */
export declare function trackExecutionPattern(patternType: "list" | "get" | "delete" | "run_webhook", executionCount?: number, statusFilter?: string): void;
/**
 * Track credential patterns
 */
export declare function trackCredentialPattern(patternType: "create" | "delete" | "transfer", credentialType?: string): void;
/**
 * Utility function to measure execution time with automatic tracking
 */
export declare function withAnalytics<T>(operation: () => Promise<T>, successCallback: (result: T, duration: number) => void, errorCallback: (error: unknown, duration: number) => void): Promise<T>;
