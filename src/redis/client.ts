/**
 * Redis Client Setup for Vercel Integration
 *
 * Provides Redis client initialization using Vercel's KV integration
 * with connection management and graceful fallback when Redis is unavailable.
 *
 * @format
 */

import kv from "@vercel/kv";

// Extended type declarations for Vercel KV
declare module "@vercel/kv" {
  interface Kv {
    ping(): Promise<string>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: { ex?: number }): Promise<string>;
    del(key: string): Promise<number>;
  }
}

/**
 * Get KV client instance
 * Returns the global kv instance if available
 */
export async function getKVClient() {
  if (!kv) {
    console.warn("Vercel KV is not available, caching will be disabled");
    return null;
  }

  try {
    // Test if KV is working
    await (kv as any).ping();
    console.log("Vercel KV client is available");
    return kv;
  } catch (error) {
    console.warn("Vercel KV connection failed:", error);
    return null;
  }
}

/**
 * Check if KV is available
 */
export async function isKVAvailable(): Promise<boolean> {
  const client = await getKVClient();
  return client !== null;
}
/**
 * Cache operations with fallback to no-op if KV unavailable
 */
export class VercelKVCache {
  private client: typeof kv | null;

  constructor(private namespace = "") {
    this.client = null;
  }

  private get typedClient() {
    return this.client as any; // TypeScript workaround for KV methods
  }

  async init() {
    this.client = await getKVClient();
    return this;
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      const fullKey = this.namespace ? `${this.namespace}:${key}` : key;
      return await this.typedClient.get(fullKey);
    } catch (error) {
      console.error("KV GET error:", error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.client) return false;
    try {
      const fullKey = this.namespace ? `${this.namespace}:${key}` : key;
      if (ttl) {
        await this.typedClient.set(fullKey, value, { ex: ttl });
      } else {
        await this.typedClient.set(fullKey, value);
      }
      return true;
    } catch (error) {
      console.error("KV SET error:", error);
      return false;
    }
  }

  async setJson(key: string, value: any, ttl?: number): Promise<boolean> {
    if (!this.client) return false;
    try {
      const fullKey = this.namespace ? `${this.namespace}:${key}` : key;
      if (ttl) {
        await this.typedClient.set(fullKey, JSON.stringify(value), { ex: ttl });
      } else {
        await this.typedClient.set(fullKey, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      console.error("KV SET JSON error:", error);
      return false;
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    if (!this.client) return null;
    try {
      const fullKey = this.namespace ? `${this.namespace}:${key}` : key;
      const value = await this.typedClient.get(fullKey);
      if (value && typeof value === "string") {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      console.error("KV GET JSON error:", error);
      return null;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.client) return false;
    try {
      const fullKey = this.namespace ? `${this.namespace}:${key}` : key;
      await this.typedClient.del(fullKey);
      return true;
    } catch (error) {
      console.error("KV DEL error:", error);
      return false;
    }
  }
}

/**
 * Backwards compatible functions
 */
export async function getRedisClient() {
  return getKVClient();
}

export async function isRedisAvailable() {
  return isKVAvailable();
}

export const RedisCache = VercelKVCache;
