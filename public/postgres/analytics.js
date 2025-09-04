/**
 * Advanced Analytics Queries for MCP Server
 *
 * Provides complex database queries for workflow analytics, performance monitoring,
 * user behavior analysis, and system health metrics.
 *
 * @format
 */
import { sql } from "@vercel/postgres";
/**
 * Get workflow performance summary
 */
export async function getWorkflowPerformanceSummary(limit = 50, offset = 0) {
    const result = await sql `
    SELECT
      w.id as workflow_id,
      w.name,
      COUNT(e.id) as total_executions,
      COUNT(CASE WHEN e.status = 'success' THEN 1 END) as successful_executions,
      COUNT(CASE WHEN e.status = 'error' THEN 1 END) as failed_executions,
      AVG(e.duration) as avg_duration,
      MIN(e.duration) as min_duration,
      MAX(e.duration) as max_duration,
      AVG(e.cpu_usage) as avg_cpu_usage,
      AVG(e.memory_usage) as avg_memory_usage,
      ROUND(
        (COUNT(CASE WHEN e.status = 'success' THEN 1 END)::decimal /
         NULLIF(COUNT(e.id), 0)) * 100, 2
      ) as success_rate,
      w.last_executed_at as last_executed
    FROM mcp_workflows w
    LEFT JOIN mcp_executions e ON w.id = e.workflow_id
    WHERE w.active = true
    GROUP BY w.id, w.name, w.last_executed_at
    HAVING COUNT(e.id) > 0
    ORDER BY total_executions DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
    const rows = result.rows || result;
    return rows.map((row) => ({
        workflowId: row.workflow_id,
        name: row.name,
        totalExecutions: Number(row.total_executions) || 0,
        successfulExecutions: Number(row.successful_executions) || 0,
        failedExecutions: Number(row.failed_executions) || 0,
        averageDuration: Number(row.avg_duration) || 0,
        minDuration: Number(row.min_duration) || 0,
        maxDuration: Number(row.max_duration) || 0,
        avgCpuUsage: Number(row.avg_cpu_usage) || 0,
        avgMemoryUsage: Number(row.avg_memory_usage) || 0,
        successRate: Number(row.success_rate) || 0,
        lastExecuted: row.last_executed
            ? new Date(row.last_executed).toISOString()
            : undefined,
    }));
}
/**
 * Get execution trends for the last N days
 */
export async function getExecutionTrends(days = 30, groupBy = "day") {
    const dateFormat = {
        hour: "YYYY-MM-DD HH24:00:00",
        day: "YYYY-MM-DD",
        week: "YYYY-WW",
    };
    // @ts-ignore - Complex time-based analytics query
    const result = await sql `
    WITH execution_stats AS (
      SELECT
        DATE_TRUNC(${groupBy}, started_at) as period,
        COUNT(*) as executions,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successes,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as failures,
        AVG(duration) as avg_duration
      FROM mcp_executions
      WHERE started_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE_TRUNC(${groupBy}, started_at)
      ORDER BY period DESC
    ),
    trend_calc AS (
      SELECT
        period,
        executions,
        successes,
        failures,
        avg_duration,
        LAG(executions, 1) OVER (ORDER BY period) as prev_executions,
        ROW_NUMBER() OVER (ORDER BY period DESC) as rn
      FROM execution_stats
    )
    SELECT
      TO_CHAR(period, ${dateFormat[groupBy]}) as period,
      executions,
      successes,
      failures,
      COALESCE(avg_duration, 0) as avg_duration,
      CASE
        WHEN rn = 1 THEN 'stable'
        WHEN executions > prev_executions THEN 'up'
        WHEN executions < prev_executions THEN 'down'
        ELSE 'stable'
      END as trend_direction
    FROM trend_calc
    ORDER BY period DESC
  `;
    return result.map((row) => ({
        period: row.period,
        executions: Number(row.executions) || 0,
        successes: Number(row.successes) || 0,
        failures: Number(row.failures) || 0,
        averageDuration: Number(row.avg_duration) || 0,
        trendDirection: row.trend_direction,
    }));
}
/**
 * Get user activity summary with productivity metrics
 */
export async function getUserActivitySummary(days = 30, limit = 100) {
    // @ts-ignore - Complex user analytics query
    const result = await sql `
    SELECT
      u.user_id,
      u.username,
      u.display_name,
      COUNT(DISTINCT s.session_id) as total_sessions,
      COUNT(e.id) as total_executions,
      AVG(EXTRACT(epoch FROM (s.last_activity - s.started_at))) / 60 as avg_session_duration,
      MAX(COALESCE(s.last_activity, u.last_login)) as last_activity,
      COALESCE(ua.productivity_score, 0) as productivity_score,
      COUNT(DISTINCT e.workflow_id) as unique_workflows_used
    FROM mcp_users u
    LEFT JOIN mcp_user_sessions s ON u.user_id = s.user_id
      AND s.started_at >= NOW() - INTERVAL '${days} days'
    LEFT JOIN mcp_executions e ON u.user_id = e.user_id
      AND e.started_at >= NOW() - INTERVAL '${days} days'
    LEFT JOIN mcp_user_analytics ua ON u.user_id = ua.user_id
    WHERE u.is_active = true
    GROUP BY u.user_id, u.username, u.display_name, ua.productivity_score
    ORDER BY total_executions DESC, last_activity DESC
    LIMIT ${limit}
  `;
    return result.map((row) => ({
        userId: row.user_id,
        username: row.username,
        displayName: row.display_name,
        totalSessions: Number(row.total_sessions) || 0,
        totalExecutions: Number(row.total_executions) || 0,
        averageSessionDuration: Number(row.avg_session_duration) || 0,
        lastActivity: row.last_activity
            ? new Date(row.last_activity).toISOString()
            : undefined,
        productivityScore: Number(row.productivity_score) || 0,
        uniqueWorkflowsUsed: Number(row.unique_workflows_used) || 0,
    }));
}
/**
 * Get performance metrics by workflow type
 */
export async function getPerformanceMetricsByType(days = 7) {
    // @ts-ignore - Complex performance metrics query
    const result = await sql `
    WITH daily_metrics AS (
      SELECT
        metric_type,
        workflow_id,
        DATE_TRUNC('day', timestamp) as day,
        AVG(metric_value) as avg_value,
        COUNT(*) as samples
      FROM mcp_performance_metrics
      WHERE timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY metric_type, workflow_id, DATE_TRUNC('day', timestamp)
    ),
    trend_calc AS (
      SELECT
        dm.metric_type,
        dm.workflow_id,
        AVG(dm.avg_value) as current_avg,
        LAG(AVG(dm.avg_value)) OVER (
          PARTITION BY dm.metric_type, dm.workflow_id
          ORDER BY dm.day
        ) as prev_avg
      FROM daily_metrics dm
      GROUP BY dm.metric_type, dm.workflow_id
      HAVING COUNT(dm.day) >= 2
    )
    SELECT
      tc.metric_type,
      tc.workflow_id,
      w.name as workflow_name,
      tc.current_avg as avg_value,
      pm.min_value,
      pm.max_value,
      pm.sample_count,
      ROUND(
        ((tc.current_avg - tc.prev_avg) / NULLIF(tc.prev_avg, 0)) * 100, 2
      ) as trend_change
    FROM trend_calc tc
    JOIN mcp_workflows w ON tc.workflow_id = w.id
    JOIN (
      SELECT
        metric_type,
        workflow_id,
        MIN(metric_value) as min_value,
        MAX(metric_value) as max_value,
        COUNT(*) as sample_count
      FROM mcp_performance_metrics
      WHERE timestamp >= NOW() - INTERVAL '${days} days'
      GROUP BY metric_type, workflow_id
    ) pm ON tc.metric_type = pm.metric_type AND tc.workflow_id = pm.workflow_id
    ORDER BY tc.metric_type, tc.current_avg DESC
  `;
    return result.map((row) => ({
        metricType: row.metric_type,
        workflowId: row.workflow_id,
        workflowName: row.workflow_name,
        avgValue: Number(row.avg_value) || 0,
        minValue: Number(row.min_value) || 0,
        maxValue: Number(row.max_value) || 0,
        sampleCount: Number(row.sample_count) || 0,
        trendChange: Number(row.trend_change) || 0,
    }));
}
/**
 * Get error analysis for debugging and optimization
 */
export async function getErrorAnalysis(days = 7, limit = 50) {
    // @ts-ignore - Complex error analysis query
    const result = await sql `
    WITH error_stats AS (
      SELECT
        e.workflow_id,
        COUNT(*) as error_count,
        MODE() WITHIN GROUP (ORDER BY e.error_message) as most_common_error,
        AVG(e.duration) as avg_duration,
        COUNT(DISTINCT e.id) as total_affected_runs
      FROM mcp_executions e
      WHERE e.status = 'error'
        AND e.started_at >= NOW() - INTERVAL '${days} days'
      GROUP BY e.workflow_id
    ),
    workflow_context AS (
      SELECT
        w.id,
        w.name,
        COUNT(we.id) as total_executions
      FROM mcp_workflows w
      LEFT JOIN mcp_executions we ON w.id = we.workflow_id
        AND we.started_at >= NOW() - INTERVAL '${days} days'
      GROUP BY w.id, w.name
    )
    SELECT
      es.workflow_id,
      wc.name as workflow_name,
      es.error_count,
      es.most_common_error,
      es.avg_duration,
      ROUND((es.error_count::decimal / NULLIF(wc.total_executions, 0)) * 100, 2) as error_rate,
      ROUND((es.error_count * es.avg_duration / 3600000.0), 2) as impact_score_hours
    FROM error_stats es
    JOIN workflow_context wc ON es.workflow_id = wc.id
    WHERE wc.total_executions > 0
    ORDER BY impact_score_hours DESC
    LIMIT ${limit}
  `;
    return result.map((row) => ({
        workflowId: row.workflow_id,
        workflowName: row.workflow_name,
        errorCount: Number(row.error_count) || 0,
        mostCommonError: row.most_common_error || "Unknown error",
        averageExecutionTime: Number(row.avg_duration) || 0,
        errorRate: Number(row.error_rate) || 0,
        impactScore: Number(row.impact_score_hours) || 0,
    }));
}
/**
 * Get system health overview metrics
 */
export async function getSystemHealthOverview() {
    // @ts-ignore - Complex system health query
    const workflowStats = await sql `
    SELECT
      COUNT(DISTINCT w.id) as total_workflows,
      COUNT(DISTINCT CASE WHEN w.active THEN w.id END) as active_workflows
    FROM mcp_workflows w;
  `;
    // @ts-ignore
    const executionStats = await sql `
    SELECT
      COUNT(*) as total_executions,
      AVG(duration) as avg_execution_time,
      ROUND(
        (COUNT(CASE WHEN status = 'success' THEN 1 END)::decimal /
         NULLIF(COUNT(*), 0)) * 100, 2
      ) as success_rate
    FROM mcp_executions
    WHERE started_at >= NOW() - INTERVAL '24 hours';
  `;
    // @ts-ignore
    const userStats = await sql `
    SELECT
      COUNT(DISTINCT u.user_id) as total_users,
      COUNT(DISTINCT CASE WHEN u.is_active THEN u.user_id END) as active_users
    FROM mcp_users u;
  `;
    // @ts-ignore
    const errorStats = await sql `
    SELECT
      w.name as workflow_name,
      e.error_message,
      e.finished_at as timestamp
    FROM mcp_executions e
    JOIN mcp_workflows w ON e.workflow_id = w.id
    WHERE e.status = 'error'
      AND e.finished_at >= NOW() - INTERVAL '24 hours'
    ORDER BY e.finished_at DESC
    LIMIT 10;
  `;
    const recentErrors = errorStats.map((row) => ({
        workflowName: row.workflow_name,
        errorMessage: row.error_message || "Unknown error",
        timestamp: row.timestamp
            ? new Date(row.timestamp).toISOString()
            : new Date().toISOString(),
    }));
    const workflowRow = workflowStats.rows?.[0] || workflowStats[0] || {};
    const executionRow = executionStats.rows?.[0] || executionStats[0] || {};
    const userRow = userStats.rows?.[0] || userStats[0] || {};
    return {
        totalWorkflows: Number(workflowRow.total_workflows) || 0,
        activeWorkflows: Number(workflowRow.active_workflows) || 0,
        totalExecutions: Number(executionRow.total_executions) || 0,
        totalUsers: Number(userRow.total_users) || 0,
        activeUsers: Number(userRow.active_users) || 0,
        averageExecutionTime: Number(executionRow.avg_execution_time) || 0,
        overallSuccessRate: Number(executionRow.success_rate) || 0,
        uptimeHours: 24, // Simplified - could be calculated from reliable uptime data
        databaseSize: "unknown", // Would need separate query for PostgreSQL database size
        recentErrors,
    };
}
/**
 * Calculate productivity score for users based on usage patterns
 */
export async function updateProductivityScores() {
    await sql `
    WITH user_metrics AS (
      SELECT
        u.user_id,
        COUNT(e.id) as execution_count,
        AVG(EXTRACT(epoch FROM (s.started_at - s.last_activity))) / 60 as avg_session_minutes,
        COUNT(DISTINCT DATE_TRUNC('day', s.started_at)) as active_days_30d,
        COUNT(DISTINCT e.workflow_id) as unique_workflows,
        AVG(e.duration) as avg_execution_time
      FROM mcp_users u
      LEFT JOIN mcp_user_sessions s ON u.user_id = s.user_id
        AND s.started_at >= NOW() - INTERVAL '30 days'
      LEFT JOIN mcp_executions e ON u.user_id = e.user_id
        AND e.started_at >= NOW() - INTERVAL '30 days'
      WHERE u.is_active = true
      GROUP BY u.user_id
    ),
    productivity_calc AS (
      SELECT
        user_id,
        CASE
          WHEN execution_count = 0 THEN 0
          ELSE ROUND(
            LEAST(100,
              (
                (COALESCE(execution_count, 0) * 2) +
                (COALESCE(active_days_30d, 0) * 3) +
                (COALESCE(unique_workflows, 0) * 5) +
                (COALESCE(avg_session_minutes, 0) / 60 * 2)
              )
            )
          , 0)
        END as productivity_score
      FROM user_metrics
    )
    INSERT INTO mcp_user_analytics (user_id, productivity_score, updated_at)
    SELECT user_id, productivity_score, NOW()
    FROM productivity_calc
    ON CONFLICT (user_id) DO UPDATE SET
      productivity_score = EXCLUDED.productivity_score,
      updated_at = NOW();
  `;
}
/**
 * Create materialized view refresh function for performance
 */
export async function refreshAnalyticsViews() {
    await sql `
    REFRESH MATERIALIZED VIEW CONCURRENTLY workflow_performance_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_activity_summary;
  `;
}
//# sourceMappingURL=analytics.js.map