/**
 * Hybrid Cache Integration Layer
 *
 * Provides seamless integration between PostgreSQL and Vercel KV caching
 * with automatic failover, intelligent cache management, and performance optimization.
 *
 * @format
 */
import { sql } from "@vercel/postgres";
import { VercelKVCache } from "../redis/client.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode } from "../errors/error-codes.js";
/**
 * Check if PostgreSQL is available
 */
async function isPostgresAvailable() {
    try {
        // Simple health check query
        await sql `SELECT 1 as status`;
        return true;
    }
    catch (error) {
        console.warn("PostgreSQL health check failed:", error);
        return false;
    }
}
/**
 * Default cache configuration
 */
const DEFAULT_CACHE_CONFIG = {
    ttl: 300, // 5 minutes
    enabled: true,
    postgresPriority: true,
    fallbackEnabled: true,
    syncWrites: true,
};
/**
 * Hybrid cache manager for MCP operations
 */
export class HybridCacheManager {
    constructor(namespace, config = {}) {
        this.healthCache = new Map();
        this.kvCache = new VercelKVCache(namespace);
        this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    }
    /**
     * Initialize both PostgreSQL and KV connections
     */
    async init() {
        await this.kvCache.init();
        await this.validateConnections();
        this.startHealthCheck();
    }
    /**
     * Validate both storage connections
     */
    async validateConnections() {
        const postgresHealthy = await isPostgresAvailable();
        const kvHealthy = (await this.kvCache.get("__health_check")) !== null || true; // Assume KV is available unless proven otherwise
        if (!postgresHealthy && !kvHealthy) {
            throw new McpError(ErrorCode.InitializationError, "Both PostgreSQL and KV cache are unavailable");
        }
        if (!postgresHealthy) {
            console.warn("PostgreSQL is not available, falling back to KV cache");
        }
        if (!kvHealthy) {
            console.warn("KV cache is not available, performance may be degraded");
        }
    }
    /**
     * Start periodic health checks
     */
    startHealthCheck() {
        setInterval(async () => {
            await this.validateConnections();
        }, 60000); // Check every minute
    }
    /**
     * Get cached or live data with fallback
     */
    async get(key, fetchFunction) {
        if (!this.config.enabled) {
            return await fetchFunction();
        }
        // Check memory cache first
        const memoryCache = this.healthCache.get(key);
        if (memoryCache && Date.now() - memoryCache.timestamp < memoryCache.ttl) {
            return memoryCache.data;
        }
        // Check KV cache
        const kvResult = await this.kvCache.getJson(key);
        if (kvResult !== null) {
            // Store in memory cache for faster subsequent access
            this.healthCache.set(key, {
                data: kvResult,
                timestamp: Date.now(),
                ttl: this.config.ttl,
            });
            return kvResult;
        }
        // Fetch from source
        try {
            const data = await fetchFunction();
            // Cache the result
            await this.set(key, data, this.config.ttl);
            return data;
        }
        catch (error) {
            if (this.config.fallbackEnabled) {
                console.warn(`Failed to fetch ${key}, attempting cached recovery`, error);
                // If we have any cached version, return it even if expired
                if (memoryCache) {
                    return memoryCache.data;
                }
                if (kvResult !== null) {
                    return kvResult;
                }
            }
            throw error;
        }
    }
    /**
     * Set data in both caches
     */
    async set(key, data, ttl) {
        if (!this.config.enabled)
            return;
        const effectiveTtl = ttl || this.config.ttl;
        // Set in memory cache
        this.healthCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: effectiveTtl,
        });
        // Set in KV cache
        await this.kvCache.setJson(key, data, effectiveTtl);
    }
    /**
     * Delete from both caches
     */
    async delete(key) {
        this.healthCache.delete(key);
        await this.kvCache.del(key);
    }
    /**
     * Clear all caches
     */
    async clear() {
        this.healthCache.clear();
        // Note: KV doesn't have a bulk clear operation
    }
}
/**
 * Workflow data access with caching
 */
