/**
 * Invite Users Tool
 *
 * This tool invites new users to n8n instance with optional role assignment.
 *
 * @format
 */

import { BaseUserToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Handler for the n8n-users-invite tool
 */
export class InviteUsersHandler extends BaseUserToolHandler {
  /**
   * Execute the tool
   *
   * @param args Tool arguments
   * @returns User invitation result
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async () => {
      const { email, role } = args;

      // Validate required email parameter
      if (!email) {
        throw new Error("Email parameter is required for user invitation");
      }

      // Validate email format
      if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
        throw new Error("Invalid email format provided");
      }

      // Prepare user invitation data
      const userInvitation = {
        email: email.toLowerCase().trim(), // Normalize email
        ...(role && { role }),
      };

      // Send invitation request (API expects array of users)
      const invitedUsers = await this.apiService.createUsers([userInvitation]);

      // Format the response for better readability
      const formattedUsers = invitedUsers.map((user: any) => ({
        id: user.id || null,
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.role || null,
        isInvited: user.isInvited || true,
        isPending: user.isPending || true,
      }));

      const successMessage = role
        ? `Successfully invited user ${email} with role ${role}`
        : `Successfully invited user ${email}`;

      return this.formatSuccess(formattedUsers, successMessage);
    }, args);
  }
}

/**
 * Get tool definition for the n8n-users-invite tool
 *
 * @returns Tool definition
 */
export function getInviteUsersToolDefinition(): ToolDefinition {
  return {
    name: "n8n-users-invite",
    description:
      "Invite new users to n8n instance with optional role assignment",
    inputSchema: {
      type: "object",
      properties: {
        email: {
          type: "string",
          description: "Email address of the user to invite (required)",
        },
        role: {
          type: "string",
          description: "Optional role to assign to the invited user",
        },
      },
      required: ["email"],
    },
  };
}
