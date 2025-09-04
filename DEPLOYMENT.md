<!-- @format -->

## Support

For issues:

- Check Vercel deployment logs: `vercel logs --token $VERCEL_TOKEN`
- View Supabase database logs in the Supabase dashboard
- Monitor performance metrics through Vercel Analytics dashboard
- Review n8n webhook execution logs

## Post-Deployment Verification

After successful deployment, verify these components:

### 1. API Connectivity

```bash
# Test MCP server health
curl https://your-deployment.vercel.app/.well-known/health

# Verify n8n integration
curl https://your-deployment.vercel.app/mcp/list-tools
```

### 2. Analytics Functionality

- Check Vercel Analytics for initial events
- Verify database connections in Supabase Query Editor
- Monitor error rates and performance metrics

### 3. Environment Variables

```bash
# List all set environment variables
vercel env ls --token $VERCEL_TOKEN

# Verify PostgreSQL connectivity
vercel env get POSTGRES_URL --token $VERCEL_TOKEN
```

## Scaling & Performance

### Database Optimization

- **Connection Pooling:** Supabase handles connection pooling automatically
- **Query Optimization:** Analytics queries include appropriate indexes
- **Caching Strategy:** Redis integration for session and temporary data

### Vercel Configuration Tuning

```json
// vercel.json
{
  "functions": {
    "api/server.ts": {
      "maxDuration": 300,
      "memory": 1024
    }
  },
  "regions": ["iad1"], // US East for Supabase compatibility
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Troubleshooting Guide

### Common Deployment Issues

1. **Environment Variable Not Set:**

   ```
   Error: Missing required environment variable
   Solution: Run ./scripts/setup-environment.sh
   ```

2. **PostgreSQL Connection Timeout:**

   ```
   Error: Unable to connect to database
   Solution: Check POSTGRES_URL format and Supabase connectivity
   ```

3. **Analytics Not Working:**

   ```
   Symptom: No data in Vercel Analytics
   Solution: Verify DISABLE_ANALYTICS=false and SUPABASE_* keys
   ```

4. **Build Failures:**
   ```
   Error: TypeScript compilation failed
   Solution: Run npm run lint to identify and fix type errors
   ```

### Debug Commands

```bash
# Check deployment status
vercel --token $VERCEL_TOKEN --list

# View detailed logs
vercel logs --token $VERCEL_TOKEN --follow

# Test database connection locally
export $(cat .env | xargs) && node -e "require('./src/postgres/client').healthCheck({url: process.env.POSTGRES_URL})"

# Validate all configurations
npm run validate:deployment
```

## Integration Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   n8n Instance  │───→│ n8n MCP Server  │───→│   Supabase DB   │
│                 │    │  (Vercel)      │    │  PostgreSQL     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Vercel Analytics│
                       │                 │
                       └─────────────────┘
```

This architecture provides:

- **Scalable MCP server** running on Vercel
- **Real-time analytics** through Vercel Analytics
- **Structured data storage** via Supabase PostgreSQL
- **Production monitoring** and error tracking
- **Secure credential management** across environments

---

_Last updated: September 2025_
_Deployment Version: n8n MCP Server v0.1.9_
