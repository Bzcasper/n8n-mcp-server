/**
 * n8n API Client Interface
 *
 * This module defines interfaces and types for the n8n API client.
 *
 * @format
 */
import { N8nApiClient } from "./client.js";
/**
 * n8n API service - provides functions for interacting with n8n API
 */
export class N8nApiService {
    /**
     * Create a new n8n API service
     *
     * @param config Environment configuration
     */
    constructor(config) {
        this.client = new N8nApiClient(config);
    }
    /**
     * Check connectivity to the n8n API
     */
    async checkConnectivity() {
        return this.client.checkConnectivity();
    }
    /**
     * Get all workflows from n8n
     *
     * @param params Optional query parameters
     * @returns Array of workflow objects
     */
    async getWorkflows(params) {
        return this.client.getWorkflows(params);
    }
    /**
     * Get a specific workflow by ID
     *
     * @param id Workflow ID
     * @param params Optional query parameters
     * @returns Workflow object
     */
    async getWorkflow(id, params) {
        return this.client.getWorkflow(id, params);
    }
    /**
     * Get tags for a specific workflow
     *
     * @param id Workflow ID
     * @returns Array of tag objects
     */
    async getWorkflowTags(id) {
        return this.client.getWorkflowTags(id);
    }
    /**
     * Update tags for a specific workflow
     *
     * @param id Workflow ID
     * @param tagIds Array of tag IDs to assign
     * @returns Array of updated tag objects
     */
    async updateWorkflowTags(id, tagIds) {
        return this.client.updateWorkflowTags(id, tagIds);
    }
    /**
     * Execute a workflow by ID
     *
     * @param id Workflow ID
     * @param data Optional data to pass to the workflow
     * @returns Execution result
     */
    async executeWorkflow(id, data) {
        return this.client.executeWorkflow(id, data);
    }
    /**
     * Create a new workflow
     *
     * @param workflow Workflow object to create
     * @returns Created workflow
     */
    async createWorkflow(workflow) {
        return this.client.createWorkflow(workflow);
    }
    /**
     * Update an existing workflow
     *
     * @param id Workflow ID
     * @param workflow Updated workflow object
     * @returns Updated workflow
     */
    async updateWorkflow(id, workflow) {
        return this.client.updateWorkflow(id, workflow);
    }
    /**
     * Delete a workflow
     *
     * @param id Workflow ID
     * @returns Deleted workflow or success message
     */
    async deleteWorkflow(id) {
        return this.client.deleteWorkflow(id);
    }
    /**
     * Activate a workflow
     *
     * @param id Workflow ID
     * @returns Activated workflow
     */
    async activateWorkflow(id) {
        return this.client.activateWorkflow(id);
    }
    /**
     * Deactivate a workflow
     *
     * @param id Workflow ID
     * @returns Deactivated workflow
     */
    async deactivateWorkflow(id) {
        return this.client.deactivateWorkflow(id);
    }
    /**
     * Get all workflow executions
     *
     * @param params Optional query parameters
     * @returns Array of execution objects
     */
    async getExecutions(params) {
        return this.client.getExecutions(params);
    }
    /**
     * Get all users from n8n
     *
     * @param params Optional query parameters
     * @returns Array of user objects
     */
    async getUsers(params) {
        return this.client.getUsers(params);
    }
    /**
     * Invite new users to n8n
     *
     * @param users Array of user invitation objects with email and optional role
     * @returns Created user objects
     */
    async createUsers(users) {
        return this.client.createUsers(users);
    }
    /**
     * Get a specific execution by ID
     *
     * @param id Execution ID
     * @param params Optional query parameters
     * @returns Execution object
     */
    async getExecution(id, params) {
        return this.client.getExecution(id, params);
    }
    /**
     * Delete an execution
     *
     * @param id Execution ID
     * @returns Deleted execution or success message
     */
    async deleteExecution(id) {
        return this.client.deleteExecution(id);
    }
    /**
     * Transfer a workflow to a different project
     *
     * @param id Workflow ID
     * @param destinationProjectId Target project ID
     * @returns Updated workflow
     */
    async transferWorkflow(id, destinationProjectId) {
        return this.client.transferWorkflow(id, destinationProjectId);
    }
    /**
     * Transfer a credential to a different project
     *
     * @param id Credential ID
     * @param destinationProjectId Target project ID
     * @returns Updated credential
     */
    async transferCredential(id, destinationProjectId) {
        return this.client.transferCredential(id, destinationProjectId);
    }
    /**
     * Create a new credential
     *
     * @param credential Credential object to create
     * @returns Created credential
     */
    async createCredential(credential) {
        return this.client.createCredential(credential);
    }
    /**
     * Get a specific credential by ID
     *
     * @param id Credential ID
     * @returns Credential object
     */
    async getCredential(id) {
        return this.client.getCredential(id);
    }
    /**
     * Get the JSON schema for a specific credential type
     *
     * @param credentialTypeName Credential type name
     * @returns JSON schema object
     */
    async getCredentialSchema(credentialTypeName) {
        return this.client.getCredentialSchema(credentialTypeName);
    }
    /**
     * Delete a credential
     *
     * @param id Credential ID
     * @returns Deleted credential or success message
     */
    async deleteCredential(id) {
        return this.client.deleteCredential(id);
    }
}
/**
 * Create a new n8n API service
 *
 * @param config Environment configuration
 * @returns n8n API service
 */
export function createApiService(config) {
    return new N8nApiService(config);
}
//# sourceMappingURL=n8n-client.js.map