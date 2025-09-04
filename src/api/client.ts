/**
 * n8n API Client
 *
 * This module provides a client for interacting with the n8n API.
 *
 * @format
 */

import axios, { AxiosInstance } from "axios";
import { EnvConfig } from "../config/environment.js";
import { handleAxiosError, N8nApiError } from "../errors/index.js";

/**
 * n8n API Client class for making requests to the n8n API
 */
export class N8nApiClient {
  private axiosInstance: AxiosInstance;
  private config: EnvConfig;

  /**
   * Create a new n8n API client
   *
   * @param config Environment configuration
   */
  constructor(config: EnvConfig) {
    this.config = config;

    // Prepare axios configuration
    const axiosConfig: any = {
      baseURL: config.n8nApiUrl,
      headers: {
        "X-N8N-API-KEY": config.n8nApiKey,
        Accept: "application/json",
      },
      timeout: config.n8nApiTimeout, // Use configured timeout
    };

    // Handle HTTP vs HTTPS settings
    if (config.n8nApiUrl.startsWith("http://")) {
      // Allow HTTP connections - disable SSL verification for HTTP URLs
      axiosConfig.httpsAgent = false;
      axiosConfig.validateStatus = function (status: number) {
        return status < 500; // Accept all responses except server errors
      };
    } else if (config.n8nApiUrl.startsWith("https://")) {
      // For HTTPS, you can add SSL options if needed for development
      // axiosConfig.httpsAgent = new https.Agent({
      //   rejectUnauthorized: !process.env.NODE_ENV?.includes('development')
      // });
    }

    this.axiosInstance = axios.create(axiosConfig);

    // Add request debugging if debug mode is enabled
    if (config.debug) {
      this.axiosInstance.interceptors.request.use((request) => {
        console.error(
          `[DEBUG] Request: ${request.method?.toUpperCase()} ${
            request.baseURL
          }${request.url}`
        );
        return request;
      });

      this.axiosInstance.interceptors.response.use(
        (response) => {
          console.error(
            `[DEBUG] Response: ${response.status} ${response.statusText}`
          );
          return response;
        },
        (error) => {
          console.error(
            `[DEBUG] Response Error: ${error.response?.status} ${error.response?.statusText}`,
            error.message
          );
          throw error;
        }
      );
    }
  }

  /**
   * Check connectivity to the n8n API
   *
   * @returns Promise that resolves if connectivity check succeeds
   * @throws N8nApiError if connectivity check fails
   */
  async checkConnectivity(): Promise<void> {
    try {
      // Try to fetch health endpoint or workflows
      const response = await this.axiosInstance.get("/workflows");

      if (response.status !== 200) {
        throw new N8nApiError(
          "n8n API connectivity check failed",
          response.status
        );
      }

      if (this.config.debug) {
        console.error(
          `[DEBUG] Successfully connected to n8n API at ${this.config.n8nApiUrl}`
        );
        console.error(
          `[DEBUG] Found ${response.data.data?.length || 0} workflows`
        );
      }
    } catch (error) {
      throw handleAxiosError(error, "Failed to connect to n8n API");
    }
  }

