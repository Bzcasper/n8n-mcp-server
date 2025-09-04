/**
 * Workflow Tools Module
 *
 * This module provides MCP tools for interacting with n8n workflows.
 *
 * @format
 */
import { ToolDefinition } from "../../types/index.js";
import { ListWorkflowsHandler } from "./list.js";
import { GetWorkflowHandler } from "./get.js";
import { CreateWorkflowHandler } from "./create.js";
import { UpdateWorkflowHandler } from "./update.js";
import { DeleteWorkflowHandler } from "./delete.js";
import { TransferWorkflowHandler } from "./transfer.js";
import { ActivateWorkflowHandler } from "./activate.js";
import { DeactivateWorkflowHandler } from "./deactivate.js";
import { GetWorkflowTagsHandler, UpdateWorkflowTagsHandler } from "./tags.js";
import { AIMLWorkflowHandler, DataProcessingHandler } from "./aiml.js";
import { SchedulingWorkflowHandler, MonitoringWorkflowHandler } from "./scheduling.js";
export { ListWorkflowsHandler, GetWorkflowHandler, CreateWorkflowHandler, UpdateWorkflowHandler, DeleteWorkflowHandler, TransferWorkflowHandler, ActivateWorkflowHandler, DeactivateWorkflowHandler, GetWorkflowTagsHandler, UpdateWorkflowTagsHandler, AIMLWorkflowHandler, DataProcessingHandler, SchedulingWorkflowHandler, MonitoringWorkflowHandler, };
/**
 * Set up workflow management tools
 *
 * @returns Array of workflow tool definitions
 */
export declare function setupWorkflowTools(): Promise<ToolDefinition[]>;
