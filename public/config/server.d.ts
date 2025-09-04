/**
 * Server Configuration
 *
 * This module configures the MCP server with tools and resources
 * for n8n workflow management.
 *
 * @format
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
/**
 * Configure and return an MCP server instance with all tools and resources
 *
 * @returns Configured MCP server instance
 */
export declare function configureServer(): Promise<Server>;
