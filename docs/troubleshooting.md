---
title: "Troubleshooting Guide for n8n MCP Server"
description: "Comprehensive troubleshooting guide covering common issues, diagnostic tools, debugging techniques, error resolution, and preventive maintenance for n8n MCP Server."
keywords:
  - "troubleshooting guide"
  - "error diagnostics"
  - "debugging techniques"
  - "problem resolution"
  - "maintenance"
  - "issue resolution"
last_updated: "2024-09-04"
difficulty: "Intermediate"
time_to_read: "20 minutes"
seo:
  meta_title: "Troubleshooting Guide | n8n MCP Server Issues & Solutions"
  meta_description: "Complete troubleshooting guide for n8n MCP Server. Learn to diagnose, debug, and resolve common issues with step-by-step solutions and diagnostic tools."
  og_type: "article"
  og_image: "/docs/images/troubleshooting.png"
  twitter_card: "summary_large_image"
  structured_data_type: "Guide"
---

<!-- @format -->

# 🔧 Troubleshooting Guide

This comprehensive troubleshooting guide helps you diagnose, debug, and resolve common issues with n8n MCP Server. Whether you're encountering connection problems, authentication failures, or performance bottlenecks, this guide provides systematic approaches to identify and fix them.

## 🩺 Diagnostic Tools

### System Health Check

```bash
#!/bin/bash
# health-check.sh - Comprehensive system diagnostics

echo "=== n8n MCP Server Health Check ==="
echo "Timestamp: $(date)"
echo ""

echo "🔍 Process Status:"
if pgrep -f "n8n-mcp-server" > /dev/null; then
    echo "✅ n8n-mcp-server process is running"
    ps aux | grep -v grep | grep n8n-mcp-server
else
    echo "❌ n8n-mcp-server process is not running"
fi
echo ""

echo "🌐 Network Connectivity:"
# Test n8n API connectivity
if curl -f -s "$N8N_API_URL/api/v1/workflows" \
   -H "X-N8n-Api-Key: $N8N_API_KEY" > /dev/null; then
    echo "✅ n8n API is accessible"
else
    echo "❌ n8n API is not accessible"
    curl -v "$N8N_API_URL/api/v1/workflows" \
     -H "X-N8n-Api-Key: $N8N_API_KEY" 2>&1 | head -10
fi
echo ""

echo "🗄️ Database/Runtime Check:"
# Check Redis connectivity
if [ -n "$REDIS_URL" ]; then
    redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Redis is accessible"
    else
        echo "❌ Redis is not accessible"
    fi
fi
echo ""

echo "📊 Resource Usage:"
echo "Memory: $(ps aux --no-headers -o pmem -C node | awk '{sum+=$1} END {print sum "%"}')"
echo "CPU: $(ps aux --no-headers -o pcpu -C node | awk '{sum+=$1} END {print sum "%"}')"
echo ""

echo "📝 Log Analysis:"
# Check for recent errors
echo "Recent errors in logs:"
tail -20 /var/log/n8n-mcp-server/error.log 2>/dev/null ||
tail -20 ./logs/error.log 2>/dev/null ||
tail -20 /app/logs/error.log 2>/dev/null ||
echo "No error logs found"
```

### Performance Monitoring

