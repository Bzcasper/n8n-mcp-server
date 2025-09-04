/**
 * Get Credential Schema Tool
 *
 * This tool retrieves the JSON schema for a specific n8n credential type.
 *
 * @format
 */
import { BaseCredentialToolHandler } from "./base-handler.js";
import { N8nApiError } from "../../errors/index.js";
/**
 * Handler for the get_credential_schema tool
 */
export class GetCredentialSchemaHandler extends BaseCredentialToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing credential type name
     * @returns JSON schema for the requested credential type
     */
    async execute(args) {
        return this.handleExecution(async (args) => {
            const { credentialTypeName } = args;
            if (!credentialTypeName) {
                throw new N8nApiError("Missing required parameter: credentialTypeName");
            }
            if (!credentialTypeName.trim()) {
                throw new N8nApiError("Parameter 'credentialTypeName' cannot be empty");
            }
            // Get the credential schema
            const schema = await this.apiService.getCredentialSchema(credentialTypeName);
            return this.formatSuccess(schema, `Retrieved credential schema for type: ${credentialTypeName}`);
        }, args);
    }
}
/**
 * Get tool definition for the get_credential_schema tool
 *
 * @returns Tool definition
 */
export function getGetCredentialSchemaToolDefinition() {
    return {
        name: "n8n-credentials-schema-get",
        description: "Retrieve the JSON schema for a specific n8n credential type",
        inputSchema: {
            type: "object",
            properties: {
                credentialTypeName: {
                    type: "string",
                    description: "The credential type name (e.g., 'slackOAuth2Api', 'freshdeskApi')",
                },
            },
            required: ["credentialTypeName"],
        },
    };
}
//# sourceMappingURL=schema.js.map