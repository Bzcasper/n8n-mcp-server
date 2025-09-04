/**
 * PostgreSQL Client Setup for Vercel Integration
 *
 * Provides PostgreSQL client initialization using Vercel's Postgres integration
 * with connection management, and graceful fallback when PostgreSQL is unavailable.
 *
 * @format
 */
/**
 * Interface for PostgreSQL connection configuration
 */
export interface PostgresConfig {
    url?: string;
    timeout: number;
    maxConnections: number;
}
/**
 * Simple query function using template literals (recommended for Vercel Postgres)
 */
export declare function query(strings: TemplateStringsArray, ...values: any[]): Promise<any[]>;
/**
 * Execute a transaction with multiple queries
 */
export declare function executeTransaction(queries: Array<{
    query: string;
    params?: any[];
}>, config?: PostgresConfig): Promise<any[]>;
/**
 * Health check for PostgreSQL connection
 */
export declare function healthCheck(config: PostgresConfig): Promise<{
    status: string;
    latency?: number;
}>;
/**
 * Gracefully close PostgreSQL connections (for cleanup in environments that need it)
 */
export declare function closeConnection(): Promise<void>;
