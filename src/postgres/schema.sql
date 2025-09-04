-- Database schema for n8n MCP Server Analytics
-- Optimized for serverless PostgreSQL with proper indexing and relationships

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
    average_execution_time INTEGER, -- in milliseconds
    success_rate DECIMAL(5,2), -- success rate as percentage
    total_cpu_time INTEGER,
    total_memory_usage INTEGER,
    workflow_hash TEXT -- for detecting changes
);

-- Enhanced executions table with comprehensive tracking
CREATE TABLE IF NOT EXISTS mcp_executions (
    id TEXT PRIMARY KEY,
    workflow_id TEXT REFERENCES mcp_workflows(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('success', 'error', 'waiting', 'canceled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    finished_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- duration in milliseconds
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
    password_hash TEXT, -- nullable for SSO users
    gdpr_consent_date TIMESTAMP WITH TIME ZONE,
    gdpr_consent_version TEXT,
    data_retention_period INTEGER -- in days
);

-- Workflow analytics cache table for faster queries
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
    error_rate_trend JSONB, -- last 30 days error rates
    performance_trend JSONB, -- last 30 days duration averages
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User analytics table
CREATE TABLE IF NOT EXISTS mcp_user_analytics (
    user_id TEXT PRIMARY KEY REFERENCES mcp_users(user_id) ON DELETE CASCADE,
    total_sessions INTEGER DEFAULT 0,
    total_executions INTEGER DEFAULT 0,
    workflows_created INTEGER DEFAULT 0,
    average_session_duration INTEGER, -- in minutes
    last_activity TIMESTAMP WITH TIME ZONE,
    preferred_workflow_types JSONB, -- most used workflow categories
    activity_pattern JSONB, -- hourly/daily activity patterns
    productivity_score INTEGER, -- 0-100 scale based on usage patterns
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Workflow templates table for sharing and standardization
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

-- Collaborative features table
CREATE TABLE IF NOT EXISTS mcp_workflow_collaborators (
    collaboration_id SERIAL PRIMARY KEY,
    workflow_id TEXT REFERENCES mcp_workflows(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES mcp_users(user_id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('owner', 'editor', 'viewer')),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    can_edit BOOLEAN DEFAULT TRUE,
    can_execute BOOLEAN DEFAULT TRUE,
    can_invite BOOLEAN DEFAULT FALSE,
    UNIQUE(workflow_id, user_id)
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_executions_workflow_status ON mcp_executions(workflow_id, status);
CREATE INDEX IF NOT EXISTS idx_executions_started_at ON mcp_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_finished_at ON mcp_executions(finished_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_duration ON mcp_executions(duration);
CREATE INDEX IF NOT EXISTS idx_executions_user ON mcp_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_active_updated ON mcp_workflows(active, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_tags ON mcp_workflows USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_workflow_analytics_updated ON mcp_workflow_analytics(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON mcp_user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON mcp_user_sessions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email ON mcp_users(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_active ON mcp_users(role, is_active);
CREATE INDEX IF NOT EXISTS idx_execution_logs_execution_timestamp ON mcp_execution_logs(execution_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_execution_logs_level ON mcp_execution_logs(level);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_workflow_timestamp ON mcp_performance_metrics(workflow_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON mcp_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_templates_category_public ON mcp_workflow_templates(category, is_public);
CREATE INDEX IF NOT EXISTS idx_templates_created_by ON mcp_workflow_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_collaborators_workflow ON mcp_workflow_collaborators(workflow_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_user ON mcp_workflow_collaborators(user_id);

-- Create views for common analytics queries
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

-- Execute workflow statistics view
CREATE OR REPLACE VIEW execution_stats AS
SELECT
    workflow_id,
    status,
    COUNT(*) as count,
    AVG(duration) as avg_duration,
    MIN(duration) as min_duration,
    MAX(duration) as max_duration,
    COUNT(DISTINCT user_id) as unique_users,
    DATE_TRUNC('hour', started_at) as hour_bucket
FROM mcp_executions
WHERE started_at >= NOW() - INTERVAL '30 days'
GROUP BY workflow_id, status, DATE_TRUNC('hour', started_at);

-- User activity summary view
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT
    u.user_id,
    u.username,
    u.display_name,
    ua.total_sessions,
    ua.total_executions,
    ua.average_session_duration,
    ua.last_activity,
    ua.productivity_score,
    COUNT(DISTINCT wa.workflow_id) as unique_workflows_used
FROM mcp_users u
LEFT JOIN mcp_user_analytics ua ON u.user_id = ua.user_id
LEFT JOIN mcp_workflows wa ON wa.created_by = u.user_id
WHERE u.is_active = true
GROUP BY u.user_id, u.username, u.display_name, ua.total_sessions, ua.total_executions,
         ua.average_session_duration, ua.last_activity, ua.productivity_score;

-- Create trigger to update workflow analytics on execution
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
        average_duration = (
            SELECT AVG(duration) FROM mcp_executions
            WHERE workflow_id = NEW.workflow_id AND duration IS NOT NULL
        ),
        min_duration = (
            SELECT MIN(duration) FROM mcp_executions
            WHERE workflow_id = NEW.workflow_id AND duration IS NOT NULL
        ),
        max_duration = (
            SELECT MAX(duration) FROM mcp_executions
            WHERE workflow_id = NEW.workflow_id AND duration IS NOT NULL
        ),
        last_execution_date = NEW.started_at,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to executions table
DROP TRIGGER IF EXISTS trigger_update_workflow_analytics ON mcp_executions;
CREATE TRIGGER trigger_update_workflow_analytics
    AFTER INSERT OR UPDATE ON mcp_executions
    FOR EACH ROW EXECUTE FUNCTION update_workflow_analytics();

-- Trigger to update workflow timestamp on execution
CREATE OR REPLACE FUNCTION update_workflow_timestamp() RETURNS TRIGGER AS $$
BEGIN
    UPDATE mcp_workflows
    SET last_executed_at = NEW.started_at,
        execution_count = COALESCE(execution_count, 0) + 1,
        updated_at = NOW()
    WHERE id = NEW.workflow_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to executions table
DROP TRIGGER IF EXISTS trigger_update_workflow_timestamp ON mcp_executions;
CREATE TRIGGER trigger_update_workflow_timestamp
    AFTER INSERT ON mcp_executions
    FOR EACH ROW EXECUTE FUNCTION update_workflow_timestamp();

-- Initial schema version
INSERT INTO schema_versions (version, description) VALUES (1, 'Initial MCP analytics schema')
ON CONFLICT (version) DO NOTHING;