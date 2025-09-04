/**
 * Dynamic Workflow Resource Handler
 *
 * This module provides the MCP resource implementation for retrieving
 * detailed workflow information by ID.
 */
import { N8nApiService } from '../../api/n8n-client.js';
/**
 * Get workflow resource data by ID
 *
 * @param apiService n8n API service
 * @param workflowId Workflow ID
 * @returns Formatted workflow resource data
 */
export declare function getWorkflowResource(apiService: N8nApiService, workflowId: string): Promise<string>;
/**
 * Get workflow resource template URI
 *
 * @returns Formatted resource template URI
 */
export declare function getWorkflowResourceTemplateUri(): string;
/**
 * Get workflow resource template metadata
 *
 * @returns Resource template metadata object
 */
export declare function getWorkflowResourceTemplateMetadata(): Record<string, any>;
/**
 * Extract workflow ID from resource URI
 *
 * @param uri Resource URI
 * @returns Workflow ID or null if URI format is invalid
 */
export declare function extractWorkflowIdFromUri(uri: string): string | null;
