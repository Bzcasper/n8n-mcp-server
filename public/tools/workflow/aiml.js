/**
 * AI/ML Workflow Tools
 *
 * This module provides tools for AI/ML workflow operations in n8n.
 *
 * @format
 */
import { BaseWorkflowToolHandler } from "./base-handler.js";
/**
 * Handler for AI/ML workflow operations
 */
export class AIMLWorkflowHandler extends BaseWorkflowToolHandler {
    /**
     * Create a batch ML training workflow
     */
    async execute(args) {
        return this.handleExecution(async () => {
            const { name, modelType, datasetUrl, parameters, gpuEnabled, batchSize, epochs, } = args;
            // Create a comprehensive ML training workflow
            const mlWorkflow = {
                name: `${name}-ml-training-${Date.now()}`,
                nodes: [
                    // Data input node
                    {
                        parameters: { url: datasetUrl },
                        name: "Data Input",
                        type: "n8n-nodes-base.httpRequest",
                        typeVersion: 1,
                        position: [240, 300],
                    },
                    // Data preprocessing node
                    {
                        parameters: {
                            mode: "splitInBatches",
                            batchSize: batchSize || 32,
                            options: {},
                        },
                        name: "Split Dataset",
                        type: "n8n-nodes-base.splitInBatches",
                        typeVersion: 1,
                        position: [500, 300],
                    },
                    // ML model training node
                    {
                        parameters: {
                            model: modelType,
                            parameters: parameters || {},
                            ...(gpuEnabled && { gpuEnabled }),
                        },
                        name: "ML Training",
                        type: "n8n-nodes-base.mlTrain",
                        typeVersion: 1,
                        position: [760, 300],
                    },
                    // Model evaluation node
                    {
                        parameters: {
                            epochs: epochs || 10,
                            metrics: ["accuracy", "loss", "precision", "recall"],
                        },
                        name: "Model Evaluation",
                        type: "n8n-nodes-base.mlEvaluate",
                        typeVersion: 1,
                        position: [1020, 300],
                    },
                ],
                connections: {
                    "Data Input": {
                        main: [[{ node: "Split Dataset", type: "main", index: 0 }]],
                    },
                    "Split Dataset": {
                        main: [[{ node: "ML Training", type: "main", index: 0 }]],
                    },
                    "ML Training": {
                        main: [[{ node: "Model Evaluation", type: "main", index: 0 }]],
                    },
                },
                active: false,
                settings: {
                    executionOrder: "v1",
                },
            };
            const createdWorkflow = await this.apiService.createWorkflow(mlWorkflow);
            return this.formatSuccess({
                id: createdWorkflow.id,
                name: createdWorkflow.name,
                modelType,
                status: "created",
                nodes: mlWorkflow.nodes.length,
            }, `Successfully created AI/ML workflow "${createdWorkflow.name}" with ${mlWorkflow.nodes.length} nodes`);
        }, args);
    }
}
/**
 * Create a data processing and transformation workflow
 */
export class DataProcessingHandler extends BaseWorkflowToolHandler {
    /**
     * Create a data transformation pipeline workflow
     */
    async execute(args) {
        return this.handleExecution(async () => {
            const { name, sourceType, targetFormat, transformations, validationRules, outputDestination, } = args;
            // Create data processing workflow
            const dataWorkflow = {
                name: `${name}-data-processing-${Date.now()}`,
                nodes: [
                    // Data source node
                    {
                        parameters: {
                            operation: "download",
                            ...(sourceType === "s3" && { bucket: args.bucket }),
                        },
                        name: "Data Source",
                        type: "n8n-nodes-base.awsS3",
                        typeVersion: 1,
                        position: [240, 300],
                    },
                    // Data transformation node
                    {
                        parameters: {
                            transformations: transformations || [],
                            validationRules: validationRules || [],
                        },
                        name: "Data Transform",
                        type: "n8n-nodes-base.dataTransform",
                        typeVersion: 1,
                        position: [500, 300],
                    },
                    // Format conversion node
                    {
                        parameters: {
                            format: targetFormat,
                            options: {},
                        },
                        name: "Format Conversion",
                        type: "n8n-nodes-base.formatData",
                        typeVersion: 1,
                        position: [760, 300],
                    },
                    // Output destination node
                    {
                        parameters: {
                            ...(outputDestination === "s3" && {
                                operation: "upload",
                                bucket: args.outputBucket,
                            }),
                        },
                        name: "Output Destination",
                        type: "n8n-nodes-base.awsS3",
                        typeVersion: 1,
                        position: [1020, 300],
                    },
                ],
                connections: {
                    "Data Source": {
                        main: [[{ node: "Data Transform", type: "main", index: 0 }]],
                    },
                    "Data Transform": {
                        main: [[{ node: "Format Conversion", type: "main", index: 0 }]],
                    },
                    "Format Conversion": {
                        main: [[{ node: "Output Destination", type: "main", index: 0 }]],
                    },
                },
                active: false,
                settings: {
                    executionOrder: "v1",
                },
            };
            const createdWorkflow = await this.apiService.createWorkflow(dataWorkflow);
            return this.formatSuccess({
                id: createdWorkflow.id,
                name: createdWorkflow.name,
                sourceType,
                targetFormat,
                nodes: dataWorkflow.nodes.length,
            }, `Successfully created data processing workflow "${createdWorkflow.name}" with ${dataWorkflow.nodes.length} nodes`);
        }, args);
    }
}
/**
 * Get tool definition for AI/ML workflow creation
 */
export function getCreateAIMLWorkflowToolDefinition() {
    return {
        name: "n8n-workflow-create-aiml",
        description: "Create a comprehensive AI/ML training workflow with data processing, model training, and evaluation",
        inputSchema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Base name for the ML workflow",
                },
                modelType: {
                    type: "string",
                    description: "ML model type (tensorflow, pytorch, sklearn, etc.)",
                },
                datasetUrl: {
                    type: "string",
                    description: "URL or path to training dataset",
                },
                parameters: {
                    type: "object",
                    description: "Model hyperparameters",
                },
                gpuEnabled: {
                    type: "boolean",
                    description: "Enable GPU acceleration",
                    default: false,
                },
                batchSize: {
                    type: "integer",
                    description: "Training batch size",
                    default: 32,
                },
                epochs: {
                    type: "integer",
                    description: "Number of training epochs",
                    default: 10,
                },
            },
            required: ["name", "modelType", "datasetUrl"],
        },
    };
}
/**
 * Get tool definition for data processing workflow creation
 */
export function getCreateDataProcessingWorkflowToolDefinition() {
    return {
        name: "n8n-workflow-create-data-processing",
        description: "Create a data processing and transformation pipeline workflow",
        inputSchema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    description: "Base name for the data processing workflow",
                },
                sourceType: {
                    type: "string",
                    description: "Data source type (s3, database, api, file)",
                },
                targetFormat: {
                    type: "string",
                    description: "Target output format (json, csv, parquet, etc.)",
                },
                transformations: {
                    type: "array",
                    description: "Array of transformation operations",
                    items: {
                        type: "object",
                    },
                },
                validationRules: {
                    type: "array",
                    description: "Data validation rules",
                    items: {
                        type: "object",
                    },
                },
                outputDestination: {
                    type: "string",
                    description: "Output destination (s3, database, file)",
                },
                bucket: {
                    type: "string",
                    description: "S3 bucket name for data source",
                },
                outputBucket: {
                    type: "string",
                    description: "S3 bucket name for data output",
                },
            },
            required: ["name", "sourceType", "targetFormat"],
        },
    };
}
//# sourceMappingURL=aiml.js.map