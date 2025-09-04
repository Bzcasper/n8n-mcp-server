/**
 * Credential Tools Module
 *
 * This module provides MCP tools for interacting with n8n credentials.
 *
 * @format
 */
import { ToolDefinition } from "../../types/index.js";
import { CreateCredentialHandler } from "./create.js";
import { DeleteCredentialHandler } from "./delete.js";
import { GetCredentialSchemaHandler } from "./schema.js";
import { TransferCredentialHandler } from "./transfer.js";
export { CreateCredentialHandler };
export { DeleteCredentialHandler };
export { GetCredentialSchemaHandler };
export { TransferCredentialHandler };
/**
 * Set up credential management tools
 *
 * @returns Array of credential tool definitions
 */
export declare function setupCredentialTools(): Promise<ToolDefinition[]>;
