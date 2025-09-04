/**
 * Workflow Scheduling and Batching Tools
 *
 * This module provides tools for workflow scheduling, batching, and automation.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for workflow scheduling and batching operations
 */
export declare class SchedulingWorkflowHandler extends BaseWorkflowToolHandler {
    /**
     * Create a scheduled batch workflow
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Handler for workflow monitoring and analytics
 */
export declare class MonitoringWorkflowHandler extends BaseWorkflowToolHandler {
    /**
     * Create a monitoring and analytics workflow
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for scheduled workflow creation
 */
export declare function getCreateScheduledWorkflowToolDefinition(): ToolDefinition;
/**
 * Get tool definition for monitoring workflow creation
 */
export declare function getCreateMonitoringWorkflowToolDefinition(): ToolDefinition;
