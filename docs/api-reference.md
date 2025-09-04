---
title: "API Reference for n8n MCP Server"
description: "Complete API reference documentation including all tools, resources, methods, parameters, response formats, and examples for n8n MCP Server integration."
keywords:
  - "API reference"
  - "n8n MCP tools"
  - "API documentation"
  - "tool specifications"
  - "workflow integration"
  - "MCP protocol"
last_updated: "2024-09-04"
difficulty: "Intermediate"
time_to_read: "20 minutes"
seo:
  meta_title: "API Reference | n8n MCP Server Developer Guide"
  meta_description: "Complete API reference for n8n MCP Server - comprehensive guide to all tools, methods, parameters, and integration patterns."
  og_type: "article"
  og_image: "/docs/images/api-reference.png"
  twitter_card: "summary_large_image"
  structured_data_type: "TechArticle"
---

<!-- @format -->

# 📖 API Reference

Complete technical documentation for n8n MCP Server APIs, including all tools, resources, methods, and integration patterns.

## 🏗️ Core API Architecture

### Base URL Structure

```
Production: https://your-domain.com/api/v1
Development: http://localhost:8000/api/v1
```

### Authentication

```typescript
// All API requests require proper headers
headers: {
  'Authorization': 'Bearer your-n8n-api-key',
  'Content-Type': 'application/json',
  'X-MCP-Version': '1.0.0'
}
```

### Response Format

```typescript
interface MCPResponse<T = any> {
  jsonrpc: "2.0";
  id: number | string | null;
  result?: {
    content: Array<{
      type: "text" | "json" | "error";
      text?: string;
      json?: T;
      error?: MCPError;
    }>;
    isError: boolean;
  };
  error?: MCPError;
}

interface MCPError {
  code: number;
  message: string;
  data?: any;
}
```

## 🔧 Available Tools

### Workflow Management Tools

#### `n8n-workflow-create`

Creates a new n8n workflow with specified configuration.

**Endpoint:** `POST /tools/workflow/create`

**Parameters:**

```typescript
interface CreateWorkflowParams {
  name: string; // Required: Workflow name
  nodes?: NodeSpecification[]; // Optional: Workflow nodes
  connections?: ConnectionMap; // Optional: Node connections
  active?: boolean; // Optional: Activate on creation (default: false)
  tags?: string[]; // Optional: Workflow tags
  settings?: WorkflowSettings; // Optional: Advanced settings
}

interface NodeSpecification {
  id: string;
  name: string;
  type: string;
  position: [number, number];
  parameters: Record<string, any>;
}
```

**Response:**

```typescript
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "json",
      "json": {
        "id": "workflow_12345",
        "name": "New Workflow",
        "active": true,
        "created": "2024-09-04T10:30:00Z",
        "updated": "2024-09-04T10:30:00Z"
      }
    }]
  }
}
```

**Usage Example:**

```typescript
// Create a basic data processing workflow
await callTool({
  name: "n8n-workflow-create",
  arguments: {
    name: "Data Processing Pipeline",
    nodes: [
      {
        id: "webhook",
        name: "Webhook",
        type: "n8n-nodes-base.webhook",
        position: [100, 100],
        parameters: {
          httpMethod: "POST",
          path: "data-input",
        },
      },
      {
        id: "transform",
        name: "Transform Data",
        type: "n8n-nodes-base.set",
        position: [400, 100],
        parameters: {
          values: {
            string: [
              {
                name: "processed_at",
                value: "={{ new Date().toISOString() }}",
              },
            ],
          },
        },
      },
    ],
    connections: {
      main: [
        {
          node: "webhook",
          type: "main",
          index: 0,
        },
        {
          node: "transform",
          type: "main",
          index: 0,
        },
      ],
    },
    tags: ["data-processing", "automation"],
  },
});
```

#### `n8n-workflow-list`

Retrieves a list of workflows with optional filtering.

**Endpoint:** `POST /tools/workflow/list`

**Parameters:**

```typescript
interface ListWorkflowsParams {
  active?: boolean; // Optional: Filter by active status
  tags?: string[]; // Optional: Filter by tags
  limit?: number; // Optional: Max results (default: 50)
  offset?: number; // Optional: Pagination offset
  search?: string; // Optional: Search by name
  sortBy?: "name" | "created" | "updated";
  sortOrder?: "asc" | "desc";
}
```

**Response:**

```typescript
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{
      "type": "json",
      "json": {
        "total": 25,
        "workflows": [
          {
            "id": "wf_123456",
            "name": "Customer Onboarding",
            "active": true,
            "tags": ["crm", "automation"],
            "created": "2024-08-15T09:00:00Z",
            "updated": "2024-09-01T14:30:00Z"
          }
        ]
      }
    }]
  }
}
```

#### `n8n-workflow-get`

