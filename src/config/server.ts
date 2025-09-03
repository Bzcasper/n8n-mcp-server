/**
 * Server Configuration
 *
 * This module configures the MCP server with tools and resources
 * for n8n workflow management.
 *
 * @format
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { getEnvConfig } from "./environment.js";
import { setupWorkflowTools } from "../tools/workflow/index.js";
import { setupExecutionTools } from "../tools/execution/index.js";
import { setupCredentialTools } from "../tools/credential/index.js";
import { setupUserTools } from "../tools/user/index.js";
import { setupResourceHandlers } from "../resources/index.js";
import { createApiService } from "../api/n8n-client.js";

// Import types
import { ToolCallResult } from "../types/index.js";

/**
 * Configure and return an MCP server instance with all tools and resources
 *
 * @returns Configured MCP server instance
 */
export async function configureServer(): Promise<Server> {
  // Get validated environment configuration
  const envConfig = getEnvConfig();

  // Create n8n API service
  const apiService = createApiService(envConfig);

  // Verify n8n API connectivity
  try {
    console.error("Verifying n8n API connectivity...");
    await apiService.checkConnectivity();
    console.error(
      `Successfully connected to n8n API at ${envConfig.n8nApiUrl}`
    );
  } catch (error) {
    console.error(
      "ERROR: Failed to connect to n8n API:",
      error instanceof Error ? error.message : error
    );
    throw error;
  }

  // Create server instance
  const server = new Server(
    {
      name: "n8n-mcp-server",
      version: "0.1.0",
    },
    {
      capabilities: {
        resources: {},
        tools: {},
      },
    }
  );

  // Set up all request handlers
  setupToolListRequestHandler(server);
  setupToolCallRequestHandler(server);
  setupResourceHandlers(server, envConfig);

  return server;
}

/**
 * Set up the tool list request handler for the server
 *
 * @param server MCP server instance
 */
function setupToolListRequestHandler(server: Server): void {
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    // Combine tools from workflow, execution, credential, and user modules
    const workflowTools = await setupWorkflowTools();
    const executionTools = await setupExecutionTools();
    const credentialTools = await setupCredentialTools();
    const userTools = await setupUserTools();

    return {
      tools: [
        ...workflowTools,
        ...executionTools,
        ...credentialTools,
        ...userTools,
      ],
    };
  });
}

/**
 * Set up the tool call request handler for the server
 *
 * @param server MCP server instance
 */
function setupToolCallRequestHandler(server: Server): void {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments || {};

    let result: ToolCallResult;

    try {
      // Handle "prompts/list" as a special case, returning an empty success response
      // This is to address client calls for a method not central to n8n-mcp-server's direct n8n integration.
      if (toolName === "prompts/list") {
        return {
          content: [{ type: "text", text: "Prompts list acknowledged." }], // Or an empty array: content: []
          isError: false,
        };
      }

      // Import handlers
      const {
        ListWorkflowsHandler,
        GetWorkflowHandler,
        CreateWorkflowHandler,
        UpdateWorkflowHandler,
        DeleteWorkflowHandler,
        TransferWorkflowHandler,
        ActivateWorkflowHandler,
        DeactivateWorkflowHandler,
        GetWorkflowTagsHandler,
        UpdateWorkflowTagsHandler,
      } = await import("../tools/workflow/index.js");

      const {
        ListExecutionsHandler,
        GetExecutionHandler,
        DeleteExecutionHandler,
        RunWebhookHandler,
      } = await import("../tools/execution/index.js");

      const {
        CreateCredentialHandler,
        DeleteCredentialHandler,
        GetCredentialSchemaHandler,
        TransferCredentialHandler,
      } = await import("../tools/credential/index.js");

      const { ListUsersHandler, InviteUsersHandler } = await import(
        "../tools/user/index.js"
      );

      // Route the tool call to the appropriate handler
      if (toolName === "n8n-workflow-list") {
        const handler = new ListWorkflowsHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-workflow-get") {
        const handler = new GetWorkflowHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-workflow-create") {
        const handler = new CreateWorkflowHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-workflow-update") {
        const handler = new UpdateWorkflowHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-workflow-delete") {
        const handler = new DeleteWorkflowHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-workflow-transfer") {
        const handler = new TransferWorkflowHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-workflow-activate") {
        const handler = new ActivateWorkflowHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-workflow-deactivate") {
        const handler = new DeactivateWorkflowHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-workflow-tags-get") {
        const handler = new GetWorkflowTagsHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-workflow-tags-update") {
        const handler = new UpdateWorkflowTagsHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-executions-list") {
        const handler = new ListExecutionsHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-executions-get") {
        const handler = new GetExecutionHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-executions-delete") {
        const handler = new DeleteExecutionHandler();
        result = await handler.execute(args);
      } else if (toolName === "run_webhook") {
        const handler = new RunWebhookHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-credentials-create") {
        const handler = new CreateCredentialHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-credentials-delete") {
        const handler = new DeleteCredentialHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-credentials-schema-get") {
        const handler = new GetCredentialSchemaHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n_credential_transfer") {
        const handler = new TransferCredentialHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-users-list") {
        const handler = new ListUsersHandler();
        result = await handler.execute(args);
      } else if (toolName === "n8n-users-invite") {
        const handler = new InviteUsersHandler();
        result = await handler.execute(args);
      } else {
        throw new Error(`Unknown tool: ${toolName}`);
      }

      // Converting to MCP SDK expected format
      return {
        content: result.content,
        isError: result.isError,
      };
    } catch (error) {
      console.error(`Error handling tool call to ${toolName}:`, error);
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          },
        ],
        isError: true,
      };
    }
  });
}
