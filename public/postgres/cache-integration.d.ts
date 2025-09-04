/**
 * Hybrid Cache Integration Layer
 *
 * Provides seamless integration between PostgreSQL and Vercel KV caching
 * with automatic failover, intelligent cache management, and performance optimization.
 *
 * @format
 */
/**
 * Cache configuration interface
 */
export interface CacheConfig {
    ttl: number;
    enabled: boolean;
    postgresPriority: boolean;
    fallbackEnabled: boolean;
    syncWrites: boolean;
}
/**
 * Hybrid cache manager for MCP operations
 */
export declare class HybridCacheManager {
    private kvCache;
    private config;
    private healthCache;
    constructor(namespace?: string, config?: Partial<CacheConfig>);
    /**
     * Initialize both PostgreSQL and KV connections
     */
    init(): Promise<void>;
    /**
     * Validate both storage connections
     */
    private validateConnections;
    /**
     * Start periodic health checks
     */
    private startHealthCheck;
    /**
     * Get cached or live data with fallback
     */
    get<T>(key: string, fetchFunction: () => Promise<T>): Promise<T>;
    /**
     * Set data in both caches
     */
    set(key: string, data: any, ttl?: number): Promise<void>;
    /**
     * Delete from both caches
     */
    delete(key: string): Promise<void>;
    /**
     * Clear all caches
     */
    clear(): Promise<void>;
}
/**
 * Workflow data access with caching
 */
export declare class WorkflowDataAccess {
    private cache;
    constructor();
    init(): Promise<void>;
    getWorkflow(id: string): Promise<any>;
    getWorkflows(limit?: number, offset?: number): Promise<any[]>;
    createWorkflow(workflowData: any): Promise<string>;
    updateWorkflow(id: string, updates: any): Promise<void>;
    private invalidateWorkflowCaches;
}
/**
 * Execution data access with caching
 */
export declare class ExecutionDataAccess {
    private cache;
    constructor();
    init(): Promise<void>;
    getExecution(id: string): Promise<any>;
    getExecutions(workflowId?: string, limit?: number): Promise<any[]>;
    createExecution(executionData: any): Promise<string>;
    updateExecution(id: string, updates: any): Promise<void>;
}
/**
 * User data access with caching
 */
export declare class UserDataAccess {
    private cache;
    constructor();
    init(): Promise<void>;
    getUser(userId: string): Promise<any>;
    validateSession(sessionId: string): Promise<any>;
}
/**
 * Analytics data access with caching
 */
export declare class AnalyticsDataAccess {
    private cache;
    private cacheExpiry;
    constructor();
    init(): Promise<void>;
    getWorkflowAnalytics(days?: number): Promise<any[]>;
    getSystemOverview(): Promise<any>;
}
/**
 * Global hybrid cache manager instance
 */
export declare const hybridCache: HybridCacheManager;
/**
 * Data access layer instances
 */
export declare const workflowData: WorkflowDataAccess;
export declare const executionData: ExecutionDataAccess;
export declare const userData: UserDataAccess;
export declare const analyticsData: AnalyticsDataAccess;
/**
 * Initialize all data access layers
 */
export declare function initializeHybridStorage(): Promise<void>;
/**
 * Graceful shutdown
 */
export declare function shutdownHybridStorage(): Promise<void>;
