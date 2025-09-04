/**
 * Error Codes Module
 *
 * This module defines error codes used throughout the application.
 * These codes are compatible with the MCP SDK error handling system.
 */
// Numeric error codes for McpError
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["InitializationError"] = 1000] = "InitializationError";
    ErrorCode[ErrorCode["AuthenticationError"] = 1001] = "AuthenticationError";
    ErrorCode[ErrorCode["NotFoundError"] = 1002] = "NotFoundError";
    ErrorCode[ErrorCode["InvalidRequest"] = 1003] = "InvalidRequest";
    ErrorCode[ErrorCode["InternalError"] = 1004] = "InternalError";
    ErrorCode[ErrorCode["NotImplemented"] = 1005] = "NotImplemented";
})(ErrorCode || (ErrorCode = {}));
//# sourceMappingURL=error-codes.js.map