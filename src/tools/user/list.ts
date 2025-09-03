/**
 * List Users Tool
 *
 * This tool retrieves a list of users from n8n.
 *
 * @format
 */

import { BaseUserToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";

/**
 * Handler for the list_users tool
 */
export class ListUsersHandler extends BaseUserToolHandler {
  /**
   * Execute the tool
   *
   * @param args Tool arguments
   * @returns List of users
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async () => {
      const { limit, cursor, includeRole } = args;

      const params: Record<string, any> = {};
      if (limit !== undefined) params.limit = limit;
      if (cursor !== undefined) params.cursor = cursor;
      if (includeRole !== undefined) params.includeRole = includeRole;

      const users = await this.apiService.getUsers(params);

      // Format the users for display
      const formattedUsers = users.map((user: any) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isOwner: user.isOwner,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return this.formatSuccess(
        formattedUsers,
        `Found ${formattedUsers.length} user(s)`
      );
    }, args);
  }
}

/**
 * Get tool definition for the n8n-users-list tool
 *
 * @returns Tool definition
 */
export function getListUsersToolDefinition(): ToolDefinition {
  return {
    name: "n8n-users-list",
    description:
      "Retrieve a list of n8n users with optional filtering and pagination",
    inputSchema: {
      type: "object",
      properties: {
        limit: {
          type: "integer",
          description: "Maximum number of users to return",
        },
        cursor: {
          type: "string",
          description: "Cursor for pagination",
        },
        includeRole: {
          type: "boolean",
          description: "Include role information in response",
        },
      },
      required: [],
    },
  };
}