```typescript
// performance-monitor.js
const os = require("os");
const { performance } = require("perf_hooks");

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      startTime: performance.now(),
      requestCount: 0,
      errorCount: 0,
      memoryPeaks: [],
      slowRequests: [],
    };
  }

  startMonitoring() {
    // Memory monitoring
    setInterval(() => {
      const memUsage = process.memoryUsage();
      this.metrics.memoryPeaks.push({
        timestamp: Date.now(),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
      });

      // Keep only last 100 samples
      if (this.metrics.memoryPeaks.length > 100) {
        this.metrics.memoryPeaks.shift();
      }
    }, 5000);

    // Slow request tracking
    setInterval(() => {
      console.log("=== Performance Report ===");
      console.log(`Uptime: ${Math.round(process.uptime())}s`);
      console.log(`Requests: ${this.metrics.requestCount}`);
      console.log(`Errors: ${this.metrics.errorCount}`);
      console.log(
        `Error Rate: ${(
          (this.metrics.errorCount / Math.max(this.metrics.requestCount, 1)) *
          100
        ).toFixed(2)}%`
      );

      // Memory analysis
      if (this.metrics.memoryPeaks.length > 0) {
        const latest =
          this.metrics.memoryPeaks[this.metrics.memoryPeaks.length - 1];
        console.log(
          `Memory RSS: ${latest.rss}MB, Heap: ${latest.heapUsed}/${latest.heapTotal}MB`
        );
      }

      // Slow requests
      if (this.metrics.slowRequests.length > 0) {
        console.log("Slow Requests (>5s):");
        this.metrics.slowRequests.slice(-5).forEach((req) => {
          console.log(`  ${req.method} ${req.url}: ${req.duration}ms`);
        });
      }
    }, 30000);
  }

  recordRequest(method, url, duration) {
    this.metrics.requestCount++;

    if (duration > 5000) {
      this.metrics.slowRequests.push({
        timestamp: Date.now(),
        method,
        url,
        duration: Math.round(duration),
      });

      // Keep only last 50 slow requests
      if (this.metrics.slowRequests.length > 50) {
        this.metrics.slowRequests.shift();
      }
    }
  }

  recordError() {
    this.metrics.errorCount++;
  }

  getHealth() {
    return {
      uptime: Math.round(process.uptime()),
      memory: process.memoryUsage(),
      requests: this.metrics.requestCount,
      errors: this.metrics.errorCount,
      errorRate:
        this.metrics.errorCount / Math.max(this.metrics.requestCount, 1),
      slowRequests: this.metrics.slowRequests.length,
    };
  }
}

module.exports = { PerformanceMonitor };
```

## 🚨 Common Issues & Solutions

### 1. "Connection Refused" Errors

**Symptoms:**

- "ECONNREFUSED" or "Connection refused" messages
- Tools return network errors
- Intermittent connectivity issues

**Diagnostic Steps:**

```bash
# 1. Check if n8n is running
curl -f http://localhost:5678/health-check 2>/dev/null ||
echo "n8n is not responding"

# 2. Verify network configuration
netstat -tlnp | grep :5678

# 3. Test with telnet
timeout 5 telnet localhost 5678

# 4. DNS resolution
nslookup your-n8n-host.com

# 5. Firewall rules
iptables -L | grep 5678
ufw status | grep 5678
```

**Solutions:**

```typescript
// Connection retry with exponential backoff
async function connectWithRetry(url, maxRetries = 3) {
  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
    try {
      const response = await fetch(url);
      return response;
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        console.log(`Connection refused, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        attempt++;
      } else {
        throw error;
      }
    }
  }

  throw new Error(`Failed to connect after ${maxRetries} retries`);
}
```

**Configuration Fixes:**

```env
# .env
N8N_API_URL=http://localhost:5678/api/v1
# Ensure no trailing slashes or incorrect protocol

# For Docker
N8N_API_URL=http://n8n:5678/api/v1
# Use container name instead of localhost in Docker Compose

# For secured connections
N8N_API_URL=https://your-secure-n8n.com/api/v1
NODE_TLS_REJECT_UNAUTHORIZED=0  # Only for development
```

### 2. Authentication Failures

**Symptoms:**

- "Invalid API key" errors
- "Authentication failed" messages
- 401/403 HTTP status codes

**Diagnostic Steps:**

```bash
# 1. Verify API key
export N8N_API_KEY="your_key_here"
curl -H "X-N8n-Api-Key: $N8N_API_KEY" \
     "$N8N_API_URL/api/v1/workflows" -v

# 2. Check environment variables
echo $N8N_API_KEY
grep -r "N8N_API_KEY" .env 2>/dev/null

