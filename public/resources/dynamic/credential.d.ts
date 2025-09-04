/**
 * Dynamic Credential Resource Handler
 *
 * This module provides the MCP resource implementation for retrieving
 * detailed credential information by ID.
 *
 * @format
 */
import { N8nApiService } from "../../api/n8n-client.js";
/**
 * Get credential resource data by ID
 *
 * @param apiService n8n API service
 * @param credentialId Credential ID
 * @returns Formatted credential resource data
 */
export declare function getCredentialResource(apiService: N8nApiService, credentialId: string): Promise<string>;
/**
 * Get credential resource template URI
 *
 * @returns Formatted resource template URI
 */
export declare function getCredentialResourceTemplateUri(): string;
/**
 * Get credential resource template metadata
 *
 * @returns Resource template metadata object
 */
export declare function getCredentialResourceTemplateMetadata(): Record<string, any>;
/**
 * Extract credential ID from resource URI
 *
 * @param uri Resource URI
 * @returns Credential ID or null if URI format is invalid
 */
export declare function extractCredentialIdFromUri(uri: string): string | null;
