/**
 * Static Workflows Resource Handler
 *
 * This module provides the MCP resource implementation for listing all workflows.
 */
import { N8nApiService } from '../../api/n8n-client.js';
/**
 * Get workflows resource data
 *
 * @param apiService n8n API service
 * @returns Formatted workflows resource data
 */
export declare function getWorkflowsResource(apiService: N8nApiService): Promise<string>;
/**
 * Get workflows resource URI
 *
 * @returns Formatted resource URI
 */
export declare function getWorkflowsResourceUri(): string;
/**
 * Get workflows resource metadata
 *
 * @returns Resource metadata object
 */
export declare function getWorkflowsResourceMetadata(): Record<string, any>;
