/**
 * Base Execution Tool Handler
 *
 * This module provides a base handler for execution-related tools.
 */
import { N8nApiError } from '../../errors/index.js';
import { createApiService } from '../../api/n8n-client.js';
import { getEnvConfig } from '../../config/environment.js';
/**
 * Base class for execution tool handlers
 */
export class BaseExecutionToolHandler {
    constructor() {
        this.apiService = createApiService(getEnvConfig());
    }
    /**
     * Format a successful response
     *
     * @param data Response data
     * @param message Optional success message
     * @returns Formatted success response
     */
    formatSuccess(data, message) {
        const formattedData = typeof data === 'object'
            ? JSON.stringify(data, null, 2)
            : String(data);
        return {
            content: [
                {
                    type: 'text',
                    text: message ? `${message}\n\n${formattedData}` : formattedData,
                },
            ],
        };
    }
    /**
     * Format an error response
     *
     * @param error Error object or message
     * @returns Formatted error response
     */
    formatError(error) {
        const errorMessage = error instanceof Error ? error.message : error;
        return {
            content: [
                {
                    type: 'text',
                    text: errorMessage,
                },
            ],
            isError: true,
        };
    }
    /**
     * Handle tool execution errors
     *
     * @param handler Function to execute
     * @param args Arguments to pass to the handler
     * @returns Tool call result
     */
    async handleExecution(handler, args) {
        try {
            return await handler(args);
        }
        catch (error) {
            if (error instanceof N8nApiError) {
                return this.formatError(error.message);
            }
            const errorMessage = error instanceof Error
                ? error.message
                : 'Unknown error occurred';
            return this.formatError(`Error executing execution tool: ${errorMessage}`);
        }
    }
}
//# sourceMappingURL=base-handler.js.map