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

  // Verify n8n API connectivity with timeout handling
  try {
    console.error("Verifying n8n API connectivity...");

    // Create AbortController for connectivity check timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, envConfig.mcpServerTimeout / 2); // Use half of server timeout for connectivity check

    // Add abort signal to promise
    const connectivityPromise = apiService.checkConnectivity();
    const timeoutPromise = new Promise<never>((_, reject) => {
      controller.signal.addEventListener("abort", () =>
        reject(
          new Error(
            `Connectivity check timed out after ${
              envConfig.mcpServerTimeout / 2
            }ms`
          )
        )
      );
    });

    await Promise.race([connectivityPromise, timeoutPromise]);
    clearTimeout(timeoutId);

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

    console.log(`[MCP Server] Tool call: ${toolName}`);

    try {
      // Handle "prompts/list" as a special case, returning an empty success response
      // This is to address client calls for a method not central to n8n-mcp-server's direct n8n integration.
      if (toolName === "prompts/list") {
        return {
          content: [{ type: "text", text: "Prompts list acknowledged." }],
          isError: false,
        };
      }

      // Import handlers with error handling
      let handlers;
      try {
        const [
          workflowHandlers,
          executionHandlers,
          credentialHandlers,
          userHandlers,
        ] = await Promise.all([
          import("../tools/workflow/index.js"),
          import("../tools/execution/index.js"),
          import("../tools/credential/index.js"),
          import("../tools/user/index.js"),
        ]);

        handlers = {
          ...workflowHandlers,
          ...executionHandlers,
          ...credentialHandlers,
          ...userHandlers,
        };
      } catch (importError) {
        console.error(
          `[MCP Server] Failed to import handlers for ${toolName}:`,
          importError
        );
        throw new Error(
          `Handler import failed: ${
            importError instanceof Error
              ? importError.message
              : "Unknown import error"
          }`
        );
      }

      // Route the tool call to the appropriate handler with individual error boundaries
      try {
        if (toolName === "n8n-workflow-list") {
          const handler = new handlers.ListWorkflowsHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-workflow-get") {
          const handler = new handlers.GetWorkflowHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-workflow-create") {
          const handler = new handlers.CreateWorkflowHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-workflow-update") {
          const handler = new handlers.UpdateWorkflowHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-workflow-delete") {
          const handler = new handlers.DeleteWorkflowHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-workflow-transfer") {
          const handler = new handlers.TransferWorkflowHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-workflow-activate") {
          const handler = new handlers.ActivateWorkflowHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-workflow-deactivate") {
          const handler = new handlers.DeactivateWorkflowHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-workflow-tags-get") {
          const handler = new handlers.GetWorkflowTagsHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-workflow-tags-update") {
          const handler = new handlers.UpdateWorkflowTagsHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-executions-list") {
          const handler = new handlers.ListExecutionsHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-executions-get") {
          const handler = new handlers.GetExecutionHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-executions-delete") {
          const handler = new handlers.DeleteExecutionHandler();
          result = await handler.execute(args);
        } else if (toolName === "run_webhook") {
          const handler = new handlers.RunWebhookHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-credentials-create") {
          const handler = new handlers.CreateCredentialHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-credentials-delete") {
          const handler = new handlers.DeleteCredentialHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-credentials-schema-get") {
          const handler = new handlers.GetCredentialSchemaHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n_credential_transfer") {
          const handler = new handlers.TransferCredentialHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-users-list") {
          const handler = new handlers.ListUsersHandler();
          result = await handler.execute(args);
        } else if (toolName === "n8n-users-invite") {
          const handler = new handlers.InviteUsersHandler();
          result = await handler.execute(args);
        } else {
          console.error(`[MCP Server] Unknown tool: ${toolName}`);
          throw new Error(`Unknown tool: ${toolName}`);
        }
      } catch (handlerError) {
        console.error(
          `[MCP Server] Handler execution error for ${toolName}:`,
          handlerError
        );

        // Re-throw with structured error info
        if (handlerError instanceof Error) {
          throw handlerError;
        } else {
          throw new Error(`Handler failed: ${String(handlerError)}`);
        }
      }

      // Converting to MCP SDK expected format
      return {
        content: result.content,
        isError: result.isError,
      };
    } catch (error) {
      console.error(`[MCP Server] Tool call error for ${toolName}:`, error);

      // Provide structured error response
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const isTimeout =
        errorMessage.includes("timeout") || errorMessage.includes("408");

      return {
        content: [
          {
            type: "text",
            text: `Error executing ${toolName}: ${errorMessage}${
              isTimeout ? " (timeout)" : ""
            }`,
          },
        ],
        isError: true,
      };
    }
  });
}