Retrieves detailed information about a specific workflow.

**Endpoint:** `POST /tools/workflow/get`

**Parameters:**

```typescript
interface GetWorkflowParams {
  id: string; // Required: Workflow ID
  includeNodes?: boolean; // Optional: Include node details
  includeConnections?: boolean; // Optional: Include connection details
  includeExecutions?: boolean; // Optional: Include recent executions
  executionLimit?: number; // Optional: Max executions to include
}
```

**Response:**

```typescript
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{
      "type": "json",
      "json": {
        "workflow": {
          "id": "wf_123456",
          "name": "Customer Onboarding",
          "active": true,
          "nodes": [...],         // Full node specifications
          "connections": {...},   // Complete connection map
          "settings": {...},      // Workflow settings
          "tags": [...],
          "created": "2024-08-15T09:00:00Z",
          "updated": "2024-09-01T14:30:00Z",
          "executions": [...]     // If requested
        }
      }
    }]
  }
}
```

#### `n8n-workflow-update`

Updates an existing workflow's configuration.

**Endpoint:** `POST /tools/workflow/update`

**Parameters:**

```typescript
interface UpdateWorkflowParams {
  id: string; // Required: Workflow ID
  name?: string; // Optional: New name
  nodes?: Partial<NodeSpecification>[]; // Optional: Updated nodes
  connections?: Partial<ConnectionMap>; // Optional: Updated connections
  active?: boolean; // Optional: Enable/disable
  tags?: string[]; // Optional: New tags
  settings?: Partial<WorkflowSettings>; // Optional: Updated settings
}
```

#### `n8n-workflow-delete`

Deletes a workflow with safety checks.

**Endpoint:** `POST /tools/workflow/delete`

**Parameters:**

```typescript
interface DeleteWorkflowParams {
  id: string; // Required: Workflow ID
  force?: boolean; // Optional: Skip deletion warnings
  backup?: boolean; // Optional: Create backup before deletion
}
```

#### `n8n-workflow-activate`

Activates a workflow for execution.

**Endpoint:** `POST /tools/workflow/activate`

**Parameters:**

```typescript
interface ActivateWorkflowParams {
  id: string; // Required: Workflow ID
  waitForReady?: boolean; // Optional: Wait for workflow to be ready
  timeout?: number; // Optional: Activation timeout (ms)
}
```

## 🚀 Execution Management Tools

#### `n8n-execution-run`

Executes a workflow immediately via API.

**Endpoint:** `POST /tools/execution/run`

**Parameters:**

```typescript
interface RunExecutionParams {
  workflowId: string; // Required: Workflow ID
  data?: Record<string, any>; // Optional: Input data
  version?: number; // Optional: Workflow version to run
  environment?: string; // Optional: Execution environment
  priority?: "low" | "normal" | "high";
  timeout?: number; // Optional: Execution timeout (seconds)
}
```

**Response:**

```typescript
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [{
      "type": "json",
      "json": {
        "executionId": "exec_789012",
        "status": "running",
        "startedAt": "2024-09-04T10:35:00Z",
        "estimatedCompletion": "2024-09-04T10:40:00Z"
      }
    }]
  }
}
```

#### `n8n-execution-run-webhook`

Triggers workflow execution via webhook endpoint.

**Endpoint:** `POST /tools/execution/run-webhook`

**Parameters:**

```typescript
interface RunWebhookParams {
  workflowName: string; // Required: Workflow webhook name
  data: Record<string, any>; // Required: Payload data
  headers?: Record<string, string>; // Optional: Custom headers
  method?: "GET" | "POST" | "PUT"; // Optional: HTTP method
  authentication?: {
    // Optional: Custom auth
    username: string;
    password: string;
  };
}
```

#### `n8n-execution-get`

Retrieves status and results of a specific execution.

**Endpoint:** `POST /tools/execution/get`

**Parameters:**

```typescript
interface GetExecutionParams {
  id: string; // Required: Execution ID
  includeNodeResults?: boolean; // Optional: Include individual node outputs
  includeLogs?: boolean; // Optional: Include execution logs
  maxLogs?: number; // Optional: Maximum log entries
}
```

**Response:**

```typescript
{
  "jsonrpc": "2.0",
  "id": 5,
  "result": {
    "content": [{
      "type": "json",
      "json": {
        "execution": {
          "id": "exec_789012",
          "workflowId": "wf_123456",
          "status": "success",
          "startedAt": "2024-09-04T10:35:00Z",
          "finishedAt": "2024-09-04T10:37:15Z",
          "duration": 135,           // seconds
          "nodeResults": {...},      // Detailed node outputs (if requested)
          "logs": [...],             // Execution logs (if requested)
          "error": null              // Error details if failed
        }
      }
    }]
  }
}
```

#### `n8n-execution-list`

Lists workflow executions with advanced filtering.

