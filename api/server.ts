/** @format */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import {
  setupWorkflowTools,
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
} from "../src/tools/workflow/index.js";
import {
  setupExecutionTools,
  ListExecutionsHandler,
  GetExecutionHandler,
  DeleteExecutionHandler,
  RunWebhookHandler,
} from "../src/tools/execution/index.js";
import {
  setupCredentialTools,
  CreateCredentialHandler,
  DeleteCredentialHandler,
  GetCredentialSchemaHandler,
  TransferCredentialHandler,
} from "../src/tools/credential/index.js";
import {
  setupUserTools,
  ListUsersHandler,
  InviteUsersHandler,
} from "../src/tools/user/index.js";

import { createApiService } from "../src/api/n8n-client.js";
import { getEnvConfig } from "../src/config/environment.js";

// Resource imports
import {
  getExecutionStatsResource,
  getExecutionStatsResourceMetadata,
  getExecutionStatsResourceUri,
} from "../src/resources/static/execution-stats.js";
import {
  getWorkflowsResource,
  getWorkflowsResourceMetadata,
  getWorkflowsResourceUri,
} from "../src/resources/static/workflows.js";
import {
  getWorkflowResource,
  getWorkflowResourceTemplateMetadata,
  getWorkflowResourceTemplateUri,
  extractWorkflowIdFromUri,
} from "../src/resources/dynamic/workflow.js";
import {
  getExecutionResource,
  getExecutionResourceTemplateMetadata,
  getExecutionResourceTemplateUri,
  extractExecutionIdFromUri,
} from "../src/resources/dynamic/execution.js";
import {
  getCredentialResource,
  getCredentialResourceTemplateMetadata,
  getCredentialResourceTemplateUri,
  extractCredentialIdFromUri,
} from "../src/resources/dynamic/credential.js";
import { getKVClient } from "../src/redis/client.js";

// Initialize KV client (for caching MCP operations)
getKVClient().then((client) => {
  if (client) {
    console.log("MCP server Redis/KV integration ready");
  } else {
    console.log("MCP server running without caching");
  }
});

const apiService = createApiService(getEnvConfig());

// Load tool definitions dynamically
let toolDefinitions: any[] = [];

async function loadToolDefinitions() {
  if (toolDefinitions.length === 0) {
    const workflowTools = await setupWorkflowTools();
    const executionTools = await setupExecutionTools();
    const credentialTools = await setupCredentialTools();
    const userTools = await setupUserTools();
    toolDefinitions = [
      ...workflowTools,
      ...executionTools,
      ...credentialTools,
      ...userTools,
    ];
  }
  return toolDefinitions;
}