# 3. Rotate API key if suspected compromised
# Visit n8n Settings > API Keys > Create New Key
```

**Solutions:**

```typescript
// API key validation and rotation
class ApiKeyValidator {
  static async validateKey(apiKey, n8nUrl) {
    try {
      const response = await fetch(`${n8nUrl}/api/v1/workflows`, {
        headers: {
          "X-N8n-Api-Key": apiKey,
          Accept: "application/json",
        },
      });

      return {
        valid: response.ok,
        status: response.status,
        message: response.statusText,
      };
    } catch (error) {
      console.error("API key validation failed:", error.message);
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  static async rotateKey(oldKey, newKey, n8nUrl) {
    // Validate new key
    const newKeyValid = await this.validateKey(newKey, n8nUrl);
    if (!newKeyValid.valid) {
      throw new Error("New API key is invalid");
    }

    // Update environment
    process.env.N8N_API_KEY = newKey;

    // Restart MCP server
    await this.restartServer();

    console.log("API key rotated successfully");
  }

  static async restartServer() {
    const { spawn } = require("child_process");
    const server = spawn("npm", ["run", "start"], {
      stdio: "inherit",
      env: { ...process.env },
    });

    return new Promise((resolve, reject) => {
      server.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Server exit code: ${code}`));
      });

      server.on("error", reject);
    });
  }
}
```

### 3. Webhook Execution Failures

**Symptoms:**

- Webhooks not triggering workflows
- "Webhook authentication failed" errors
- Missing webhook data
- Delayed webhook processing

**Diagnostic Steps:**

```bash
# 1. Test webhook endpoint directly
curl -X POST "$N8N_WEBHOOK_URL/your-webhook-path" \
     -H "Content-Type: application/json" \
     -u "$N8N_WEBHOOK_USERNAME:$N8N_WEBHOOK_PASSWORD" \
     -d '{"test": "data"}' -v

# 2. Check webhook logs
tail -f /app/logs/webhook.log

# 3. Verify webhook configuration
# In n8n: Edit workflow > Webhook node > Settings
# Check Basic Auth credentials
# Verify webhook URL format

# 4. Network connectivity test
openssl s_client -connect your-n8n-host.com:443 -servername your-n8n-host.com

# 5. SSL certificate verification
curl -v https://your-n8n-webhook-url.com/webhook/test
```

**Solutions:**

```typescript
// Webhook retry mechanism
class WebhookRetrier {
  constructor(maxRetries = 3, retryDelay = 1000) {
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
    this.retryableErrors = ["ECONNREFUSED", "ENOTFOUND", "ECONNRESET"];
  }

  async executeWebhook(url, data, headers = {}) {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${btoa(
              `${process.env.N8N_WEBHOOK_USERNAME}:${process.env.N8N_WEBHOOK_PASSWORD}`
            )}`,
            ...headers,
          },
          body: JSON.stringify(data),
          timeout: 30000,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;

        if (attempt === this.maxRetries || !this.isRetryableError(error.code)) {
          break;
        }

        console.log(`Webhook attempt ${attempt + 1} failed:`, error.message);
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * Math.pow(2, attempt))
        );
      }
    }

    throw new Error(
      `Webhook execution failed after ${this.maxRetries + 1} attempts: ${
        lastError.message
      }`
    );
  }

  isRetryableError(errorCode) {
    return this.retryableErrors.includes(errorCode);
  }
}

// Circuit breaker for webhook endpoints
class WebhookCircuitBreaker {
  constructor(failureThreshold = 5, recoveryTime = 60000) {
    this.failureThreshold = failureThreshold;
    this.recoveryTime = recoveryTime;
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
  }

  async execute(fn) {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.recoveryTime) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error("Webhook circuit breaker is OPEN");
      }
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure(error);
      throw error;
    }
  }

  recordFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = "OPEN";
      console.warn(
        `Webhook circuit breaker OPEN after ${this.failureCount} failures`
      );
    }
  }

  reset() {
    this.failureCount = 0;
    this.state = "CLOSED";
    if (this.failureCount === 0) {
      console.log("Webhook circuit breaker reset");
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: new Date(this.lastFailureTime).toISOString(),
    };
  }
}
```

### 4. Memory Leaks and Performance Issues

**Symptoms:**

- Increasing memory usage over time
- Slow response times
- Node.js garbage collection stalls
- Out of memory errors

**Diagnostic Tools:**

```bash
# Memory profiling
node --inspect --inspect-brk --expose-gc index.js

# Heap snapshot
curl -X POST http://localhost:9229/json/snapshot

# Memory usage monitoring
while true; do
  ps aux --no-headers -o pid,pmem,pcpu,cmd | grep node
  sleep 5
done
```

**Solutions:**

```typescript
// Memory leak detection and mitigation
class MemoryManager {
  private readonly MEMORY_THRESHOLD = 512 * 1024 * 1024; // 512MB
  private readonly GC_INTERVAL = 300000; // 5 minutes

  constructor() {
    this.setupMemoryMonitoring();
    this.setupGarbageCollection();
    this.setupMemoryWarnings();
  }