**Endpoint:** `POST /tools/execution/list`

**Parameters:**

```typescript
interface ListExecutionsParams {
  workflowId?: string; // Optional: Filter by workflow
  status?: "running" | "success" | "error" | "waiting" | "canceled";
  startDate?: string; // Optional: Filter by date range
  endDate?: string;
  limit?: number; // Optional: Max results (default: 20)
  offset?: number; // Optional: Pagination offset
  includeDetails?: boolean; // Optional: Include full execution data
}
```

#### `n8n-execution-stop`

Stops a running workflow execution.

**Endpoint:** `POST /tools/execution/stop`

**Parameters:**

```typescript
interface StopExecutionParams {
  id: string; // Required: Execution ID
  reason?: string; // Optional: Stop reason
  timeout?: number; // Optional: Grace period before force stop
  cleanup?: boolean; // Optional: Clean up resources
}
```

## 🎯 Resource Access

### Static Resources

#### `n8n://workflows`

Lists all available workflows.

**Endpoint:** `GET /resources/workflows`

**Parameters:**

```typescript
interface WorkflowsResourceParams {
  active?: boolean; // Optional: Filter by active status
  limit?: number; // Optional: Max results
  format?: "summary" | "detailed"; // Optional: Response format
}
```

**Response:**

```json
{
  "workflows": [
    {
      "id": "wf_123456",
      "name": "Customer Onboarding",
      "active": true,
      "description": "Automated customer onboarding workflow",
      "tags": ["crm", "automation"],
      "lastExecuted": "2024-09-04T10:30:00Z",
      "totalExecutions": 1250,
      "successRate": 0.945
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0
  }
}
```

#### `n8n://execution-stats`

Provides comprehensive execution statistics.

**Endpoint:** `GET /resources/execution-stats`

**Parameters:**

```typescript
interface ExecutionStatsParams {
  timeframe?: "hour" | "day" | "week" | "month" | "year";
  workflows?: string[]; // Optional: Filter by workflow IDs
  groupBy?: "hour" | "day" | "workflow" | "status";
}
```

**Response:**

```json
{
  "totalExecutions": 51247,
  "successfulExecutions": 47892,
  "failedExecutions": 3355,
  "successRate": 0.934,
  "averageDuration": 45.2,        // seconds
  "executionsByStatus": {
    "success": 47892,
    "error": 3355,
    "waiting": 340,
    "running": 294,
    "canceled": 366
  },
  "timeSeriesData": [...],         // Hourly/daily statistics
  "performanceMetrics": {
    "p50Duration": 32.5,
    "p95Duration": 89.7,
    "p99Duration": 145.2,
    "maxDuration": 890.1
  }
}
```

### Dynamic Resources

#### `n8n://workflow/{id}`

Access specific workflow details.

**Endpoint:** `GET /resources/workflow/{id}`

**Parameters:**

```typescript
interface WorkflowResourceParams {
  version?: number; // Optional: Specific workflow version
  format?: "json" | "yaml" | "xml"; // Optional: Response format
  includeDependencies?: boolean; // Optional: Include related workflows
}
```

#### `n8n://execution/{id}`

Access execution details and results.

**Endpoint:** `GET /resources/execution/{id}`

## ❌ Error Handling

### Standard Error Codes

```typescript
enum MCPErrorCode {
  PARSE_ERROR = -32700, // Invalid JSON
  INVALID_REQUEST = -32600, // Invalid request
  METHOD_NOT_FOUND = -32601, // Method not found
  INVALID_PARAMS = -32602, // Invalid parameters
  INTERNAL_ERROR = -32603, // Internal error
  SERVER_ERROR = -32000, // Server error

  // n8n-specific errors
  WORKFLOW_NOT_FOUND = 1001,
  EXECUTION_FAILED = 1002,
  INVALID_WORKFLOW = 1003,
  PERMISSION_DENIED = 1004,
  RATE_LIMIT_EXCEEDED = 1005,
  AUTHENTICATION_FAILED = 1006,
}
```

### Error Response Format

```typescript
{
  "jsonrpc": "2.0",
  "id": null,
  "error": {
    "code": 1001,
    "message": "Workflow not found",
    "data": {
      "requestedId": "wf_nonexistent",
      "suggestion": "Check the workflow ID and ensure it exists",
      "availableWorkflows": ["wf_123", "wf_456", "wf_789"]
    }
  }
}
```

### Common Error Scenarios

