/**
 * Analytics Module
 *
 * Provides GDPR-compliant, privacy-focused analytics tracking for n8n MCP server
 * using Vercel Analytics programmatic API.
 *
 * @format
 */

import { track } from "@vercel/analytics/server";

// Environment variable to disable analytics (for testing/privacy)
const IS_ANALYTICS_DISABLED = process.env.DISABLE_ANALYTICS === "true";

/**
 * GDPR-safe event names (no personal data)
 */
export const EVENTS = {
  // MCP Operations
  TOOL_CALLED: "mcp_tool_called",
  TOOL_SUCCESS: "mcp_tool_success",
  TOOL_ERROR: "mcp_tool_error",
  RESOURCE_REQUESTED: "mcp_resource_requested",
  RESOURCE_ERROR: "mcp_resource_error",

  // Server Events
  SERVER_START: "mcp_server_start",
  SERVER_ERROR: "mcp_server_error",
  API_TIMEOUT: "mcp_api_timeout",

  // Custom MCP Metrics
  WORKFLOW_PATTERN: "mcp_workflow_pattern",
  EXECUTION_PATTERN: "mcp_execution_pattern",
  CREDENTIAL_PATTERN: "mcp_credential_pattern",
} as const;

/**
 * Event properties interface for type safety
 */
export interface EventProperties {
  [key: string]: string | number | boolean | null;
}

/**
 * Core analytics tracking function
 */
export function trackEvent(
  event: keyof typeof EVENTS,
  properties: EventProperties = {}
): void {
  if (IS_ANALYTICS_DISABLED) {
    return;
  }

  try {
    // Non-blocking analytics call
    track(EVENTS[event], properties);
  } catch (error) {
    // Silently fail analytics to avoid impacting main functionality
    console.warn("Analytics tracking failed:", error);
  }
}

/**
 * Track MCP tool usage with timing
 */
export function trackToolCall(
  toolName: string,
  success: boolean,
  duration?: number,
  errorType?: string
): void {
  const properties: EventProperties = {
    tool_name: toolName,
    success,
    duration_ms: duration || null,
    error_type: errorType || null,
  };

  if (success) {
    trackEvent("TOOL_SUCCESS", properties);
  } else {
    trackEvent("TOOL_ERROR", properties);
  }
}

/**
 * Track resource access
 */
export function trackResourceAccess(
  resourceType: string,
  success: boolean,
  duration?: number
): void {
  trackEvent("RESOURCE_REQUESTED", {
    resource_type: resourceType,
    success,
    duration_ms: duration || null,
  });
}

/**
 * Track server-level events
 */
export function trackServerEvent(
  event: "start" | "error" | "timeout",
  errorType?: string
): void {
  switch (event) {
    case "start":
      trackEvent("SERVER_START");
      break;
    case "error":
      trackEvent("SERVER_ERROR", { error_type: errorType || "unknown" });
      break;
    case "timeout":
      trackEvent("API_TIMEOUT");
      break;
  }
}

/**
 * Track workflow-related patterns (non-specific to user data)
 */
export function trackWorkflowPattern(
  patternType: "create" | "update" | "delete" | "activate" | "deactivate",
  nodeCount?: number,
  tagCount?: number
): void {
  trackEvent("WORKFLOW_PATTERN", {
    pattern_type: patternType,
    node_count: nodeCount || 0,
    tag_count: tagCount || 0,
  });
}

/**
 * Track execution patterns
 */
export function trackExecutionPattern(
  patternType: "list" | "get" | "delete" | "run_webhook",
  executionCount?: number,
  statusFilter?: string
): void {
  trackEvent("EXECUTION_PATTERN", {
    pattern_type: patternType,
    execution_count: executionCount || 0,
    status_filter: statusFilter || null,
  });
}

/**
 * Track credential patterns
 */
export function trackCredentialPattern(
  patternType: "create" | "delete" | "transfer",
  credentialType?: string
): void {
  trackEvent("CREDENTIAL_PATTERN", {
    pattern_type: patternType,
    credential_type: credentialType || null,
  });
}

/**
 * Utility function to measure execution time with automatic tracking
 */
export async function withAnalytics<T>(
  operation: () => Promise<T>,
  successCallback: (result: T, duration: number) => void,
  errorCallback: (error: unknown, duration: number) => void
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = Math.round(performance.now() - startTime);
    successCallback(result, duration);
    return result;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    errorCallback(error, duration);
    throw error; // Re-throw to preserve error handling
  }
}
