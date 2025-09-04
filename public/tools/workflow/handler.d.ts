/**
 * Workflow Tools Handler
 *
 * This module handles calls to workflow-related tools.
 *
 * @format
 */
import { ToolCallResult } from "../../types/index.js";
/**
 * Handle workflow tool calls
 *
 * @param toolName Name of the tool being called
 * @param args Arguments passed to the tool
 * @returns Tool call result
 */
export default function workflowHandler(toolName: string, args: Record<string, any>): Promise<ToolCallResult>;
