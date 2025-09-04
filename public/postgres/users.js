/**
 * User and Session Management for MCP Server
 *
 * Provides comprehensive user management, session tracking, authentication,
 * and GDPR-compliant user data handling.
 *
 * @format
 */
import { sql } from "@vercel/postgres";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode } from "../errors/error-codes.js";
/**
 * Create a new user
 */
export async function createUser(user) {
    const userId = crypto.randomUUID();
    // @ts-ignore - User creation query
    await sql `
    INSERT INTO mcp_users (
      user_id, email, username, display_name, role, is_active,
      email_verified, mfa_enabled, preferences, data_retention_period,
      gdpr_consent_date, gdpr_consent_version
    ) VALUES (
      ${userId}, ${user.email || null}, ${user.username || null},
      ${user.displayName || null}, ${user.role}, ${user.isActive},
      ${user.emailVerified}, ${user.mfaEnabled},
      ${JSON.stringify(user.preferences || {})}, ${user.dataRetentionPeriod || null},
      ${user.gdprConsentDate || null}, ${user.gdprConsentVersion || null}
    )
  `;
    return userId;
}
/**
 * Get user by ID
 */
export async function getUserById(userId) {
    // @ts-ignore - User lookup query
    const result = await sql `
    SELECT * FROM mcp_users WHERE user_id = ${userId}
  `;
    if (result.rows.length === 0)
        return null;
    const row = result.rows[0];
    return {
        userId: row.user_id,
        email: row.email,
        username: row.username,
        displayName: row.display_name,
        role: row.role,
        isActive: row.is_active,
        emailVerified: row.email_verified,
        mfaEnabled: row.mfa_enabled,
        createdAt: row.created_at.toISOString(),
        lastLogin: row.last_login?.toISOString(),
        loginCount: Number(row.login_count),
        preferences: row.preferences || {},
        dataRetentionPeriod: row.data_retention_period,
        gdprConsentDate: row.gdpr_consent_date?.toISOString(),
        gdprConsentVersion: row.gdpr_consent_version,
    };
}
/**
 * Get user by email or username
 */
export async function getUserByCredentials(identifier) {
    // @ts-ignore - User lookup by credentials
    const result = await sql `
    SELECT * FROM mcp_users
    WHERE (email = ${identifier} OR username = ${identifier}) AND is_active = true
  `;
    if (result.rows.length === 0)
        return null;
    const row = result.rows[0];
    return {
        userId: row.user_id,
        email: row.email,
        username: row.username,
        displayName: row.display_name,
        role: row.role,
        isActive: row.is_active,
        emailVerified: row.email_verified,
        mfaEnabled: row.mfa_enabled,
        createdAt: row.created_at.toISOString(),
        lastLogin: row.last_login?.toISOString(),
        loginCount: Number(row.login_count),
        preferences: row.preferences || {},
        dataRetentionPeriod: row.data_retention_period,
        gdprConsentDate: row.gdpr_consent_date?.toISOString(),
        gdprConsentVersion: row.gdpr_consent_version,
    };
}
/**
 * Update user information
 */
export async function updateUser(userId, updates) {
    const setStatements = [];
    const values = [];
    if (updates.email !== undefined) {
        setStatements.push("email = ?");
        values.push(updates.email);
    }
    if (updates.username !== undefined) {
        setStatements.push("username = ?");
        values.push(updates.username);
    }
    if (updates.displayName !== undefined) {
        setStatements.push("display_name = ?");
        values.push(updates.displayName);
    }
    if (updates.role !== undefined) {
        setStatements.push("role = ?");
        values.push(updates.role);
    }
    if (updates.isActive !== undefined) {
        setStatements.push("is_active = ?");
        values.push(updates.isActive);
    }
    if (updates.emailVerified !== undefined) {
        setStatements.push("email_verified = ?");
        values.push(updates.emailVerified);
    }
    if (updates.mfaEnabled !== undefined) {
        setStatements.push("mfa_enabled = ?");
        values.push(updates.mfaEnabled);
    }
    if (updates.preferences !== undefined) {
        setStatements.push("preferences = ?");
        values.push(JSON.stringify(updates.preferences));
    }
    if (updates.dataRetentionPeriod !== undefined) {
        setStatements.push("data_retention_period = ?");
        values.push(updates.dataRetentionPeriod);
    }
    if (updates.gdprConsentDate !== undefined) {
        setStatements.push("gdpr_consent_date = ?");
        values.push(updates.gdprConsentDate ? new Date(updates.gdprConsentDate) : null);
    }
    if (updates.gdprConsentVersion !== undefined) {
        setStatements.push("gdpr_consent_version = ?");
        values.push(updates.gdprConsentVersion);
    }
    if (setStatements.length === 0)
        return;
    setStatements.push("updated_at = NOW()");
    const sqlQuery = `
    UPDATE mcp_users
    SET ${setStatements.join(", ")}
    WHERE user_id = ?
  `;
    // @ts-ignore - Dynamic user update query
    await sql.unsafe(sqlQuery.replace(/\?/g, (match, offset) => `$${values.splice(0, 1)[0] !== undefined ? values.length : offset + 1}`), [...values, userId]);
}
/**
 * Delete user (GDPR compliance)
 */
