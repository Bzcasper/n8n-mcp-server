/**
 * Transfer Credential Tool
 *
 * This tool transfers an existing credential to a different project.
 *
 * @format
 */
import { BaseCredentialToolHandler } from "./base-handler.js";
import { N8nApiError } from "../../errors/index.js";
/**
 * Handler for the n8n_credential_transfer tool
 */
export class TransferCredentialHandler extends BaseCredentialToolHandler {
    /**
     * Execute the tool
     *
     * @param args Tool arguments containing id and destinationProjectId
     * @returns Transfer confirmation
     */
    async execute(args) {
        return this.handleExecution(async (args) => {
            const { id, destinationProjectId } = args;
            if (!id) {
                throw new N8nApiError("Missing required parameter: id");
            }
            if (!destinationProjectId) {
                throw new N8nApiError("Missing required parameter: destinationProjectId");
            }
            // Get the credential info first for the confirmation message
            const credential = await this.apiService.getCredential(id);
            const credentialName = credential.name;
            // Transfer the credential
            const transferredCredential = await this.apiService.transferCredential(id, destinationProjectId);
            return this.formatSuccess({ id, destinationProjectId, transferredCredential }, `Credential "${credentialName}" (ID: ${id}) has been successfully transferred to project ${destinationProjectId}`);
        }, args);
    }
}
/**
 * Get tool definition for the n8n_credential_transfer tool
 *
 * @returns Tool definition
 */
export function getTransferCredentialToolDefinition() {
    return {
        name: "n8n_credential_transfer",
        description: "Transfer an n8n credential to a different project (you must own the credential)",
        inputSchema: {
            type: "object",
            properties: {
                id: {
                    type: "string",
                    description: "Credential ID to transfer",
                },
                destinationProjectId: {
                    type: "string",
                    description: "Target project ID",
                },
            },
            required: ["id", "destinationProjectId"],
        },
    };
}
//# sourceMappingURL=transfer.js.map