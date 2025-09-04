/**
 * Server Configuration
 *
 * This module configures the MCP server with tools and resources
 * for n8n workflow management.
 *
 * @format
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { getEnvConfig } from "./environment.js";
import { setupWorkflowTools } from "../tools/workflow/index.js";
import { setupExecutionTools } from "../tools/execution/index.js";
import { setupCredentialTools } from "../tools/credential/index.js";
import { setupUserTools } from "../tools/user/index.js";
import { setupResourceHandlers } from "../resources/index.js";
import { createApiService } from "../api/n8n-client.js";
import { trackToolCall, trackEvent, withAnalytics, } from "../analytics/index.js";
/**
 * Configure and return an MCP server instance with all tools and resources
 *
 * @returns Configured MCP server instance
 */
export async function configureServer() {
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
        const timeoutPromise = new Promise((_, reject) => {
            controller.signal.addEventListener("abort", () => reject(new Error(`Connectivity check timed out after ${envConfig.mcpServerTimeout / 2}ms`)));
        });
        await Promise.race([connectivityPromise, timeoutPromise]);
        clearTimeout(timeoutId);
        console.error(`Successfully connected to n8n API at ${envConfig.n8nApiUrl}`);
    }
    catch (error) {
        console.error("ERROR: Failed to connect to n8n API:", error instanceof Error ? error.message : error);
        throw error;
    }
    // Create server instance
    const server = new Server({
        name: "n8n-mcp-server",
        version: "0.1.0",
    }, {
        capabilities: {
            resources: {},
            tools: {},
        },
    });
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
function setupToolListRequestHandler(server) {
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
function setupToolCallRequestHandler(server) {
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const toolName = request.params.name;
        const args = request.params.arguments || {};
        let result;
        console.log(`[MCP Server] Tool call: ${toolName}`);
        try {
            // Handle "prompts/list" as a special case, returning an empty success response
            // This is to address client calls for a method not central to n8n-mcp-server's direct n8n integration.
            if (toolName === "prompts/list") {
                trackEvent("TOOL_CALLED", {
                    tool_name: toolName,
                    handled_special_case: true,
                });
                return {
                    content: [{ type: "text", text: "Prompts list acknowledged." }],
                    isError: false,
                };
            }
            // Import handlers with error handling
            let handlers;
            try {
                const [workflowHandlers, executionHandlers, credentialHandlers, userHandlers,] = await Promise.all([
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
            }
            catch (importError) {
                console.error(`[MCP Server] Failed to import handlers for ${toolName}:`, importError);
                throw new Error(`Handler import failed: ${importError instanceof Error
                    ? importError.message
                    : "Unknown import error"}`);
            }
            // Route the tool call to the appropriate handler with individual error boundaries and analytics
            const handlerResult = await withAnalytics(async () => {
                if (toolName === "n8n-workflow-list") {
                    const handler = new handlers.ListWorkflowsHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-workflow-get") {
                    const handler = new handlers.GetWorkflowHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-workflow-create") {
                    const handler = new handlers.CreateWorkflowHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-workflow-update") {
                    const handler = new handlers.UpdateWorkflowHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-workflow-delete") {
                    const handler = new handlers.DeleteWorkflowHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-workflow-transfer") {
                    const handler = new handlers.TransferWorkflowHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-workflow-activate") {
                    const handler = new handlers.ActivateWorkflowHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-workflow-deactivate") {
                    const handler = new handlers.DeactivateWorkflowHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-workflow-tags-get") {
                    const handler = new handlers.GetWorkflowTagsHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-workflow-tags-update") {
                    const handler = new handlers.UpdateWorkflowTagsHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-executions-list") {
                    const handler = new handlers.ListExecutionsHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-executions-get") {
                    const handler = new handlers.GetExecutionHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-executions-delete") {
                    const handler = new handlers.DeleteExecutionHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "run_webhook") {
                    const handler = new handlers.RunWebhookHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-credentials-create") {
                    const handler = new handlers.CreateCredentialHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-credentials-delete") {
                    const handler = new handlers.DeleteCredentialHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-credentials-schema-get") {
                    const handler = new handlers.GetCredentialSchemaHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n_credential_transfer") {
                    const handler = new handlers.TransferCredentialHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-users-list") {
                    const handler = new handlers.ListUsersHandler();
                    return await handler.execute(args);
                }
                else if (toolName === "n8n-users-invite") {
                    const handler = new handlers.InviteUsersHandler();
                    return await handler.execute(args);
                }
                else {
                    console.error(`[MCP Server] Unknown tool: ${toolName}`);
                    throw new Error(`Unknown tool: ${toolName}`);
                }
            }, (result, duration) => {
                // Success callback - track with precise timing
                trackToolCall(toolName, true, duration);
                console.log(`[MCP Server] Tool executed successfully: ${toolName} (${duration}ms)`);
            }, (error, duration) => {
                // Error callback - re-throw for downstream error handling
                trackToolCall(toolName, false, duration, error instanceof Error ? error.name : "UnknownError");
                console.log(`[MCP Server] Tool execution failed: ${toolName} (${duration}ms)`);
                throw error;
            });
            result = handlerResult;
            // Converting to MCP SDK expected format
            return {
                content: result.content,
                isError: result.isError,
            };
        }
        catch (error) {
            console.error(`[MCP Server] Tool call error for ${toolName}:`, error);
            // Track error analytics
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            const errorType = error instanceof Error ? error.name : "UnknownError";
            const isTimeout = errorMessage.includes("timeout") || errorMessage.includes("408");
            if (isTimeout) {
                trackEvent("API_TIMEOUT", { tool_name: toolName });
            }
            trackToolCall(toolName, false, undefined, errorType);
            return {
                content: [
                    {
                        type: "text",
                        text: `Error executing ${toolName}: ${errorMessage}${isTimeout ? " (timeout)" : ""}`,
                    },
                ],
                isError: true,
            };
        }
    });
}
//# sourceMappingURL=server.js.map