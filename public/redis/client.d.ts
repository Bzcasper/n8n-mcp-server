/**
 * Redis Client Setup for Vercel Integration
 *
 * Provides Redis client initialization using Vercel's KV integration
 * with connection management and graceful fallback when Redis is unavailable.
 *
 * @format
 */
declare module "@vercel/kv" {
    interface Kv {
        ping(): Promise<string>;
        get(key: string): Promise<string | null>;
        set(key: string, value: string, options?: {
            ex?: number;
        }): Promise<string>;
        del(key: string): Promise<number>;
    }
}
/**
 * Get KV client instance
 * Returns the global kv instance if available
 */
export declare function getKVClient(): Promise<import("@vercel/kv").VercelKV | null>;
/**
 * Check if KV is available
 */
export declare function isKVAvailable(): Promise<boolean>;
/**
 * Cache operations with fallback to no-op if KV unavailable
 */
export declare class VercelKVCache {
    private namespace;
    private client;
    constructor(namespace?: string);
    private get typedClient();
    init(): Promise<this>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<boolean>;
    setJson(key: string, value: any, ttl?: number): Promise<boolean>;
    getJson<T>(key: string): Promise<T | null>;
    del(key: string): Promise<boolean>;
}
/**
 * Backwards compatible functions
 */
export declare function getRedisClient(): Promise<import("@vercel/kv").VercelKV | null>;
export declare function isRedisAvailable(): Promise<boolean>;
export declare const RedisCache: typeof VercelKVCache;
