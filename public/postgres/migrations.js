/**
 * Database Migration System for MCP Server
 *
 * Handles safe schema evolution with rollback capabilities and version tracking.
 *
 * @format
 */
import { sql } from "@vercel/postgres";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode } from "../errors/error-codes.js";
/**
 * Migration registry - add new migrations here
 */
const migrations = [
    {
        version: 1,
        description: "Initial MCP analytics schema",
        up: (queries) => {
            queries.push(`
        -- Schema version table for migrations
        CREATE TABLE IF NOT EXISTS schema_versions (
            version INTEGER PRIMARY KEY,
            description TEXT NOT NULL,
            applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enhanced workflows table with analytics support
        CREATE TABLE IF NOT EXISTS mcp_workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            active BOOLEAN DEFAULT TRUE,
            nodes JSONB,
            connections JSONB,
            tags JSONB DEFAULT '[]',
            settings JSONB DEFAULT '{}',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_by TEXT,
            last_executed_at TIMESTAMP WITH TIME ZONE,
            execution_count INTEGER DEFAULT 0,
            average_execution_time INTEGER,
            success_rate DECIMAL(5,2),
            total_cpu_time INTEGER,
            total_memory_usage INTEGER,
            workflow_hash TEXT
        );

        -- Enhanced executions table with comprehensive tracking
        CREATE TABLE IF NOT EXISTS mcp_executions (
            id TEXT PRIMARY KEY,
            workflow_id TEXT REFERENCES mcp_workflows(id) ON DELETE CASCADE,
            status TEXT CHECK (status IN ('success', 'error', 'waiting', 'canceled')),
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            finished_at TIMESTAMP WITH TIME ZONE,
            duration INTEGER,
            error_message TEXT,
            error_details JSONB,
            node_results JSONB,
            execution_data JSONB,
            user_id TEXT,
            session_id TEXT,
            webhook_trigger BOOLEAN DEFAULT FALSE,
            webhook_data JSONB,
            cpu_usage INTEGER,
            memory_usage INTEGER,
            node_count INTEGER,
            api_calls_count INTEGER,
            data_processed_bytes INTEGER,
            input_size INTEGER,
            output_size INTEGER
        );

        -- User sessions for authentication and tracking
        CREATE TABLE IF NOT EXISTS mcp_user_sessions (
            session_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_agent TEXT,
            ip_address INET,
            location JSONB,
            session_data JSONB DEFAULT '{}',
            token_hash TEXT,
            expires_at TIMESTAMP WITH TIME ZONE,
            is_active BOOLEAN DEFAULT TRUE
        );

        -- User management table
        CREATE TABLE IF NOT EXISTS mcp_users (
            user_id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            username TEXT UNIQUE,
            display_name TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login TIMESTAMP WITH TIME ZONE,
            login_count INTEGER DEFAULT 0,
            preferences JSONB DEFAULT '{}',
            role TEXT CHECK (role IN ('admin', 'user', 'viewer')) DEFAULT 'user',
            is_active BOOLEAN DEFAULT TRUE,
            email_verified BOOLEAN DEFAULT FALSE,
            mfa_enabled BOOLEAN DEFAULT FALSE,
            password_hash TEXT,
            gdpr_consent_date TIMESTAMP WITH TIME ZONE,
            gdpr_consent_version TEXT,
            data_retention_period INTEGER
        );

        -- Indexes for performance optimization
        CREATE INDEX IF NOT EXISTS idx_executions_workflow_status ON mcp_executions(workflow_id, status);
        CREATE INDEX IF NOT EXISTS idx_executions_started_at ON mcp_executions(started_at DESC);
        CREATE INDEX IF NOT EXISTS idx_workflows_active_updated ON mcp_workflows(active, updated_at DESC);
        CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON mcp_user_sessions(user_id, is_active);
        CREATE INDEX IF NOT EXISTS idx_users_email ON mcp_users(email) WHERE email IS NOT NULL;

        -- Initial schema version
        INSERT INTO schema_versions (version, description) VALUES (1, 'Initial MCP analytics schema')
        ON CONFLICT (version) DO NOTHING;
      `);
        },
        down: (queries) => {
            queries.push(`
        DROP TABLE IF EXISTS schema_versions CASCADE;
        DROP TABLE IF EXISTS mcp_executions CASCADE;
        DROP TABLE IF EXISTS mcp_workflows CASCADE;
        DROP TABLE IF EXISTS mcp_user_sessions CASCADE;
        DROP TABLE IF EXISTS mcp_users CASCADE;
      `);
        },
    },
    {
        version: 2,
        description: "Add workflow analytics and advanced tracking",
        up: (queries) => {
            queries.push(`
        -- Workflow analytics cache table
        CREATE TABLE IF NOT EXISTS mcp_workflow_analytics (
            workflow_id TEXT PRIMARY KEY REFERENCES mcp_workflows(id) ON DELETE CASCADE,
            total_executions INTEGER DEFAULT 0,
            successful_executions INTEGER DEFAULT 0,
            failed_executions INTEGER DEFAULT 0,
            average_duration INTEGER,
            min_duration INTEGER,
            max_duration INTEGER,
            last_execution_date TIMESTAMP WITH TIME ZONE,
            execution_trend_24h INTEGER,
            execution_trend_7d INTEGER,
            execution_trend_30d INTEGER,
            error_rate_trend JSONB,
            performance_trend JSONB,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- User analytics table
        CREATE TABLE IF NOT EXISTS mcp_user_analytics (
            user_id TEXT PRIMARY KEY REFERENCES mcp_users(user_id) ON DELETE CASCADE,
            total_sessions INTEGER DEFAULT 0,
            total_executions INTEGER DEFAULT 0,
            workflows_created INTEGER DEFAULT 0,
            average_session_duration INTEGER,
            last_activity TIMESTAMP WITH TIME ZONE,
            preferred_workflow_types JSONB,
            activity_pattern JSONB,
            productivity_score INTEGER,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Update schema version
        INSERT INTO schema_versions (version, description) VALUES (2, 'Add workflow analytics and advanced tracking')
        ON CONFLICT (version) DO NOTHING;
      `);
        },
        down: (queries) => {
            queries.push(`
        DROP TABLE IF EXISTS mcp_workflow_analytics CASCADE;
        DROP TABLE IF EXISTS mcp_user_analytics CASCADE;
        DELETE FROM schema_versions WHERE version = 2;
      `);
        },
    },
    {
        version: 3,
        description: "Add performance monitoring and collaboration features",
        up: (queries) => {
            queries.push(`
        -- Performance metrics table
        CREATE TABLE IF NOT EXISTS mcp_performance_metrics (
            metric_id SERIAL PRIMARY KEY,
            workflow_id TEXT REFERENCES mcp_workflows(id) ON DELETE CASCADE,
            execution_id TEXT REFERENCES mcp_executions(id) ON DELETE CASCADE,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            metric_type TEXT CHECK (metric_type IN ('cpu', 'memory', 'network', 'disk', 'response_time')),
            metric_name TEXT,
            metric_value NUMERIC,
            unit TEXT,
            node_name TEXT,
            additional_data JSONB
        );

        -- Workflow templates table
        CREATE TABLE IF NOT EXISTS mcp_workflow_templates (
            template_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            category TEXT,
            tags JSONB DEFAULT '[]',
            template_data JSONB NOT NULL,
            is_public BOOLEAN DEFAULT FALSE,
            created_by TEXT REFERENCES mcp_users(user_id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            usage_count INTEGER DEFAULT 0,
            rating DECIMAL(3,2),
            version TEXT DEFAULT '1.0.0'
        );

        -- Templates indexes
        CREATE INDEX IF NOT EXISTS idx_templates_category_public ON mcp_workflow_templates(category, is_public);
        CREATE INDEX IF NOT EXISTS idx_performance_metrics_workflow_timestamp ON mcp_performance_metrics(workflow_id, timestamp DESC);

        -- Update schema version
        INSERT INTO schema_versions (version, description) VALUES (3, 'Add performance monitoring and collaboration features')
        ON CONFLICT (version) DO NOTHING;
      `);
        },
        down: (queries) => {
            queries.push(`
        DROP TABLE IF EXISTS mcp_performance_metrics CASCADE;
        DROP TABLE IF EXISTS mcp_workflow_templates CASCADE;
        DELETE FROM schema_versions WHERE version = 3;
      `);
        },
    },
    {
        version: 4,
        description: "Add audit logging and GDPR compliance",
        up: (queries) => {
            queries.push(`
        -- Execution logs for detailed audit trail
        CREATE TABLE IF NOT EXISTS mcp_execution_logs (
            log_id SERIAL PRIMARY KEY,
            execution_id TEXT REFERENCES mcp_executions(id) ON DELETE CASCADE,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            level TEXT CHECK (level IN ('debug', 'info', 'warning', 'error')),
            message TEXT,
            node_name TEXT,
            node_type TEXT,
            metadata JSONB,
            error_code TEXT,
            stack_trace TEXT
        );

        -- GDPR compliance updates for users table
        ALTER TABLE mcp_users ADD COLUMN IF NOT EXISTS gdpr_consent_date TIMESTAMP WITH TIME ZONE;
        ALTER TABLE mcp_users ADD COLUMN IF NOT EXISTS gdpr_consent_version TEXT;
        ALTER TABLE mcp_users ADD COLUMN IF NOT EXISTS data_retention_period INTEGER;

        -- Audit indexes
        CREATE INDEX IF NOT EXISTS idx_execution_logs_execution_timestamp ON mcp_execution_logs(execution_id, timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_execution_logs_level ON mcp_execution_logs(level);

        -- Update schema version
        INSERT INTO schema_versions (version, description) VALUES (4, 'Add audit logging and GDPR compliance')
        ON CONFLICT (version) DO NOTHING;
      `);
        },
        down: (queries) => {
            queries.push(`
        DROP TABLE IF EXISTS mcp_execution_logs CASCADE;
        ALTER TABLE mcp_users DROP COLUMN IF EXISTS gdpr_consent_date;
        ALTER TABLE mcp_users DROP COLUMN IF EXISTS gdpr_consent_version;
        ALTER TABLE mcp_users DROP COLUMN IF EXISTS data_retention_period;
        DELETE FROM schema_versions WHERE version = 4;
      `);
        },
    },
    {
        version: 5,
        description: "Add views and automated analytics triggers",
        up: (queries) => {
            queries.push(`
        -- Performance summary view
        CREATE OR REPLACE VIEW workflow_performance_summary AS
        SELECT
            w.id,
            w.name,
            COUNT(e.id) as total_executions,
            COUNT(CASE WHEN e.status = 'success' THEN 1 END) as successful_executions,
            COUNT(CASE WHEN e.status = 'error' THEN 1 END) as failed_executions,
            AVG(e.duration) as avg_duration,
            MIN(e.duration) as min_duration,
            MAX(e.duration) as max_duration,
            AVG(e.cpu_usage) as avg_cpu_usage,
            AVG(e.memory_usage) as avg_memory_usage,
            MAX(w.updated_at) as last_updated
        FROM mcp_workflows w
        LEFT JOIN mcp_executions e ON w.id = e.workflow_id
        WHERE w.active = true
        GROUP BY w.id, w.name;

        -- Automated analytics trigger
        CREATE OR REPLACE FUNCTION update_workflow_analytics() RETURNS TRIGGER AS $$
        BEGIN
            INSERT INTO mcp_workflow_analytics (workflow_id, updated_at)
            VALUES (NEW.workflow_id, NOW())
            ON CONFLICT (workflow_id) DO UPDATE SET
                total_executions = (
                    SELECT COUNT(*) FROM mcp_executions WHERE workflow_id = NEW.workflow_id
                ),
                successful_executions = (
                    SELECT COUNT(*) FROM mcp_executions
                    WHERE workflow_id = NEW.workflow_id AND status = 'success'
                ),
                failed_executions = (
                    SELECT COUNT(*) FROM mcp_executions
                    WHERE workflow_id = NEW.workflow_id AND status = 'error'
                ),
                last_execution_date = NEW.started_at,
                updated_at = NOW();

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Attach trigger
        DROP TRIGGER IF EXISTS trigger_update_workflow_analytics ON mcp_executions;
        CREATE TRIGGER trigger_update_workflow_analytics
            AFTER INSERT ON mcp_executions
            FOR EACH ROW EXECUTE FUNCTION update_workflow_analytics();

        -- Update schema version
        INSERT INTO schema_versions (version, description) VALUES (5, 'Add views and automated analytics triggers')
        ON CONFLICT (version) DO NOTHING;
      `);
        },
        down: (queries) => {
            queries.push(`
        DROP TRIGGER IF EXISTS trigger_update_workflow_analytics ON mcp_executions;
        DROP FUNCTION IF EXISTS update_workflow_analytics();
        DROP VIEW IF EXISTS workflow_performance_summary;
        DELETE FROM schema_versions WHERE version = 5;
      `);
        },
    },
];
/**
 * Get current schema version
 */
