/**
 * Delete Credential Tool
 *
 * This tool deletes an existing credential from n8n.
 *
 * @format
 */

import { BaseCredentialToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";
import { N8nApiError } from "../../errors/index.js";

/**
 * Handler for the n8n-credentials-delete tool
 */
export class DeleteCredentialHandler extends BaseCredentialToolHandler {
  /**
   * Execute the tool
   *
   * @param args Tool arguments containing id
   * @returns Deletion confirmation
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async (args) => {
      const { id } = args;

      if (!id) {
        throw new N8nApiError("Missing required parameter: id");
      }

      // Get the credential info first for the confirmation message
      const credential = await this.apiService.getCredential(id);
      const credentialName = credential.name;

      // Delete the credential
      await this.apiService.deleteCredential(id);

      return this.formatSuccess(
        { id },
        `Credential "${credentialName}" (ID: ${id}) has been successfully deleted`
      );
    }, args);
  }
}

/**
 * Get tool definition for the n8n-credentials-delete tool
 *
 * @returns Tool definition
 */
export function getDeleteCredentialToolDefinition(): ToolDefinition {
  return {
    name: "n8n-credentials-delete",
    description:
      "Delete an n8n credential by its ID (you must own the credential)",
    inputSchema: {
      type: "object",
      properties: {
        id: {
          type: "string",
          description: "Credential ID to delete",
        },
      },
      required: ["id"],
    },
  };
}
