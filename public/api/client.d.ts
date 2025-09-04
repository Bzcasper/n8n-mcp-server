/**
 * n8n API Client
 *
 * This module provides a client for interacting with the n8n API.
 *
 * @format
 */
import { AxiosInstance } from "axios";
import { EnvConfig } from "../config/environment.js";
/**
 * n8n API Client class for making requests to the n8n API
 */
export declare class N8nApiClient {
    private axiosInstance;
    private config;
    /**
     * Create a new n8n API client
     *
     * @param config Environment configuration
     */
    constructor(config: EnvConfig);
    /**
     * Check connectivity to the n8n API
     *
     * @returns Promise that resolves if connectivity check succeeds
     * @throws N8nApiError if connectivity check fails
     */
    checkConnectivity(): Promise<void>;
    /**
     * Get the axios instance for making custom requests
     *
     * @returns Axios instance
     */
    getAxiosInstance(): AxiosInstance;
    /**
     * Get all workflows from n8n
     *
     * @param params Optional query parameters
     * @returns Array of workflow objects
     */
    getWorkflows(params?: Record<string, any>): Promise<any[]>;
    /**
     * Get a specific workflow by ID
     *
     * @param id Workflow ID
     * @param params Optional query parameters
     * @returns Workflow object
     */
    getWorkflow(id: string, params?: Record<string, any>): Promise<any>;
    /**
     * Get all workflow executions
     *
     * @param params Optional query parameters
     * @returns Array of execution objects
     */
    getExecutions(params?: Record<string, any>): Promise<any[]>;
    /**
     * Get a specific execution by ID
     *
     * @param id Execution ID
     * @param params Optional query parameters
     * @returns Execution object
     */
    getExecution(id: string, params?: Record<string, any>): Promise<any>;
    /**
     * Get all users from n8n
     *
     * @param params Optional query parameters
     * @returns Array of user objects
     */
    getUsers(params?: Record<string, any>): Promise<any[]>;
    /**
     * Invite new users to n8n
     *
     * @param users Array of user invitation objects with email and optional role
     * @returns Created user objects
     */
    createUsers(users: Record<string, any>[]): Promise<any[]>;
    /**
     * Execute a workflow by ID
     *
     * @param id Workflow ID
     * @param data Optional data to pass to the workflow
     * @returns Execution result
     */
    executeWorkflow(id: string, data?: Record<string, any>): Promise<any>;
    /**
     * Create a new workflow
     *
     * @param workflow Workflow object to create
     * @returns Created workflow
     */
    createWorkflow(workflow: Record<string, any>): Promise<any>;
    /**
     * Update an existing workflow
     *
     * @param id Workflow ID
     * @param workflow Updated workflow object
     * @returns Updated workflow
     */
    updateWorkflow(id: string, workflow: Record<string, any>): Promise<any>;
    /**
     * Delete a workflow
     *
     * @param id Workflow ID
     * @returns Deleted workflow
     */
    deleteWorkflow(id: string): Promise<any>;
    /**
     * Activate a workflow
     *
     * @param id Workflow ID
     * @returns Activated workflow
     */
    activateWorkflow(id: string): Promise<any>;
    /**
     * Deactivate a workflow
     *
     * @param id Workflow ID
     * @returns Deactivated workflow
     */
    deactivateWorkflow(id: string): Promise<any>;
    /**
     * Delete an execution
     *
     * @param id Execution ID
     * @returns Deleted execution or success message
     */
    deleteExecution(id: string): Promise<any>;
    /**
     * Get tags for a specific workflow
     *
     * @param id Workflow ID
     * @returns Array of tag objects
     */
    getWorkflowTags(id: string): Promise<any[]>;
    /**
     * Update tags for a specific workflow
     *
     * @param id Workflow ID
     * @param tagIds Array of tag IDs to assign
     * @returns Array of updated tag objects
     */
    updateWorkflowTags(id: string, tagIds: any[]): Promise<any[]>;
    /**
     * Transfer a workflow to a different project
     *
     * @param id Workflow ID
     * @param destinationProjectId Target project ID
     * @returns Updated workflow
     */
    transferWorkflow(id: string, destinationProjectId: string): Promise<any>;
    /**
     * Transfer a credential to a different project
     *
     * @param id Credential ID
     * @param destinationProjectId Target project ID
     * @returns Updated credential
     */
    transferCredential(id: string, destinationProjectId: string): Promise<any>;
    /**
     * Create a new credential
     *
     * @param credential Credential object to create
     * @returns Created credential
     */
    createCredential(credential: Record<string, any>): Promise<any>;
    /**
     * Get a specific credential by ID
     *
     * @param id Credential ID
     * @returns Credential object
     */
    getCredential(id: string): Promise<any>;
    /**
     * Get the JSON schema for a specific credential type
     *
     * @param credentialTypeName Credential type name
     * @returns JSON schema object
     */
    getCredentialSchema(credentialTypeName: string): Promise<any>;
    /**
     * Delete a credential
     *
     * @param id Credential ID
     * @returns Deleted credential or success message
     */
    deleteCredential(id: string): Promise<any>;
}
/**
 * Create and return a configured n8n API client
 *
 * @param config Environment configuration
 * @returns n8n API client instance
 */
export declare function createApiClient(config: EnvConfig): N8nApiClient;
