/**
 * Advanced Analytics Queries for MCP Server
 *
 * Provides complex database queries for workflow analytics, performance monitoring,
 * user behavior analysis, and system health metrics.
 *
 * @format
 */
/**
 * Workflow performance analytics interface
 */
export interface WorkflowPerformance {
    workflowId: string;
    name: string;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    avgCpuUsage: number;
    avgMemoryUsage: number;
    successRate: number;
    lastExecuted?: string;
}
/**
 * Execution trend interface
 */
export interface ExecutionTrend {
    period: string;
    executions: number;
    successes: number;
    failures: number;
    averageDuration: number;
    trendDirection: "up" | "down" | "stable";
}
/**
 * User activity interface
 */
export interface UserActivity {
    userId: string;
    username?: string;
    displayName?: string;
    totalSessions: number;
    totalExecutions: number;
    averageSessionDuration: number;
    lastActivity?: string;
    productivityScore: number;
    uniqueWorkflowsUsed: number;
}
/**
 * Get workflow performance summary
 */
export declare function getWorkflowPerformanceSummary(limit?: number, offset?: number): Promise<WorkflowPerformance[]>;
/**
 * Get execution trends for the last N days
 */
export declare function getExecutionTrends(days?: number, groupBy?: "hour" | "day" | "week"): Promise<ExecutionTrend[]>;
/**
 * Get user activity summary with productivity metrics
 */
export declare function getUserActivitySummary(days?: number, limit?: number): Promise<UserActivity[]>;
/**
 * Get performance metrics by workflow type
 */
export declare function getPerformanceMetricsByType(days?: number): Promise<Array<{
    metricType: string;
    workflowId: string;
    workflowName: string;
    avgValue: number;
    minValue: number;
    maxValue: number;
    sampleCount: number;
    trendChange: number;
}>>;
/**
 * Get error analysis for debugging and optimization
 */
export declare function getErrorAnalysis(days?: number, limit?: number): Promise<Array<{
    workflowId: string;
    workflowName: string;
    errorCount: number;
    mostCommonError: string;
    averageExecutionTime: number;
    errorRate: number;
    impactScore: number;
}>>;
/**
 * Get system health overview metrics
 */
export declare function getSystemHealthOverview(): Promise<{
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    totalUsers: number;
    activeUsers: number;
    averageExecutionTime: number;
    overallSuccessRate: number;
    uptimeHours: number;
    databaseSize: string;
    recentErrors: Array<{
        workflowName: string;
        errorMessage: string;
        timestamp: string;
    }>;
}>;
/**
 * Calculate productivity score for users based on usage patterns
 */
export declare function updateProductivityScores(): Promise<void>;
/**
 * Create materialized view refresh function for performance
 */
export declare function refreshAnalyticsViews(): Promise<void>;
