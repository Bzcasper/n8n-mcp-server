/**
 * Credential Tools Module
 *
 * This module provides MCP tools for interacting with n8n credentials.
 *
 * @format
 */

import { ToolDefinition } from "../../types/index.js";

// Import tool definitions
import {
  getCreateCredentialToolDefinition,
  CreateCredentialHandler,
} from "./create.js";
import {
  getDeleteCredentialToolDefinition,
  DeleteCredentialHandler,
} from "./delete.js";
import {
  getGetCredentialSchemaToolDefinition,
  GetCredentialSchemaHandler,
} from "./schema.js";
import {
  getTransferCredentialToolDefinition,
  TransferCredentialHandler,
} from "./transfer.js";

// Export handlers
export { CreateCredentialHandler };
export { DeleteCredentialHandler };
export { GetCredentialSchemaHandler };
export { TransferCredentialHandler };

/**
 * Set up credential management tools
 *
 * @returns Array of credential tool definitions
 */
export async function setupCredentialTools(): Promise<ToolDefinition[]> {
  return [
    getCreateCredentialToolDefinition(),
    getDeleteCredentialToolDefinition(),
    getTransferCredentialToolDefinition(),
    getGetCredentialSchemaToolDefinition(),
  ];
}