const server = new Server(
  {
    name: "n8n-mcp-server",
    version: "0.1.9",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Resource definitions
const staticResources = [
  getExecutionStatsResourceMetadata(),
  getWorkflowsResourceMetadata(),
];

const dynamicResources = [
  getWorkflowResourceTemplateMetadata(),
  getExecutionResourceTemplateMetadata(),
  getCredentialResourceTemplateMetadata(),
];

// Tool handler map for JSON-RPC requests
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  // Workflow tools
  "n8n-workflow-list": async (args) => {
    const handler = new ListWorkflowsHandler();
    const argsObj: Record<string, any> = {};
    if (args.includeData !== undefined) argsObj.includeData = args.includeData;
    if (args.projectId !== undefined) argsObj.projectId = args.projectId;
    if (args.limit !== undefined) argsObj.limit = args.limit;
    if (args.cursor !== undefined) argsObj.cursor = args.cursor;
    const result = await handler.execute(argsObj);
    return {
      content: result.content.map((item) => ({
        type: "text",
        text: typeof item === "string" ? item : JSON.stringify(item),
      })),
    };
  },

  "n8n-workflow-get": async (args) => {
    const handler = new GetWorkflowHandler();
    const argsObj: any = { id: args.id };
    if (args.includeData !== undefined) argsObj.includeData = args.includeData;
    const result = await handler.execute(argsObj);
    return {
      content: result.content.map((item) => ({
        type: "text",
        text: typeof item === "string" ? item : JSON.stringify(item),
      })),
    };
  },

  "n8n-workflow-create": async (args) => {
    const handler = new CreateWorkflowHandler();
    const argsObj: any = { name: args.name };
    if (args.nodes !== undefined) argsObj.nodes = args.nodes;
    if (args.connections !== undefined) argsObj.connections = args.connections;
    if (args.active !== undefined) argsObj.active = args.active;
    if (args.tags !== undefined) argsObj.tags = args.tags;
    const result = await handler.execute(argsObj);
    return {
      content: result.content.map((item) => ({
        type: "text",
        text: typeof item === "string" ? item : JSON.stringify(item),
      })),
    };
  },

  "n8n-workflow-update": async (args) => {
    const handler = new UpdateWorkflowHandler();
    const argsObj: any = { id: args.id, name: args.name || "" };
    if (args.nodes !== undefined) argsObj.nodes = args.nodes;
    if (args.connections !== undefined) argsObj.connections = args.connections;
    if (args.active !== undefined) argsObj.active = args.active;
    if (args.tags !== undefined) argsObj.tags = args.tags;
    const result = await handler.execute(argsObj);
    return {
      content: result.content.map((item) => ({
        type: "text",
        text: typeof item === "string" ? item : JSON.stringify(item),
      })),
    };
  },

  "n8n-workflow-delete": async (args) => {
    const handler = new DeleteWorkflowHandler();
    const result = await handler.execute({ id: args.id });
    return { content: result.content };
  },

  "n8n-workflow-activate": async (args) => {
    const handler = new ActivateWorkflowHandler();
    const result = await handler.execute({ id: args.id });
    return { content: result.content };
  },

  "n8n-workflow-deactivate": async (args) => {
    const handler = new DeactivateWorkflowHandler();
    const result = await handler.execute({ id: args.id });
    return { content: result.content };
  },

  "n8n-workflow-tags-get": async (args) => {
    const handler = new GetWorkflowTagsHandler();
    const result = await handler.execute({ id: args.id });
    return { content: result.content };
  },

  "n8n-workflow-tags-update": async (args) => {
    const handler = new UpdateWorkflowTagsHandler();
    const result = await handler.execute({ id: args.id, tagIds: args.tagIds });
    return { content: result.content };
  },

  "n8n-workflow-transfer": async (args) => {
    const handler = new TransferWorkflowHandler();
    const result = await handler.execute({
      id: args.id,
      destinationProjectId: args.destinationProjectId,
    });
    return { content: result.content };
  },

  // Execution tools
  "n8n-execution-list": async (args) => {
    const handler = new ListExecutionsHandler();
    const argsObj: any = {};
    if (args.workflowId !== undefined) argsObj.workflowId = args.workflowId;
    if (args.status !== undefined) argsObj.status = args.status;
    if (args.limit !== undefined) argsObj.limit = args.limit;
    if (args.lastId !== undefined) argsObj.lastId = args.lastId;
    if (args.includeSummary !== undefined)
      argsObj.includeSummary = args.includeSummary;
    const result = await handler.execute(argsObj);
    return {
      content: result.content.map((item) => ({
        type: "text",
        text: typeof item === "string" ? item : JSON.stringify(item),
      })),
    };
  },

  "n8n-execution-get": async (args) => {
    const handler = new GetExecutionHandler();
    const result = await handler.execute({ executionId: args.executionId });
    return {
      content: result.content.map((item) => ({
        type: "text",
        text: typeof item === "string" ? item : JSON.stringify(item),
      })),
    };
  },

  "n8n-execution-delete": async (args) => {
    const handler = new DeleteExecutionHandler();
    const result = await handler.execute({ executionId: args.executionId });
    return { content: result.content };
  },

  "n8n-webhook-run": async (args) => {
    const handler = new RunWebhookHandler();
    const argsObj: any = { workflowName: args.workflowName };
    if (args.data !== undefined) argsObj.data = args.data;
    if (args.headers !== undefined) argsObj.headers = args.headers;
    const result = await handler.execute(argsObj);
    return {
      content: result.content.map((item) => ({
        type: "text",
        text: typeof item === "string" ? item : JSON.stringify(item),
      })),
    };
  },

  // Credential tools
  "n8n-credential-create": async (args) => {
    const handler = new CreateCredentialHandler();
    const argsObj: any = { name: args.name, type: args.type };
    if (args.data !== undefined) argsObj.data = args.data;
    const result = await handler.execute(argsObj);
    return {
      content: result.content.map((item) => ({
        type: "text",
        text: typeof item === "string" ? item : JSON.stringify(item),
      })),
    };
  },

  "n8n-credential-delete": async (args) => {
    const handler = new DeleteCredentialHandler();
    const result = await handler.execute({ credentialId: args.credentialId });
    return { content: result.content };
  },

  "n8n-credential-schema-get": async (args) => {
    const handler = new GetCredentialSchemaHandler();
    const result = await handler.execute({ type: args.type });
    return {
      content: result.content.map((item) => ({
        type: "text",
        text: typeof item === "string" ? item : JSON.stringify(item),
      })),
    };
  },

  "n8n-credential-transfer": async (args) => {
    const handler = new TransferCredentialHandler();
    const result = await handler.execute({
      credentialId: args.credentialId,
      destinationProjectId: args.destinationProjectId,
    });
    return { content: result.content };
  },

  // User tools
  "n8n-user-list": async (args) => {
    const handler = new ListUsersHandler();
    const argsObj: any = {};
    if (args.limit !== undefined) argsObj.limit = args.limit;
    if (args.cursor !== undefined) argsObj.cursor = args.cursor;
    const result = await handler.execute(argsObj);
    return {
      content: result.content.map((item) => ({
        type: "text",
        text: typeof item === "string" ? item : JSON.stringify(item),
      })),
    };
  },

  "n8n-user-invite": async (args) => {
    const handler = new InviteUsersHandler();
    const result = await handler.execute({ emails: args.emails.split(",") });
    return {
      content: result.content.map((item) => ({
        type: "text",
        text: typeof item === "string" ? item : JSON.stringify(item),
      })),
    };
  },
};

// Minimum MCP server setup for compatibility
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: await loadToolDefinitions(),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;
  const handler = toolHandlers[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return await handler(args);
});

// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [...staticResources, ...dynamicResources],
}));

// Helper function to read a resource by URI
async function readResourceByUri(uri: string): Promise<string> {
  // Handle static resources
  if (uri === getExecutionStatsResourceUri()) {
    return await getExecutionStatsResource(apiService);
  } else if (uri === getWorkflowsResourceUri()) {
    return await getWorkflowsResource(apiService);
  }

  // Handle dynamic resources
  const workflowId = extractWorkflowIdFromUri(uri);
  if (workflowId) {
    return await getWorkflowResource(apiService, workflowId);
  }

  const executionId = extractExecutionIdFromUri(uri);
  if (executionId) {
    return await getExecutionResource(apiService, executionId);
  }

  const credentialId = extractCredentialIdFromUri(uri);
  if (credentialId) {
    return await getCredentialResource(apiService, credentialId);
  }

  throw new Error(`Unknown resource URI: ${uri}`);
}

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  try {
    const contents = await readResourceByUri(uri);
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: contents,
        },
      ],
    };
  } catch (error: any) {
    throw new Error(`Failed to read resource ${uri}: ${error.message}`);
  }
});

// HTTP handler wrapper for JSON-RPC over HTTP
const handler = async (request: Request): Promise<Response> => {
  try {
    const body = await request.json();

    // Basic JSON-RPC validation
    if (!body.jsonrpc || body.jsonrpc !== "2.0") {
      return Response.json(
        {
          jsonrpc: "2.0",
          error: { code: -32600, message: "Invalid JSON-RPC 2.0 request" },
          id: body.id || null,
        },
        { status: 400 }
      );
    }

    // Route based on method
    const method = body.method;
    const id = body.id;

    try {
      let result;
      if (method === "tools/list") {
        result = { tools: await loadToolDefinitions() };
      } else if (method === "tools/call") {
        const { name, arguments: args = {} } = body.params;
        const toolHandler = toolHandlers[name];
        if (!toolHandler) {
          throw new Error(`Unknown tool: ${name}`);
        }
        result = await toolHandler(args);
      } else if (method === "resources/list") {
        result = { resources: [...staticResources, ...dynamicResources] };
      } else if (method === "resources/read") {
        const { uri } = body.params;
        const contents = await readResourceByUri(uri);
        result = {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: contents,
            },
          ],
        };
      } else {
        return Response.json(
          {
            jsonrpc: "2.0",
            error: { code: -32601, message: "Method not found" },
            id,
          },
          { status: 400 }
        );
      }

      return Response.json({ jsonrpc: "2.0", result, id });
    } catch (error: any) {
      return Response.json(
        {
          jsonrpc: "2.0",
          error: { code: -32602, message: error.message || "Internal error" },
          id,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return Response.json(
      {
        jsonrpc: "2.0",
        error: { code: -32700, message: "Parse error" },
        id: null,
      },
      { status: 400 }
    );
  }
};

export { handler as GET, handler as POST, handler as DELETE };
