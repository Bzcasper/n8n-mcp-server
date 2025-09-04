/**
 * AI/ML Workflow Tools
 *
 * This module provides tools for AI/ML workflow operations in n8n.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
/**
 * Handler for AI/ML workflow operations
 */
export declare class AIMLWorkflowHandler extends BaseWorkflowToolHandler {
    /**
     * Create a batch ML training workflow
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Create a data processing and transformation workflow
 */
export declare class DataProcessingHandler extends BaseWorkflowToolHandler {
    /**
     * Create a data transformation pipeline workflow
     */
    execute(args: Record<string, any>): Promise<ToolCallResult>;
}
/**
 * Get tool definition for AI/ML workflow creation
 */
export declare function getCreateAIMLWorkflowToolDefinition(): ToolDefinition;
/**
 * Get tool definition for data processing workflow creation
 */
export declare function getCreateDataProcessingWorkflowToolDefinition(): ToolDefinition;
