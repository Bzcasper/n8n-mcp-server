/**
 * User and Session Management for MCP Server
 *
 * Provides comprehensive user management, session tracking, authentication,
 * and GDPR-compliant user data handling.
 *
 * @format
 */
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
    userAgent?: string;
    ipAddress?: string;
    location?: Record<string, any>;
    tokenHash?: string;
    expiresAt?: string;
    isActive: boolean;
}
/**
 * Create a new user
 */
export declare function createUser(user: Omit<MCPUser, "userId" | "createdAt" | "loginCount">): Promise<string>;
/**
 * Get user by ID
 */
export declare function getUserById(userId: string): Promise<MCPUser | null>;
/**
 * Get user by email or username
 */
export declare function getUserByCredentials(identifier: string): Promise<MCPUser | null>;
/**
 * Update user information
 */
export declare function updateUser(userId: string, updates: Partial<MCPUser>): Promise<void>;
/**
 * Delete user (GDPR compliance)
 */
export declare function deleteUser(userId: string, hardDelete?: boolean): Promise<void>;
/**
 * Record user login
 */
export declare function recordLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void>;
/**
 * Create a new session
 */
export declare function createSession(userId: string, options?: {
    userAgent?: string;
    ipAddress?: string;
    location?: Record<string, any>;
    tokenHash?: string;
    expiresAt?: Date;
}): Promise<string>;
/**
 * Get active session
 */
export declare function getActiveSession(sessionId: string): Promise<UserSession | null>;
/**
 * Update session activity
 */
export declare function updateSessionActivity(sessionId: string): Promise<void>;
/**
 * Expire session
 */
export declare function expireSession(sessionId: string): Promise<void>;
/**
 * Clean up expired sessions
 */
export declare function cleanupExpiredSessions(): Promise<number>;
/**
 * Get user's active sessions
 */
export declare function getUserActiveSessions(userId: string): Promise<UserSession[]>;
/**
 * Validate user authentication
 */
export declare function authenticateUser(identifier: string, passwordHash: string): Promise<MCPUser | null>;
/**
 * Check if user has permission for an action
 */
export declare function checkUserPermission(userId: string, requiredRole: string): Promise<boolean>;
/**
 * Get user analytics
 */
export declare function getUserAnalytics(userId: string, days?: number): Promise<{
    totalSessions: number;
    totalExecutions: number;
    averageSessionDuration: number;
    lastActivity: string;
    workflowsCreated: number;
    uniqueWorkflowsUsed: number;
}>;
/**
 * GDPR: Export user data
 */
export declare function exportUserData(userId: string): Promise<{
    user: MCPUser;
    sessions: UserSession[];
    executions: Array<{
        id: string;
        status: string;
        timestamp: string;
    }>;
    preferences: Record<string, any>;
}>;
/**
 * GDPR: Delete user data based on retention policy
 */
export declare function enforceDataRetention(): Promise<number>;
