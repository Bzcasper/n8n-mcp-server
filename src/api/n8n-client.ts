/**
 * n8n API Client Interface
 *
 * This module defines interfaces and types for the n8n API client.
 *
 * @format
 */

import { N8nApiClient } from "./client.js";
import { EnvConfig } from "../config/environment.js";
import { Workflow, Execution } from "../types/index.js";

/**
 * n8n API service - provides functions for interacting with n8n API
 */
export class N8nApiService {
  private client: N8nApiClient;

  /**
   * Create a new n8n API service
   *
   * @param config Environment configuration
   */
  constructor(config: EnvConfig) {
    this.client = new N8nApiClient(config);
  }

  /**
   * Check connectivity to the n8n API
   */
  async checkConnectivity(): Promise<void> {
    return this.client.checkConnectivity();
  }

  /**
   * Get all workflows from n8n
   *
   * @param params Optional query parameters
   * @returns Array of workflow objects
   */
  async getWorkflows(params?: Record<string, any>): Promise<Workflow[]> {
    return this.client.getWorkflows(params);
  }

  /**
   * Get a specific workflow by ID
   *
   * @param id Workflow ID
   * @param params Optional query parameters
   * @returns Workflow object
   */
  async getWorkflow(
    id: string,
    params?: Record<string, any>
  ): Promise<Workflow> {
    return this.client.getWorkflow(id, params);
  }

  /**
   * Get tags for a specific workflow
   *
   * @param id Workflow ID
   * @returns Array of tag objects
   */
  async getWorkflowTags(id: string): Promise<any[]> {
    return this.client.getWorkflowTags(id);
  }

  /**
   * Update tags for a specific workflow
   *
   * @param id Workflow ID
   * @param tagIds Array of tag IDs to assign
   * @returns Array of updated tag objects
   */
  async updateWorkflowTags(id: string, tagIds: any[]): Promise<any[]> {
    return this.client.updateWorkflowTags(id, tagIds);
  }

  /**
   * Execute a workflow by ID
   *
   * @param id Workflow ID
   * @param data Optional data to pass to the workflow
   * @returns Execution result
   */
  async executeWorkflow(id: string, data?: Record<string, any>): Promise<any> {
    return this.client.executeWorkflow(id, data);
  }

  /**
   * Create a new workflow
   *
   * @param workflow Workflow object to create
   * @returns Created workflow
   */
  async createWorkflow(workflow: Record<string, any>): Promise<Workflow> {
    return this.client.createWorkflow(workflow);
  }

  /**
   * Update an existing workflow
   *
   * @param id Workflow ID
   * @param workflow Updated workflow object
   * @returns Updated workflow
   */
  async updateWorkflow(
    id: string,
    workflow: Record<string, any>
  ): Promise<Workflow> {
    return this.client.updateWorkflow(id, workflow);
  }

  /**
   * Delete a workflow
   *
   * @param id Workflow ID
   * @returns Deleted workflow or success message
   */
  async deleteWorkflow(id: string): Promise<any> {
    return this.client.deleteWorkflow(id);
  }

  /**
   * Activate a workflow
   *
   * @param id Workflow ID
   * @returns Activated workflow
   */
  async activateWorkflow(id: string): Promise<Workflow> {
    return this.client.activateWorkflow(id);
  }

  /**
   * Deactivate a workflow
   *
   * @param id Workflow ID
   * @returns Deactivated workflow
   */
  async deactivateWorkflow(id: string): Promise<Workflow> {
    return this.client.deactivateWorkflow(id);
  }

  /**
   * Get all workflow executions
   *
   * @param params Optional query parameters
   * @returns Array of execution objects
   */
  async getExecutions(params?: Record<string, any>): Promise<Execution[]> {
    return this.client.getExecutions(params);
  }

  /**
   * Get all users from n8n
   *
   * @param params Optional query parameters
   * @returns Array of user objects
   */
  async getUsers(params?: Record<string, any>): Promise<any[]> {
    return this.client.getUsers(params);
  }

  /**
   * Invite new users to n8n
   *
   * @param users Array of user invitation objects with email and optional role
   * @returns Created user objects
   */
  async createUsers(users: Record<string, any>[]): Promise<any[]> {
    return this.client.createUsers(users);
  }

  /**
   * Get a specific execution by ID
   *
   * @param id Execution ID
   * @param params Optional query parameters
   * @returns Execution object
   */
  async getExecution(
    id: string,
    params?: Record<string, any>
  ): Promise<Execution> {
    return this.client.getExecution(id, params);
  }

  /**
   * Delete an execution
   *
   * @param id Execution ID
   * @returns Deleted execution or success message
   */
  async deleteExecution(id: string): Promise<any> {
    return this.client.deleteExecution(id);
  }

  /**
   * Transfer a workflow to a different project
   *
   * @param id Workflow ID
   * @param destinationProjectId Target project ID
   * @returns Updated workflow
   */
  async transferWorkflow(
    id: string,
    destinationProjectId: string
  ): Promise<Workflow> {
    return this.client.transferWorkflow(id, destinationProjectId);
  }

  /**
   * Transfer a credential to a different project
   *
   * @param id Credential ID
   * @param destinationProjectId Target project ID
   * @returns Updated credential
   */
  async transferCredential(
    id: string,
    destinationProjectId: string
  ): Promise<any> {
    return this.client.transferCredential(id, destinationProjectId);
  }

  /**
   * Create a new credential
   *
   * @param credential Credential object to create
   * @returns Created credential
   */
  async createCredential(credential: Record<string, any>): Promise<any> {
    return this.client.createCredential(credential);
  }

  /**
   * Get a specific credential by ID
   *
   * @param id Credential ID
   * @returns Credential object
   */
  async getCredential(id: string): Promise<any> {
    return this.client.getCredential(id);
  }

  /**
   * Get the JSON schema for a specific credential type
   *
   * @param credentialTypeName Credential type name
   * @returns JSON schema object
   */
  async getCredentialSchema(credentialTypeName: string): Promise<any> {
    return this.client.getCredentialSchema(credentialTypeName);
  }

  /**
   * Delete a credential
   *
   * @param id Credential ID
   * @returns Deleted credential or success message
   */
  async deleteCredential(id: string): Promise<any> {
    return this.client.deleteCredential(id);
  }
}

/**
 * Create a new n8n API service
 *
 * @param config Environment configuration
 * @returns n8n API service
 */
export function createApiService(config: EnvConfig): N8nApiService {
  return new N8nApiService(config);
}
