/**
 * Database Migration System for MCP Server
 *
 * Handles safe schema evolution with rollback capabilities and version tracking.
 *
 * @format
 */
/**
 * Migration definition interface
 */
export interface Migration {
    version: number;
    description: string;
    up: (queries: string[]) => void;
    down: (queries: string[]) => void;
}
/**
 * Get current schema version
 */
export declare function getCurrentSchemaVersion(): Promise<number>;
/**
 * Run pending migrations
 */
export declare function runMigrations(): Promise<void>;
/**
 * Rollback to specific version
 */
export declare function rollbackToVersion(targetVersion: number): Promise<void>;
/**
 * Get migration status
 */
export declare function getMigrationStatus(): Promise<{
    currentVersion: number;
    availableVersions: number[];
    appliedVersions: number[];
}>;
/**
 * Force set schema version (dangerous - use with care)
 */
export declare function forceSetSchemaVersion(version: number): Promise<void>;
