/**
 * Execution Formatter Utilities
 *
 * This module provides utility functions for formatting execution data
 * in a consistent, user-friendly manner.
 */
import { Execution } from '../types/index.js';
/**
 * Format basic execution information for display
 *
 * @param execution Execution object
 * @returns Formatted execution summary
 */
export declare function formatExecutionSummary(execution: Execution): Record<string, any>;
/**
 * Format detailed execution information including node results
 *
 * @param execution Execution object
 * @returns Formatted execution details
 */
export declare function formatExecutionDetails(execution: Execution): Record<string, any>;
/**
 * Get appropriate status indicator emoji based on execution status
 *
 * @param status Execution status string
 * @returns Status indicator emoji
 */
export declare function getStatusIndicator(status: string): string;
/**
 * Summarize execution results for more compact display
 *
 * @param executions Array of execution objects
 * @param limit Maximum number of executions to include
 * @returns Summary of execution results
 */
export declare function summarizeExecutions(executions: Execution[], limit?: number): Record<string, any>;