```typescript
// 1. Workflow Not Found
{
  "error": {
    "code": 1001,
    "message": "Workflow with ID 'wf_unknown' not found",
    "data": {
      "availableIds": ["wf_123456", "wf_789012"]
    }
  }
}

// 2. Authentication Failed
{
  "error": {
    "code": 1006,
    "message": "Invalid API key",
    "data": {
      "help": "Visit n8n Settings > API Keys to generate a new key",
      "docs": "https://docs.n8n.io/api/authentication/"
    }
  }
}

// 3. Rate Limit Exceeded
{
  "error": {
    "code": 1005,
    "message": "Rate limit exceeded",
    "data": {
      "retryAfter": 60,      // seconds
      "currentWindow": "100 requests/hour",
      "limit": 100,
      "resetTime": "2024-09-04T11:00:00Z"
    }
  }
}
```

## 📊 Rate Limiting

### Rate Limits

```typescript
const rateLimits = {
  general: {
    perSecond: 10,
    perMinute: 100,
    perHour: 1000,
  },
  workflows: {
    create: { perMinute: 20 },
    update: { perMinute: 50 },
    delete: { perMinute: 10 },
  },
  executions: {
    run: { perMinute: 30 },
    get: { perMinute: 200 },
    list: { perMinute: 100 },
  },
};
```

### Rate Limit Headers

```bash
X-RateLimit-Limit-Requests: 1000
X-RateLimit-Remaining-Requests: 999
X-RateLimit-Reset-Time: 2024-09-04T11:00:00Z
X-RateLimit-Retry-After: 0
```

## 🔒 Security & Authentication

### API Key Authentication

```typescript
// All requests must include
headers: {
  'X-N8n-Api-Key': 'your_api_key_here',
  'Content-Type': 'application/json',
  'User-Agent': 'n8n-mcp-server/1.0.0'
}
```

### Webhook Security

```typescript
// Webhook requests include authentication
const webhookPayload = {
  headers: {
    "X-N8n-Webhook-Auth": "Basic dXNlcjpwYXNz", // Base64 encoded
    "X-N8n-Workflow-Id": "workflow_123",
    "X-N8n-Execution-Id": "execution_456",
  },
  body: {
    // Your data payload
  },
};
```

## 🌐 SDK Integration Examples

### JavaScript/TypeScript Client

```typescript
class N8nMCPClient {
  constructor(apiKey, baseUrl = "http://localhost:8000/api/v1") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async createWorkflow(name, nodes, connections) {
    const response = await fetch(`${this.baseUrl}/tools/workflow/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-N8n-Api-Key": this.apiKey,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: {
          name: "n8n-workflow-create",
          arguments: { name, nodes, connections },
        },
      }),
    });

    return response.json();
  }

  async listWorkflows(filters = {}) {
    const response = await fetch(`${this.baseUrl}/resources/workflows`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-N8n-Api-Key": this.apiKey,
      },
      body: JSON.stringify({ ...filters }),
    });

    return response.json();
  }
}
```

### Python Client

```python
import requests
from typing import Dict, Any, Optional

class N8nMCPClient:
    def __init__(self, api_key: str, base_url: str = "http://localhost:8000/api/v1"):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'X-N8n-Api-Key': api_key,
            'Content-Type': 'application/json'
        })

    def _make_request(self, endpoint: str, method: str = "GET", **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        response = self.session.request(method, url, **kwargs)
        response.raise_for_status()
        return response.json()

    def create_workflow(self, name: str, nodes: list, connections: dict) -> Dict[str, Any]:
        payload = {
            "jsonrpc": "2.0",
            "id": int(time.time() * 1000),
            "method": "tools/call",
            "params": {
                "name": "n8n-workflow-create",
                "arguments": {
                    "name": name,
                    "nodes": nodes,
                    "connections": connections
                }
            }
        }

        return self._make_request("tools/workflow/create", method="POST", json=payload)

    def list_workflows(self, active: Optional[bool] = None) -> Dict[str, Any]:
        params = {}
        if active is not None:
            params['active'] = active
        return self._make_request("resources/workflows", params=params)

    def run_workflow(self, workflow_id: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        payload = {
            "jsonrpc": "2.0",
            "id": int(time.time() * 1000),
            "method": "tools/call",
            "params": {
                "name": "n8n-execution-run",
                "arguments": {
                    "workflowId": workflow_id,
                    "data": data or {}
                }
            }
        }

        return self._make_request("tools/execution/run", method="POST", json=payload)
```

### CLI Tool

```bash
# Install CLI globally
npm install -g @n8n/mcp-cli

# Configure API key
n8n-mcp config set-api-key your_api_key

# List workflows
n8n-mcp workflows list

# Create workflow from file
n8n-mcp workflows create --file workflow.json

# Run workflow
n8n-mcp workflows run workflow_id --data '{"input": "value"}'

# Get execution status
n8n-mcp executions get execution_id

# Monitor workflow executions
n8n-mcp executions monitor workflow_id
```

This comprehensive API reference provides everything needed to integrate with n8n MCP Server effectively. Whether you're building client applications, CLI tools, or automation systems, these endpoints and examples will help you leverage the full power of n8n through the MCP protocol.
