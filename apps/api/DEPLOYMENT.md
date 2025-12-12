# Railway Deployment Guide

This guide provides step-by-step instructions for deploying the LLM Engineer API to Railway's free tier.

## Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli) installed (optional, but recommended)
- Railway account (sign up at [railway.app](https://railway.app))
- Git repository connected to Railway
- PostgreSQL database ready (Railway provides this)

## Architecture

The API is built with:
- NestJS framework
- Prisma ORM with PostgreSQL
- JWT authentication
- Multi-stage Docker builds for optimization

## Deployment Files

The following files are configured for Railway deployment:

1. **Dockerfile.railway** - Optimized production Dockerfile with multi-stage builds
2. **railway.toml** - Railway configuration with build and deploy settings
3. **.dockerignore** - Excludes unnecessary files from Docker build
4. **src/health/** - Health check endpoint at `/api/health`

## Step-by-Step Deployment

### 1. Create a New Railway Project

#### Via Railway Dashboard:
1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the monorepo root directory

#### Via CLI:
```bash
# Login to Railway
railway login

# Initialize project in the monorepo root
cd /Users/admin/Projects/fun-projects/llmengineer/llmengineer-platform
railway init
```

### 2. Add PostgreSQL Database

1. In your Railway project dashboard, click "New"
2. Select "Database" > "Add PostgreSQL"
3. Railway will automatically provision a PostgreSQL instance
4. The `DATABASE_URL` environment variable will be automatically added

### 3. Configure Environment Variables

In the Railway dashboard, go to your service's "Variables" tab and add the following:

#### Required Variables:

```bash
# Database (automatically set by Railway when you add PostgreSQL)
DATABASE_URL=postgresql://user:password@host:port/dbname?schema=public

# JWT Configuration
JWT_SECRET=your-super-secure-random-secret-key-min-32-chars
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3001

# CORS (update with your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.com
```

#### Generate a Secure JWT_SECRET:

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Using Railway CLI
railway run echo $RANDOM_SECRET
```

### 4. Configure Build Settings

Railway should automatically detect the `railway.toml` file. If not, configure manually:

#### Via Dashboard:
1. Go to your service's "Settings" tab
2. Under "Build", set:
   - **Builder**: Dockerfile
   - **Dockerfile Path**: `apps/api/Dockerfile.railway`
   - **Root Directory**: `/`

#### Via railway.toml (Already configured):
The `railway.toml` file includes:
- Dockerfile path
- Health check endpoint (`/api/health`)
- Start command with migrations
- Restart policy

### 5. Deploy

#### Via Dashboard:
1. Push your code to GitHub
2. Railway will automatically trigger a deployment
3. Monitor the build logs in the Railway dashboard

#### Via CLI:
```bash
# Deploy from local
railway up

# Or link to existing project and deploy
railway link
railway up
```

### 6. Run Database Migrations

The Dockerfile is configured to automatically run migrations on startup:

```dockerfile
CMD npx prisma migrate deploy && node dist/main
```

This ensures migrations are applied before the application starts.

#### Manual Migration (if needed):
```bash
# Via Railway CLI
railway run npx prisma migrate deploy

# Generate Prisma Client
railway run npx prisma generate
```

### 7. Verify Deployment

Once deployed, verify the application is running:

1. **Check Health Endpoint**:
   ```bash
   curl https://your-app.railway.app/api/health
   ```

   Expected response:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-12-11T12:00:00.000Z",
     "uptime": 123.456
   }
   ```

2. **Check API Documentation**:
   Visit `https://your-app.railway.app/api/docs` for Swagger UI

3. **Check Logs**:
   ```bash
   railway logs
   ```

## Railway Free Tier Limits

Railway's free tier includes:
- $5 of usage per month
- 500 execution hours
- 100GB network egress
- Up to 8GB memory
- Up to 8 vCPUs

### Optimization Tips:
1. **Use sleep mode**: Configure services to sleep after inactivity
2. **Optimize build time**: Multi-stage builds reduce image size
3. **Monitor usage**: Check Railway dashboard regularly
4. **Database optimization**: Use connection pooling with Prisma

## Monorepo Considerations

Since this is a monorepo with shared packages:

1. **Root Context**: The Dockerfile builds from the repository root
2. **Shared Package**: The `packages/shared` package is built during Docker build
3. **Dependencies**: All package.json files are copied for dependency resolution

## Database Schema Updates

To update the database schema:

1. **Modify Prisma Schema**:
   ```bash
   # Edit apps/api/prisma/schema.prisma
   ```

2. **Create Migration** (locally):
   ```bash
   cd apps/api
   npm run db:migrate
   ```

3. **Commit Migration**:
   ```bash
   git add prisma/migrations
   git commit -m "Add new database migration"
   git push
   ```

4. **Deploy**:
   Railway will automatically run migrations on next deployment

## Troubleshooting

### Build Failures

1. **Check Build Logs**:
   ```bash
   railway logs --build
   ```

2. **Common Issues**:
   - Missing environment variables
   - Prisma client not generated
   - Shared package build failures

### Runtime Errors

1. **Check Application Logs**:
   ```bash
   railway logs
   ```

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is set
   - Check PostgreSQL service is running
   - Ensure connection pooling is configured

3. **Migration Failures**:
   ```bash
   # Check migration status
   railway run npx prisma migrate status

   # Reset and redeploy (WARNING: This will delete data)
   railway run npx prisma migrate reset
   ```

### Health Check Failures

1. **Verify endpoint**:
   ```bash
   curl https://your-app.railway.app/api/health
   ```

2. **Check Railway health check settings**:
   - Path: `/api/health`
   - Timeout: 100s
   - Should return 200 status

### CORS Issues

Update the `CORS_ORIGIN` environment variable:
```bash
railway variables set CORS_ORIGIN=https://your-frontend-domain.com
```

## Monitoring

### Railway Dashboard:
- CPU and memory usage
- Build and deployment history
- Environment variables
- Service metrics

### Application Logs:
```bash
# View real-time logs
railway logs --follow

# Filter logs
railway logs | grep ERROR
```

## Rollback

If a deployment fails:

```bash
# Via CLI
railway rollback

# Or redeploy a specific commit
railway up --detach <commit-hash>
```

## CI/CD Integration

Railway automatically deploys on:
- Push to main branch (configurable)
- Pull request previews (optional)

### GitHub Actions (Optional):
```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --detach
```

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **JWT Secret**: Use a strong, random secret (min 32 characters)
3. **Database**: Enable SSL for production databases
4. **CORS**: Restrict to specific origins
5. **Rate Limiting**: Consider adding rate limiting middleware

## Cost Management

To stay within free tier:

1. **Monitor usage**: Check Railway dashboard weekly
2. **Optimize queries**: Use Prisma's query optimization
3. **Cache responses**: Implement caching for frequently accessed data
4. **Sleep on idle**: Configure auto-sleep for inactive periods

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

## Support

For issues or questions:
1. Check Railway status: [status.railway.app](https://status.railway.app)
2. Railway Discord: [discord.gg/railway](https://discord.gg/railway)
3. Project issues: Create an issue in the GitHub repository

## Next Steps After Deployment

1. Configure custom domain (optional)
2. Set up monitoring and alerts
3. Configure backup strategy for database
4. Implement logging service (e.g., LogTail)
5. Add performance monitoring (e.g., New Relic, DataDog)
6. Set up staging environment for testing

---

Last updated: 2025-12-11
