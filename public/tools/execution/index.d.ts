/**
 * Execution Tools Module
 *
 * This module provides MCP tools for interacting with n8n workflow executions.
 */
import { ToolDefinition } from '../../types/index.js';
/**
 * Set up execution management tools
 *
 * @returns Array of execution tool definitions
 */
export declare function setupExecutionTools(): Promise<ToolDefinition[]>;
export { ListExecutionsHandler } from './list.js';
export { GetExecutionHandler } from './get.js';
export { DeleteExecutionHandler } from './delete.js';
export { RunWebhookHandler } from './run.js';
