/**
 * Create Credential Tool
 *
 * This tool creates a new credential in n8n.
 *
 * @format
 */
import { BaseCredentialToolHandler } from "./base-handler.js";
import { N8nApiError } from "../../errors/index.js";
/**
 * Handler for the create_credential tool
 */
export class CreateCredentialHandler extends BaseCredentialToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing credential details
     * @returns Created credential information
     */
    async execute(args) {
        return this.handleExecution(async (args) => {
            const { name, type, data, nodesAccess } = args;
            if (!name) {
                throw new N8nApiError("Missing required parameter: name");
            }
            if (!type) {
                throw new N8nApiError("Missing required parameter: type");
            }
            if (!data) {
                throw new N8nApiError("Missing required parameter: data");
            }
            // Validate data parameter - should be object
            if (typeof data !== "object") {
                throw new N8nApiError('Parameter "data" must be an object');
            }
            // Prepare credential object
            const credentialData = {
                name,
                type,
                data,
            };
            // Add optional fields if provided
            if (nodesAccess !== undefined)
                credentialData.nodesAccess = nodesAccess;
            // Create the credential
            const credential = await this.apiService.createCredential(credentialData);
            return this.formatSuccess({
                id: credential.id,
                name: credential.name,
                type: credential.type,
            }, `Credential created successfully`);
        }, args);
    }
}
/**
 * Get tool definition for the create_credential tool
 *
 * @returns Tool definition
 */
export function getCreateCredentialToolDefinition() {
    return {
        name: "n8n-credentials-create",
        description: "Create a new n8n credential with the specified configuration",
        inputSchema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Name of the credential",
                },
                type: {
                    type: "string",
                    description: "Type of the credential (e.g., 'slackOAuth2Api', 'freshdeskApi')",
                },
                data: {
                    type: "object",
                    description: "Credential data object containing authentication parameters",
                    additionalProperties: true,
                },
                nodesAccess: {
                    type: "array",
                    description: "Array of node types that can use this credential",
                    items: {
                        type: "object",
                    },
                },
            },
            required: ["name", "type", "data"],
        },
    };
}
//# sourceMappingURL=create.js.map