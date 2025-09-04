/**
 * Static Execution Statistics Resource Handler
 *
 * This module provides the MCP resource implementation for execution statistics.
 */
import { N8nApiService } from '../../api/n8n-client.js';
/**
 * Get execution statistics resource data
 *
 * @param apiService n8n API service
 * @returns Formatted execution statistics resource data
 */
export declare function getExecutionStatsResource(apiService: N8nApiService): Promise<string>;
/**
 * Get execution statistics resource URI
 *
 * @returns Formatted resource URI
 */
export declare function getExecutionStatsResourceUri(): string;
/**
 * Get execution statistics resource metadata
 *
 * @returns Resource metadata object
 */
export declare function getExecutionStatsResourceMetadata(): Record<string, any>;
