/**
 * Core Types Module
 *
 * This module provides type definitions used throughout the application
 * and bridges compatibility with the MCP SDK.
 *
 * @format
 */
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, any>;
        required?: string[];
    };
}
export interface ToolCallResult {
    content: Array<{
        type: string;
        text: string;
    }>;
    isError?: boolean;
}
export interface Workflow {
    id: string;
    name: string;
    active: boolean;
    nodes: any[];
    connections: any;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}
export interface Execution {
    id: string;
    workflowId: string;
    finished: boolean;
    mode: string;
    startedAt: string;
    stoppedAt: string;
    status: string;
    data: {
        resultData: {
            runData: any;
        };
    };
    [key: string]: any;
}
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isOwner?: boolean;
    createdAt: string;
    updatedAt: string;
    [key: string]: any;
}
