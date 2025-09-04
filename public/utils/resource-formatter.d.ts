/**
 * Resource Formatter Utilities
 *
 * This module provides utility functions for formatting resource data
 * in a consistent, user-friendly manner for MCP resources.
 *
 * @format
 */
import { Workflow, Execution } from "../types/index.js";
/**
 * Format workflow summary for static resource listing
 *
 * @param workflow Workflow object
 * @returns Formatted workflow summary
 */
export declare function formatWorkflowSummary(workflow: Workflow): Record<string, any>;
/**
 * Format detailed workflow information for dynamic resources
 *
 * @param workflow Workflow object
 * @returns Formatted workflow details
 */
export declare function formatWorkflowDetails(workflow: Workflow): Record<string, any>;
/**
 * Format execution statistics summary
 *
 * @param executions Array of execution objects
 * @returns Formatted execution statistics
 */
export declare function formatExecutionStats(executions: Execution[]): Record<string, any>;
/**
 * Format resource URI for n8n resources
 *
 * @param resourceType Type of resource (workflow, execution, or credential)
 * @param id Optional resource ID for specific resources
 * @returns Formatted resource URI
 */
export declare function formatResourceUri(resourceType: "workflow" | "execution" | "workflows" | "execution-stats" | "credential", id?: string): string;
