/**
 * Resources Module
 *
 * This module provides MCP resource handlers for n8n workflows and executions.
 *
 * @format
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { EnvConfig } from "../config/environment.js";
/**
 * Set up resource handlers for the MCP server
 *
 * @param server MCP server instance
 * @param envConfig Environment configuration
 */
export declare function setupResourceHandlers(server: Server, envConfig: EnvConfig): void;