  /**
   * Get the axios instance for making custom requests
   *
   * @returns Axios instance
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }

  /**
   * Get all workflows from n8n
   *
   * @param params Optional query parameters
   * @returns Array of workflow objects
   */
  async getWorkflows(params?: Record<string, any>): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get("/workflows", { params });
      return response.data.data || [];
    } catch (error) {
      throw handleAxiosError(error, "Failed to fetch workflows");
    }
  }

  /**
   * Get a specific workflow by ID
   *
   * @param id Workflow ID
   * @param params Optional query parameters
   * @returns Workflow object
   */
  async getWorkflow(id: string, params?: Record<string, any>): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/workflows/${id}`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, `Failed to fetch workflow ${id}`);
    }
  }

  /**
   * Get all workflow executions
   *
   * @param params Optional query parameters
   * @returns Array of execution objects
   */
  async getExecutions(params?: Record<string, any>): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get("/executions", { params });
      return response.data.data || [];
    } catch (error) {
      throw handleAxiosError(error, "Failed to fetch executions");
    }
  }

  /**
   * Get a specific execution by ID
   *
   * @param id Execution ID
   * @param params Optional query parameters
   * @returns Execution object
   */
  async getExecution(id: string, params?: Record<string, any>): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/executions/${id}`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, `Failed to fetch execution ${id}`);
    }
  }

  /**
   * Get all users from n8n
   *
   * @param params Optional query parameters
   * @returns Array of user objects
   */
  async getUsers(params?: Record<string, any>): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get("/users", { params });
      return response.data.data || [];
    } catch (error) {
      throw handleAxiosError(error, "Failed to fetch users");
    }
  }

  /**
   * Invite new users to n8n
   *
   * @param users Array of user invitation objects with email and optional role
   * @returns Created user objects
   */
  async createUsers(users: Record<string, any>[]): Promise<any[]> {
    try {
      const response = await this.axiosInstance.post("/users", users);
      return response.data.data || [];
    } catch (error) {
      throw handleAxiosError(error, "Failed to create users");
    }
  }

  /**
   * Execute a workflow by ID
   *
   * @param id Workflow ID
   * @param data Optional data to pass to the workflow
   * @returns Execution result
   */
  async executeWorkflow(id: string, data?: Record<string, any>): Promise<any> {
    try {
      const response = await this.axiosInstance.post(
        `/workflows/${id}/execute`,
        data || {}
      );
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, `Failed to execute workflow ${id}`);
    }
  }

  /**
   * Create a new workflow
   *
   * @param workflow Workflow object to create
   * @returns Created workflow
   */
  async createWorkflow(workflow: Record<string, any>): Promise<any> {
    try {
      // Make sure settings property is present
      if (!workflow.settings) {
        workflow.settings = {
          saveExecutionProgress: true,
          saveManualExecutions: true,
          saveDataErrorExecution: "all",
          saveDataSuccessExecution: "all",
          executionTimeout: 3600,
          timezone: "UTC",
        };
      }

      // Remove read-only properties that cause issues
      const workflowToCreate = { ...workflow };
      delete workflowToCreate.active; // Remove active property as it's read-only
      delete workflowToCreate.id; // Remove id property if it exists
      delete workflowToCreate.createdAt; // Remove createdAt property if it exists
      delete workflowToCreate.updatedAt; // Remove updatedAt property if it exists
      delete workflowToCreate.tags; // Remove tags property as it's read-only

      // Log request for debugging
      console.error(
        "[DEBUG] Creating workflow with data:",
        JSON.stringify(workflowToCreate, null, 2)
      );

      const response = await this.axiosInstance.post(
        "/workflows",
        workflowToCreate
      );
      return response.data;
    } catch (error) {
      console.error("[ERROR] Create workflow error:", error);
      throw handleAxiosError(error, "Failed to create workflow");
    }
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
  ): Promise<any> {
    try {
      // Remove read-only properties that cause issues with n8n API v1
      // According to n8n API schema, only name, nodes, connections, settings, and staticData are allowed
      const workflowToUpdate = { ...workflow };
      delete workflowToUpdate.id; // Remove id property as it's read-only
      delete workflowToUpdate.active; // Remove active property as it's read-only
      delete workflowToUpdate.createdAt; // Remove createdAt property as it's read-only
      delete workflowToUpdate.updatedAt; // Remove updatedAt property as it's read-only
      delete workflowToUpdate.tags; // Remove tags property as it's read-only

      // Log request for debugging
      if (this.config.debug) {
        console.error(
          "[DEBUG] Updating workflow with data:",
          JSON.stringify(workflowToUpdate, null, 2)
        );
      }

      const response = await this.axiosInstance.put(
        `/workflows/${id}`,
        workflowToUpdate
      );
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, `Failed to update workflow ${id}`);
    }
  }

  /**
   * Delete a workflow
   *
   * @param id Workflow ID
   * @returns Deleted workflow
   */
  async deleteWorkflow(id: string): Promise<any> {
    try {
      const response = await this.axiosInstance.delete(`/workflows/${id}`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, `Failed to delete workflow ${id}`);
    }
  }

  /**
   * Activate a workflow
   *
   * @param id Workflow ID
   * @returns Activated workflow
   */
  async activateWorkflow(id: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post(
        `/workflows/${id}/activate`
      );
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, `Failed to activate workflow ${id}`);
    }
  }

  /**
   * Deactivate a workflow
   *
   * @param id Workflow ID
   * @returns Deactivated workflow
   */
  async deactivateWorkflow(id: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post(
        `/workflows/${id}/deactivate`
      );
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, `Failed to deactivate workflow ${id}`);
    }
  }

  /**
   * Delete an execution
   *
   * @param id Execution ID
   * @returns Deleted execution or success message
   */
  async deleteExecution(id: string): Promise<any> {
    try {
      const response = await this.axiosInstance.delete(`/executions/${id}`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, `Failed to delete execution ${id}`);
    }
  }

  /**
   * Get tags for a specific workflow
   *
   * @param id Workflow ID
   * @returns Array of tag objects
   */
  async getWorkflowTags(id: string): Promise<any[]> {
    try {
      const response = await this.axiosInstance.get(`/workflows/${id}/tags`);
      return response.data.data || [];
    } catch (error) {
      throw handleAxiosError(error, `Failed to fetch tags for workflow ${id}`);
    }
  }

  /**
   * Update tags for a specific workflow
   *
   * @param id Workflow ID
   * @param tagIds Array of tag IDs to assign
   * @returns Array of updated tag objects
   */
  async updateWorkflowTags(id: string, tagIds: any[]): Promise<any[]> {
    try {
      const response = await this.axiosInstance.put(`/workflows/${id}/tags`, {
        tagIds: tagIds,
      });
      return response.data.data || [];
    } catch (error) {
      throw handleAxiosError(error, `Failed to update tags for workflow ${id}`);
    }
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
  ): Promise<any> {
    try {
      const response = await this.axiosInstance.put(
        `/workflows/${id}/transfer`,
        { destinationProjectId }
      );
      return response.data;
    } catch (error) {
      throw handleAxiosError(
        error,
        `Failed to transfer workflow ${id} to project ${destinationProjectId}`
      );
    }
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
    try {
      const response = await this.axiosInstance.put(
        `/credentials/${id}/transfer`,
        { destinationProjectId }
      );
      return response.data;
    } catch (error) {
      throw handleAxiosError(
        error,
        `Failed to transfer credential ${id} to project ${destinationProjectId}`
      );
    }
  }

  /**
   * Create a new credential
   *
   * @param credential Credential object to create
   * @returns Created credential
   */
  async createCredential(credential: Record<string, any>): Promise<any> {
    try {
      const response = await this.axiosInstance.post(
        "/credentials",
        credential
      );
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, "Failed to create credential");
    }
  }

  /**
   * Get a specific credential by ID
   *
   * @param id Credential ID
   * @returns Credential object
   */
  async getCredential(id: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/credentials/${id}`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, `Failed to fetch credential ${id}`);
    }
  }

  /**
   * Get the JSON schema for a specific credential type
   *
   * @param credentialTypeName Credential type name
   * @returns JSON schema object
   */
  async getCredentialSchema(credentialTypeName: string): Promise<any> {
    try {
      const response = await this.axiosInstance.get(
        `/credentials/schema/${credentialTypeName}`
      );
      return response.data;
    } catch (error) {
      throw handleAxiosError(
        error,
        `Failed to fetch schema for credential type ${credentialTypeName}`
      );
    }
  }

  /**
   * Delete a credential
   *
   * @param id Credential ID
   * @returns Deleted credential or success message
   */
  async deleteCredential(id: string): Promise<any> {
    try {
      const response = await this.axiosInstance.delete(`/credentials/${id}`);
      return response.data;
    } catch (error) {
      throw handleAxiosError(error, `Failed to delete credential ${id}`);
    }
  }
}

/**
 * Create and return a configured n8n API client
 *
 * @param config Environment configuration
 * @returns n8n API client instance
 */
export function createApiClient(config: EnvConfig): N8nApiClient {
  return new N8nApiClient(config);
}
