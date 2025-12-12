# Railway Deployment Quick Start

## Files Created

1. `/apps/api/Dockerfile.railway` - Production-optimized multi-stage Dockerfile
2. `/apps/api/railway.toml` - Railway configuration
3. `/apps/api/.dockerignore` - Docker build exclusions
4. `/apps/api/src/health/` - Health check endpoint module
5. `/apps/api/DEPLOYMENT.md` - Comprehensive deployment guide

## Quick Deploy Steps

### 1. Create Railway Project
```bash
railway login
railway init
```

### 2. Add PostgreSQL Database
In Railway dashboard: New > Database > Add PostgreSQL

### 3. Set Environment Variables
```bash
JWT_SECRET=<generate-secure-random-string>
JWT_EXPIRES_IN=7d
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

DATABASE_URL is auto-configured by Railway PostgreSQL.

### 4. Deploy
```bash
railway up
```

Or push to GitHub and Railway auto-deploys.

### 5. Verify
```bash
curl https://your-app.railway.app/api/health
```

## Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Important Notes

- Health check endpoint: `/api/health`
- Swagger docs: `/api/docs`
- Migrations run automatically on deploy
- Free tier: $5/month usage limit
- Dockerfile path: `apps/api/Dockerfile.railway`

## Troubleshooting

View logs:
```bash
railway logs
```

Check build logs:
```bash
railway logs --build
```

Rollback:
```bash
railway rollback
```

## Full Documentation

See `DEPLOYMENT.md` for complete deployment guide.
