/**
 * User and Session Management for MCP Server
 *
 * Provides comprehensive user management, session tracking, authentication,
 * and GDPR-compliant user data handling.
 *
 * @format
 */

import { sql } from "@vercel/postgres";
import { query as _query } from "./client.js";
import { McpError } from "@modelcontextprotocol/sdk/types.js";
import { ErrorCode } from "../errors/error-codes.js";

/**
 * User interface for MCP users
 */
export interface MCPUser {
  userId: string;
  email?: string;
  username?: string;
  displayName?: string;
  role: "admin" | "user" | "viewer";
  isActive: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  lastLogin?: string;
  loginCount: number;
  preferences: Record<string, any>;
  dataRetentionPeriod?: number;
  gdprConsentDate?: string;
  gdprConsentVersion?: string;
}

/**
 * Session interface for user sessions
 */
export interface UserSession {
  sessionId: string;
  userId: string;
  startedAt: string;
  lastActivity: string;
  _userAgent?: string;
  ipAddress?: string;
  location?: Record<string, any>;
  tokenHash?: string;
  expiresAt?: string;
  isActive: boolean;
}

/**
 * Create a new user
 */
export async function createUser(
  user: Omit<MCPUser, "userId" | "createdAt" | "loginCount">
): Promise<string> {
  const userId = crypto.randomUUID();

  // @ts-expect-error - User creation query
  await sql`
    INSERT INTO mcp_users (
      user_id, email, username, display_name, role, is_active,
      email_verified, mfa_enabled, preferences, data_retention_period,
      gdpr_consent_date, gdpr_consent_version
    ) VALUES (
      ${userId}, ${user.email || null}, ${user.username || null},
      ${user.displayName || null}, ${user.role}, ${user.isActive},
      ${user.emailVerified}, ${user.mfaEnabled},
      ${JSON.stringify(user.preferences || {})}, ${
    user.dataRetentionPeriod || null
  },
      ${user.gdprConsentDate || null}, ${user.gdprConsentVersion || null}
    )
  `;

  return userId;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<MCPUser | null> {
  // @ts-expect-error - User lookup query
  const result = await sql`
    SELECT * FROM mcp_users WHERE user_id = ${userId}
  `;

  if (result.rows.length === 0) return null;

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
export async function getUserByCredentials(
  identifier: string
): Promise<MCPUser | null> {
  // @ts-expect-error - User lookup by credentials
  const result = await sql`
    SELECT * FROM mcp_users
    WHERE (email = ${identifier} OR username = ${identifier}) AND is_active = true
  `;

  if (result.rows.length === 0) return null;

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
export async function updateUser(
  userId: string,
  updates: Partial<MCPUser>
): Promise<void> {
  const setStatements = [];
  const values: (string | number | boolean | null | Date)[] = [];

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
    values.push(
      updates.gdprConsentDate ? new Date(updates.gdprConsentDate) : null
    );
  }
  if (updates.gdprConsentVersion !== undefined) {
    setStatements.push("gdpr_consent_version = ?");
    values.push(updates.gdprConsentVersion);
  }

  if (setStatements.length === 0) return;

  setStatements.push("updated_at = NOW()");

  const sqlQuery = `
    UPDATE mcp_users
    SET ${setStatements.join(", ")}
    WHERE user_id = ?
  `;

  // @ts-expect-error - Dynamic user update query
  await sql.unsafe(
    sqlQuery.replace(
      /\?/g,
      (match, offset) =>
        `$${values.splice(0, 1)[0] !== undefined ? values.length : offset + 1}`
    ),
    [...values, userId]
  );
}

/**
 * Delete user (GDPR compliance)
 */
export async function deleteUser(
  userId: string,
  hardDelete: boolean = false
): Promise<void> {
  if (hardDelete) {
    // Complete data removal
    // @ts-expect-error - User deletion queries
    await sql`DELETE FROM mcp_user_sessions WHERE user_id = ${userId}`;
    await sql`DELETE FROM mcp_executions WHERE user_id = ${userId}`;
    await sql`DELETE FROM mcp_users WHERE user_id = ${userId}`;
  } else {
    // Soft delete by anonymizing and deactivating
    const anonymousId = `deleted_${crypto.randomUUID()}`;
    // @ts-expect-error - User anonymization update
    await sql`
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
export async function recordLogin(
  userId: string,
  ipAddress?: string,
  _userAgent?: string
): Promise<void> {
  // @ts-expect-error - Login recording update
  await sql`
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
export async function createSession(
  userId: string,
  options: {
    _userAgent?: string;
    ipAddress?: string;
    location?: Record<string, any>;
    tokenHash?: string;
    expiresAt?: Date;
  } = {}
): Promise<string> {
  const sessionId = crypto.randomUUID();

  // @ts-expect-error - Session creation query
  await sql`
    INSERT INTO mcp_user_sessions (
      session_id, user_id, user_agent, ip_address, location,
      token_hash, expires_at
    ) VALUES (
      ${sessionId}, ${userId}, ${options._userAgent || null},
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
export async function getActiveSession(
  sessionId: string
): Promise<UserSession | null> {
  // @ts-expect-error - Session lookup query
  const result = await sql`
    SELECT * FROM mcp_user_sessions
    WHERE session_id = ${sessionId} AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
  `;

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    startedAt: row.started_at.toISOString(),
    lastActivity: row.last_activity.toISOString(),
    _userAgent: row.user_agent,
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
export async function updateSessionActivity(sessionId: string): Promise<void> {
  // @ts-expect-error - Session activity update
  await sql`
    UPDATE mcp_user_sessions
    SET last_activity = NOW()
    WHERE session_id = ${sessionId} AND is_active = true
  `;
}

/**
 * Expire session
 */
export async function expireSession(sessionId: string): Promise<void> {
  // @ts-expect-error - Session expiration update
  await sql`
    UPDATE mcp_user_sessions
    SET is_active = false, expires_at = NOW()
    WHERE session_id = ${sessionId}
  `;
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  // @ts-expect-error - Session cleanup query
  const result = await sql`
    UPDATE mcp_user_sessions
    SET is_active = false
    WHERE is_active = true AND expires_at <= NOW()
  `;

  return result.rowCount || 0;
}

/**
 * Get user's active sessions
 */
export async function getUserActiveSessions(
  userId: string
): Promise<UserSession[]> {
  // @ts-expect-error - User sessions lookup
  const result = await sql`
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
    _userAgent: row.user_agent,
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
export async function authenticateUser(
  identifier: string,
  passwordHash: string
): Promise<MCPUser | null> {
  // @ts-expect-error - User authentication query
  const result = await sql`
    SELECT *,
           CASE WHEN password_hash IS NOT NULL AND password_hash = ${passwordHash}
                THEN true ELSE false END as password_valid
    FROM mcp_users
    WHERE (email = ${identifier} OR username = ${identifier})
      AND is_active = true
  `;

  if (result.rows.length === 0 || !result.rows[0].password_valid) return null;

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
export async function checkUserPermission(
  userId: string,
  requiredRole: string
): Promise<boolean> {
  const user = await getUserById(userId);
  if (!user || !user.isActive) return false;

  const roleHierarchy = { viewer: 1, user: 2, admin: 3 } as const;
  const userLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] ?? 0;
  const requiredLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 0;

  return userLevel >= requiredLevel;
}

/**
 * Get user analytics
 */
export async function getUserAnalytics(
  userId: string,
  days: number = 30
): Promise<{
  totalSessions: number;
  totalExecutions: number;
  averageSessionDuration: number;
  lastActivity: string;
  workflowsCreated: number;
  uniqueWorkflowsUsed: number;
}> {
  // @ts-expect-error - User analytics aggregation query
  const result = await sql`
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
export async function exportUserData(userId: string): Promise<{
  user: MCPUser;
  sessions: UserSession[];
  executions: Array<{ id: string; status: string; timestamp: string }>;
  preferences: Record<string, any>;
}> {
  const user = await getUserById(userId);
  if (!user) {
    throw new McpError(ErrorCode.InvalidRequest, "User not found");
  }

  const sessions = await getUserActiveSessions(userId);

  // @ts-expect-error - User executions export query
  const executionsResult = await sql`
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
export async function enforceDataRetention(): Promise<number> {
  const deletedCount = { sessions: 0, executions: 0 };

  // Clean up sessions older than retention period
  // @ts-expect-error - Data retention cleanup for sessions
  const sessionResult = await sql`
    UPDATE mcp_user_sessions
    SET is_active = false
    WHERE started_at < NOW() - INTERVAL '30 days'
      AND is_active = true
  `;
  deletedCount.sessions = sessionResult.rowCount || 0;

  // Clean up executions for users with data retention policies
  // @ts-expect-error - Data retention cleanup for executions
  const executionResult = await sql`
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