export async function deleteUser(userId, hardDelete = false) {
    if (hardDelete) {
        // Complete data removal
        // @ts-ignore - User deletion queries
        await sql `DELETE FROM mcp_user_sessions WHERE user_id = ${userId}`;
        await sql `DELETE FROM mcp_executions WHERE user_id = ${userId}`;
        await sql `DELETE FROM mcp_users WHERE user_id = ${userId}`;
    }
    else {
        // Soft delete by anonymizing and deactivating
        const anonymousId = `deleted_${crypto.randomUUID()}`;
        // @ts-ignore - User anonymization update
        await sql `
      UPDATE mcp_users
      SET email = NULL,
          username = ${anonymousId},
          display_name = 'Deleted User',
          password_hash = NULL,
          is_active = false,
          preferences = '{}',
          updated_at = NOW()
      WHERE user_id = ${userId}
    `;
    }
}
/**
 * Record user login
 */
export async function recordLogin(userId, ipAddress, userAgent) {
    // @ts-ignore - Login recording update
    await sql `
    UPDATE mcp_users
    SET last_login = NOW(),
        login_count = login_count + 1
    WHERE user_id = ${userId}
  `;
    // Log location data if IP is provided (would need IP geolocation service)
    if (ipAddress) {
        console.log(`User ${userId} logged in from ${ipAddress}`);
    }
}
/**
 * Create a new session
 */
export async function createSession(userId, options = {}) {
    const sessionId = crypto.randomUUID();
    // @ts-ignore - Session creation query
    await sql `
    INSERT INTO mcp_user_sessions (
      session_id, user_id, user_agent, ip_address, location,
      token_hash, expires_at
    ) VALUES (
      ${sessionId}, ${userId}, ${options.userAgent || null},
      ${options.ipAddress || null},
      ${options.location ? JSON.stringify(options.location) : null},
      ${options.tokenHash || null},
      ${options.expiresAt ? new Date(options.expiresAt).toISOString() : null}
    )
  `;
    return sessionId;
}
/**
 * Get active session
 */
export async function getActiveSession(sessionId) {
    // @ts-ignore - Session lookup query
    const result = await sql `
    SELECT * FROM mcp_user_sessions
    WHERE session_id = ${sessionId} AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
  `;
    if (result.rows.length === 0)
        return null;
    const row = result.rows[0];
    return {
        sessionId: row.session_id,
        userId: row.user_id,
        startedAt: row.started_at.toISOString(),
        lastActivity: row.last_activity.toISOString(),
        userAgent: row.user_agent,
        ipAddress: row.ip_address,
        location: row.location,
        tokenHash: row.token_hash,
        expiresAt: row.expires_at?.toISOString(),
        isActive: row.is_active,
    };
}
/**
 * Update session activity
 */
export async function updateSessionActivity(sessionId) {
    // @ts-ignore - Session activity update
    await sql `
    UPDATE mcp_user_sessions
    SET last_activity = NOW()
    WHERE session_id = ${sessionId} AND is_active = true
  `;
}
/**
 * Expire session
 */
export async function expireSession(sessionId) {
    // @ts-ignore - Session expiration update
    await sql `
    UPDATE mcp_user_sessions
    SET is_active = false, expires_at = NOW()
    WHERE session_id = ${sessionId}
  `;
}
/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
    // @ts-ignore - Session cleanup query
    const result = await sql `
    UPDATE mcp_user_sessions
    SET is_active = false
    WHERE is_active = true AND expires_at <= NOW()
  `;
    return result.rowCount || 0;
}
/**
 * Get user's active sessions
 */
export async function getUserActiveSessions(userId) {
    // @ts-ignore - User sessions lookup
    const result = await sql `
    SELECT * FROM mcp_user_sessions
    WHERE user_id = ${userId} AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
    ORDER BY started_at DESC
  `;
    return result.rows.map((row) => ({
        sessionId: row.session_id,
        userId: row.user_id,
        startedAt: row.started_at.toISOString(),
        lastActivity: row.last_activity.toISOString(),
        userAgent: row.user_agent,
        ipAddress: row.ip_address,
        location: row.location,
        tokenHash: row.token_hash,
        expiresAt: row.expires_at?.toISOString(),
        isActive: row.is_active,
    }));
}
/**
 * Validate user authentication
 */