export async function getCurrentSchemaVersion() {
    try {
        const result = await sql `SELECT MAX(version) as version FROM schema_versions`;
        return result.rows[0]?.version || 0;
    }
    catch (error) {
        // If schema_versions table doesn't exist, assume version 0
        if (error instanceof Error &&
            error.message?.includes('relation "schema_versions" does not exist')) {
            return 0;
        }
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        throw new McpError(ErrorCode.InternalError, `Failed to get schema version: ${errorMessage}`);
    }
}
/**
 * Run pending migrations
 */
export async function runMigrations() {
    const currentVersion = await getCurrentSchemaVersion();
    console.log(`Current database schema version: ${currentVersion}`);
    for (const migration of migrations) {
        if (migration.version > currentVersion) {
            console.log(`Applying migration ${migration.version}: ${migration.description}`);
            try {
                const queries = [];
                migration.up(queries);
                // Execute all migration queries as a single batch
                if (queries.length > 0) {
                    // For Vercel Postgres, we need to execute queries individually
                    // as it doesn't support complex multi-statement queries
                    for (const sqlQuery of queries) {
                        if (sqlQuery.trim()) {
                            // @ts-expect-error - Dynamic SQL execution for migrations
                            await sql `${[sqlQuery]}`;
                        }
                    }
                }
                console.log(`Migration ${migration.version} applied successfully`);
            }
            catch (error) {
                console.error(`Migration ${migration.version} failed:`, error);
                // Try to rollback if rollback function exists
                try {
                    const rollbackQueries = [];
                    migration.down(rollbackQueries);
                    for (const sqlQuery of rollbackQueries) {
                        if (sqlQuery.trim()) {
                            // @ts-expect-error - Dynamic SQL execution for migrations
                            await sql `${[sqlQuery]}`;
                        }
                    }
                    console.log(`Migration ${migration.version} rolled back successfully`);
                }
                catch (rollbackError) {
                    console.error(`Migration ${migration.version} rollback failed:`, rollbackError);
                }
                throw new McpError(ErrorCode.InternalError, `Migration ${migration.version} failed and could not be rolled back: ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        }
    }
    console.log("All migrations completed successfully");
}
/**
 * Rollback to specific version
 */
export async function rollbackToVersion(targetVersion) {
    const currentVersion = await getCurrentSchemaVersion();
    if (targetVersion >= currentVersion) {
        console.log(`Target version ${targetVersion} is greater than or equal to current version ${currentVersion}. Nothing to rollback.`);
        return;
    }
    console.log(`Rolling back from version ${currentVersion} to ${targetVersion}`);
    // Find migrations to rollback in reverse order
    const migrationsToRollback = migrations
        .filter((m) => m.version > targetVersion && m.version <= currentVersion)
        .sort((a, b) => b.version - a.version);
    for (const migration of migrationsToRollback) {
        console.log(`Rolling back migration ${migration.version}: ${migration.description}`);
        try {
            const queries = [];
            migration.down(queries);
            for (const sqlQuery of queries) {
                if (sqlQuery.trim()) {
                    // @ts-expect-error - Dynamic SQL execution for migrations
                    await sql `${[sqlQuery]}`;
                }
            }
            console.log(`Migration ${migration.version} rolled back successfully`);
        }
        catch (error) {
            console.error(`Migration ${migration.version} rollback failed:`, error);
            throw new McpError(ErrorCode.InternalError, `Migration ${migration.version} rollback failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    console.log(`Rolled back to schema version ${targetVersion}`);
}
/**
 * Get migration status
 */
export async function getMigrationStatus() {
    const currentVersion = await getCurrentSchemaVersion();
    const availableVersions = migrations.map((m) => m.version);
    // Get applied versions (this is a simplified approach)
    const appliedVersions = availableVersions.filter((v) => v <= currentVersion);
    return {
        currentVersion,
        availableVersions,
        appliedVersions,
    };
}
/**
 * Force set schema version (dangerous - use with care)
 */
export async function forceSetSchemaVersion(version) {
    await sql `
    INSERT INTO schema_versions (version, description, applied_at)
    VALUES (${version}, 'Forced version update', NOW())
    ON CONFLICT (version) DO UPDATE SET
      applied_at = NOW(),
      description = 'Forced version update'`;
    console.log(`Schema version forcibly set to ${version}`);
}
//# sourceMappingURL=migrations.js.map