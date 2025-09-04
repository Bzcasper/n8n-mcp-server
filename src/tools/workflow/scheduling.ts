/**
 * Workflow Scheduling and Batching Tools
 *
 * This module provides tools for workflow scheduling, batching, and automation.
 *
 * @format
 */

import { BaseWorkflowToolHandler } from "./base-handler.js";
import { ToolCallResult, ToolDefinition } from "../../types/index.js";

/**
 * Handler for workflow scheduling and batching operations
 */
export class SchedulingWorkflowHandler extends BaseWorkflowToolHandler {
  /**
   * Create a scheduled batch workflow
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async () => {
      const {
        name,
        scheduleType,
        batchSize,
        targetWorkflows,
        scheduleExpression,
        maxConcurrency,
        failurePolicy,
      } = args;

      // Create scheduled batch workflow
      const scheduledWorkflow = {
        name: `${name}-scheduled-batch-${Date.now()}`,
        nodes: [
          // Schedule trigger node
          {
            parameters: {
              rule: {
                interval: [0, "hours"],
                ...(scheduleExpression && {
                  cronExpression: scheduleExpression,
                }),
              },
            },
            name: "Schedule Trigger",
            type: "n8n-nodes-base.scheduleTrigger",
            typeVersion: 1,
            position: [240, 300],
          },
          // Batch processor node
          {
            parameters: {
              batchSize: batchSize || 50,
              maxConcurrency: maxConcurrency || 3,
              inputDataFieldName: "data",
            },
            name: "Batch Processor",
            type: "n8n-nodes-base.splitInBatches",
            typeVersion: 1,
            position: [500, 300],
          },
          // Workflow execution node
          {
            parameters: {
              workflowId: targetWorkflows[0], // Execute first target workflow
              data: "[batch_data]",
            },
            name: "Execute Workflow",
            type: "n8n-nodes-base.executeWorkflow",
            typeVersion: 1,
            position: [760, 300],
          },
          // Error handler node
          {
            parameters: {
              mode: failurePolicy || "continueOnFail",
              retryOptions: {
                maxRetries: 3,
                waitBetweenRetries: "1 minute",
              },
            },
            name: "Error Handler",
            type: "n8n-nodes-base.errorTrigger",
            typeVersion: 1,
            position: [1020, 300],
          },
        ],
        connections: {
          "Schedule Trigger": {
            main: [[{ node: "Batch Processor", type: "main", index: 0 }]],
          },
          "Batch Processor": {
            main: [[{ node: "Execute Workflow", type: "main", index: 0 }]],
          },
          "Execute Workflow": {
            main: [[{ node: "Error Handler", type: "main", index: 0 }]],
          },
        },
        active: false,
        settings: {
          executionOrder: "v1",
          timezone: "UTC",
        },
      };

      const createdWorkflow = await this.apiService.createWorkflow(
        scheduledWorkflow
      );

      return this.formatSuccess(
        {
          id: createdWorkflow.id,
          name: createdWorkflow.name,
          scheduleType,
          batchSize: batchSize || 50,
          maxConcurrency: maxConcurrency || 3,
          targetWorkflows: targetWorkflows.length,
        },
        `Successfully created scheduled workflow "${createdWorkflow.name}" for ${targetWorkflows.length} target workflows`
      );
    }, args);
  }
}

/**
 * Handler for workflow monitoring and analytics
 */
export class MonitoringWorkflowHandler extends BaseWorkflowToolHandler {
  /**
   * Create a monitoring and analytics workflow
   */
  async execute(args: Record<string, any>): Promise<ToolCallResult> {
    return this.handleExecution(async () => {
      const {
        name,
        targetWorkflows,
        metrics,
        alertThresholds,
        dashboardConfig,
      } = args;

      // Create monitoring analytics workflow
      const monitoringWorkflow = {
        name: `${name}-monitoring-analytics-${Date.now()}`,
        nodes: [
          // Periodic trigger for monitoring
          {
            parameters: {
              rule: {
                interval: [5, "minutes"],
              },
            },
            name: "Monitoring Trigger",
            type: "n8n-nodes-base.scheduleTrigger",
            typeVersion: 1,
            position: [240, 300],
          },
          // Fetch workflow executions
          {
            parameters: {
              limit: 100,
              status: "all",
            },
            name: "Get Executions",
            type: "n8n-nodes-base.n8n",
            typeVersion: 1,
            position: [500, 300],
          },
          // Calculate metrics
          {
            parameters: {
              operation: "calculate",
              metrics: metrics || [
                "success_rate",
                "avg_duration",
                "error_rate",
              ],
              aggregationType: "average",
            },
            name: "Calculate Metrics",
            type: "n8n-nodes-base.aggregate",
            typeVersion: 1,
            position: [760, 300],
          },
          // Alert checker
          {
            parameters: {
              thresholds: alertThresholds || [],
              conditions: [
                {
                  key: "success_rate",
                  operator: "lessThan",
                  value: 95,
                },
              ],
            },
            name: "Check Thresholds",
            type: "n8n-nodes-base.if",
            typeVersion: 1,
            position: [1020, 300],
          },
          // Send alerts
          {
            parameters: {
              service: "email",
              subject: "Workflow Alert",
              message: "Workflow metrics have crossed thresholds",
            },
            name: "Send Alert",
            type: "n8n-nodes-base.emailSend",
            typeVersion: 1,
            position: [1280, 300],
          },
          // Update dashboard
          {
            parameters: {
              operation: "update",
              config: dashboardConfig || {},
              dataSource: "[calculated_metrics]",
            },
            name: "Update Dashboard",
            type: "n8n-nodes-base.httpRequest",
            typeVersion: 1,
            position: [1540, 300],
          },
        ],
        connections: {
          "Monitoring Trigger": {
            main: [[{ node: "Get Executions", type: "main", index: 0 }]],
          },
          "Get Executions": {
            main: [[{ node: "Calculate Metrics", type: "main", index: 0 }]],
          },
          "Calculate Metrics": {
            main: [
              [{ node: "Check Thresholds", type: "main", index: 0 }],
              [{ node: "Update Dashboard", type: "main", index: 0 }],
            ],
          },
          "Check Thresholds": {
            main: [[{ node: "Send Alert", type: "main", index: 0 }]],
          },
        },
        active: false,
        settings: {
          executionOrder: "v1",
        },
      };

      const createdWorkflow = await this.apiService.createWorkflow(
        monitoringWorkflow
      );

      return this.formatSuccess(
        {
          id: createdWorkflow.id,
          name: createdWorkflow.name,
          metrics: metrics || ["success_rate", "avg_duration", "error_rate"],
          monitoredWorkflows: targetWorkflows.length,
          alertCount: alertThresholds?.length || 0,
          nodes: monitoringWorkflow.nodes.length,
        },
        `Successfully created monitoring workflow "${createdWorkflow.name}" with analytics and alerting for ${targetWorkflows.length} workflows`
      );
    }, args);
  }
}

/**
 * Get tool definition for scheduled workflow creation
 */
export function getCreateScheduledWorkflowToolDefinition(): ToolDefinition {
  return {
    name: "n8n-workflow-create-scheduled",
    description:
      "Create a scheduled batch workflow for processing multiple workflows with specific timing",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Base name for the scheduled workflow",
        },
        scheduleType: {
          type: "string",
          description: "Type of schedule (cron, interval, manual)",
        },
        batchSize: {
          type: "integer",
          description: "Number of items to process in each batch",
          default: 50,
        },
        targetWorkflows: {
          type: "array",
          description: "List of workflow IDs to execute in batches",
          items: {
            type: "string",
          },
        },
        scheduleExpression: {
          type: "string",
          description:
            "Cron expression for scheduling (e.g., '0 0 * * *' for daily)",
        },
        maxConcurrency: {
          type: "integer",
          description: "Maximum concurrent executions",
          default: 3,
        },
        failurePolicy: {
          type: "string",
          description:
            "How to handle failures (continueOnFail, stopOnFail, retry)",
          default: "continueOnFail",
        },
      },
      required: ["name", "scheduleType", "targetWorkflows"],
    },
  };
}

/**
 * Get tool definition for monitoring workflow creation
 */
export function getCreateMonitoringWorkflowToolDefinition(): ToolDefinition {
  return {
    name: "n8n-workflow-create-monitoring",
    description:
      "Create a monitoring and analytics workflow with alerts and dashboard updates",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Base name for the monitoring workflow",
        },
        targetWorkflows: {
          type: "array",
          description: "List of workflow IDs to monitor",
          items: {
            type: "string",
          },
        },
        metrics: {
          type: "array",
          description: "List of metrics to calculate",
          items: {
            type: "string",
          },
          default: ["success_rate", "avg_duration", "error_rate"],
        },
        alertThresholds: {
          type: "array",
          description: "Alert threshold configurations",
          items: {
            type: "object",
            properties: {
              metric: { type: "string" },
              operator: { type: "string" },
              value: { type: "number" },
              severity: { type: "string" },
            },
          },
        },
        dashboardConfig: {
          type: "object",
          description: "Dashboard configuration for metrics display",
        },
      },
      required: ["name", "targetWorkflows"],
    },
  };
}