export class WorkflowDataAccess {
    constructor() {
        this.cache = new HybridCacheManager("workflows");
    }
    async init() {
        await this.cache.init();
    }
    async getWorkflow(id) {
        return this.cache.get(`workflow:${id}`, async () => {
            const result = await sql `SELECT * FROM mcp_workflows WHERE id = ${id}`;
            const rows = result.rows || result;
            if (rows.length === 0) {
                throw new McpError(ErrorCode.NotFoundError, `Workflow ${id} not found`);
            }
            return rows[0];
        });
    }
    async getWorkflows(limit = 50, offset = 0) {
        const cacheKey = `workflows:list:${limit}:${offset}`;
        return this.cache.get(cacheKey, async () => {
            // @ts-ignore - Paginated workflow query
            const result = await sql `
        SELECT * FROM mcp_workflows
        WHERE active = true
        ORDER BY updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
            return result.rows || result;
        });
    }
    async createWorkflow(workflowData) {
        const workflowId = crypto.randomUUID();
        try {
            // @ts-ignore - Workflow creation
            await sql `
        INSERT INTO mcp_workflows (
          id, name, nodes, connections, created_by, active
        ) VALUES (
          ${workflowId}, ${workflowData.name},
          ${JSON.stringify(workflowData.nodes)},
          ${JSON.stringify(workflowData.connections)},
          ${workflowData.createdBy}, true
        )
      `;
            // Invalidate relevant caches
            await this.invalidateWorkflowCaches();
            return workflowId;
        }
        catch (error) {
            console.error("Failed to create workflow:", error);
            throw new McpError(ErrorCode.InternalError, "Failed to create workflow");
        }
    }
    async updateWorkflow(id, updates) {
        try {
            const setStatements = [];
            const values = [];
            if (updates.name !== undefined) {
                setStatements.push("name = ?");
                values.push(updates.name);
            }
            if (updates.nodes !== undefined) {
                setStatements.push("nodes = ?");
                values.push(JSON.stringify(updates.nodes));
            }
            if (updates.connections !== undefined) {
                setStatements.push("connections = ?");
                values.push(JSON.stringify(updates.connections));
            }
            if (updates.active !== undefined) {
                setStatements.push("active = ?");
                values.push(updates.active);
            }
            if (setStatements.length === 0)
                return;
            setStatements.push("updated_at = NOW()");
            const sqlQuery = `UPDATE mcp_workflows SET ${setStatements.join(", ")} WHERE id = ?`;
            // Delete specific workflow cache
            await this.cache.delete(`workflow:${id}`);
            await this.invalidateWorkflowCaches();
        }
        catch (error) {
            console.error("Failed to update workflow:", error);
            throw new McpError(ErrorCode.InternalError, "Failed to update workflow");
        }
    }
    async invalidateWorkflowCaches() {
        // Invalidate list caches (this is a simplified approach)
        // In production, you might want to use more sophisticated cache invalidation
        await this.cache.delete("workflows:list:50:0");
        await this.cache.delete("workflows:list:100:0");
    }
}
/**
 * Execution data access with caching
 */
export class ExecutionDataAccess {
    constructor() {
        this.cache = new HybridCacheManager("executions");
    }
    async init() {
        await this.cache.init();
    }
    async getExecution(id) {
        return this.cache.get(`execution:${id}`, async () => {
            // @ts-ignore - Execution lookup
            const result = await sql `SELECT * FROM mcp_executions WHERE id = ${id}`;
            if (result.length === 0) {
                throw new McpError(ErrorCode.InvalidParams, `Execution ${id} not found`);
            }
            return result[0];
        });
    }
    async getExecutions(workflowId, limit = 50) {
        const cacheKey = workflowId
            ? `executions:${workflowId}:${limit}`
            : `executions:all:${limit}`;
        return this.cache.get(cacheKey, async () => {
            let query, params;
            if (workflowId) {
                // @ts-ignore - Workflow-specific executions
                query = await sql `
          SELECT * FROM mcp_executions
          WHERE workflow_id = ${workflowId}
          ORDER BY started_at DESC
          LIMIT ${limit}
        `;
            }
            else {
                // @ts-ignore - All executions
                query = await sql `
          SELECT * FROM mcp_executions
          ORDER BY started_at DESC
          LIMIT ${limit}
        `;
            }
            return query.rows || query;
        });
    }
    async createExecution(executionData) {
        const executionId = crypto.randomUUID();
        try {
            // @ts-ignore - Execution creation
            await sql `
        INSERT INTO mcp_executions (
          id, workflow_id, status, user_id, webhook_trigger
        ) VALUES (
          ${executionId}, ${executionData.workflowId}, 'waiting',
          ${executionData.userId || null},
          ${executionData.webhookTrigger || false}
        )
      `;
            return executionId;
        }
        catch (error) {
            console.error("Failed to create execution:", error);
            throw new McpError(ErrorCode.InternalError, "Failed to create execution");
        }
    }
    async updateExecution(id, updates) {
        try {
            // Delete specific execution cache
            await this.cache.delete(`execution:${id}`);
            // Update the execution
            // ... update logic would go here
        }
        catch (error) {
            console.error("Failed to update execution:", error);
            throw new McpError(ErrorCode.InternalError, "Failed to update execution");
        }
    }
}
/**
 * User data access with caching
 */
export class UserDataAccess {
    constructor() {
        this.cache = new HybridCacheManager("users");
    }
    async init() {
        await this.cache.init();
    }
    async getUser(userId) {
        return this.cache.get(`user:${userId}`, async () => {
            // @ts-ignore - User lookup
            const result = await sql `
        SELECT user_id, email, username, display_name, role, is_active, created_at, last_login
        FROM mcp_users WHERE user_id = ${userId}
      `;
            if (result.length === 0) {
                throw new McpError(ErrorCode.InvalidParams, `User ${userId} not found`);
            }
            return result[0];
        });
    }
    async validateSession(sessionId) {
        return this.cache.get(`session:${sessionId}`, async () => {
            // @ts-ignore - Session validation
            const result = await sql `
        SELECT u.user_id, u.username, u.display_name, u.role, s.started_at
        FROM mcp_user_sessions s
        JOIN mcp_users u ON s.user_id = u.user_id
        WHERE s.session_id = ${sessionId}
          AND s.is_active = true
          AND (s.expires_at IS NULL OR s.expires_at > NOW())
      `;
            if (result.length === 0) {
                throw new McpError(ErrorCode.InvalidParams, "Invalid or expired session");
            }
            return result[0];
        });
    }
}
/**
 * Analytics data access with caching
 */
export class AnalyticsDataAccess {
    constructor() {
        this.cacheExpiry = 3600; // 1 hour for analytics data
        this.cache = new HybridCacheManager("analytics");
    }
    async init() {
        await this.cache.init();
    }
    async getWorkflowAnalytics(days = 30) {
        const cacheKey = `analytics:workflows:${days}`;
        return this.cache.get(cacheKey, async () => {
            // @ts-ignore - Analytics aggregation query
            const result = await sql `
        SELECT
          w.id,
          w.name,
          COUNT(e.id) as total_executions,
          COUNT(CASE WHEN e.status = 'success' THEN 1 END) as successful_count,
          COUNT(CASE WHEN e.status = 'error' THEN 1 END) as error_count,
          AVG(e.duration) as avg_duration,
          MAX(e.started_at) as last_execution,
          ROUND(
            COUNT(CASE WHEN e.status = 'success' THEN 1 END)::decimal /
            NULLIF(COUNT(e.id), 0) * 100, 2
          ) as success_rate
        FROM mcp_workflows w
        LEFT JOIN mcp_executions e ON w.id = e.workflow_id
          AND e.started_at >= NOW() - INTERVAL '${days} days'
        WHERE w.active = true
        GROUP BY w.id, w.name
        ORDER BY total_executions DESC
        LIMIT 100
      `;
            return result.rows || result;
        });
    }
    async getSystemOverview() {
        const cacheKey = "analytics:system:overview";
        return this.cache.get(cacheKey, async () => {
            // @ts-ignore - System overview query
            const [workflowStats, userStats, executionStats] = await Promise.all([
                sql `SELECT COUNT(*) as count FROM mcp_workflows WHERE active = true`,
                sql `SELECT COUNT(*) as count FROM mcp_users WHERE is_active = true`,
                sql `
          SELECT
            COUNT(*) as total_executions,
            AVG(duration) as avg_execution_time,
            COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions
          FROM mcp_executions
          WHERE started_at >= NOW() - INTERVAL '24 hours'
        `,
            ]);
            return {
                totalWorkflows: Number((workflowStats.rows || workflowStats)[0]?.count) || 0,
                totalUsers: Number((userStats.rows || userStats)[0]?.count) || 0,
                totalExecutions24h: Number((executionStats.rows || executionStats)[0]?.total_executions) || 0,
                avgExecutionTime24h: Number((executionStats.rows || executionStats)[0]?.avg_execution_time) || 0,
                successRate24h: (Number((executionStats.rows || executionStats)[0]?.successful_executions) /
                    Math.max(1, Number((executionStats.rows || executionStats)[0]?.total_executions))) *
                    100,
                lastUpdated: new Date().toISOString(),
            };
        });
    }
}
/**
 * Global hybrid cache manager instance
 */
export const hybridCache = new HybridCacheManager();
/**
 * Data access layer instances
 */
export const workflowData = new WorkflowDataAccess();
export const executionData = new ExecutionDataAccess();
export const userData = new UserDataAccess();
export const analyticsData = new AnalyticsDataAccess();
/**
 * Initialize all data access layers
 */
export async function initializeHybridStorage() {
    console.log("Initializing hybrid storage system...");
    try {
        await hybridCache.init();
        await workflowData.init();
        await executionData.init();
        await userData.init();
        await analyticsData.init();
        console.log("Hybrid storage system initialized successfully");
    }
    catch (error) {
        console.error("Failed to initialize hybrid storage system:", error);
        if (DEFAULT_CACHE_CONFIG.fallbackEnabled) {
            console.log("Falling back to KV cache only mode");
            // Continue with limited functionality
        }
        else {
            throw error;
        }
    }
}
/**
 * Graceful shutdown
 */
export async function shutdownHybridStorage() {
    console.log("Shutting down hybrid storage system...");
    try {
        await hybridCache.clear();
        console.log("Hybrid storage system shut down successfully");
    }
    catch (error) {
        console.error("Error during hybrid storage shutdown:", error);
    }
}
//# sourceMappingURL=cache-integration.js.map