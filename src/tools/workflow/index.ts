/**
 * Workflow Tools Module
 *
 * This module provides MCP tools for interacting with n8n workflows.
 *
 * @format
 */

import { ToolDefinition } from "../../types/index.js";

// Import tool definitions
import {
  getListWorkflowsToolDefinition,
  ListWorkflowsHandler,
} from "./list.js";
import { getGetWorkflowToolDefinition, GetWorkflowHandler } from "./get.js";
import {
  getCreateWorkflowToolDefinition,
  CreateWorkflowHandler,
} from "./create.js";
import {
  getUpdateWorkflowToolDefinition,
  UpdateWorkflowHandler,
} from "./update.js";
import {
  getDeleteWorkflowToolDefinition,
  DeleteWorkflowHandler,
} from "./delete.js";
import {
  getTransferWorkflowToolDefinition,
  TransferWorkflowHandler,
} from "./transfer.js";
import {
  getActivateWorkflowToolDefinition,
  ActivateWorkflowHandler,
} from "./activate.js";
import {
  getDeactivateWorkflowToolDefinition,
  DeactivateWorkflowHandler,
} from "./deactivate.js";
import {
  getGetWorkflowTagsToolDefinition,
  GetWorkflowTagsHandler,
  getUpdateWorkflowTagsToolDefinition,
  UpdateWorkflowTagsHandler,
} from "./tags.js";
import {
  getCreateAIMLWorkflowToolDefinition,
  AIMLWorkflowHandler,
  getCreateDataProcessingWorkflowToolDefinition,
  DataProcessingHandler,
} from "./aiml.js";
import {
  getCreateScheduledWorkflowToolDefinition,
  SchedulingWorkflowHandler,
  getCreateMonitoringWorkflowToolDefinition,
  MonitoringWorkflowHandler,
} from "./scheduling.js";

// Export handlers
export {
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
  AIMLWorkflowHandler,
  DataProcessingHandler,
  SchedulingWorkflowHandler,
  MonitoringWorkflowHandler,
};

/**
 * Set up workflow management tools
 *
 * @returns Array of workflow tool definitions
 */
export async function setupWorkflowTools(): Promise<ToolDefinition[]> {
  return [
    getListWorkflowsToolDefinition(),
    getGetWorkflowToolDefinition(),
    getCreateWorkflowToolDefinition(),
    getUpdateWorkflowToolDefinition(),
    getDeleteWorkflowToolDefinition(),
    getTransferWorkflowToolDefinition(),
    getActivateWorkflowToolDefinition(),
    getDeactivateWorkflowToolDefinition(),
    getGetWorkflowTagsToolDefinition(),
    getUpdateWorkflowTagsToolDefinition(),
    // AI/ML workflow tools
    getCreateAIMLWorkflowToolDefinition(),
    getCreateDataProcessingWorkflowToolDefinition(),
    // Scheduling and monitoring tools
    getCreateScheduledWorkflowToolDefinition(),
    getCreateMonitoringWorkflowToolDefinition(),
  ];
}