export async function authenticateUser(identifier, passwordHash) {
    // @ts-ignore - User authentication query
    const result = await sql `
    SELECT *,
           CASE WHEN password_hash IS NOT NULL AND password_hash = ${passwordHash}
                THEN true ELSE false END as password_valid
    FROM mcp_users
    WHERE (email = ${identifier} OR username = ${identifier})
      AND is_active = true
  `;
    if (result.rows.length === 0 || !result.rows[0].password_valid)
        return null;
    const row = result.rows[0];
    // Record successful login
    await recordLogin(row.user_id);
    return {
        userId: row.user_id,
        email: row.email,
        username: row.username,
        displayName: row.display_name,
        role: row.role,
        isActive: row.is_active,
        emailVerified: row.email_verified,
        mfaEnabled: row.mfa_enabled,
        createdAt: row.created_at.toISOString(),
        lastLogin: row.last_login?.toISOString(),
        loginCount: Number(row.login_count),
        preferences: row.preferences || {},
        dataRetentionPeriod: row.data_retention_period,
        gdprConsentDate: row.gdpr_consent_date?.toISOString(),
        gdprConsentVersion: row.gdpr_consent_version,
    };
}
/**
 * Check if user has permission for an action
 */
export async function checkUserPermission(userId, requiredRole) {
    const user = await getUserById(userId);
    if (!user || !user.isActive)
        return false;
    const roleHierarchy = { viewer: 1, user: 2, admin: 3 };
    const userLevel = roleHierarchy[user.role] ?? 0;
    const requiredLevel = roleHierarchy[requiredRole] ?? 0;
    return userLevel >= requiredLevel;
}
/**
 * Get user analytics
 */
export async function getUserAnalytics(userId, days = 30) {
    // @ts-ignore - User analytics aggregation query
    const result = await sql `
    WITH session_stats AS (
      SELECT
        COUNT(*) as total_sessions,
        AVG(EXTRACT(epoch FROM (last_activity - started_at))) / 60 as avg_session_minutes,
        MAX(last_activity) as last_activity
      FROM mcp_user_sessions
      WHERE user_id = ${userId}
        AND started_at >= NOW() - INTERVAL '${days} days'
    ),
    execution_stats AS (
      SELECT
        COUNT(*) as total_executions,
        COUNT(DISTINCT workflow_id) as unique_workflows_used
      FROM mcp_executions
      WHERE user_id = ${userId}
        AND started_at >= NOW() - INTERVAL '${days} days'
    ),
    workflow_stats AS (
      SELECT COUNT(*) as workflows_created
      FROM mcp_workflows
      WHERE created_by = ${userId}
    )
    SELECT
      s.total_sessions,
      e.total_executions,
      s.avg_session_minutes,
      s.last_activity,
      w.workflows_created,
      e.unique_workflows_used
    FROM session_stats s, execution_stats e, workflow_stats w
  `;
    if (result.rows.length === 0) {
        return {
            totalSessions: 0,
            totalExecutions: 0,
            averageSessionDuration: 0,
            lastActivity: new Date().toISOString(),
            workflowsCreated: 0,
            uniqueWorkflowsUsed: 0,
        };
    }
    const row = result.rows[0];
    return {
        totalSessions: Number(row.total_sessions) || 0,
        totalExecutions: Number(row.total_executions) || 0,
        averageSessionDuration: Number(row.avg_session_minutes) || 0,
        lastActivity: row.last_activity?.toISOString() || new Date().toISOString(),
        workflowsCreated: Number(row.workflows_created) || 0,
        uniqueWorkflowsUsed: Number(row.unique_workflows_used) || 0,
    };
}
/**
 * GDPR: Export user data
 */
export async function exportUserData(userId) {
    const user = await getUserById(userId);
    if (!user) {
        throw new McpError(ErrorCode.InvalidRequest, "User not found");
    }
    const sessions = await getUserActiveSessions(userId);
    // @ts-ignore - User executions export query
    const executionsResult = await sql `
    SELECT id, status, started_at as timestamp
    FROM mcp_executions
    WHERE user_id = ${userId}
    ORDER BY started_at DESC
    LIMIT 1000
  `;
    const executions = executionsResult.rows.map((row) => ({
        id: row.id,
        status: row.status,
        timestamp: row.timestamp.toISOString(),
    }));
    return {
        user,
        sessions,
        executions,
        preferences: user.preferences,
    };
}
/**
 * GDPR: Delete user data based on retention policy
 */
export async function enforceDataRetention() {
    const deletedCount = { sessions: 0, executions: 0 };
    // Clean up sessions older than retention period
    // @ts-ignore - Data retention cleanup for sessions
    const sessionResult = await sql `
    UPDATE mcp_user_sessions
    SET is_active = false
    WHERE started_at < NOW() - INTERVAL '30 days'
      AND is_active = true
  `;
    deletedCount.sessions = sessionResult.rowCount || 0;
    // Clean up executions for users with data retention policies
    // @ts-ignore - Data retention cleanup for executions
    const executionResult = await sql `
    DELETE FROM mcp_executions
    WHERE user_id IN (
      SELECT user_id FROM mcp_users
      WHERE data_retention_period IS NOT NULL
        AND created_at < NOW() - INTERVAL '1 day' * data_retention_period
    )
    AND started_at < NOW() - INTERVAL '365 days' -- fallback 1 year
  `;
    deletedCount.executions = executionResult.rowCount || 0;
    return deletedCount.sessions + deletedCount.executions;
}
//# sourceMappingURL=users.js.map