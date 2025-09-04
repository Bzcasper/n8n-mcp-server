/**
 * Dynamic Execution Resource Handler
 *
 * This module provides the MCP resource implementation for retrieving
 * detailed execution information by ID.
 */
import { N8nApiService } from '../../api/n8n-client.js';
/**
 * Get execution resource data by ID
 *
 * @param apiService n8n API service
 * @param executionId Execution ID
 * @returns Formatted execution resource data
 */
export declare function getExecutionResource(apiService: N8nApiService, executionId: string): Promise<string>;
/**
 * Get execution resource template URI
 *
 * @returns Formatted resource template URI
 */
export declare function getExecutionResourceTemplateUri(): string;
/**
 * Get execution resource template metadata
 *
 * @returns Resource template metadata object
 */
export declare function getExecutionResourceTemplateMetadata(): Record<string, any>;
/**
 * Extract execution ID from resource URI
 *
 * @param uri Resource URI
 * @returns Execution ID or null if URI format is invalid
 */
export declare function extractExecutionIdFromUri(uri: string): string | null;