  private setupMemoryMonitoring() {
    setInterval(() => {
      const memUsage = process.memoryUsage();

      if (memUsage.heapUsed > this.MEMORY_THRESHOLD) {
        console.warn(
          `High memory usage detected: ${Math.round(
            memUsage.heapUsed / 1024 / 1024
          )}MB`
        );
        this.performEmergencyCleanup();
      }

      // Log memory stats
      console.log(
        `Memory: RSS=${Math.round(memUsage.rss / 1024 / 1024)}MB, ` +
          `Heap=${Math.round(memUsage.heapUsed / 1024 / 1024)}/` +
          `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
      );
    }, 60000); // Every minute
  }

  private setupGarbageCollection() {
    if (typeof global.gc === "function") {
      setInterval(() => {
        const beforeGC = process.memoryUsage().heapUsed;
        global.gc();
        const afterGC = process.memoryUsage().heapUsed;
        const freed = beforeGC - afterGC;

        if (freed > 50 * 1024 * 1024) {
          // More than 50MB freed
          console.log(
            `Garbage collection freed ${Math.round(freed / 1024 / 1024)}MB`
          );
        }
      }, this.GC_INTERVAL);
    }
  }

  private setupMemoryWarnings() {
    process.on("warning", (warning) => {
      if (warning.name === "MaxListenersExceededWarning") {
        console.error(
          "MaxListenersExceededWarning: Possible memory leak detected"
        );
        this.findAndRemoveEventListenerLeaks();
      }
    });

    process.on("memory-usage", (data) => {
      console.log(`Memory usage: ${JSON.stringify(data)}`);
    });
  }

  private performEmergencyCleanup() {
    console.log("Performing emergency memory cleanup...");

    // Clear caches
    this.clearApplicationCaches();

    // Force garbage collection if available
    if (typeof global.gc === "function") {
      global.gc();
    }

    // Restart child processes if needed
    this.restartChildProcesses();
  }

  private clearApplicationCaches() {
    // Clear workflow cache
    if (global.workflowCache) {
      global.workflowCache.clear();
      console.log("Workflow cache cleared");
    }

    // Clear execution results cache
    if (global.executionCache) {
      global.executionCache.clear();
      console.log("Execution cache cleared");
    }
  }

  private restartChildProcesses() {
    // Implementation depends on your child process setup
    console.log("Child processes restarted");
  }

  private findAndRemoveEventListenerLeaks() {
    const events = require("events");
    const ee = new events.EventEmitter();

    // Override emit to track listeners
    const originalEmit = ee.emit;
    ee.emit = function (...args) {
      const listeners = this.listenerCount(args[0]);
      if (listeners > 10) {
        console.warn(`Event '${args[0]}' has ${listeners} listeners`);
      }
      return originalEmit.apply(this, args);
    };
  }
}

// Automatic memory leak prevention
const memoryManager = new MemoryManager();

// Connection pooling with limits
class ConnectionPoolManager {
  private static instance;
  private activeConnections = new Set();
  private readonly MAX_CONNECTIONS = 100;
  private readonly IDLE_TIMEOUT = 30000;

  static getInstance() {
    if (!ConnectionPoolManager.instance) {
      ConnectionPoolManager.instance = new ConnectionPoolManager();
    }
    return ConnectionPoolManager.instance;
  }

  registerConnection(connection) {
    if (this.activeConnections.size >= this.MAX_CONNECTIONS) {
      console.warn("Maximum connection limit reached");
      return false;
    }

    this.activeConnections.add(connection);
    return true;
  }

  unregisterConnection(connection) {
    this.activeConnections.delete(connection);
  }

  getConnectionCount() {
    return this.activeConnections.size;
  }

  cleanupIdleConnections() {
    // Close connections that have been idle too long
    this.activeConnections.forEach((connection) => {
      if (connection.isIdle && connection.idleTime > this.IDLE_TIMEOUT) {
        connection.close();
        this.activeConnections.delete(connection);
      }
    });
  }
}
```

### 5. Rate Limiting Issues

**Symptoms:**

- "Too many requests" errors
- Intermittent 429 status codes
- Degraded service performance

**Solutions:**

```typescript
// Adaptive rate limiting
class AdaptiveRateLimiter {
  private requestCounts = new Map();
  private readonly WINDOW_SIZE = 60000; // 1 minute
  private readonly MAX_REQUESTS = 100;
  private readonly BACKOFF_FACTOR = 2;
  private backlogTime = 0;

  canMakeRequest(identifier) {
    const now = Date.now();
    const windowKey = `${identifier}_${Math.floor(now / this.WINDOW_SIZE)}`;

    let count = this.requestCounts.get(windowKey) || 0;

    if (count >= this.MAX_REQUESTS) {
      return false;
    }

    // Check if we're in backoff period
    if (this.backlogTime > 0) {
      if (now < this.backlogTime) {
        return false;
      }
      this.backlogTime = 0;
    }

    count++;
    this.requestCounts.set(windowKey, count);

    return true;
  }

  recordRateLimit(identifier) {
    console.warn(`Rate limit reached for ${identifier}`);

    // Implement exponential backoff
    const backoffTime = this.WINDOW_SIZE * this.BACKOFF_FACTOR;
    this.backlogTime = Date.now() + backoffTime;

    console.log(`Entering backoff period for ${backoffTime}ms`);
  }

  getRemainingRequests(identifier) {
    const now = Date.now();
    const windowKey = `${identifier}_${Math.floor(now / this.WINDOW_SIZE)}`;
    const count = this.requestCounts.get(windowKey) || 0;
    return Math.max(0, this.MAX_REQUESTS - count);
  }

  // Clean up old entries
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      const cutoff = now - this.WINDOW_SIZE * 2;

      for (const [key, count] of this.requestCounts.entries()) {
        const windowStart = parseInt(key.split("_")[1]) * this.WINDOW_SIZE;
        if (windowStart < cutoff) {
          this.requestCounts.delete(key);
        }
      }
    }, this.WINDOW_SIZE);
  }
}

// Queue system for rate-limited requests
class RequestQueue {
  constructor(rateLimiter) {
    this.rateLimiter = rateLimiter;
    this.queue = [];
    this.processing = false;
  }

  async enqueue(identifier, requestFn) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        identifier,
        requestFn,
        resolve,
        reject,
        timestamp: Date.now(),
      });

      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift();

      try {
        if (!this.rateLimiter.canMakeRequest(item.identifier)) {
          // Re-queue with delay
          setTimeout(() => {
            this.queue.unshift(item);
          }, 1000);
          break;
        }

        const result = await item.requestFn();
        item.resolve(result);
      } catch (error) {
        if (error.status === 429) {
          this.rateLimiter.recordRateLimit(item.identifier);
          // Re-queue with exponential backoff
          setTimeout(() => {
            this.queue.unshift(item);
          }, Math.random() * 10000 + 5000); // 5-15s
          break;
        }

        item.reject(error);
      }
    }

    this.processing = false;
  }
}

// Usage with n8n API calls
const rateLimiter = new AdaptiveRateLimiter();
const requestQueue = new RequestQueue(rateLimiter);

async function makeRateLimitedRequest(url, options) {
  return requestQueue.enqueue("n8n-api", async () => {
    return fetch(url, options).then((response) => {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded");
      }
      return response;
    });
  });
}
```

## 🛠️ Advanced Debugging Techniques

### Remote Debugging

```bash
# Enable Node.js debugging
node --inspect=0.0.0.0:9229 build/index.js

# Debug production builds
node --inspect-brk --expose-gc build/index.js

# Chrome DevTools connection
# Open chrome://inspect in Chrome browser
```

### Profiling Production Applications

```typescript
// CPU profiling
const profiler = require("v8-profiler-node8");
const fs = require("fs");

function startCPUProfile(name, duration = 30000) {
  console.log(`Starting CPU profile: ${name}`);

  profiler.startProfiling(name);

  setTimeout(() => {
    const profile = profiler.stopProfiling(name);
    const profileData = profile.export();

    fs.writeFileSync(`${name}.cpuprofile`, profileData);
    console.log(`CPU profile saved: ${name}.cpuprofile`);

    profile.delete();
  }, duration);
}

// Memory heap snapshot
function takeHeapSnapshot(name) {
  const snapshot = profiler.takeSnapshot();
  const transform = snapshot.export();

  fs.writeFileSync(`${name}.heapsnapshot`, transform);
  console.log(`Heap snapshot saved: ${name}.heapsnapshot`);
}

// Usage
app.get("/debug/cpu-profile", (req, res) => {
  startCPUProfile("n8n-mcp-server");
  res.json({ message: "CPU profiling started" });
});

app.get("/debug/heap-snapshot", (req, res) => {
  takeHeapSnapshot("n8n-mcp-server");
  res.json({ message: "Heap snapshot taken" });
});
```

### Log Analysis Tools

```bash
# Extract error patterns
grep "ERROR\|FATAL" /var/log/n8n-mcp-server/app.log | \
  awk -F'[][]' '{print $2}' | sort | uniq -c | sort -rn

# Analyze response times
awk 'BEGIN {FS="["; RS="]"} /GET|POST/ {print $2}' /var/log/n8n-mcp-server/access.log | \
  grep -o '"[^"]*"$' | tr -d '"' | awk '{if(NF==1) print $1}' | sort | uniq -c

# Memory usage over time
grep "Memory: RSS=" /var/log/n8n-mcp-server/app.log | \
  sed 's/.*Memory: RSS=\([0-9]*\)MB.*/\1/' | \
  gnuplot -e "set terminal dumb; plot '-' using 1 with lines"
```

## 🚀 Preventive Maintenance

### Automated Health Checks

```bash
#!/bin/bash
# daily-health-check.sh

echo "=== Daily Health Check $(date) ==="

# Service availability
 curl -f -s http://localhost:8000/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Server is healthy"
else
    echo "❌ Server health check failed"
    # Send alert
    curl -X POST -H 'Content-type: application/json' \
         --data '{"text":"n8n MCP Server is unhealthy"}' \
         YOUR_SLACK_WEBHOOK_URL
fi

# Disk space monitoring
DISK_FREE=$(df / | tail -n 1 | awk '{print $4}')
if [ $DISK_FREE -lt 1048576 ]; then # Less than 1GB
    echo "⚠️ Low disk space: $(($DISK_FREE * 1024)) bytes"
fi

# Log rotation
find /var/log/n8n-mcp-server -name "*.log" -mtime +7 -exec rm {} \;

# Certificate expiration check
if command -v openssl >/dev/null; then
    EXPIRATION=$(openssl x509 -enddate -noout -in /path/to/ssl/cert.pem 2>/dev/null | cut -d= -f2)
    if [ -n "$EXPIRATION" ]; then
        EXPIRY_DATE=$(date -d "$EXPIRATION" +%s)
        NOW=$(date +%s)
        DAYS_LEFT=$(( ($EXPIRY_DATE - $NOW) / 86400 ))

        if [ $DAYS_LEFT -lt 30 ]; then
            echo "⚠️ SSL certificate expires in $DAYS_LEFT days"
        fi
    fi
fi

echo "=== Health Check Complete ==="
```

### Automated Backups

```bash
#!/bin/bash
# automated-backup.sh

BACKUP_DIR="/opt/backups/n8n-mcp-server"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="n8n-mcp-server_$TIMESTAMP"

# Create backup directory
mkdir -p "$BACKUP_DIR/$BACKUP_NAME"

# Configuration backup
cp -r /opt/n8n-mcp-server/config "$BACKUP_DIR/$BACKUP_NAME/"
cp /opt/n8n-mcp-server/.env "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true

# Database backup (if using local SQLite/PostgreSQL)
if [ -n "$DATABASE_URL" ]; then
    if echo "$DATABASE_URL" | grep -q "sqlite"; then
        SQLITE_PATH=$(echo "$DATABASE_URL" | sed 's|sqlite://||')
        cp "$SQLITE_PATH" "$BACKUP_DIR/$BACKUP_NAME/database.db" 2>/dev/null || true
    fi
fi

# Log backups
cp -r /var/log/n8n-mcp-server "$BACKUP_DIR/$BACKUP_NAME/" 2>/dev/null || true

# Compress backup
cd "$BACKUP_DIR"
tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"

# Upload to remote storage (optional)
# aws s3 cp "${BACKUP_NAME}.tar.gz" "s3://your-backups/${BACKUP_NAME}.tar.gz"

# Cleanup old backups
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -exec rm {} \;

echo "Backup completed: $BACKUP_DIR/${BACKUP_NAME}.tar.gz"
```

This comprehensive troubleshooting guide provides you with the tools and knowledge to diagnose and resolve virtually any issue you might encounter with n8n MCP Server. Remember to always start with the health check script and work methodically through the diagnostic steps. When in doubt, check the logs and consider the context of when the issue first appeared.
