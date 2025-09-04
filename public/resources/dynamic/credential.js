/**
 * Dynamic Credential Resource Handler
 *
 * This module provides the MCP resource implementation for retrieving
 * detailed credential information by ID.
 *
 * @format
 */
import { formatResourceUri } from "../../utils/resource-formatter.js";
import { McpError, ErrorCode } from "../../errors/index.js";
/**
 * Get credential resource data by ID
 *
 * @param apiService n8n API service
 * @param credentialId Credential ID
 * @returns Formatted credential resource data
 */
export async function getCredentialResource(apiService, credentialId) {
    try {
        // Get the specific credential from the API
        const credential = await apiService.getCredential(credentialId);
        // Format the credential for resource consumption
        const formattedCredential = {
            id: credential.id,
            name: credential.name,
            type: credential.type,
            nodesAccess: credential.nodesAccess || [],
            createdAt: credential.createdAt,
            updatedAt: credential.updatedAt,
            // Note: We don't expose the actual data values for security reasons
            dataStructure: credential.data ? Object.keys(credential.data) : [],
        };
        // Add metadata about the resource
        const result = {
            resourceType: "credential",
            ...formattedCredential,
            _links: {
                self: formatResourceUri("credential", credentialId),
                // Include links to related resources if applicable
            },
            lastUpdated: new Date().toISOString(),
            note: "Credential data values are not exposed for security reasons",
        };
        return JSON.stringify(result, null, 2);
    }
    catch (error) {
        console.error(`Error fetching credential resource (ID: ${credentialId}):`, error);
        // Handle not found errors specifically
        if (error instanceof McpError && error.code === ErrorCode.NotFoundError) {
            throw error;
        }
        throw new McpError(ErrorCode.InternalError, `Failed to retrieve credential (ID: ${credentialId}): ${error instanceof Error ? error.message : "Unknown error"}`);
    }
}
/**
 * Get credential resource template URI
 *
 * @returns Formatted resource template URI
 */
export function getCredentialResourceTemplateUri() {
    return "n8n://credentials/{id}";
}
/**
 * Get credential resource template metadata
 *
 * @returns Resource template metadata object
 */
export function getCredentialResourceTemplateMetadata() {
    return {
        uriTemplate: getCredentialResourceTemplateUri(),
        name: "n8n Credential Details",
        mimeType: "application/json",
        description: "Detailed information about a specific n8n credential including type and access permissions",
    };
}
/**
 * Extract credential ID from resource URI
 *
 * @param uri Resource URI
 * @returns Credential ID or null if URI format is invalid
 */
export function extractCredentialIdFromUri(uri) {
    const match = uri.match(/^n8n:\/\/credentials\/([^/]+)$/);
    return match ? match[1] : null;
}
//# sourceMappingURL=credential.js.map