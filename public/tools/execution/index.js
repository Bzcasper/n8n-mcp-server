/**
 * Execution Tools Module
 *
 * This module provides MCP tools for interacting with n8n workflow executions.
 */
import { getListExecutionsToolDefinition } from './list.js';
import { getGetExecutionToolDefinition } from './get.js';
import { getDeleteExecutionToolDefinition } from './delete.js';
import { getRunWebhookToolDefinition } from './run.js';
/**
 * Set up execution management tools
 *
 * @returns Array of execution tool definitions
 */
export async function setupExecutionTools() {
    return [
        getListExecutionsToolDefinition(),
        getGetExecutionToolDefinition(),
        getDeleteExecutionToolDefinition(),
        getRunWebhookToolDefinition()
    ];
}
// Export execution tool handlers for use in the handler
export { ListExecutionsHandler } from './list.js';
export { GetExecutionHandler } from './get.js';
export { DeleteExecutionHandler } from './delete.js';
export { RunWebhookHandler } from './run.js';
//# sourceMappingURL=index.js.map