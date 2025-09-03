/**
 * User Tools Module
 *
 * This module provides MCP tools for interacting with n8n users.
 *
 * @format
 */

import { ToolDefinition } from "../../types/index.js";

// Import tool definitions
import { getListUsersToolDefinition, ListUsersHandler } from "./list.js";
import { getInviteUsersToolDefinition, InviteUsersHandler } from "./invite.js";

// Export handlers
export { ListUsersHandler, InviteUsersHandler };

/**
 * Set up user management tools
 *
 * @returns Array of user tool definitions
 */
export async function setupUserTools(): Promise<ToolDefinition[]> {
  return [getListUsersToolDefinition(), getInviteUsersToolDefinition()];
}
