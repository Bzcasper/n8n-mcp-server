/**
 * User Tools Module
 *
 * This module provides MCP tools for interacting with n8n users.
 *
 * @format
 */
import { ToolDefinition } from "../../types/index.js";
import { ListUsersHandler } from "./list.js";
import { InviteUsersHandler } from "./invite.js";
export { ListUsersHandler, InviteUsersHandler };
/**
 * Set up user management tools
 *
 * @returns Array of user tool definitions
 */
export declare function setupUserTools(): Promise<ToolDefinition[]>;
