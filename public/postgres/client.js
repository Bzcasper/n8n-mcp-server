/**
 * PostgreSQL Client Setup for Vercel Integration
 *
 * Provides PostgreSQL client initialization using Vercel's Postgres integration
 * with connection management, and graceful fallback when PostgreSQL is unavailable.
 *
 * @format
 */
import { sql } from "@vercel/postgres";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode } from "../errors/error-codes.js";
/**
 * Simple query function using template literals (recommended for Vercel Postgres)
 */
export async function query(strings, ...values) {
    try {
        // @ts-expect-error - Vercel Postgres has complex types
        const result = await sql(strings, values);
        return result.rows || result;
    }
    catch (error) {
        console.error("PostgreSQL query error:", error);
        throw new McpError(ErrorCode.InternalError, `PostgreSQL query failed: ${error.message || "Unknown error"}`);
    }
}
/**
 * Execute a transaction with multiple queries
 */
export async function executeTransaction(queries, config = { timeout: 10000, maxConnections: 5 }) {
    if (!config.url) {
        throw new McpError(ErrorCode.InternalError, "PostgreSQL is not configured");
    }
    // Execute queries sequentially (simplified transaction)
    const results = [];
    try {
        // @ts-ignore - Vercel Postgres transaction handling
        await sql.begin(async (tx) => {
            for (const { query, params = [] } of queries) {
                const result = await tx.unsafe(query, params);
                results.push(result);
            }
        });
        return results;
    }
    catch (error) {
        console.error("PostgreSQL transaction error:", error);
        throw new McpError(ErrorCode.InternalError, `PostgreSQL transaction failed: ${error.message || "Unknown error"}`);
    }
}
/**
 * Health check for PostgreSQL connection
 */
export async function healthCheck(config) {
    if (!config.url) {
        return { status: "not_configured" };
    }
    const startTime = Date.now();
    try {
        await sql `SELECT 1 as status`;
        const latency = Date.now() - startTime;
        return { status: "healthy", latency };
    }
    catch (error) {
        return { status: "unhealthy" };
    }
}
/**
 * Gracefully close PostgreSQL connections (for cleanup in environments that need it)
 */
export async function closeConnection() {
    try {
        await sql.end();
    }
    catch (error) {
        console.warn("Error closing PostgreSQL connections:", error);
    }
}
//# sourceMappingURL=client.js.map